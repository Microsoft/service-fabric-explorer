import { IRawNode, IRawNodeLoadInformation, IRawNodeLoadMetricInformation, IRawNodeHealth, NodeStatus } from '../RawDataTypes';
import { IDecorators, DataModelBase } from './Base';
import { DataService } from 'src/app/services/data.service';
import { HealthStateFilterFlags, IClusterHealthChunkQueryDescription, IHealthStateFilter } from '../HealthChunkRawDataTypes';
import { TimeUtils } from 'src/app/Utils/TimeUtils';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CollectionUtils } from 'src/app/Utils/CollectionUtils';
import { HealthBase } from './HealthEvent';
import { DeployedApplicationCollection } from './collections/DeployedApplicationCollection';
import { ActionWithConfirmationDialog, Action } from '../Action';
import { NodeStatusConstants } from 'src/app/Common/Constants';
import { RoutesService } from 'src/app/services/routes.service';

// -----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
// -----------------------------------------------------------------------------

export class Node extends DataModelBase<IRawNode> {
    public decorators: IDecorators = {
        decorators: {
            NodeUpTimeInSeconds: {
                displayName: (name) => 'Node Up Time',
                displayValueInHtml: (value) => this.nodeUpTime
            }
        }
    };

    public deployedApps: DeployedApplicationCollection;
    public loadInformation: NodeLoadInformation;
    public health: NodeHealth;

    // When the auto-refresh is off, we won't be able to rely on this.status alone to determine which actions to enable because that data will be stale.
    // So we track what we expect the node status to be. This data is set after a successful action and cleared when we refresh the controller.
    private expectedNodeStatus: NodeStatus = NodeStatus.Invalid;

    public constructor(data: DataService, raw?: IRawNode) {
        super(data, raw);

        this.deployedApps = new DeployedApplicationCollection(this.data, this);
        this.loadInformation = new NodeLoadInformation(this.data, this);
        this.health = new NodeHealth(this.data, this, HealthStateFilterFlags.Default);

        if (this.data.actionsEnabled()) {
            this.setUpActions();
            this.setAdvancedActions();
        }
    }

    public get nodeStatus(): string {
        return this.raw.IsStopped ? 'Down (Stopped)' : this.raw.NodeStatus;
    }

    public get nodeUpTime(): string {
        return TimeUtils.getDurationFromSeconds(this.raw.NodeUpTimeInSeconds);
    }

    public get id(): string {
        return this.raw.Id.Id;
    }

    public get viewPath(): string {
        return RoutesService.getNodeViewPath(this.name);
    }

    public get tooltip(): string {
        return `${this.name}\nType: ${this.raw.Type}\nStatus: ${this.raw.NodeStatus}\nHealth State: ${this.healthState.text}`;
    }

    public get upgradeDomain(): string {
        return this.raw.UpgradeDomain;
    }

    public get faultDomain(): string {
        return this.raw.FaultDomain;
    }

    public get isDeactivating(): boolean {
        return this.raw.NodeDeactivationInfo.NodeDeactivationStatus !== 'None';
    }

    public addHealthStateFiltersForChildren(clusterHealthChunkQueryDescription: IClusterHealthChunkQueryDescription): IHealthStateFilter {
        // To get all deployed applications on this node, we need to add deployed application filters in all existing application filters.
        // (There will be at least one application filter there by default which is returned by DataService.getInitialClusterHealthChunkQueryDescription)
        Object.keys(clusterHealthChunkQueryDescription.ApplicationFilters).forEach(filter => {
            if (!clusterHealthChunkQueryDescription.ApplicationFilters[filter].DeployedApplicationFilters) {
                clusterHealthChunkQueryDescription.ApplicationFilters[filter].DeployedApplicationFilters = [];
            }
            clusterHealthChunkQueryDescription.ApplicationFilters[filter].DeployedApplicationFilters.push(
                {
                    NodeNameFilter: this.name
                });
        });
        return null;
    }

    public setAdvancedActions(): void {
        this.actions.add(new Action(
            'activateNode',
            'Activate',
            'Activating',
            () => this.activate(),
            () => (this.expectedNodeStatus !== NodeStatus.Invalid) ?
                this.expectedNodeStatus === NodeStatus.Disabled :
                this.raw.NodeStatus === NodeStatusConstants.Down || this.raw.NodeStatus === NodeStatusConstants.Disabling || this.raw.NodeStatus === NodeStatusConstants.Disabled
            , true
                ));

        const removeNodeState = new ActionWithConfirmationDialog(
            this.data.dialog,
            'removeNodeState',
            'Remove node state',
            'Removing',
            () => this.removeNodeState(),
            () => this.raw.NodeStatus === NodeStatusConstants.Down,
            'Confirm Node Removal',
            `Data about node ${this.name} will be completely erased from the cluster ${window.location.host}. All data stored on the node will be lost permanently. Are you sure to continue?`,
            this.name
            );
        removeNodeState.isAdvanced = true;
        this.actions.add(removeNodeState);

        const deactivePauseNode = new ActionWithConfirmationDialog(
            this.data.dialog,
            'deactivePauseNode',
            'Deactivate (pause)',
            'Deactivating',
            () => this.deactivate(1),
            // There are various levels of "disabling" and it should be possible to disable "at a higher level" an already-disabled node.
            () => this.raw.NodeStatus !== NodeStatusConstants.Down,
            // We do not track the level of disabling, so we just enable the command as long as the node is not down.
            'Confirm Node Deactivation',
            `Deactivate node '${this.name}' from cluster '${window.location.host}'? This node will not become operational again until it is manually reactivated. WARNING: Deactivating nodes can cause data loss if not used with caution. For more information see: https://go.microsoft.com/fwlink/?linkid=825861`,
            this.name
        );
        deactivePauseNode.isAdvanced = true;
        this.actions.add(deactivePauseNode);

        const deactiveRestartNode = new ActionWithConfirmationDialog(
            this.data.dialog,
            'deactiveRestartNode',
            'Deactivate (restart)',
            'Deactivating',
            () => this.deactivate(2),
            () => this.raw.NodeStatus !== NodeStatusConstants.Down,
            'Confirm Node Deactivation',
            `Deactivate node '${this.name}' from cluster '${window.location.host}'? This node will not become operational again until it is manually reactivated. WARNING: Deactivating nodes can cause data loss if not used with caution. For more information see: https://go.microsoft.com/fwlink/?linkid=825861`,
            this.name
        );
        deactiveRestartNode.isAdvanced = true;
        this.actions.add(deactiveRestartNode);

        const deactiveRemoveNodeData =  new ActionWithConfirmationDialog(
            this.data.dialog,
            'deactiveRemoveNodeData',
            'Deactivate (remove data)',
            'Deactivating',
            () => this.deactivate(3),
            () => this.raw.NodeStatus !== NodeStatusConstants.Down,
            'Confirm Node Deactivation',
            `Deactivate node '${this.name}' from cluster '${window.location.host}'? This node will not become operational again until it is manually reactivated. WARNING: Deactivating nodes can cause data loss if not used with caution. For more information see: https://go.microsoft.com/fwlink/?linkid=825861`,
            this.name
        );
        deactiveRemoveNodeData.isAdvanced = true;
        this.actions.add(deactiveRemoveNodeData);
    }

