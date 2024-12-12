import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriticalObservationBarComponent } from './critical-observation-bar.component';

describe('CriticalObservationBarComponent', () => {
  let component: CriticalObservationBarComponent;
  let fixture: ComponentFixture<CriticalObservationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CriticalObservationBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CriticalObservationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
