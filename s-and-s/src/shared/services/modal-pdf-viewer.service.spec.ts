import { TestBed } from '@angular/core/testing';

import { ModalPdfViewerService } from './modal-pdf-viewer.service';

describe('ModalPdfViewerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModalPdfViewerService = TestBed.get(ModalPdfViewerService);
    expect(service).toBeTruthy();
  });
});
