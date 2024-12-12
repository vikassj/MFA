import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaysDropdownComponent } from './days-dropdown.component';

describe('DaysDropdownComponent', () => {
  let component: DaysDropdownComponent;
  let fixture: ComponentFixture<DaysDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaysDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaysDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
