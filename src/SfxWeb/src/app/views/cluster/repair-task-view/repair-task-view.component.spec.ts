import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairTaskViewComponent } from './repair-task-view.component';

describe('RepairTaskViewComponent', () => {
  let component: RepairTaskViewComponent;
  let fixture: ComponentFixture<RepairTaskViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepairTaskViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepairTaskViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
