import { Component, OnInit, Injector } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ClusterUpgradeProgress, ClusterHealth } from '../../../Models/DataModels/Cluster';
import { HealthStateFilterFlags } from 'src/app/Models/HealthChunkRawDataTypes';
import { SystemApplication } from 'src/app/Models/DataModels/Application';
import { Observable, forkJoin, of } from 'rxjs';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { BaseControllerDirective } from 'src/app/ViewModels/BaseController';
import { NodeCollection } from 'src/app/Models/DataModels/collections/NodeCollection';
import { ListSettings } from 'src/app/Models/ListSettings';
import { SettingsService } from 'src/app/services/settings.service';
import { map, catchError } from 'rxjs/operators';
import { IDashboardViewModel, DashboardViewModel } from 'src/app/ViewModels/DashboardViewModels';
import { RoutesService } from 'src/app/services/routes.service';
import { HealthUtils, HealthStatisticsEntityKind } from 'src/app/Utils/healthUtils';


@Component({
  selector: 'app-essentials',
  templateUrl: './essentials.component.html',
  styleUrls: ['./essentials.component.scss']
})
export class EssentialsComponent extends BaseControllerDirective {

  clusterUpgradeProgress: ClusterUpgradeProgress;
  nodes: NodeCollection;
  clusterHealth: ClusterHealth;
  systemApp: SystemApplication;

  nodesDashboard: IDashboardViewModel;
  appsDashboard: IDashboardViewModel;
  servicesDashboard: IDashboardViewModel;
  partitionsDashboard: IDashboardViewModel;
  replicasDashboard: IDashboardViewModel;
  upgradesDashboard: IDashboardViewModel;
  upgradeAppsCount = 0;

  constructor(public data: DataService,
              public injector: Injector,
              public settings: SettingsService,
              private routes: RoutesService) {
    super(injector);
  }

  setup() {
    this.clusterHealth = this.data.getClusterHealth(HealthStateFilterFlags.Default, HealthStateFilterFlags.None, HealthStateFilterFlags.None);
    this.clusterUpgradeProgress = this.data.clusterUpgradeProgress;
    this.nodes = this.data.nodes;
    this.systemApp = this.data.systemApp;
  }

  refresh(messageHandler?: IResponseMessageHandler): Observable<any> {
    return forkJoin([
      this.clusterHealth.refresh(messageHandler).pipe(map((clusterHealth: ClusterHealth) => {
        const nodesHealthStateCount = HealthUtils.getHealthStateCount(clusterHealth.raw, HealthStatisticsEntityKind.Node);
        this.nodesDashboard = DashboardViewModel.fromHealthStateCount('Nodes', 'Node', true, nodesHealthStateCount, this.data.routes, RoutesService.getNodesViewPath());

        const appsHealthStateCount = HealthUtils.getHealthStateCount(clusterHealth.raw, HealthStatisticsEntityKind.Application);
        this.appsDashboard = DashboardViewModel.fromHealthStateCount('Applications', 'Application', true, appsHealthStateCount, this.data.routes, RoutesService.getAppsViewPath());

        const servicesHealthStateCount = HealthUtils.getHealthStateCount(clusterHealth.raw, HealthStatisticsEntityKind.Service);
        this.servicesDashboard = DashboardViewModel.fromHealthStateCount('Services', 'Service', false, servicesHealthStateCount);

        const partitionsDashboard = HealthUtils.getHealthStateCount(clusterHealth.raw, HealthStatisticsEntityKind.Partition);
        this.partitionsDashboard = DashboardViewModel.fromHealthStateCount('Partitions', 'Partition', false, partitionsDashboard);

        const replicasHealthStateCount = HealthUtils.getHealthStateCount(clusterHealth.raw, HealthStatisticsEntityKind.Replica);
        this.replicasDashboard = DashboardViewModel.fromHealthStateCount('Replicas', 'Replica', false, replicasHealthStateCount);
        clusterHealth.checkExpiredCertStatus();
    })),
      this.data.getApps(true, messageHandler)
                .pipe(map(apps => {
                    this.upgradeAppsCount = apps.collection.filter(app => app.isUpgrading).length;
                })),
      this.nodes.refresh(messageHandler),
      this.systemApp.refresh(messageHandler).pipe(catchError(err => of(null))),
      this.clusterUpgradeProgress.refresh(messageHandler)
    ]);
  }

}
