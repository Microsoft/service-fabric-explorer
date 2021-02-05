import { Component, Injector } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { ListSettings, ListColumnSetting, ListColumnSettingForLink, ListColumnSettingForBadge, ListColumnSettingWithFilter } from 'src/app/Models/ListSettings';
import { SettingsService } from 'src/app/services/settings.service';
import { DeployedApplicationCollection } from 'src/app/Models/DataModels/collections/DeployedApplicationCollection';
import { NodeBaseControllerDirective } from '../NodeBase';

@Component({
  selector: 'app-essentials',
  templateUrl: './essentials.component.html',
  styleUrls: ['./essentials.component.scss']
})
export class EssentialsComponent extends NodeBaseControllerDirective {

  deployedApps: DeployedApplicationCollection;
  listSettings: ListSettings;

  constructor(protected data: DataService, injector: Injector, private settings: SettingsService) {
    super(data, injector);
  }

  setup() {
    this.listSettings = this.settings.getNewOrExistingListSettings('apps', ['name'], [
      new ListColumnSettingForLink('name', 'Name', item => item.viewPath),
      new ListColumnSetting('raw.TypeName', 'Application Type'),
      new ListColumnSettingForBadge('health.healthState', 'Health State'),
      new ListColumnSettingWithFilter('raw.Status', 'Status'),
    ]);
  }

  refresh(messageHandler?: IResponseMessageHandler): Observable<any>{
    return this.node.deployedApps.refresh(messageHandler).pipe(map(deployedApps => {
        this.deployedApps = deployedApps;
      }));
  }
}
