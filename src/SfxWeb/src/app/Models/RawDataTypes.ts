import { NodeStatusConstants, HealthStateConstants } from '../Common/Constants';
import { Node } from './DataModels/Node';

// -----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
// -----------------------------------------------------------------------------
export interface IRawCollection<T> {
        ContinuationToken: string;
        Items: T[];
    }

export interface IRawList<T> extends Array<T> {
    }

export interface IRawApplication {
        Id: string;
        Name: string;
        TypeName: string;
        TypeVersion: string;
        Parameters: IRawParameter[];
        Status: string;
        HealthState: string;
        ApplicationDefinitionKind: string;
    }
export class IRawBackupEntity{
    EntityKind: BackupEntityKind;
}
export interface IRawApplicationBackupEntity extends IRawBackupEntity{
    ApplicationName: string;
}
export interface IRawServiceBackupEntity extends IRawBackupEntity{
    ServiceName: string;
}
export interface IRawPartitionBackupEntity extends IRawBackupEntity{
    ServiceName: string;
    PartitionId: string;
}
export enum BackupEntityKind{
    Invalid,
    Partition,
    Service,
    Application
}
export interface IRawBackupConfigurationInfo {
        Kind: string;
        PolicyName: string;
        PolicyInheritedFrom: string;
        SuspensionInfo: IRawSuspensionInfo;
    }

export interface IRawPartitionBackup {
        BackupId: string;
        BackupChainId: string;
        ApplicationName: string;
        ServiceManifestVersion: string;
        ServiceName: string;
        BackupLocation: string;
        BackupType: string;
        LsnOfLastBackupRecord: string;
        CreationTimeUtc: string;
        EpochOfLastBackupRecord: IRawEpochOfLastBackupRecord;
    }

export interface IRawEpochOfLastBackupRecord {
        DataLossVersion: string;
        ConfigurationVersion: string;
    }
export interface IRawApplicationBackupConfigurationInfo extends IRawPartitionBackupConfigurationInfo {
        ApplicationName: string;
    }

export interface IRawServiceBackupConfigurationInfo extends IRawPartitionBackupConfigurationInfo {
        ServiceName: string;
    }

export interface IRawPartitionBackupConfigurationInfo extends IRawBackupConfigurationInfo {
        PartitionId: string;
    }

export interface IRawBackupProgressInfo {
        RestoreState: string;
        TimeStampUtc: string;
        RestoredEpoch: IRawEpochOfLastBackupRecord;
        RestoredLsn: string;
    }

export interface IRawRestoreProgressInfo {
        BackupState: string;
        TimeStampUtc: string;
        BackupId: string;
        BackupLocation: string;
        EpochOfLastBackupRecord: IRawEpochOfLastBackupRecord;
        LsnOfLastBackupRecord: string;
    }

export interface IRawSuspensionInfo {
        IsSuspended: boolean;
        SuspensionInheritedFrom: string;
    }

export interface IRawApplicationManifest {
        Manifest: string;
    }

export interface IRawServiceManifest {
        Manifest: string;
    }

export interface IRawHealth {
        HealthEvents: IRawHealthEvent[];
        AggregatedHealthState: string;
        UnhealthyEvaluations: IRawUnhealthyEvaluation[];
    }

export interface IRawApplicationHealth extends IRawHealth {
        Name: string;
        ServiceHealthStates: IRawServiceHealthState[];
        DeployedApplicationHealthStates: IRawDeployedApplicationHealthState[];
        HealthStatistics: IRawHealthStatistics;
    }

export interface IRawApplicationHealthState {
        Name: string;
        AggregatedHealthState: string;
    }

export interface IRawApplicationType {
        Name: string;
        Version: string;
        Status: string;
        StatusDetails: string;
        DefaultParameterList: IRawParameter[];
    }

export interface IRawUpgradeDomain {
        Name: string;
        State: string;
    }

export interface IRawMonitoringPolicy {
        FailureAction: string;
        HealthCheckWaitDurationInMilliseconds: string;
        HealthCheckStableDurationInMilliseconds: string;
        HealthCheckRetryTimeoutInMilliseconds: string;
        UpgradeTimeoutInMilliseconds: string;
        UpgradeDomainTimeoutInMilliseconds: string;
    }

export interface IRawClusterHealthPolicy {
        ConsiderWarningAsError: boolean;
        MaxPercentUnhealthyNodes: number;
        MaxPercentUnhealthyApplications: number;
    }

