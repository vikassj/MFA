import { TestBed } from '@angular/core/testing';

import { GlobalResultsPopupService } from './global-results-popup.service';

describe('GlobalResultsPopupService', () => {
  let service: GlobalResultsPopupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalResultsPopupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
