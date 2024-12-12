import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualObservationAnnotationComponent } from './manual-observation-annotation.component';

describe('ManualObservationAnnotationComponent', () => {
  let component: ManualObservationAnnotationComponent;
  let fixture: ComponentFixture<ManualObservationAnnotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualObservationAnnotationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualObservationAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
