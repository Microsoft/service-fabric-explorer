import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { IUnhealthyEvaluationNode } from 'src/app/Utils/healthUtils';

@Component({
  selector: 'app-unhealthy-evaluation',
  templateUrl: './unhealthy-evaluation.component.html',
  styleUrls: ['./unhealthy-evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnhealthyEvaluationComponent implements OnChanges, OnInit, AfterViewInit {

  @Input() isAnchor = false;

  @Input() node: IUnhealthyEvaluationNode;

  @Input() condensed = true;
  @Input() containsErrorInPath = false;
  @Input() fullDescription = false;


  @Output() anchor = new EventEmitter<IUnhealthyEvaluationNode>();

  showChildren = true;

  showFullText = false;
  displayTextIsLong = false;

  @ViewChild('tref', { read: ElementRef }) tref: ElementRef;

  constructor(private cdr: ChangeDetectorRef) { }
  ngAfterViewInit(): void {
    this.checkText(true);
  }

  ngOnInit(): void {
    this.checkText();
  }

  ngOnChanges(): void {
    this.checkText();
  }

  checkText(runCdr: boolean = false) {
    if (this.tref) {
      this.displayTextIsLong = this.tref.nativeElement.clientHeight > 60;
      if (runCdr) {
        this.cdr.detectChanges();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  checkTextOnResize() {
    this.checkText(true);
  }

  toggleShow() {
    this.showChildren = !this.showChildren;
  }

  toggleShowText() {
    this.showFullText = !this.showFullText;
    this.cdr.detectChanges();
  }

  onAnchorSet(node: IUnhealthyEvaluationNode) {
    this.anchor.emit(node);
  }

  trackById(index: number, node: IUnhealthyEvaluationNode) {
    return node.healthEvaluation.uniqueId;
  }

}
