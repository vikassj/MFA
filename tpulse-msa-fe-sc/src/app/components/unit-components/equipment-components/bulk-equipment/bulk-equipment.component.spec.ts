import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEquipmentComponent } from './bulk-equipment.component';

describe('BulkEquipmentComponent', () => {
  let component: BulkEquipmentComponent;
  let fixture: ComponentFixture<BulkEquipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkEquipmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
