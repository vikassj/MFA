import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgementComponent } from './knowledgement.component';

describe('KnowledgementComponent', () => {
  let component: KnowledgementComponent;
  let fixture: ComponentFixture<KnowledgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
