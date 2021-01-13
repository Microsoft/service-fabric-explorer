import { DataModelBase, IDecorators } from './Base';
import { IRawService, IRawUpdateServiceDescription, IRawServiceHealth, IRawServiceDescription, IRawServiceType, IRawServiceManifest,
         IRawCreateServiceDescription, IRawServiceBackupConfigurationInfo, IRawCreateServiceFromTemplateDescription } from '../RawDataTypes';
import { PartitionCollection, ServiceBackupConfigurationInfoCollection } from './collections/Collections';
import { DataService } from 'src/app/services/data.service';
import { HealthStateFilterFlags, IClusterHealthChunkQueryDescription, IServiceHealthStateFilter } from '../HealthChunkRawDataTypes';
import { ServiceKindRegexes, Constants, FabricEnumValues } from 'src/app/Common/Constants';
import { Utils } from 'src/app/Utils/Utils';
import { DeployedServicePackage } from './DeployedServicePackage';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { Application } from './Application';
import { Observable, of } from 'rxjs';
import { HealthBase } from './HealthEvent';
import { ApplicationType } from './ApplicationType';
import { mergeMap, map } from 'rxjs/operators';
import cloneDeep from 'lodash/cloneDeep';
import escapeRegExp from 'lodash/escapeRegExp';
import { ActionWithConfirmationDialog, IsolatedAction } from '../Action';
import { ScaleServiceComponent } from 'src/app/views/service/scale-service/scale-service.component';
import { ViewBackupComponent } from 'src/app/modules/backup-restore/view-backup/view-backup.component';
import { RoutesService } from 'src/app/services/routes.service';
// -----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
// -----------------------------------------------------------------------------

export class Service extends DataModelBase<IRawService> {
    public decorators: IDecorators = {
        hideList: [
            'IsServiceGroup'
        ]
    };

    public partitions: PartitionCollection;
    public health: ServiceHealth;
    public description: ServiceDescription;
    public serviceBackupConfigurationInfoCollection: ServiceBackupConfigurationInfoCollection;
    public backupPolicyName: string;
    public cleanBackup: boolean;

    public constructor(data: DataService, raw: IRawService, public parent: Application) {
        super(data, raw, parent);

        this.partitions = new PartitionCollection(this.data, this);
        this.health = new ServiceHealth(this.data, this, HealthStateFilterFlags.Default, HealthStateFilterFlags.None);
        this.description = new ServiceDescription(this.data, this);
        this.serviceBackupConfigurationInfoCollection = new ServiceBackupConfigurationInfoCollection(data, this);

        if (this.data.actionsEnabled()) {
            this.setUpActions();
        }


        this.cleanBackup = false;
    }

    public get isStatefulService(): boolean {
        return ServiceKindRegexes.Stateful.test(this.raw.ServiceKind);
    }

    public get isStatelessService(): boolean {
        return ServiceKindRegexes.Stateless.test(this.raw.ServiceKind);
    }

    public get serviceKindInNumber(): number {
        return this.raw.ServiceKind === Constants.ServiceKindStateful ? 2 : 1;
    }

    public get viewPath(): string {
        return RoutesService.getServiceViewPath(this.parent.raw.TypeName, this.parent.id, this.id);
    }

    public addHealthStateFiltersForChildren(clusterHealthChunkQueryDescription: IClusterHealthChunkQueryDescription): IServiceHealthStateFilter {
        const appFilter = this.parent.addHealthStateFiltersForChildren(clusterHealthChunkQueryDescription);
        let serviceFilter = appFilter.ServiceFilters.find(filter => filter.ServiceNameFilter === this.name);
        if (!serviceFilter) {
            serviceFilter = {
                ServiceNameFilter: this.name,
                PartitionFilters: []
            };
            appFilter.ServiceFilters.push(serviceFilter);
        }
        if (serviceFilter.PartitionFilters.length === 0) {
            serviceFilter.PartitionFilters = [{
                HealthStateFilter: HealthStateFilterFlags.All
            }];
        }
        return serviceFilter;
    }

    public updateService(updateServiceDescription: IRawUpdateServiceDescription): Observable<any> {
        return this.data.restClient.updateService(this.parent.id, this.id, updateServiceDescription);
    }

