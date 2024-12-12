import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarObservationComponent } from './sidebar-observation.component';

describe('SidebarObservationComponent', () => {
  let component: SidebarObservationComponent;
  let fixture: ComponentFixture<SidebarObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarObservationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarObservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