export interface IRawClusterUpgradeDescription {
        CodeVersion: string;
        ConfigVersion: string;
        UpgradeKind: string;
        RollingUpgradeMode: string;
        UpgradeReplicaSetCheckTimeoutInSeconds: number;
        ForceRestart: boolean;
        MonitoringPolicy: IRawMonitoringPolicy;
        ClusterHealthPolicy: IRawClusterHealthPolicy;
        EnableDeltaHealthEvaluation: boolean;
        SortOrder: string;
    }

export interface IRawUpgradeDescription {
        Name: string;
        TargetApplicationTypeVersion: string;
        Parameters: IRawParameter[];
        UpgradeKind: string;
        RollingUpgradeMode: string;
        UpgradeReplicaSetCheckTimeoutInSeconds: string;
        ForceRestart: boolean;
        MonitoringPolicy: IRawMonitoringPolicy;
    }

export interface IRawUnhealthyEvaluation {
        HealthEvaluation: IRawHealthEvaluation;
    }

export interface IRawHealthEvaluation {
        Kind: string;
        Description: string;
        AggregatedHealthState: string;
        UnhealthyEvent: IRawUnhealthyEvent;
        UnhealthyEvaluations: IRawUnhealthyEvaluation[];
        ConsiderWarningAsError: boolean;
    }

export interface IRawApplicationHealthEvluation extends IRawHealthEvaluation {
        ApplicationName: string;
    }

export interface IRawApplicationsHealthEvluation extends IRawHealthEvaluation {
        MaxPercentUnhealthyApplications: number;
        TotalCount: number;
    }

export interface IRawApplicationTypeHealthEvluation extends IRawHealthEvaluation {
        ApplicationTypeName: string;
        MaxPercentUnhealthyApplications: number;
    }

export interface IRawNodeHealthEvluation extends IRawHealthEvaluation {
        NodeName: string;
    }

export interface IRawPartitionHealthEvaluation extends IRawHealthEvaluation {
        PartitionId: string;
    }

export interface IRawServiceHealthEvaluation extends IRawHealthEvaluation {
        ServiceName: string;
    }

export interface IRawReplicaHealthEvaluation extends IRawHealthEvaluation {
        ReplicaOrInstanceId: string;
        PartitionId: string;
    }

export interface IRawDeployedApplicationHealthEvaluation extends IRawHealthEvaluation {
        NodeName: string;
        ApplicationName: string;
    }
export interface IRawDeployedServicePackageHealthEvaluation extends IRawHealthEvaluation {
        NodeName: string;
        ApplicationName: string;
        ServiceManifestName: string;
        ServicePackageActivationId?: string;
    }

export interface IRawServicesHealthEvaluation extends IRawHealthEvaluation {
    ServiceTypeName: string;
}

export interface IRawUnhealthyEvent {
        SourceId: string;
        Property: string;
        HealthState: string;
        TimeToLiveInMilliSeconds: string;
        Description: string;
        SequenceNumber: string;
        RemoveWhenExpired: boolean;
        SourceUtcTimestamp: string;
        LastModifiedUtcTimestamp: string;
        IsExpired: boolean;
    }

export interface IRawApplicationUpgradeProgress {
        Name: string;
        TypeName: string;
        TargetApplicationTypeVersion: string;
        UpgradeDomains: IRawUpgradeDomain[];
        UpgradeState: string;
        NextUpgradeDomain: string;
        RollingUpgradeMode: string;
        UpgradeDescription: IRawUpgradeDescription;
        UpgradeDurationInMilliseconds: string;
        UpgradeDomainDurationInMilliseconds: string;
        UnhealthyEvaluations: IRawUnhealthyEvaluation[];
        CurrentUpgradeDomainProgress: IRawUpgradeDomainProgress;
        StartTimestampUtc: string;
        FailureTimestampUtc: string;
        FailureReason: string;
        UpgradeDomainProgressAtFailure: IRawUpgradeDomainProgress;
        UpgradeStatusDetails: string;
    }

export interface IRawClusterHealth extends IRawHealth {
        NodeHealthStates: IRawNodeHealthState[];
        ApplicationHealthStates: IRawApplicationHealthState[];
        HealthStatistics: IRawHealthStatistics;
    }

export interface IRawClusterManifest {
        Manifest: string;
    }

