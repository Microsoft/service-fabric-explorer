//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

module Sfx {

    export class Node extends DataModelBase<IRawNode> {
        public decorators: IDecorators = {
            decorators: {
                "NodeUpTimeInSeconds": {
                    displayName: (name) => "Node Up Time",
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
            }

            if (this.data.actionsAdvancedEnabled()) {
                this.setAdvancedActions();
            }

        }

        public get nodeStatus(): string {
            return this.raw.IsStopped ? "Down (Stopped)" : this.raw.NodeStatus;
        }

        public get nodeUpTime(): string {
            return TimeUtils.getDurationFromSeconds(this.raw.NodeUpTimeInSeconds);
        }

        public get id(): string {
            return this.raw.Id.Id;
        }

        public get viewPath(): string {
            return this.data.routes.getNodeViewPath(this.name);
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

        public addHealthStateFiltersForChildren(clusterHealthChunkQueryDescription: IClusterHealthChunkQueryDescription): IHealthStateFilter {
            // To get all deployed applications on this node, we need to add deployed application filters in all existing application filters.
            // (There will be at least one application filter there by default which is returned by DataService.getInitialClusterHealthChunkQueryDescription)
            _.forEach(clusterHealthChunkQueryDescription.ApplicationFilters, filter => {
                if (_.isEmpty(filter.DeployedApplicationFilters)) {
                    filter.DeployedApplicationFilters = [];
                }
                filter.DeployedApplicationFilters.push(
                    {
                        NodeNameFilter: this.name
                    });
            });
            return null;
        }

        public removeAdvancedActions(): void {
            this.actions.collection = this.actions.collection.filter(action => ["activateNode", "removeNodeState", "deactivePauseNode", "deactiveRestartNode", "deactiveRemoveNodeData"].indexOf(action.name) === -1);
        }

        public setAdvancedActions(): void {
            this.actions.add(new Action(
                "activateNode",
                "Activate",
                "Activating",
                () => this.activate(),
                () => (this.expectedNodeStatus !== NodeStatus.Invalid) ?
                    this.expectedNodeStatus === NodeStatus.Disabled :
                    this.raw.NodeStatus === NodeStatusConstants.Down || this.raw.NodeStatus === NodeStatusConstants.Disabling || this.raw.NodeStatus === NodeStatusConstants.Disabled
            ));
            this.actions.add(new ActionWithConfirmationDialog(
                this.data.$uibModal,
                this.data.$q,
                "removeNodeState",
                "Remove node state",
                "Removing",
                () => this.removeNodeState(),
                () => this.raw.NodeStatus === NodeStatusConstants.Down,
                "Confirm Node Removal",
                `Data about node ${this.name} will be completely erased from the cluster ${this.data.$location.host()}. All data stored on the node will be lost permanently. Are you sure to continue?`,
                this.name
            ));
            this.actions.add(new ActionWithConfirmationDialog(
                this.data.$uibModal,
                this.data.$q,
                "deactivePauseNode",
                "Deactivate (pause)",
                "Deactivating",
                () => this.deactivate(1),
                // There are various levels of "disabling" and it should be possible to disable "at a higher level" an already-disabled node.
                () => this.raw.NodeStatus !== NodeStatusConstants.Down,
                // We do not track the level of disabling, so we just enable the command as long as the node is not down.
                "Confirm Node Deactivation",
                `Deactivate node '${this.name}' from cluster '${this.data.$location.host()}'? This node will not become operational again until it is manually reactivated. WARNING: Deactivating nodes can cause data loss if not used with caution. For more information see: https://go.microsoft.com/fwlink/?linkid=825861`,
                this.name
            ));
            this.actions.add(new ActionWithConfirmationDialog(
                this.data.$uibModal,
                this.data.$q,
                "deactiveRestartNode",
                "Deactivate (restart)",
                "Deactivating",
                () => this.deactivate(2),
                () => this.raw.NodeStatus !== NodeStatusConstants.Down,
                "Confirm Node Deactivation",
                `Deactivate node '${this.name}' from cluster '${this.data.$location.host()}'? This node will not become operational again until it is manually reactivated. WARNING: Deactivating nodes can cause data loss if not used with caution. For more information see: https://go.microsoft.com/fwlink/?linkid=825861`,
                this.name
            ));
            this.actions.add(new ActionWithConfirmationDialog(
                this.data.$uibModal,
                this.data.$q,
                "deactiveRemoveNodeData",
                "Deactivate (remove data)",
                "Deactivating",
                () => this.deactivate(3),
                () => this.raw.NodeStatus !== NodeStatusConstants.Down,
                "Confirm Node Deactivation",
                `Deactivate node '${this.name}' from cluster '${this.data.$location.host()}'? This node will not become operational again until it is manually reactivated. WARNING: Deactivating nodes can cause data loss if not used with caution. For more information see: https://go.microsoft.com/fwlink/?linkid=825861`,
                this.name
            ));
        }

        protected retrieveNewData(messageHandler?: IResponseMessageHandler): angular.IPromise<IRawNode> {
            return this.data.restClient.getNode(this.name, messageHandler).then(response => {
                this.expectedNodeStatus = NodeStatus.Invalid;
                return response.data;
            });
        }

        private setUpActions(): void {
            this.actions.add(new ActionWithConfirmationDialog(
                this.data.$uibModal,
                this.data.$q,
                "restartNode",
                "Restart Fabric Services",
                "Restarting Fabric Services",
                () => this.restart(),
                () => true,
                "Confirm Fabric Services Restart",
                `Restart node ${this.name} fabric services from the cluster ${this.data.$location.host()}?`,
                this.name
            ));
        }

        private activate(): angular.IPromise<any> {
            return this.data.restClient.activateNode(this.name)
                .then(() => {
                    this.expectedNodeStatus = NodeStatus.Up;
                });
        }

        private deactivate(intent: number): angular.IPromise<any> {
            return this.data.restClient.deactivateNode(this.name, intent)
                .then(() => {
                    this.expectedNodeStatus = NodeStatus.Disabled;
                });
        }

        private removeNodeState(): angular.IPromise<any> {
            return this.data.restClient.removeNodeState(this.name);
        }

        private restart(): angular.IPromise<any> {
            return this.data.restClient.restartNode(this.name, this.raw.InstanceId);
        }
    }

    export class NodeLoadInformation extends DataModelBase<IRawNodeLoadInformation> {
        public decorators: IDecorators = {
            hideList: [
                "NodeName"
            ]
        };

        public nodeLoadMetricInformation: NodeLoadMetricInformation[] = [];

        public get name(): string {
            return this.raw.NodeName;
        }

        public constructor(data: DataService, public parent: Node) {
            super(data, null, parent);
        }

        protected retrieveNewData(messageHandler?: IResponseMessageHandler): angular.IPromise<IRawNodeLoadInformation> {
            return Utils.getHttpResponseData(this.data.restClient.getNodeLoadInformation(this.parent.name, messageHandler));
        }

        protected updateInternal(): angular.IPromise<any> | void {
            CollectionUtils.updateDataModelCollection(this.nodeLoadMetricInformation, _.map(this.raw.NodeLoadMetricInformation, lmi => new NodeLoadMetricInformation(this.data, lmi, this)));
        }
    }

    export class NodeLoadMetricInformation extends DataModelBase<IRawNodeLoadMetricInformation> {
        public get hasCapacity(): boolean {
            return this.raw.NodeCapacity && +this.raw.NodeCapacity > 0;
        }

        public get isSystemMetric(): boolean {
            return _.startsWith(this.raw.Name, "__") && _.endsWith(this.raw.Name, "__");
        }

        public get loadCapacityRatio(): number {
            return this.hasCapacity ? this.raw.NodeLoad / this.raw.NodeCapacity : 0;
        }

        public get loadCapacityRatioString(): string {
            return (this.loadCapacityRatio * 100).toFixed(1) + "%";
        }

        public constructor(data: DataService, raw: IRawNodeLoadMetricInformation, public parent: NodeLoadInformation) {
            super(data, raw, parent);
        }
    }

    export class NodeHealth extends HealthBase<IRawNodeHealth> {
        public constructor(data: DataService, public parent: Node, protected eventsHealthStateFilter: HealthStateFilterFlags) {
            super(data, parent);
        }

        protected retrieveNewData(messageHandler?: IResponseMessageHandler): angular.IPromise<IRawNodeHealth> {
            return Utils.getHttpResponseData(this.data.restClient.getNodeHealth(this.parent.name, this.eventsHealthStateFilter, messageHandler));
        }
    }
}

