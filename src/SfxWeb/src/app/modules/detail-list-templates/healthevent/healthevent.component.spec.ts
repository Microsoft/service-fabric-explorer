import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealtheventComponent } from './healthevent.component';

describe('HealtheventComponent', () => {
  let component: HealtheventComponent;
  let fixture: ComponentFixture<HealtheventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealtheventComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HealtheventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
