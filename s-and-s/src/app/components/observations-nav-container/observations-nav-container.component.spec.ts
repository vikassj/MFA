import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationsNavContainerComponent } from './observations-nav-container.component';

describe('ObservationsNavContainerComponent', () => {
  let component: ObservationsNavContainerComponent;
  let fixture: ComponentFixture<ObservationsNavContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObservationsNavContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationsNavContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
