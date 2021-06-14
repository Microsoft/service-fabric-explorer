import { Component, OnInit, Injector } from '@angular/core';
import { BaseControllerDirective } from 'src/app/ViewModels/BaseController';
import { DataService } from 'src/app/services/data.service';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { Observable } from 'rxjs';
import { SettingsService } from 'src/app/services/settings.service';
import { InfrastructureJobCollection } from 'src/app/Models/DataModels/collections/InfrastructureJobCollection';


@Component({
  selector: 'app-infrastructure-tasks',
  templateUrl: './infrastructure-tasks.component.html',
  styleUrls: ['./infrastructure-tasks.component.scss']
})
export class InfrastructureTasksComponent extends  BaseControllerDirective {

  public infraJobsCollection : InfrastructureJobCollection ; 


  constructor(private data: DataService, injector: Injector , private settings: SettingsService) {
    super(injector);
  }

  setup() {
    this.infraJobsCollection  = this.data.infrastructureCollection;
  }

  refresh(messageHandler?: IResponseMessageHandler): Observable<any> {
    return this.infraJobsCollection.refresh(messageHandler);
  }

}
