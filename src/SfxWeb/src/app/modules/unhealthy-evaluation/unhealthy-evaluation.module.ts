import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthViewerComponent } from './health-viewer/health-viewer.component';
import { UnhealthyEvaluationsContainerComponent } from './unhealthy-evaluations-container/unhealthy-evaluations-container.component';
import { UnhealthyEvaluationComponent } from './unhealthy-evaluation/unhealthy-evaluation.component';
import { UnhealtyEvaluationChildFilterPipe } from './unhealty-evaluation-child-filter.pipe';
import { DetailListTemplatesModule } from '../detail-list-templates/detail-list-templates.module';
import { ListViewComponent } from './list-view/list-view.component';
import { NgbNavModule, NgbButtonsModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [UnhealthyEvaluationsContainerComponent, UnhealthyEvaluationComponent, UnhealtyEvaluationChildFilterPipe, HealthViewerComponent, ListViewComponent  ],
  exports: [HealthViewerComponent],
  imports: [
    CommonModule,
    DetailListTemplatesModule,
    NgbNavModule,
    SharedModule,
    RouterModule,
    NgbButtonsModule,
    FormsModule
  ]
})
export class UnhealthyEvaluationModule { }
