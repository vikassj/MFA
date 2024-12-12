import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskRatingBarComponent } from './risk-rating-bar.component';

describe('RiskRatingBarComponent', () => {
  let component: RiskRatingBarComponent;
  let fixture: ComponentFixture<RiskRatingBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiskRatingBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskRatingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
