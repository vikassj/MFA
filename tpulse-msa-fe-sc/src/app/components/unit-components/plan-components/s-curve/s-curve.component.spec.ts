import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SCurveComponent } from './s-curve.component';

describe('SCurveComponent', () => {
  let component: SCurveComponent;
  let fixture: ComponentFixture<SCurveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SCurveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
