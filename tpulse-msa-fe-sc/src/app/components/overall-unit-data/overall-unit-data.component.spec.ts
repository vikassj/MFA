import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallUnitDataComponent } from './overall-unit-data.component';

describe('OverallUnitDataComponent', () => {
  let component: OverallUnitDataComponent;
  let fixture: ComponentFixture<OverallUnitDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverallUnitDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverallUnitDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