export interface IRawClusterUpgradeProgress {
        CodeVersion: string;
        ConfigVersion: string;
        UpgradeDomains: IRawUpgradeDomain[];
        UpgradeState: string;
        NextUpgradeDomain: string;
        RollingUpgradeMode: string;
        UpgradeDescription: IRawClusterUpgradeDescription;
        UpgradeDurationInMilliseconds: string;
        UpgradeDomainDurationInMilliseconds: string;
        UnhealthyEvaluations: IRawUnhealthyEvaluation[];
        CurrentUpgradeDomainProgress: IRawUpgradeDomainProgress;
        StartTimestampUtc: string;
        FailureTimestampUtc: string;
        FailureReason: string;
        UpgradeDomainProgressAtFailure: IRawUpgradeDomainProgress;
    }

export interface IRawClusterLoadInformation {
        LastBalancingStartTimeUtc: string;
        LastBalancingEndTimeUtc: string;
        LoadMetricInformation: IRawLoadMetricInformation[];
    }

export interface IRawLoadMetricInformation {
        Name: string;
        IsBalancedBefore: boolean;
        IsBalancedAfter: boolean;
        DeviationBefore: string;
        DeviationAfter: string;
        BalancingThreshold: string;
        Action: string;
        ActivityThreshold: string;
        ClusterCapacity: number;
        ClusterLoad: number;
        CurrentClusterLoad: number;
        RemainingUnbufferedCapacity: number;
        NodeBufferPercentage: number;
        BufferedCapacity: number;
        RemainingBufferedCapacity: number;
        IsClusterCapacityViolation: boolean;
        MinNodeLoadValue: number;
        MinNodeLoadId: IRawId;
        MaxNodeLoadValue: number;
        MaxNodeLoadId: IRawId;
    }

export interface IRawDeployedApplicationHealthState {
        ApplicationName: string;
        NodeName: string;
        AggregatedHealthState: string;
    }

export interface IRawHealthEvent {
        SourceId: string;
        Property: string;
        HealthState: string;
        Description: string;
        TimeToLiveInMilliSeconds: string;
        SequenceNumber: string;
        RemoveWhenExpired: boolean;
        IsExpired: boolean;
        SourceUtcTimestamp: string;
        LastModifiedUtcTimestamp: string;
    }

export interface IRawId {
        Id: string;
    }

export interface IRawNetwork {
        name: string;
        properties: IRawNetworkProperties;
    }

export interface IRawNetworkProperties {
        kind: string;
        networkAddressPrefix: string;
        networkStatus: string;
    }

export interface IRawNetworkOnApp {
        networkName: string;
    }

export interface IRawNetworkOnNode {
        NetworkName: string;
    }

export interface IRawAppOnNetwork {
        ApplicationName: string;
    }

export interface IRawNodeOnNetwork {
        nodeName: string;
    }

export interface IRawDeployedContainerOnNetwork {
        ApplicationName: string;
        NetworkName: string;
        CodePackageName: string;
        CodePackageVersion: string;
        ServiceManifestName: string;
        ServicePackageActivationId: string;
        ContainerAddress: string;
        ContainerId: string;
    }

export interface IRawNode {
        Name: string;
        IpAddressOrFQDN: string;
        Type: string;
        CodeVersion: string;
        ConfigVersion: string;
        NodeStatus: string;
        NodeUpTimeInSeconds: string;
        HealthState: string;
        IsSeedNode: boolean;
        UpgradeDomain: string;
        FaultDomain: string;
        Id: IRawId;
        InstanceId: string;
        NodeDeactivationInfo: IRawNodeDeactivationInfo;
        IsStopped: boolean;
    }

export interface IRawBackupPolicy {
        Name: string;
        AutoRestoreOnDataLoss: boolean;
        MaxIncrementalBackups: number;
        Schedule: IRawSchedule;
        Storage: IRawStorage;
    }

export interface IRawRetentionPolicy {
        RetentionPolicyType: string;
        MinimumNumberOfBackups: number;
        RetentionDuration: string;
    }

export interface IRawNodeDeactivationInfo {
        NodeDeactivationIntent: string;
        NodeDeactivationStatus: string;
        NodeDeactivationTask: IRawNodeDeactivationTask[];
        PendingSafetyChecks: IRawSafetyCheckDescription[];
    }

