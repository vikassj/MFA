import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsRatingBarComponent } from './analytics-rating-bar.component';

describe('AnalyticsRatingBarComponent', () => {
  let component: AnalyticsRatingBarComponent;
  let fixture: ComponentFixture<AnalyticsRatingBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsRatingBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsRatingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
