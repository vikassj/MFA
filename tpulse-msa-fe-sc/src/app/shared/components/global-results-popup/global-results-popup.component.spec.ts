import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalResultsPopupComponent } from './global-results-popup.component';

describe('GlobalResultsPopupComponent', () => {
  let component: GlobalResultsPopupComponent;
  let fixture: ComponentFixture<GlobalResultsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalResultsPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalResultsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
