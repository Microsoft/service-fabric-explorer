import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class ToggleComponent {
  @Input() state = false;
  @Output() stateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  changeState() {
    this.stateChange.emit(this.state);
  }

}
