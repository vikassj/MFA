import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentChecklistComponent } from './equipment-checklist.component';

describe('EquipmentChecklistComponent', () => {
  let component: EquipmentChecklistComponent;
  let fixture: ComponentFixture<EquipmentChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EquipmentChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
