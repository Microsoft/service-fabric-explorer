import { Injectable } from '@angular/core';
import { ListColumnSetting, ListSettings, ListColumnSettingForBadge, ListColumnSettingForLink, ListColumnSettingWithCopyText, ListColumnSettingWithUtcTime, ListColumnSettingForHealthEvent } from '../Models/ListSettings';
import { NodeStatusConstants, Constants } from '../Common/Constants';
import { ClusterLoadInformation } from '../Models/DataModels/Cluster';
import { NodeLoadInformation } from '../Models/DataModels/Node';
import { MetricsViewModel } from '../ViewModels/MetricsViewModel';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private listSettings: Record<string, ListSettings>;
  private iPaginationLimit: number;
  private iMetricsViewModel: MetricsViewModel;

  public get paginationLimit(): number {
      return this.iPaginationLimit;
  }

  public set paginationLimit(limit: number) {
      if (!limit) {
          return;
      }
      if (limit < Constants.PaginationLimitMin) {
          limit = Constants.PaginationLimitMin;
      } else if (limit > Constants.PaginationLimitMax) {
          limit = Constants.PaginationLimitMax;
      }
      this.iPaginationLimit = limit;
      this.storage.setValue(Constants.PaginationLimitStorageKey, limit);
      this.updatePaginationLimit(limit);
  }

  public constructor(private storage: StorageService) {
      this.listSettings = {};
      this.iPaginationLimit = storage.getValueNumber(Constants.PaginationLimitStorageKey, Constants.DefaultPaginationLimit);
  }

  public getNewOrExistingMetricsViewModel(clusterLoadInformation: ClusterLoadInformation, nodesLoadInformation: NodeLoadInformation[]): MetricsViewModel {
      if (!this.iMetricsViewModel) {
          this.iMetricsViewModel = new MetricsViewModel(clusterLoadInformation, nodesLoadInformation);
      }
      return this.iMetricsViewModel;
  }

  public getNewOrExistingListSettings(
      listName: string,
      defaultSortProperties: string[] = [],
      columnSettings: ListColumnSetting[] = [],
      secondRowColumnSettings: ListColumnSetting[] = [],
      secondRowCollapsible: boolean = false,
      showSecondRow: (item) => boolean = (item) => true,
      searchable: boolean = true) {

      // Use URL + listName as unique key to track list settings on detail pages
      const key: string = listName; // TODO fix this this.$location.path() + "/" + listName;
      if (!this.listSettings[key]) {
          this.listSettings[key] = new ListSettings(this.paginationLimit, defaultSortProperties, columnSettings, secondRowColumnSettings, secondRowCollapsible, showSecondRow, searchable);
      }
      return this.listSettings[key];
  }

  public getNewOrExistingTreeNodeListSettings(
      listKey: string,
      defaultSortProperties: string[] = [],
      columnSettings: ListColumnSetting[] = []) {

      if (!this.listSettings[listKey]) {
          this.listSettings[listKey] = new ListSettings(this.paginationLimit, defaultSortProperties, columnSettings);
      }
      return this.listSettings[listKey];
  }

  public getNewOrExistingUnhealthyEvaluationsListSettings(listKey: string = 'unhealthyEvaluations') {
      return this.getNewOrExistingListSettings(listKey, null,
          [
              new ListColumnSettingForLink('kind', 'Kind', (item) =>  item.viewPath),
              new ListColumnSettingForBadge('healthState', 'Health State'),
              new ListColumnSettingForHealthEvent(),
              new ListColumnSettingWithUtcTime('sourceTimeStamp', 'Source UTC'),
          ]);
  }

  public getNewOrExistingHealthEventsListSettings(listKey: string = 'healthEvents') {
      return this.getNewOrExistingListSettings(listKey, ['raw.SequenceNumber'],
          [
              new ListColumnSettingForBadge('healthState', 'Health State'),
              new ListColumnSetting('raw.SourceId', 'Source'),
              new ListColumnSetting('raw.Property', 'Property'),
              new ListColumnSettingWithUtcTime('sourceUtcTimestamp', 'Source UTC'),
              new ListColumnSetting('TTL', 'TTL'),
              new ListColumnSetting('raw.SequenceNumber', 'Sequence Number'),
              new ListColumnSetting('raw.RemoveWhenExpired', 'Remove When Expired'),
              new ListColumnSetting('raw.IsExpired', 'Is Expired')
          ],
          // Second row with description
          [
              new ListColumnSetting('placeholder', 'placeholder', {enableFilter: false}), // Empty column
              new ListColumnSettingForHealthEvent(),
          ],
          false,
          (item) => item.description.length > 0
          );
  }

  public getNewOrExistingNodeStatusListSetting(listKey: string = 'nodeStatus') {
      return this.getNewOrExistingListSettings(listKey, null,
          [
              new ListColumnSetting('nodeType', 'Node Type'),
              new ListColumnSetting('totalCount', 'Total Node Count'),
              new ListColumnSetting(`statusTypeCounts.${NodeStatusConstants.Up}`, NodeStatusConstants.Up),
              new ListColumnSetting(`statusTypeCounts.${NodeStatusConstants.Down}`, NodeStatusConstants.Down),
              new ListColumnSetting(`statusTypeCounts.${NodeStatusConstants.Disabled}`, NodeStatusConstants.Disabled),
              new ListColumnSetting(`statusTypeCounts.${NodeStatusConstants.Disabling}`, NodeStatusConstants.Disabling),
              new ListColumnSetting('errorCount', 'Error'),
              new ListColumnSetting('warningCount', 'Warning'),
          ]

      );
  }

  public getNewOrExistingBackupPolicyListSettings(listKey: string = 'backupPolicies') {
      return this.getNewOrExistingListSettings(listKey, null, [
        new ListColumnSetting('raw.Name', 'Name', {
            enableFilter: false,
            getDisplayHtml: (item, property) =>  `<span class="link">${property}</span>`,
            colspan: 1,
            clickEvent: item => item.action.run()
          }),
          new ListColumnSetting('raw.Schedule.ScheduleKind', 'ScheduleKind'),
          new ListColumnSetting('raw.Storage.StorageKind', 'StorageKind'),
          new ListColumnSetting('raw.AutoRestoreOnDataLoss', 'AutoRestoreOnDataLoss'),
          new ListColumnSetting('raw.MaxIncrementalBackups', 'MaxIncrementalBackups'),
      ]);
  }

  public getNewOrExistingNetworkRequestListSettings(includeApiDesc: boolean = false) {
    const listKey = 'requestsData';
    const settings = [
        new ListColumnSetting('statusCode', 'Status Code'),
        new ListColumnSetting('errorMessage', 'Error Message'),
        new ListColumnSetting('duration', 'Duration(MS)'),
        new ListColumnSettingWithUtcTime('startTime', 'Start Time'),
      ];

    if (includeApiDesc) {
        return this.getNewOrExistingListSettings(listKey + 'andApiDesc', [],
                                                [new ListColumnSetting('apiDesc', 'API Description')].concat(settings));
      }

    return this.getNewOrExistingListSettings(listKey, [], settings);

  }

  // Update all existing list settings to use new limit
  private updatePaginationLimit(limit: number): void {
      Object.keys(this.listSettings).forEach(key => {
          const item = this.listSettings[key];
          item.currentPage = 1;
          item.limit = limit;
      });
  }
}

