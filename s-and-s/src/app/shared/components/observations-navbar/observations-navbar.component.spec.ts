import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationsNavbarComponent } from './observations-navbar.component';

describe('ObservationsNavbarComponent', () => {
  let component: ObservationsNavbarComponent;
  let fixture: ComponentFixture<ObservationsNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObservationsNavbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationsNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
