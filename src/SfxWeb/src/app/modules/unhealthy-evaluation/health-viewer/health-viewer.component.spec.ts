import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HealthViewerComponent } from './health-viewer.component';

describe('HealthViewerComponent', () => {
  let component: HealthViewerComponent;
  let fixture: ComponentFixture<HealthViewerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
