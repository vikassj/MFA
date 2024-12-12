import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsTrendBarComponent } from './analytics-trend-bar.component';

describe('AnalyticsTrendBarComponent', () => {
  let component: AnalyticsTrendBarComponent;
  let fixture: ComponentFixture<AnalyticsTrendBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsTrendBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsTrendBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