    protected retrieveNewData(messageHandler?: IResponseMessageHandler): Observable<IRawService> {
        return this.data.restClient.getService(this.parent.id, this.id, messageHandler);
    }


    private setUpActions(): void {
        if (this.parent.raw.TypeName === Constants.SystemAppTypeName) {
            return;
        }

        this.actions.add(new ActionWithConfirmationDialog(
            this.data.dialog,
            'deleteService',
            'Delete Service',
            'Deleting',
            () => this.delete().pipe(map( () => {
                this.data.routes.navigate(() => this.parent.viewPath);
            })),
            () => true,
            'Confirm Service Deletion',
            `Delete service ${this.name} from cluster ${window.location.host}?`,
            this.name
        ));

        if (this.isStatelessService) {
            this.actions.add(new IsolatedAction(
                this.data.dialog,
                'scaleService',
                'Scale Service',
                'Scaling Service',
                this,
                ScaleServiceComponent,
                () => this.isStatelessService
            ));
        }

    }

    private delete(): Observable<any> {
        return this.data.restClient.deleteService(this.parent.id, this.id);
    }
}

export class ServiceHealth extends HealthBase<IRawServiceHealth> {
    public constructor(data: DataService, public parent: Service,
                       protected eventsHealthStateFilter: HealthStateFilterFlags,
                       protected partitionsHealthStateFilter: HealthStateFilterFlags) {
        super(data, parent);
    }

    protected retrieveNewData(messageHandler?: IResponseMessageHandler): Observable<IRawServiceHealth> {
        return this.data.restClient.getServiceHealth(this.parent.parent.id, this.parent.id, this.eventsHealthStateFilter, this.partitionsHealthStateFilter, messageHandler);
    }
}

export class ServiceDescription extends DataModelBase<IRawServiceDescription> {
    public decorators: IDecorators = {
        hideList: [
            'ServiceKind',
            'ServiceName',
            'ServiceTypeName',
            'HasPersistedState',
            'IsDefaultMoveCostSpecified',
            'Flags'
        ],
        decorators: {
            DefaultMoveCost: {
                displayName: (name) => 'Move Cost'
            }
        }
    };

    public constructor(data: DataService, public parent: Service) {
        super(data, null, parent);
    }

    protected retrieveNewData(messageHandler?: IResponseMessageHandler): Observable<IRawServiceDescription> {
        return this.data.restClient.getServiceDescription(this.parent.parent.id, this.parent.id, messageHandler);
    }
}

export class ServiceType extends DataModelBase<IRawServiceType> {
    public manifest: ServiceManifest;

    public constructor(data: DataService, raw: IRawServiceType, public parent: ApplicationType | Application) {
        super(data, raw, parent);

        this.manifest = new ServiceManifest(this.data, this);

        if (this.data.actionsEnabled()) {
            this.setUpActions();
        }
    }

    public get serviceKind(): string {
        return this.raw.ServiceTypeDescription.IsStateful ? Constants.ServiceKindStateful : Constants.ServiceKindStateless;
    }

    public get serviceKindInNumber(): number {
        return this.serviceKind === Constants.ServiceKindStateful ? 2 : 1;
    }

    public get name(): string {
        return this.raw.ServiceTypeDescription.ServiceTypeName;
    }

    public createService(description: CreateServiceDescription): Observable<any> {
        let createServicePromise = null;
        if (description.createFromTemplate) {
            createServicePromise = this.data.restClient.createServiceFromTemplate(description.application.id, description.createFromTemplateDescription);
        } else {
            createServicePromise = this.data.restClient.createService(description.application.id, description.createDescription);
        }

        return createServicePromise;
    }

    private setUpActions() {
        if (this.parent instanceof Application) {
            this.actions.add(new IsolatedAction(
                this.data.dialog,
                'scaleService',
                'Scale Service',
                'Scaling Service',
                this,
                ScaleServiceComponent,
                () => !this.raw.ServiceTypeDescription.IsStateful
            ));
        }
    }
}

export class ServiceManifest extends DataModelBase<IRawServiceManifest> {
    public packages: ServiceTypePackage[] = [];

    public constructor(data: DataService, public parent: DeployedServicePackage | ServiceType) {
        super(data, null, parent);
    }

