import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemApplicationsRoutingModule } from './system-applications-routing.module';
import { EssentialsComponent } from './essentials/essentials.component';
import { BaseComponent } from './base/base.component';
import { DetailsComponent } from './details/details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DetailListTemplatesModule } from 'src/app/modules/detail-list-templates/detail-list-templates.module';
import { UnhealthyEvaluationModule } from 'src/app/modules/unhealthy-evaluation/unhealthy-evaluation.module';


@NgModule({
  declarations: [EssentialsComponent, BaseComponent, DetailsComponent],
  imports: [
    CommonModule,
    SystemApplicationsRoutingModule,
    SharedModule,
    DetailListTemplatesModule,
    UnhealthyEvaluationModule
  ]
})
export class SystemApplicationsModule { }
