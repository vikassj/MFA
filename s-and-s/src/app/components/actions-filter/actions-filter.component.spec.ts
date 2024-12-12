import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsFilterComponent } from './actions-filter.component';

describe('ActionsFilterComponent', () => {
  let component: ActionsFilterComponent;
  let fixture: ComponentFixture<ActionsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionsFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
