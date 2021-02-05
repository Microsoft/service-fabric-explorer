import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClusterRoutingModule } from './cluster-routing.module';
import { EssentialsComponent } from './essentials/essentials.component';
import { DetailsComponent } from './details/details.component';
import { BaseComponent } from './base/base.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MetricsComponent } from './metrics/metrics.component';
import { ClustermapComponent } from './clustermap/clustermap.component';
import { ImagestoreComponent } from './imagestore/imagestore.component';
import { ManifestComponent } from './manifest/manifest.component';
import { EventsComponent } from './events/events.component';
import { DetailListTemplatesModule } from 'src/app/modules/detail-list-templates/detail-list-templates.module';
import { ImagestoreModule } from 'src/app/modules/imagestore/imagestore.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionCreateBackupPolicyComponent } from './action-create-backup-policy/action-create-backup-policy.component';
import { EventStoreModule } from 'src/app/modules/event-store/event-store.module';
import { UpgradeProgressModule } from 'src/app/modules/upgrade-progress/upgrade-progress.module';
import { ChartsModule } from 'src/app/modules/charts/charts.module';
import { StatusWarningsComponent } from './status-warnings/status-warnings.component';
import { BackupsComponent } from './backups/backups.component';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { BackupRestoreModule } from 'src/app/modules/backup-restore/backup-restore.module';
import { RepairTasksComponent } from './repair-tasks/repair-tasks.component';
import { RepairTaskViewComponent } from './repair-task-view/repair-task-view.component';
import { UnhealthyEvaluationModule } from 'src/app/modules/unhealthy-evaluation/unhealthy-evaluation.module';

@NgModule({
  declarations: [EssentialsComponent, DetailsComponent, BaseComponent, MetricsComponent, ClustermapComponent,
                 ImagestoreComponent, ManifestComponent, EventsComponent, ActionCreateBackupPolicyComponent,
                 StatusWarningsComponent, BackupsComponent, RepairTasksComponent, RepairTaskViewComponent],
  imports: [
    CommonModule,
    ClusterRoutingModule,
    SharedModule,
    DetailListTemplatesModule,
    ImagestoreModule,
    FormsModule,
    ReactiveFormsModule,
    EventStoreModule,
    ChartsModule,
    NgbDropdownModule,
    BackupRestoreModule,
    UnhealthyEvaluationModule,
    NgbNavModule,
    UpgradeProgressModule
  ]
})
export class ClusterModule { }
