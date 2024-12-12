import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAuditComponent } from './start-audit.component';

describe('StartAuditComponent', () => {
  let component: StartAuditComponent;
  let fixture: ComponentFixture<StartAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StartAuditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StartAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
