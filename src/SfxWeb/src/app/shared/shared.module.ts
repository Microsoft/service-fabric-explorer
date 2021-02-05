import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './component/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClipBoardComponent } from './component/clip-board/clip-board.component';
import { HealthBadgeComponent } from './component/health-badge/health-badge.component';
import { CandyBarCompactComponent } from './component/candy-bar-compact/candy-bar-compact.component';
import { DetailViewPartComponent } from './component/detail-view-part/detail-view-part.component';
import { CollapseContainerComponent } from './component/collapse-container/collapse-container.component';
import { RefreshRateComponent } from './component/refresh-rate/refresh-rate.component';
import { DragDirective } from './directive/drag.directive';
import { ActionDialogComponent } from './component/action-dialog/action-dialog.component';
import { ManifestComponent } from './component/manifest/manifest.component';
import { ActionCollectionDropDownComponent } from './component/action-collection-drop-down/action-collection-drop-down.component';
import { NgbDropdownModule, NgbToastModule, NgbDatepickerModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { InputComponent } from './component/input/input.component';
import { ToastContainerComponent } from './component/toast-container/toast-container.component';
import { CheckBoxComponent } from './component/check-box/check-box.component';
import { ClusterUpgradeBannerComponent } from './component/cluster-upgrade-banner/cluster-upgrade-banner.component';
import { DualDatePickerComponent } from './component/dual-date-picker/dual-date-picker.component';
import { AdvancedOptionComponent } from './component/advanced-option/advanced-option.component';
import { ReplicaAddressComponent } from './component/replica-address/replica-address.component';
import { ToggleComponent } from './component/toggle/toggle.component';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { LocalTimeComponent } from './component/local-time/local-time.component';
import { DisplayTimeComponent } from './component/display-time/display-time.component';
@NgModule({
  declarations: [NavbarComponent, ClipBoardComponent, HealthBadgeComponent, CandyBarCompactComponent, DetailViewPartComponent,
                 CollapseContainerComponent, RefreshRateComponent, DragDirective, ActionDialogComponent, ManifestComponent,
                 ActionCollectionDropDownComponent, InputComponent, ToastContainerComponent, CheckBoxComponent,
                 ClusterUpgradeBannerComponent, DualDatePickerComponent, AdvancedOptionComponent, ReplicaAddressComponent,
                 FormatDatePipe, LocalTimeComponent, DisplayTimeComponent, ToggleComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbDropdownModule,
    NgbToastModule,
    NgbDatepickerModule,
    NgbTooltipModule
  ],
  exports: [NavbarComponent, ClipBoardComponent, HealthBadgeComponent, CandyBarCompactComponent, DetailViewPartComponent,
            CollapseContainerComponent, RefreshRateComponent, DragDirective, ActionDialogComponent, ManifestComponent,
            ActionCollectionDropDownComponent, InputComponent, ToastContainerComponent, CheckBoxComponent,
            ClusterUpgradeBannerComponent, DualDatePickerComponent, AdvancedOptionComponent, ReplicaAddressComponent,
            FormatDatePipe, LocalTimeComponent, DisplayTimeComponent, ToggleComponent]
})
export class SharedModule { }