export interface IRawNodeDeactivationTask {
        NodeDeactivationTaskId: IRawNodeDeactivationTaskId;
        NodeDeactivationIntent: string;
    }
export interface IRawSchedule {
        ScheduleKind: string;
        ScheduleFrequencyType: string;
        RunDays: string[];
        RunTimes: string[];
        Interval: string;
    }
export interface IRawStorage {
        StorageKind: string;
        FriendlyName: string;
        Path: string;
        ConnectionString: string;
        ContainerName: string;
        PrimaryUserName: string;
        PrimaryPassword: string;
        SecondaryUserName: string;
        SecondaryPassword: string;
    }

export interface IRawNodeDeactivationTaskId {
        Id: string;
        NodeDeactivationTaskType: string;
    }

export interface IRawNodeHealthState {
        Name: string;
        Id: IRawId;
        AggregatedHealthState: string;
    }

export interface IRawNodeHealth extends IRawHealth {
        Name: string;
    }

export interface IRawNodeLoadInformation {
        NodeName: string;
        NodeLoadMetricInformation: IRawNodeLoadMetricInformation[];
    }


export interface IRawNodeLoadMetricInformation {
        Name: string;
        NodeCapacity: number;
        NodeLoad: number;
        NodeRemainingCapacity: number;
        IsCapacityViolation: boolean;
        NodeBufferedCapacity: number;
        NodeRemainingBufferedCapacity: number;
    }

export interface IRawParameter {
        Key: string;
        Value: string;
    }

export interface IRawPartition {
        ServiceKind: string;
        PartitionInformation: IRawPartitionInformation;
        TargetReplicaSetSize: number;
        MinReplicaSetSize: number;
        InstanceCount: number;
        HealthState: string;
        PartitionStatus: string;
        CurrentConfigurationEpoch: IRawConfigurationEpoch;
    }

export interface IRawPartitionDescription {
        PartitionScheme: string;
        Count: number;
        Names: string[];
        LowKey: string;
        HighKey: string;
    }

export interface IRawPartitionHealth extends IRawHealth {
        PartitionId: string;
        ReplicaHealthStates: IRawReplicaHealthState[];
    }

export interface IRawPartitionHealthState {
        PartitionId: string;
        AggregatedHealthState: string;
    }

export interface IRawPartitionInformation {
        Id: string;
        ServicePartitionKind: string;

        // Used for ServicePartitionKind.Int64Range
        HighKey: string;
        LowKey: string;

        // Used for ServicePartitionKind.Named
        Name: string;
    }

export interface IRawPartitionLoadInformation {
        PartitionId: string;
        PrimaryLoadMetricReports: IRawLoadMetricReport[];
        SecondaryLoadMetricReports: IRawLoadMetricReport[];
    }

export interface IRawLoadMetricReport {
        Name: string;
        Value: string;
        LastReportedUtc: string;
    }

export interface IRawConfigurationEpoch {
        ConfigurationVersion: number;
        DataLossVersion: number;
    }

export interface IRawReplicaHealth extends IRawHealth {
        Kind: string;
        PartitionId: string;
        ReplicaId: string;
        InstanceId: string;
    }

export interface IRawDeployedReplica {
        Address: string;
        CodePackageName: string;
        InstanceId: string;
        LastInBuildDurationInSeconds: string;
        ReplicaId: string;
        PartitionId: string;
        ReplicaRole: string;
        ReplicaStatus: string;
        ServiceKind: string;
        ServiceManifestVersion: string;
        ServiceName: string;
        ServiceTypeName: string;
        ServicePackageActivationId: string;
    }

export interface IRawDeployedReplicaDetail {
        PartitionId: string;
        InstanceId: string;
        ReplicaId: string;
        ReadStatus: string;
        WriteStatus: string;
        CurrentServiceOperation: string;
        CurrentServiceOperationStartTimeUtc: string;
        CurrentReplicatorOperation: string;
        ReportedLoad: IRawLoadMetricReport[];
        ReplicatorStatus: IRawReplicatorStatus;
        ReplicaStatus: IRawDeployedReplicaStatus;
    }

export interface IRawDeployedReplicaStatus {
        Kind: string;
        DatabaseRowCountEstimate: string;
        DatabaseLogicalSizeEstimate: string;
        StatusDetails: string;
    }

