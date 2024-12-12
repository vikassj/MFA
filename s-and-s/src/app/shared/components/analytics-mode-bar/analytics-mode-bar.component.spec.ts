import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsModeBarComponent } from './analytics-mode-bar.component';

describe('AnalyticsModeBarComponent', () => {
  let component: AnalyticsModeBarComponent;
  let fixture: ComponentFixture<AnalyticsModeBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsModeBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsModeBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