    protected retrieveNewData(messageHandler?: IResponseMessageHandler): Observable<IRawServiceManifest> {
        if (this.parent instanceof ServiceType) {
            const serviceType = (this.parent) as ServiceType;
            const appType = serviceType.parent as ApplicationType;
            return this.getServiceManifest(serviceType.parent.name, appType.raw.Version, serviceType.raw.ServiceManifestName, messageHandler);
        } else {
            const deployedService = (this.parent) as DeployedServicePackage;
            return this.data.getApp(deployedService.parent.raw.Id, false, messageHandler).pipe(mergeMap(app => {
                return this.getServiceManifest(app.raw.TypeName, app.raw.TypeVersion, deployedService.name, messageHandler);
            }));
        }
    }

    protected updateInternal(): Observable<any> | void {
            const parser = new DOMParser();
            const xml = parser.parseFromString(this.raw.Manifest, 'text/xml');

            // let $xml = $($.parseXML(this.raw.Manifest));
            let packType = xml.getElementsByTagName('CodePackage');

            const packages = [];
            Array.from(packType).forEach( (item: any) => {
                packages.push(new ServiceTypePackage(this.data, 'Code', item.getAttribute('Name'), item.getAttribute('Version')));
            });

            packType = xml.getElementsByTagName('ConfigPackage');
            Array.from(packType).forEach((item: any) => {
                packages.push(new ServiceTypePackage(this.data, 'Config', item.getAttribute('Name'), item.getAttribute('Version')));
            });

            this.packages = packages;
            return of(null);
    }

    private getServiceManifest(appTypeName: string, appTypeVersion: string, manifestName: string,
                               messageHandler?: IResponseMessageHandler): Observable<IRawServiceManifest> {
        return this.data.restClient.getServiceManifest(appTypeName, appTypeVersion, manifestName, messageHandler);
    }
}

export class ServiceTypePackage extends DataModelBase<any> {
    public constructor(data: DataService, public Type: string, public Name: string, public Version: string) {
        super(data, Type);
    }

    public get id(): string {
        return this.Type + ' ' + this.Name + ' ' + this.Version;
    }
}

export class CreateServiceDescription {
    public raw: IRawCreateServiceDescription;

    public initializationData: string;
    public createFromTemplate: boolean;
    public isAdvancedOptionCollapsed: boolean;

    public get createDescription(): IRawCreateServiceDescription {
        const descriptionCloned = cloneDeep(this.raw);
        let flags = 0;
        if (this.raw.ReplicaRestartWaitDurationSeconds !== null) {
            // tslint:disable-next-line:no-bitwise
            flags ^= 0x01;
        } else {
            delete descriptionCloned.ReplicaRestartWaitDurationSeconds;
        }
        if (this.raw.QuorumLossWaitDurationSeconds !== null) {
            // tslint:disable-next-line:no-bitwise
            flags ^= 0x02;
        } else {
            delete descriptionCloned.QuorumLossWaitDurationSeconds;
        }
        if (this.raw.StandByReplicaKeepDurationSeconds !== null) {
            // tslint:disable-next-line:no-bitwise
            flags ^= 0x04;
        } else {
            delete descriptionCloned.StandByReplicaKeepDurationSeconds;
        }
        
        if (this.raw.AuxiliaryReplicaCount !== null && this.raw.AuxiliaryReplicaCount > 0) {
            // tslint:disable-next-line:no-bitwise
            flags ^= 0x20;
        } else {
            delete descriptionCloned.AuxiliaryReplicaCount;
            if (this.raw.ServiceLoadMetrics !== null && this.raw.ServiceLoadMetrics.length > 0) {
                descriptionCloned.ServiceLoadMetrics.forEach(metric => delete metric.AuxiliaryDefaultLoad);
            }
        }

        descriptionCloned.Flags = flags;
        descriptionCloned.InitializationData = Utils.hexToBytes(this.initializationData);
        return descriptionCloned;
    }

    public get createFromTemplateDescription(): IRawCreateServiceFromTemplateDescription {
        return {
            ApplicationName: this.raw.ApplicationName,
            ServiceName: this.raw.ServiceName,
            ServiceTypeName: this.raw.ServiceTypeName,
            ServicePackageActivationMode: this.raw.ServicePackageActivationMode,
            InitializationData: Utils.hexToBytes(this.initializationData)
        } as IRawCreateServiceFromTemplateDescription;
    }