export class IRawReplicatorStatus {
        Kind: string;
        IsInBuild: boolean;
        LastCopyOperationReceivedTimeUtc: string;
        LastReplicationOperationReceivedTimeUtc: string;
        LastAcknowledgementSentTimeUtc: string;
        ReplicationQueueStatus: IRawReplicatorQueueStatus;
        CopyQueueStatus: IRawReplicatorQueueStatus;
        RemoteReplicators: IRawRemoteReplicatorStatus[];
    }

export class IRawReplicatorQueueStatus {
        QueueUtilizationPercentage: string;
        QueueMemorySize: boolean;
        FirstSequenceNumber: string;
        CompletedSequenceNumber: string;
        CommittedSequenceNumber: string;
        LastSequenceNumber: string;
    }

export class IRawRemoteReplicatorStatus {
        ReplicaId: string;
        IsInBuild: boolean;
        LastAcknowledgementProcessedTimeUtc: string;
        LastReceivedReplicationSequenceNumber: string;
        LastAppliedReplicationSequenceNumber: string;
        LastReceivedCopySequenceNumber: string;
        LastAppliedCopySequenceNumber: string;
        RemoteReplicatorAcknowledgementStatus: IRemoteReplicatorAcknowledgementStatus;
    }

export interface IRemoteReplicatorAcknowledgementStatus {
        ReplicationStreamAcknowledgementDetail: IRemoteReplicatorAcknowledgementDetail;
        CopyStreamAcknowledgementDetail: IRemoteReplicatorAcknowledgementDetail;
    }

export interface IRemoteReplicatorAcknowledgementDetail {
        AverageReceiveDuration: string;
        AverageApplyDuration: string;
        NotReceivedCount: string;
        ReceivedAndNotAppliedCount: string;
    }

export interface IRawReplicaOnPartition {
        Address: string;
        HealthState: string;
        ReplicaId: string;
        ReplicaRole: string;
        InstanceId: string;
        LastInBuildDurationInSeconds: string;
        NodeName: string;
        ReplicaStatus: string;
        ServiceKind: string;
    }

export interface IRawReplicaHealthState {
        ServiceKind: string;
        PartitionId: string;
        ReplicaId: string;
        AggregatedHealthState: string;
    }

export interface IRawService {
        Id: string;
        ServiceKind: string;
        Name: string;
        TypeName: string;
        ManifestVersion: string;
        ServiceStatus: string;
        HasPersistedState: boolean; // Only shows up when this is a stateful service.
        HealthState: string;
        IsServiceGroup: boolean;
    }

export interface IRawServiceCorrelationDescription {
        ServiceName: string;
        Scheme: string;
    }

export interface IRawServicePlacementPolicy {
        Type: string;
        DomainName?: string;
    }

export interface IRawServiceDescription {
        ServiceKind: string;
        ApplicationName: string;
        ServiceName: string;
        ServiceTypeName: string;
        InitializationData: number[];
        PartitionDescription: IRawPartitionDescription;
        InstanceCount: number;
        TargetReplicaSetSize: number;
        MinReplicaSetSize: number;
        HasPersistedState: boolean;
        PlacementConstraints: string;
        CorrelationScheme: IRawServiceCorrelationDescription[];
        ReplicaRestartWaitDurationSeconds: number;
        ServiceLoadMetrics: IRawServiceLoadMetricDescription[];
        ServicePlacementPolicies: IRawServicePlacementPolicy[];
        Flags: string;
        DefaultMoveCost: string;
        IsDefaultMoveCostSpecified: boolean;
        ServicePackageActivationMode: string;
        ServiceDnsName: string;
    }

export interface IRawServiceHealth extends IRawHealth {
        Name: string;
        PartitionHealthStates: IRawPartitionHealthState[];
        HealthStatistics: IRawHealthStatistics;
    }

export interface IRawServiceHealthState {
        ServiceName: string;
        AggregatedHealthState: string;
    }

export interface IRawServiceLoadMetricDescription {
        Name: string;
        Weight: string;
        PrimaryDefaultLoad: number;
        SecondaryDefaultLoad: number;
    }

export interface IRawServiceType {
        ServiceTypeDescription: IRawServiceTypeDescription;
        ServiceManifestVersion: string;
        ServiceManifestName: string;
        IsServiceGroup: boolean;
    }

export interface IRawServiceTypeDescription {
        IsStateful: boolean;
        ServiceTypeName: string;
        PlacementConstraints: string;
        HasPersistedState: boolean;
        UseImplicitHost: boolean;
    }

