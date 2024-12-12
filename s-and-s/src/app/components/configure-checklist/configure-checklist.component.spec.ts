import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureChecklistComponent } from './configure-checklist.component';

describe('ConfigureChecklistComponent', () => {
  let component: ConfigureChecklistComponent;
  let fixture: ComponentFixture<ConfigureChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigureChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
