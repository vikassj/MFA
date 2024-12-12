import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenCloseGraphComponent } from './open-close-graph.component';

describe('OpenCloseGraphComponent', () => {
  let component: OpenCloseGraphComponent;
  let fixture: ComponentFixture<OpenCloseGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenCloseGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenCloseGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