export interface IRawUpgradeDomainProgress {
        DomainName: string;
        NodeUpgradeProgressList: IRawNodeUpgradeProgress[];
    }

export interface IRawNodeUpgradeProgress {
        NodeName: string;
        UpgradePhase: string;
        PendingSafetyChecks: IRawSafetyCheckDescription[];
    }

export interface IRawSafetyCheckDescription {
        Kind: string;
        PartitionId: string;
    }

export interface IRawApplicationEvent {
        PartitionKey: string;
        RowKey: string;
        EventType: string;
        targetversion: string;
        TaskName: string;
        Timestamp: string;
    }

export interface IRawDeployedServicePackage {
        Name: string;
        Version: string;
        Status: string;
        ServicePackageActivationId: string;
    }

export interface IRawDeployedApplication {
        Id: string;
        LogDirectory: string;
        Name: string;
        Status: string;
        TempDirectory: string;
        TypeName: string;
        WorkDirectory: string;
    }

export interface IRawDeployedServicePackageHealth extends IRawHealth {
        ApplicationName: string;
        ServiceManifestName: string;
        NodeName: string;
        ServicePackageActivationId: string;
    }

export interface IRawContainerLogs {
        Content: string;
    }

export interface IRawDeployedCodePackage {
        Name: string;
        Version: string;
        ServiceManifestName: string;
        ServicePackageActivationId: string;
        Status: string;
        RunFrequencyInterval: number;
        SetupEntryPoint: IRawCodePackageEntryPoint;
        MainEntryPoint: IRawCodePackageEntryPoint;
        HasSetupEntryPoint: boolean;
        HostType: string;
        HostIsolationMode: string;
    }

export interface IRawCodePackageEntryPoint {
        EntryPointLocation: string;
        InstanceId: string;
        ProcessId: string;
        RunAsUserName: string;
        Status: string;
        NextActivationTime: string;
        CodePackageEntryPointStatistics: IRawCodePackageEntryPointStatistics;
    }

export interface IRawCodePackageEntryPointStatistics {
        LastExitCode: number;
        LastActivationTime: string;
        LastExitTime: string;
        LastSuccessfulActivationTime: string;
        LastSuccessfulExitTime: string;
        ActivationCount: number;
        ActivationFailureCount: number;
        ContinuousActivationFailureCount: number;
        ExitCount: number;
        ExitFailureCount: number;
        ContinuousExitFailureCount: number;
    }

export interface IRawAadMetadata {
        type: string;
        metadata: IRawAadMetadataMetadata;  // Yes, there's a Metadata property on what's returned from GetAadMetadata.
    }

export interface IRawAadMetadataMetadata {
        login: string;
        authority: string;
        client: string;
        cluster: string;
        redirect: string;
        tenant: string;
    }

export interface IRawCreateServiceFromTemplateDescription {
        ServiceName: string;
        ServiceTypeName: string;
        ApplicationName: string;
        ServicePackageActivationMode: string;
        InitializationData: any[];
    }

export interface IRawUpdateServiceDescription {
        ServiceKind?: number;
        Flags?: number;
        TargetReplicaSetSize?: number;
        MinReplicaSetSize?: number;
        InstanceCount?: number;
        ReplicaRestartWaitDurationSeconds?: number;
        QuorumLossWaitDurationSeconds?: number;
        StandByReplicaKeepDurationSeconds?: number;
    }

export interface IRawCreateServiceDescription extends IRawCreateServiceFromTemplateDescription, IRawUpdateServiceDescription {
        PartitionDescription: IRawPartitionDescription;
        TargetReplicaSetSize: number;
        HasPersistedState: boolean;
        PlacementConstraints: string;
        CorrelationScheme: IRawServiceCorrelationDescription[];
        ServiceLoadMetrics: IRawServiceLoadMetricDescription[];
        ServicePlacementPolicies: IRawServicePlacementPolicy[];
        ServiceDnsName: string;
    }

export interface IRawHealthStatistics {
        HealthStateCountList: IRawHealthStatisticsItem[];
    }

export interface IRawHealthStatisticsItem {
        EntityKind: string;
        HealthStateCount: IRawHealthStateCount;
    }

export interface IRawHealthStateCount {
        OkCount: number;
        ErrorCount: number;
        WarningCount: number;
    }

export interface IRawRepositoryCredential {
        RepositoryUserName?: string;
        RepositoryPassword?: string;
        PasswordEncrypted?: boolean;
    }

