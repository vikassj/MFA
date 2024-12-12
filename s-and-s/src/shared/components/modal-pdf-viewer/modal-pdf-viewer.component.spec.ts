import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPdfViewerComponent } from './modal-pdf-viewer.component';

describe('ModalPdfViewerComponent', () => {
  let component: ModalPdfViewerComponent;
  let fixture: ComponentFixture<ModalPdfViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPdfViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPdfViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
