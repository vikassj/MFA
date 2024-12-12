import { TestBed } from '@angular/core/testing';

import { ModalImageViewerService } from './modal-image-viewer.service';

describe('ModalImageViewerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModalImageViewerService = TestBed.get(ModalImageViewerService);
    expect(service).toBeTruthy();
  });
});
