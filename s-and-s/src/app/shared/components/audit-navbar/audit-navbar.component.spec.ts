import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditNavbarComponent } from './audit-navbar.component';

describe('AuditNavbarComponent', () => {
  let component: AuditNavbarComponent;
  let fixture: ComponentFixture<AuditNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditNavbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
