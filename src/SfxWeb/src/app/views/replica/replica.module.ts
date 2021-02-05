import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReplicaRoutingModule } from './replica-routing.module';
import { BaseComponent } from './base/base.component';
import { DetailsComponent } from './details/details.component';
import { EssentialsComponent } from './essentials/essentials.component';
import { EventsComponent } from './events/events.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DetailListTemplatesModule } from 'src/app/modules/detail-list-templates/detail-list-templates.module';
import { EventStoreModule } from 'src/app/modules/event-store/event-store.module';
import { UnhealthyEvaluationModule } from 'src/app/modules/unhealthy-evaluation/unhealthy-evaluation.module';


@NgModule({
  declarations: [BaseComponent, DetailsComponent, EssentialsComponent, EventsComponent],
  imports: [
    CommonModule,
    ReplicaRoutingModule,
    SharedModule,
    DetailListTemplatesModule,
    EventStoreModule,
    UnhealthyEvaluationModule
  ]
})
export class ReplicaModule { }
