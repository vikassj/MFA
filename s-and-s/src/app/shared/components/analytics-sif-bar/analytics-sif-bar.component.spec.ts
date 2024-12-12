import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsSifBarComponent } from './analytics-sif-bar.component';

describe('AnalyticsSifBarComponent', () => {
  let component: AnalyticsSifBarComponent;
  let fixture: ComponentFixture<AnalyticsSifBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsSifBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsSifBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
