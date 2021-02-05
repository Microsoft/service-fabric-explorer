import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeployedServicePackageRoutingModule } from './deployed-service-package-routing.module';
import { BaseComponent } from './base/base.component';
import { DetailsComponent } from './details/details.component';
import { ManifestComponent } from './manifest/manifest.component';
import { EssentialsComponent } from './essentials/essentials.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DetailListTemplatesModule } from 'src/app/modules/detail-list-templates/detail-list-templates.module';
import { UnhealthyEvaluationModule } from 'src/app/modules/unhealthy-evaluation/unhealthy-evaluation.module';


@NgModule({
  declarations: [BaseComponent, DetailsComponent, ManifestComponent, EssentialsComponent],
  imports: [
    CommonModule,
    SharedModule,
    DeployedServicePackageRoutingModule,
    DetailListTemplatesModule,
    UnhealthyEvaluationModule
  ]
})
export class DeployedServicePackageModule { }
