import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsDropdownComponent } from './units-dropdown.component';

describe('UnitsDropdownComponent', () => {
  let component: UnitsDropdownComponent;
  let fixture: ComponentFixture<UnitsDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitsDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
