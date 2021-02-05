import { Component, Injector } from '@angular/core';
import { ListSettings, ListColumnSettingForLink, ListColumnSetting, ListColumnSettingWithFilter, ListColumnSettingForBadge } from 'src/app/Models/ListSettings';
import { DataService } from 'src/app/services/data.service';
import { SettingsService } from 'src/app/services/settings.service';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { Observable, forkJoin, of } from 'rxjs';
import { PartitionBaseControllerDirective } from '../PartitionBase';

@Component({
  selector: 'app-essentials',
  templateUrl: './essentials.component.html',
  styleUrls: ['./essentials.component.scss']
})
export class EssentialsComponent extends PartitionBaseControllerDirective {

  public hideReplicator = true;

  unhealthyEvaluationsListSettings: ListSettings;
  listSettings: ListSettings;

  constructor(protected data: DataService, injector: Injector, private settings: SettingsService) {
    super(data, injector);
  }

  setup() {

  }

  refresh(messageHandler?: IResponseMessageHandler): Observable<any>{
    if (!this.listSettings) {
        let defaultSortProperties = ['replicaRoleSortPriority', 'raw.NodeName'];
        const columnSettings = [
            new ListColumnSettingForLink('id', 'Id', item => item.viewPath),
            new ListColumnSetting('raw.NodeName', 'Node Name'),
            new ListColumnSettingWithFilter('role', 'Replica Role', {sortPropertyPaths: defaultSortProperties}),
            new ListColumnSettingForBadge('healthState', 'Health State'),
            new ListColumnSettingWithFilter('raw.ReplicaStatus', 'Status')
        ];

        if (this.partition.isStatelessService) {
            columnSettings.splice(2, 1); // Remove replica role column
            defaultSortProperties = ['raw.NodeName'];
        }

        // Keep the sort properties in sync with the sortBy for ClusterTreeService.getDeployedReplicas
        this.listSettings = this.settings.getNewOrExistingListSettings('replicas', defaultSortProperties, columnSettings);
    }

    return forkJoin([
      this.partition.health.refresh(messageHandler),
      this.partition.replicas.refresh(messageHandler)
    ]);
  }
}