export interface IRawCreateComposeDeploymentDescription {
        DeploymentName: string;
        ComposeFileContent: string;
        RepositoryCredential?: IRawRepositoryCredential;
    }

export interface IRawImageStoreContent {
        StoreFiles: IRawStoreFile[];
        StoreFolders: IRawStoreFolder[];
    }

export interface IRawStoreFile {
        FileSize: string;
        FileVersion: IRawFileVersion;
        ModifiedDate: string;
        StoreRelativePath: string;
    }

export interface IRawFileVersion {
        VersionNumber: string;
    }

export interface IRawStoreFolder {
        StoreRelativePath: string;
        FileCount: string;
    }

export interface IRawStoreFolderSize {
        StoreRelativePath: string;
        FolderSize: string;
    }

export interface IRawClusterVersion {
        Version: string;
    }

export interface IRawNodeImpact {
        NodeName: string;
        ImpactLevel	?: number;
    }

export interface IRawNodeRepairImpactDescription {
        Kind: string;
        NodeImpactList: IRawNodeImpact[];
    }

export interface IRawNodeRepairTargetDescription {
        Kind: string;
        NodeNames: string[];
    }
export interface IRawRepairTaskHistory {
        CreatedUtcTimestamp ?: string;
        ClaimedUtcTimestamp ?: string;
        PreparingUtcTimestamp ?: string;
        ApprovedUtcTimestamp ?: string;
        ExecutingUtcTimestamp ?: string;
        RestoringUtcTimestamp ?: string;
        CompletedUtcTimestamp ?: string;
        PreparingHealthCheckStartUtcTimestamp ?: string;
        PreparingHealthCheckEndUtcTimestamp ?: string;
        RestoringHealthCheckStartUtcTimestamp ?: string;
        RestoringHealthCheckEndUtcTimestamp ?: string;
    }

export interface IRawRepairTask {
        TaskId: string;
        Version?: string;
        Description?: string;
        State: string;
        Flags?: number;
        Action: string;
        Target?: IRawNodeRepairTargetDescription;
        Executor?: string;
        ExecutorData?: string;
        Impact?: IRawNodeRepairImpactDescription;
        ResultStatus?: string;
        ResultCode?: number;
        ResultDetail?: string;
        History?: IRawRepairTaskHistory;
        PreparingHealthCheckState?: string;
        RestoringHealthCheckState?: string;
        PerformPreparingHealthCheck?: boolean;
        PerformRestoringHealthCheck?: boolean;
        scope?: any;
        ResultDetails?: string;
    }


export interface INodesStatusDetails {
        nodeType: string;
        statusTypeCounts: Record<string, number>;
        warningCount: number;
        errorCount: number;
    }

export class NodeStatusDetails implements INodesStatusDetails {
        public nodeType: string;
        public statusTypeCounts: Record<string, number>;
        public warningCount = 0;
        public errorCount = 0;
        public totalCount = 0;
        public constructor(nodeType: string) {
            this.nodeType = nodeType;

            // easiest way to initialize all possible values with Enum strings
            this.statusTypeCounts = {};
            this.statusTypeCounts[NodeStatusConstants.Up] = 0;
            this.statusTypeCounts[NodeStatusConstants.Down] = 0;
            this.statusTypeCounts[NodeStatusConstants.Enabling] = 0;
            this.statusTypeCounts[NodeStatusConstants.Disabling] = 0;
            this.statusTypeCounts[NodeStatusConstants.Disabled] = 0;
            this.statusTypeCounts[NodeStatusConstants.Unknown] = 0;
            this.statusTypeCounts[NodeStatusConstants.Invalid] = 0;
        }

        public add(node: Node): void {
            this.statusTypeCounts[node.raw.NodeStatus]++;
            this.totalCount++;
            if (node.healthState.text === HealthStateConstants.Warning) {
                this.warningCount++;
            }
            if (node.healthState.text === HealthStateConstants.Error) {
                this.errorCount++;
            }
        }
    }

export enum NodeStatus {
        Invalid = 0,
        Up = 1,
        Down = 2,
        Enabling = 3,
        Disabling = 4,
        Disabled = 5
    }

export interface IRawApplicationNameInfo{
        Id: string;
        Name: string;
    }
export interface IRawServiceNameInfo{
        Id: string;
        Name: string;
    }
