import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsFilterComponent } from './units-filter.component';

describe('UnitsFilterComponent', () => {
  let component: UnitsFilterComponent;
  let fixture: ComponentFixture<UnitsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitsFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
