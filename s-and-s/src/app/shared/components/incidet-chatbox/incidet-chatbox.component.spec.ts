import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidetChatboxComponent } from './incidet-chatbox.component';

describe('IncidetChatboxComponent', () => {
  let component: IncidetChatboxComponent;
  let fixture: ComponentFixture<IncidetChatboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncidetChatboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidetChatboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
