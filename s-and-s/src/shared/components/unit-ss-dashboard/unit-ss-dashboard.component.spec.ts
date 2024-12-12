import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitSsDashboardComponent } from './unit-ss-dashboard.component';

describe('UnitSsDashboardComponent', () => {
  let component: UnitSsDashboardComponent;
  let fixture: ComponentFixture<UnitSsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitSsDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitSsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
