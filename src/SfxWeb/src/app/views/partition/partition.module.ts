import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PartitionRoutingModule } from './partition-routing.module';
import { BaseComponent } from './base/base.component';
import { EssentialsComponent } from './essentials/essentials.component';
import { DetailsComponent } from './details/details.component';
import { EventsComponent } from './events/events.component';
import { BackupsComponent } from './backups/backups.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DetailListTemplatesModule } from 'src/app/modules/detail-list-templates/detail-list-templates.module';
import { EventStoreModule } from 'src/app/modules/event-store/event-store.module';
import { BackupRestoreModule } from 'src/app/modules/backup-restore/backup-restore.module';
import { PartitionReplicationModule } from 'src/app/modules/partition-replication/partition-replication.module';
import { PartitionRestoreBackUpComponent } from './partition-restore-back-up/partition-restore-back-up.component';
import { PartitionTriggerBackUpComponent } from './partition-trigger-back-up/partition-trigger-back-up.component';
import { UnhealthyEvaluationModule } from 'src/app/modules/unhealthy-evaluation/unhealthy-evaluation.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackupinfoComponent } from './backupinfo/backupinfo.component';


@NgModule({
  declarations: [BaseComponent, EssentialsComponent, DetailsComponent, EventsComponent, BackupsComponent, PartitionRestoreBackUpComponent, PartitionTriggerBackUpComponent, BackupinfoComponent],
  imports: [
    CommonModule,
    PartitionRoutingModule,
    SharedModule,
    DetailListTemplatesModule,
    EventStoreModule,
    BackupRestoreModule,
    ReactiveFormsModule,
    UnhealthyEvaluationModule,
    PartitionReplicationModule,
    FormsModule
  ],
  exports: [BackupinfoComponent]
})
export class PartitionModule { }
