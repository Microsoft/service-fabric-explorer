import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyperLinkComponent } from './hyper-link/hyper-link.component';
import { ResolverDirective } from 'src/app/modules/detail-list-templates/resolver.directive';
import { DetailTableResolverComponent } from './detail-table-resolver/detail-table-resolver.component';
import { RouterModule } from '@angular/router';
import { CopyTextComponent } from './copy-text/copy-text.component';
import { DetailListComponent } from './detail-list/detail-list.component';
import { PagerComponent } from './pager/pager.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbPaginationModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { UtcTimestampComponent } from './utc-timestamp/utc-timestamp.component';
import { ExportModalComponent } from './export-modal/export-modal.component';
import { HealtheventComponent } from './healthevent/healthevent.component';



@NgModule({
  declarations: [HyperLinkComponent, DetailTableResolverComponent, ResolverDirective, CopyTextComponent, ResolverDirective,
                 DetailListComponent, PagerComponent, UtcTimestampComponent, ExportModalComponent, HealtheventComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    NgbPaginationModule,
    NgbDropdownModule,
    FormsModule
  ],
  exports: [DetailTableResolverComponent, HyperLinkComponent, CopyTextComponent, DetailListComponent, HealtheventComponent]
})
export class DetailListTemplatesModule { }