    public get servicePartitionKinds(): string[] {
        return FabricEnumValues.ServicePartitionKinds;
    }

    public get servicePackageActivationModes(): string[] {
        return FabricEnumValues.ServicePackageActivationModes;
    }

    public get placementPolicies(): string[] {
        return FabricEnumValues.PlacementPolicies;
    }

    public get serviceCorrelationSchemes(): string[] {
        return FabricEnumValues.ServiceCorrelationSchemes;
    }

    public get serviceLoadMetricWeights(): string[] {
        return FabricEnumValues.ServiceLoadMetricWeights;
    }

    public get serviceNamePattern(): string {
        return `^${escapeRegExp(this.raw.ApplicationName)}.+`;
    }

    public constructor(public serviceType: ServiceType, public application: Application) {
        this.reset();
    }

    public toggleAdvancedOptions(): void {
        if (!this.createFromTemplate) {
            this.isAdvancedOptionCollapsed = !this.isAdvancedOptionCollapsed;
        }
    }

    public addName(): void {
        this.raw.PartitionDescription.Names.push('');
    }

    public addPlacementPolicy(): void {
        this.raw.ServicePlacementPolicies.push({
            Type: '1'
        });
    }

    public addServiceCorrelation(): void {
        this.raw.CorrelationScheme.push({
            ServiceName: '',
            Scheme: '1'
        });
    }

    public resolveCorrelationScheme(scheme: string) {
        return FabricEnumValues.ServiceCorrelationSchemes[+scheme];
    }

    public resolveLoadMetricWeight(scheme: string) {
        return FabricEnumValues.ServiceLoadMetricWeights[+scheme];
    }

    public resolvePlacementPolicyType(scheme: string) {
        return FabricEnumValues.PlacementPolicies[+scheme];
    }

    public addLoadMetric(): void {
        this.raw.ServiceLoadMetrics.push({
            Name: '',
            Weight: '1',
            PrimaryDefaultLoad: null,
            SecondaryDefaultLoad: null,
            AuxiliaryDefaultLoad: null,
        });
    }

    public reset(): void {
        this.initializationData = '';
        this.createFromTemplate = false;
        this.isAdvancedOptionCollapsed = true;
        this.raw = {
            ServiceKind: this.serviceType.serviceKindInNumber,
            ApplicationName: this.application.name,
            ServiceName: `${this.application.name}/${this.serviceType.name}`,
            ServiceTypeName: this.serviceType.name,
            InitializationData: [],
            PartitionDescription: {
                PartitionScheme: '1',
                Count: 1,
                Names: [],
                LowKey: '',
                HighKey: ''
            },
            Flags: 0,
            ReplicaRestartWaitDurationSeconds: null,
            QuorumLossWaitDurationSeconds: null,
            StandByReplicaKeepDurationSeconds: null,
            TargetReplicaSetSize: 1,
            MinReplicaSetSize: 1,
            AuxiliaryReplicaCount: 0,
            HasPersistedState: this.serviceType.raw.ServiceTypeDescription.HasPersistedState,
            InstanceCount: 1,
            PlacementConstraints: '',
            CorrelationScheme: [],
            ServiceLoadMetrics: [],
            ServicePlacementPolicies: [],
            ServicePackageActivationMode: '0',
            ServiceDnsName: ''
        };
    }
}
export class ServiceBackupConfigurationInfo extends DataModelBase<IRawServiceBackupConfigurationInfo> {
    public decorators: IDecorators = {
        hideList: [
            'action.Name',
        ]
    };
    public action: IsolatedAction;
    public constructor(data: DataService, raw: IRawServiceBackupConfigurationInfo, public parent: Service) {
        super(data, raw, parent);

        this.action = new IsolatedAction(
            data.dialog,
            'deleteBackupPolicy',
            'Delete Backup Policy',
            'Deleting',
            {
                backup: raw,
                delete: () => data.restClient.deleteBackupPolicy(this.raw.PolicyName)
            },
            ViewBackupComponent,
            () => true,
            () => this.data.restClient.getBackupPolicy(this.raw.PolicyName).pipe(map(resp => {
                this.action.data.backup = resp;
            }))
            );
    }

    public get uniqueId(): string {
        return this.raw.PolicyName + '-' + this.raw.Kind;
    }
}


