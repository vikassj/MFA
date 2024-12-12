import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryDatePickerComponent } from './category-date-picker.component';

describe('CategoryDatePickerComponent', () => {
  let component: CategoryDatePickerComponent;
  let fixture: ComponentFixture<CategoryDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryDatePickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
