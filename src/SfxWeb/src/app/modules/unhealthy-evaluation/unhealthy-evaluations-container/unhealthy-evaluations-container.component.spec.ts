import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnhealthyEvaluationsContainerComponent } from './unhealthy-evaluations-container.component';

describe('UnhealthyEvaluationsContainerComponent', () => {
  let component: UnhealthyEvaluationsContainerComponent;
  let fixture: ComponentFixture<UnhealthyEvaluationsContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnhealthyEvaluationsContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnhealthyEvaluationsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
