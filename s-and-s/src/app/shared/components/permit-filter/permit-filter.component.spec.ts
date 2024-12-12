import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermitFilterComponent } from './permit-filter.component';

describe('PermitFilterComponent', () => {
  let component: PermitFilterComponent;
  let fixture: ComponentFixture<PermitFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermitFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermitFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
