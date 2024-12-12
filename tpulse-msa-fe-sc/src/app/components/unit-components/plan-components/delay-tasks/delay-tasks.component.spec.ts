import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelayTasksComponent } from './delay-tasks.component';

describe('DelayTasksComponent', () => {
  let component: DelayTasksComponent;
  let fixture: ComponentFixture<DelayTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelayTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DelayTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
