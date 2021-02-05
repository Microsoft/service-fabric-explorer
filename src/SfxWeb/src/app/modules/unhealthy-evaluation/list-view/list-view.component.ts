import { Component, OnInit, Input } from '@angular/core';
import { HealthEvaluation } from 'src/app/Models/DataModels/Shared';
import { ListSettings } from 'src/app/Models/ListSettings';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent implements OnInit {

  @Input() unhealthyEvaluations: HealthEvaluation[];
  unhealthyEvaluationsListSettings: ListSettings;

  constructor(public settings: SettingsService) { }

  ngOnInit(): void {
    this.unhealthyEvaluationsListSettings = this.settings.getNewOrExistingUnhealthyEvaluationsListSettings();

  }

}
