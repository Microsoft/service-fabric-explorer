import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-clip-board',
  templateUrl: './clip-board.component.html',
  styleUrls: ['./clip-board.component.scss']
})
export class ClipBoardComponent {

  @Input() func: () => string;
  @Input() text = '';

  constructor() { }

  copy(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = !!this.func ? this.func() : this.text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
}
