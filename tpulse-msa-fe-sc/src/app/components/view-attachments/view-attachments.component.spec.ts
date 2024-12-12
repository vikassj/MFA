import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAttachmentsComponent } from './view-attachments.component';

describe('ViewAttachmentsComponent', () => {
  let component: ViewAttachmentsComponent;
  let fixture: ComponentFixture<ViewAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAttachmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
