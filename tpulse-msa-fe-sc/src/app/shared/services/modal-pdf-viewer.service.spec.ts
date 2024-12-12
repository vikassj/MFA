import { TestBed } from '@angular/core/testing';

import { ModalPdfViewerService } from './modal-pdf-viewer.service';

describe('ModalPdfViewerService', () => {
  let service: ModalPdfViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalPdfViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
