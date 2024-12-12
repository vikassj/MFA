import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdsEyeViewComponent } from './birds-eye-view.component';

describe('BirdsEyeViewComponent', () => {
  let component: BirdsEyeViewComponent;
  let fixture: ComponentFixture<BirdsEyeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirdsEyeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirdsEyeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
