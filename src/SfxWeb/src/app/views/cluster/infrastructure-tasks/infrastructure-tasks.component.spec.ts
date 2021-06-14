import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfrastructureTasksComponent } from './infrastructure-tasks.component';

describe('InfrastructureTasksComponent', () => {
  let component: InfrastructureTasksComponent;
  let fixture: ComponentFixture<InfrastructureTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfrastructureTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfrastructureTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
