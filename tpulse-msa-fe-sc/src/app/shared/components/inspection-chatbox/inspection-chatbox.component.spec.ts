import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionChatboxComponent } from './inspection-chatbox.component';

describe('InspectionChatboxComponent', () => {
  let component: InspectionChatboxComponent;
  let fixture: ComponentFixture<InspectionChatboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspectionChatboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectionChatboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
