import { Component, Injector } from '@angular/core';
import { ListSettings } from 'src/app/Models/ListSettings';
import { DataService } from 'src/app/services/data.service';
import { SettingsService } from 'src/app/services/settings.service';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ReplicaBaseControllerDirective } from '../ReplicaBase';
import { RoutesService } from 'src/app/services/routes.service';

@Component({
  selector: 'app-essentials',
  templateUrl: './essentials.component.html',
  styleUrls: ['./essentials.component.scss']
})
export class EssentialsComponent extends ReplicaBaseControllerDirective {
  unhealthyEvaluationsListSettings: ListSettings;
  nodeView: string;

  constructor(protected data: DataService, injector: Injector, private settings: SettingsService) {
    super(data, injector);
  }

  refresh(messageHandler?: IResponseMessageHandler): Observable<any>{
      if (!this.isSystem) {
          try {
            this.replica.detail.refresh(messageHandler).pipe(map( () => {
                const rawDataProperty = this.replica.isStatefulService ? 'DeployedServiceReplica' : 'DeployedServiceReplicaInstance';
                const detailRaw = this.replica.detail.raw[rawDataProperty];

                const serviceNameOnly = detailRaw.ServiceManifestName;
                const activationId = detailRaw.ServicePackageActivationId || null;
                this.nodeView = RoutesService.getDeployedReplicaViewPath(this.replica.raw.NodeName, this.appId, serviceNameOnly, activationId, this.partitionId, this.replicaId);
            })).pipe(tap()).subscribe();
          } catch (e) {
              console.log(e);
          }
      }
      return this.replica.health.refresh(messageHandler);
  }
}
