import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionAnnotationsComponent } from './inspection-annotations.component';

describe('InspectionAnnotationsComponent', () => {
  let component: InspectionAnnotationsComponent;
  let fixture: ComponentFixture<InspectionAnnotationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspectionAnnotationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectionAnnotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
