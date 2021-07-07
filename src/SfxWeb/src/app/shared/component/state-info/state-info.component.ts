import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IRawPartition, IRawServiceDescription } from 'src/app/Models/RawDataTypes';



@Component({
  selector: 'app-state-info',
  templateUrl: './state-info.component.html',
  styleUrls: ['./state-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StateInfoComponent implements OnInit {

  @Input() stateful: boolean = false;
  @Input() data: IRawServiceDescription | IRawPartition;
  
  constructor() { }

  ngOnInit(): void {
  }

}
