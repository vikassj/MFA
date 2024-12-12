import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentActionsComponent } from './incident-actions.component';

describe('IncidentActionsComponent', () => {
  let component: IncidentActionsComponent;
  let fixture: ComponentFixture<IncidentActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncidentActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidentActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
