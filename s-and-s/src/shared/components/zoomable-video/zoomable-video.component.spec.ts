import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomableVideoComponent } from './zoomable-video.component';

describe('ZoomableVideoComponent', () => {
  let component: ZoomableVideoComponent;
  let fixture: ComponentFixture<ZoomableVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZoomableVideoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoomableVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
