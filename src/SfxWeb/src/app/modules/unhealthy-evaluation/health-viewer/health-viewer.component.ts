import { Component, OnInit, Input } from '@angular/core';
import { HealthEvaluation } from 'src/app/Models/DataModels/Shared';

@Component({
  selector: 'app-health-viewer',
  templateUrl: './health-viewer.component.html',
  styleUrls: ['./health-viewer.component.scss']
})
export class HealthViewerComponent implements OnInit {

  @Input() unhealthyEvaluations: HealthEvaluation[];

  constructor() { }

  ngOnInit(): void {
  }

}
