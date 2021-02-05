import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceRoutingModule } from './service-routing.module';
import { EssentialsComponent } from './essentials/essentials.component';
import { BaseComponent } from './base/base.component';
import { DetailsComponent } from './details/details.component';
import { ManifestComponent } from './manifest/manifest.component';
import { EventsComponent } from './events/events.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DetailListTemplatesModule } from 'src/app/modules/detail-list-templates/detail-list-templates.module';
import { EventStoreModule } from 'src/app/modules/event-store/event-store.module';
import { ScaleServiceComponent } from './scale-service/scale-service.component';
import { BackupComponent } from './backup/backup.component';
import { UnhealthyEvaluationModule } from 'src/app/modules/unhealthy-evaluation/unhealthy-evaluation.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'src/app/modules/charts/charts.module';


@NgModule({
  declarations: [EssentialsComponent, BaseComponent, DetailsComponent, ManifestComponent, EventsComponent, ScaleServiceComponent, BackupComponent],
  imports: [
    CommonModule,
    ServiceRoutingModule,
    SharedModule,
    DetailListTemplatesModule,
    EventStoreModule,
    FormsModule,
    UnhealthyEvaluationModule,
    ReactiveFormsModule,
    ChartsModule
  ],
  entryComponents: [ScaleServiceComponent]
})
export class ServiceModule { }
