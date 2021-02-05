import { Component, OnInit, Injector } from '@angular/core';
import { ServiceApplicationsBaseControllerDirective } from '../SystemApplicationBase';
import { ListSettings, ListColumnSettingForLink, ListColumnSetting, ListColumnSettingWithFilter, ListColumnSettingForBadge } from 'src/app/Models/ListSettings';
import { DataService } from 'src/app/services/data.service';
import { SettingsService } from 'src/app/services/settings.service';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-essentials',
  templateUrl: './essentials.component.html',
  styleUrls: ['./essentials.component.scss']
})
export class EssentialsComponent extends ServiceApplicationsBaseControllerDirective {

  listSettings: ListSettings;

  constructor(protected data: DataService, injector: Injector, private settings: SettingsService) {
    super(data, injector);
  }

  setup() {
    this.listSettings = this.settings.getNewOrExistingListSettings('systemServices', ['name'], [
      new ListColumnSettingForLink('name', 'Name', item => item.viewPath),
      new ListColumnSetting('raw.TypeName', 'Service Type'),
      new ListColumnSetting('raw.ManifestVersion', 'Version'),
      new ListColumnSettingWithFilter('raw.ServiceKind', 'Service Kind'),
      new ListColumnSettingForBadge('healthState', 'Health State'),
      new ListColumnSettingWithFilter('raw.ServiceStatus', 'Status')
  ]);
  }

  refresh(messageHandler?: IResponseMessageHandler): Observable<any>{
    return this.systemApp.services.refresh(messageHandler);
  }

}
