import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSurpriseTaskComponent } from './create-surprise-task.component';

describe('CreateSurpriseTaskComponent', () => {
  let component: CreateSurpriseTaskComponent;
  let fixture: ComponentFixture<CreateSurpriseTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSurpriseTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSurpriseTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
