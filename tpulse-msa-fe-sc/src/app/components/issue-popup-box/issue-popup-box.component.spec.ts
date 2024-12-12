import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuePopupBoxComponent } from './issue-popup-box.component';

describe('IssuePopupBoxComponent', () => {
  let component: IssuePopupBoxComponent;
  let fixture: ComponentFixture<IssuePopupBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssuePopupBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuePopupBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
