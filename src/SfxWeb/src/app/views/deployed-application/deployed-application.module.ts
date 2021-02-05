import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeployedApplicationRoutingModule } from './deployed-application-routing.module';
import { BaseComponent } from './base/base.component';
import { EssentialsComponent } from './essentials/essentials.component';
import { DetailsComponent } from './details/details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DetailListTemplatesModule } from 'src/app/modules/detail-list-templates/detail-list-templates.module';
import { UnhealthyEvaluationModule } from 'src/app/modules/unhealthy-evaluation/unhealthy-evaluation.module';


@NgModule({
  declarations: [BaseComponent, EssentialsComponent, DetailsComponent],
  imports: [
    CommonModule,
    DeployedApplicationRoutingModule,
    SharedModule,
    DetailListTemplatesModule,
    UnhealthyEvaluationModule
  ]
})
export class DeployedApplicationModule { }
