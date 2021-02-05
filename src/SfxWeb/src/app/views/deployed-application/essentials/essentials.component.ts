import { Component, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { SettingsService } from 'src/app/services/settings.service';
import { ListSettings, ListColumnSettingForLink, ListColumnSettingForBadge, ListColumnSettingWithFilter, ListColumnSetting } from 'src/app/Models/ListSettings';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { DeployedAppBaseControllerDirective } from '../DeployedApplicationBase';

@Component({
  selector: 'app-essentials',
  templateUrl: './essentials.component.html',
  styleUrls: ['./essentials.component.scss']
})
export class EssentialsComponent extends DeployedAppBaseControllerDirective {
  listSettings: ListSettings;

  constructor(protected data: DataService, injector: Injector, private settings: SettingsService) {
      super(data, injector);
   }


   refresh(messageHandler?: IResponseMessageHandler): Observable<any>{
    return this.deployedApp.deployedServicePackages.refresh(messageHandler);
  }


  setup(){
    this.listSettings = this.settings.getNewOrExistingListSettings('servicePackages', ['name'], [
      new ListColumnSettingForLink('uniqueId', 'Name', item => item.viewPath),
      new ListColumnSetting('raw.Version', 'Version'),
      new ListColumnSettingForBadge('health.healthState', 'Health State'),
      new ListColumnSettingWithFilter('raw.Status', 'Status')
    ]);
  }
}