    protected retrieveNewData(messageHandler?: IResponseMessageHandler): Observable<IRawNode> {
        return this.data.restClient.getNode(this.name, messageHandler).pipe(map(response => {
            this.expectedNodeStatus = NodeStatus.Invalid;
            return response;
        }));
    }

    private setUpActions(): void {
        this.actions.add(new ActionWithConfirmationDialog(
            this.data.dialog,
            'restartNode',
            'Restart Fabric Services',
            'Restarting Fabric Services',
            () => this.restart(),
            () => true,
            'Confirm Fabric Services Restart',
            `Restart node ${this.name} fabric services from the cluster ${window.location.host}?`,
            // `Restart node ${this.name} from the cluster ${this.data.$location.host()}?`, TODO
            this.name
        ));
    }

    private activate(): Observable<any> {
        return this.data.restClient.activateNode(this.name)
            .pipe(map( () => {
                this.expectedNodeStatus = NodeStatus.Up;
            }));
    }

    private deactivate(intent: number): Observable<any> {
        return this.data.restClient.deactivateNode(this.name, intent)
            .pipe(map( () => {
                this.expectedNodeStatus = NodeStatus.Disabled;
            }));
    }

    private removeNodeState(): Observable<any> {
        return this.data.restClient.removeNodeState(this.name);
    }

    private restart(): Observable<any> {
        return this.data.restClient.restartNode(this.name, this.raw.InstanceId);
    }
}

export class NodeLoadInformation extends DataModelBase<IRawNodeLoadInformation> {
    public metrics: Record<string, number>;
    public decorators: IDecorators = {
        hideList: [
            'NodeName'
        ]
    };

    public nodeLoadMetricInformation: NodeLoadMetricInformation[] = [];

    public get name(): string {
        return this.raw.NodeName;
    }

    public constructor(data: DataService, public parent: Node) {
        super(data, null, parent);
    }

    protected retrieveNewData(messageHandler?: IResponseMessageHandler): Observable<IRawNodeLoadInformation> {
        return this.data.restClient.getNodeLoadInformation(this.parent.name, messageHandler);
    }

    protected updateInternal(): Observable<any> | void {
        this.nodeLoadMetricInformation = CollectionUtils.updateDataModelCollection(this.nodeLoadMetricInformation,
                                                                                   this.raw.NodeLoadMetricInformation.map(lmi => new NodeLoadMetricInformation(this.data, lmi, this)));
        this.metrics = this.nodeLoadMetricInformation.reduce(
            (obj: Record<string, number>, metricData) => {
                obj[metricData.name] = +metricData.raw.NodeLoad;
                return obj;
            }, {} );
    }
}

export class NodeLoadMetricInformation extends DataModelBase<IRawNodeLoadMetricInformation> {
    public decorators: IDecorators = {
        hideList: [
            'NodeLoad',
            'NodeRemainingCapacity',
            'NodeRemainingBufferedCapacity'
        ]
    };
    public get hasCapacity(): boolean {
        return this.raw.NodeCapacity && +this.raw.NodeCapacity > 0;
    }

    public get isSystemMetric(): boolean {
        return this.raw.Name.startsWith('__') && this.raw.Name.endsWith('__');
    }

    public get loadCapacityRatio(): number {
        return this.hasCapacity ? this.raw.NodeLoad / this.raw.NodeCapacity : 0;
    }

    public get loadCapacityRatioString(): string {
        return (this.loadCapacityRatio * 100).toFixed(1) + '%';
    }

    public constructor(data: DataService, raw: IRawNodeLoadMetricInformation, public parent: NodeLoadInformation) {
        super(data, raw, parent);
    }
}

export class NodeHealth extends HealthBase<IRawNodeHealth> {
    public constructor(data: DataService, public parent: Node, protected eventsHealthStateFilter: HealthStateFilterFlags) {
        super(data, parent);
    }

    protected retrieveNewData(messageHandler?: IResponseMessageHandler): Observable<IRawNodeHealth> {
        return this.data.restClient.getNodeHealth(this.parent.name, this.eventsHealthStateFilter, messageHandler);
    }
}


