import { Component, OnInit } from '@angular/core';
import { HealthEvent } from 'src/app/Models/DataModels/HealthEvent';
import { HealthEvaluation } from 'src/app/Models/DataModels/Shared';
import { ListColumnSetting } from 'src/app/Models/ListSettings';
import { DetailBaseComponent } from 'src/app/ViewModels/detail-table-base.component';

@Component({
  selector: 'app-healthevent',
  templateUrl: './healthevent.component.html',
  styleUrls: ['./healthevent.component.scss']
})
export class HealtheventComponent implements DetailBaseComponent {

  item: HealthEvaluation;
  listSetting: ListColumnSetting;

  link: string;
  constructor() { }

}
