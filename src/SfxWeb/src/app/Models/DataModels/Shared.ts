import { DataModelBase, IDecorators } from './Base';
import { IRawHealthEvaluation, IRawLoadMetricInformation, IRawUpgradeDescription, IRawMonitoringPolicy, IRawUpgradeDomain, IRawClusterUpgradeDescription } from '../RawDataTypes';
import { DataService } from 'src/app/services/data.service';
import { UpgradeDomainStateRegexes, UpgradeDomainStateNames, BadgeConstants } from 'src/app/Common/Constants';
import { TimeUtils } from 'src/app/Utils/TimeUtils';
import { checkForJson } from 'src/app/Utils/healthUtils';

// -----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
// -----------------------------------------------------------------------------

export class HealthEvaluation extends DataModelBase<IRawHealthEvaluation> {
    public showAsRichText = false;
    public jsonData = null;
    public viewPathUrl = '';
    public children: any[];
    public displayName: string;
    public constructor(raw: IRawHealthEvaluation, public level: number = 0, parent: HealthEvaluation = null, viewPathUrl: string = '') {
        super(null, raw, parent);
        this.viewPathUrl = viewPathUrl;
        try {
          this.jsonData =  JSON.parse(this.raw.UnhealthyEvent.Description.trim());
          this.showAsRichText = true;
      } catch (e) {

        }
    }

    changeDefaultView() {
        this.showAsRichText = !this.showAsRichText;
    }

    public get viewPath(): string {
        return this.viewPathUrl;
    }

    public get kind(): string {
        if (this.level > 0) {
            return Array(this.level * 4).join(' ')  + this.raw.Kind;
        } else {
            return this.raw.Kind;
        }
    }

    public get uniqueId(): string {
        // Explicitly set this to null to allow detail-list directive to use angular build-in parameter $id to track the list.
        return null;
    }

    public get sourceTimeStamp(): string {
        return this.raw?.UnhealthyEvent?.SourceUtcTimestamp;
    }

    public get description(): string {
        let description = '';
        if (this.raw.UnhealthyEvent) {
            description = (checkForJson(this.raw.Description) + '\n' + checkForJson(this.raw.UnhealthyEvent.Description)).trim();
        } else {
            description = checkForJson(this.raw.Description).trim();
        }

        // Temp solution for rendering a link instead of plain text
        // Long term solution would be an independent service which provides troubleshooting tips based on health report
        return description.replace('http://aka.ms/sfhealth', '<a href=\'https://aka.ms/sfhealth\' target=\'_blank\'>https://aka.ms/sfhealth</a>');
    }
}

export class LoadMetricInformation extends DataModelBase<IRawLoadMetricInformation> {
    public decorators: IDecorators = {
        showList: [
            'Name',
            'BalancingThreshold',
            'Action',
            'IsBalancedBefore',
            'DeviationBefore',
            'IsBalancedAfter',
            'DeviationAfter'
        ]
    };

    public selected: boolean;

    public get minNodeLoadId(): string {
        return this.raw.MinNodeLoadId.Id;
    }

    public get maxNodeLoadId(): string {
        return this.raw.MaxNodeLoadId.Id;
    }

    public get hasCapacity(): boolean {
        return this.raw.ClusterCapacity && +this.raw.ClusterCapacity > 0;
    }

    public get isResourceGovernanceMetric(): boolean {
        return this.raw.Name.startsWith('servicefabric:/_');
    }

    public get isSystemMetric(): boolean {
        return this.raw.Name.startsWith('__') && this.raw.Name.endsWith('__');
    }

    public get isLoadMetric(): boolean {
        return !(this.isResourceGovernanceMetric || this.isSystemMetric);
    }

    public get loadCapacityRatio(): number {
        return this.hasCapacity ? this.raw.CurrentClusterLoad / this.raw.ClusterCapacity : 0;
    }

    public get loadCapacityRatioString(): string {
        return (this.loadCapacityRatio * 100).toFixed(1) + '%';
    }

    public get displayName(): string {
        return this.name.replace(/^servicefabric:\/_/, 'Reserved ');
    }

    public constructor(data: DataService, raw: IRawLoadMetricInformation) {
        super(data, raw);
    }
}

export class UpgradeDescription extends DataModelBase<IRawUpgradeDescription | IRawClusterUpgradeDescription> {
    public decorators: IDecorators = {
        hideList: ['Name', 'TargetApplicationTypeVersion', 'UpgradeKind', 'RollingUpgradeMode']
    };

    public monitoringPolicy: MonitoringPolicy;

    public constructor(data: DataService, raw: IRawUpgradeDescription | IRawClusterUpgradeDescription) {
        super(data, raw);

        this.monitoringPolicy = new MonitoringPolicy(this.data, raw.MonitoringPolicy);
    }
}

export class MonitoringPolicy extends DataModelBase<IRawMonitoringPolicy> {
    public decorators: IDecorators = {
        decorators: {
            HealthCheckWaitDurationInMilliseconds: {
                displayName: (name) => 'Health Check Wait Duration',
                displayValueInHtml: (value) => TimeUtils.getDuration(value)
            },
            HealthCheckStableDurationInMilliseconds: {
                displayName: (name) => 'Health Check Stable Duration',
                displayValueInHtml: (value) => TimeUtils.getDuration(value)
            },
            HealthCheckRetryTimeoutInMilliseconds: {
                displayName: (name) => 'Health Check Retry Timeout',
                displayValueInHtml: (value) => TimeUtils.getDuration(value)
            },
            UpgradeTimeoutInMilliseconds: {
                displayName: (name) => 'Upgrade Timeout',
                displayValueInHtml: (value) => TimeUtils.getDuration(value)
            },
            UpgradeDomainTimeoutInMilliseconds: {
                displayName: (name) => 'Upgrade Domain Timeout',
                displayValueInHtml: (value) => TimeUtils.getDuration(value)
            }
        }
    };

    public constructor(data: DataService, raw: IRawMonitoringPolicy) {
        super(data, raw);
    }
}

export class UpgradeDomain extends DataModelBase<IRawUpgradeDomain> {
    public constructor(data: DataService, raw: IRawUpgradeDomain) {
        super(data, raw);
    }

    public get stateName(): string {
        if (UpgradeDomainStateRegexes.Completed.test(this.raw.State)) {
            return UpgradeDomainStateNames.Completed;
        } else if (UpgradeDomainStateRegexes.InProgress.test(this.raw.State)) {
            return UpgradeDomainStateNames.InProgress;
        }

        return UpgradeDomainStateNames.Pending;
    }

    public get badgeClass(): string {
        if (UpgradeDomainStateRegexes.Completed.test(this.raw.State)) {
            return BadgeConstants.BadgeOK;
        } else if (UpgradeDomainStateRegexes.InProgress.test(this.raw.State)) {
            return BadgeConstants.BadgeWarning;
        }
        return BadgeConstants.BadgeUnknown;
    }
}


