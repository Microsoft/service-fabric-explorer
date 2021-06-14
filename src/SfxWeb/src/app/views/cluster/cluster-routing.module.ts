import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EssentialsComponent } from './essentials/essentials.component';
import { DetailsComponent } from './details/details.component';
import { BaseComponent } from './base/base.component';
import { MetricsComponent } from './metrics/metrics.component';
import { ClustermapComponent } from './clustermap/clustermap.component';
import { ImagestoreComponent } from './imagestore/imagestore.component';
import { ManifestComponent } from './manifest/manifest.component';
import { EventsComponent } from './events/events.component';
import { BackupsComponent } from './backups/backups.component';
import { RepairTasksComponent } from './repair-tasks/repair-tasks.component';
import { InfrastructureTasksComponent } from './infrastructure-tasks/infrastructure-tasks.component';


const routes: Routes = [{
  path: '', component: BaseComponent, children: [
    { path: 'details', component: DetailsComponent },
    { path: 'metrics', component: MetricsComponent },
    { path: 'clustermap', component: ClustermapComponent },
    { path: 'imagestore', component: ImagestoreComponent },
    { path: 'manifest', component: ManifestComponent },
    { path: 'events', component: EventsComponent },
    { path: 'backups', component: BackupsComponent },
    { path: 'repairtasks', component: RepairTasksComponent },
    { path: 'infrastructurejobs', component: InfrastructureTasksComponent },
    { path: '', component: EssentialsComponent },
  ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClusterRoutingModule { }
