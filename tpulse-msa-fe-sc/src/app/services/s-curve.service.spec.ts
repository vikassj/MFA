import { TestBed } from '@angular/core/testing';

import { SCurveService } from './s-curve.service';

describe('SCurveService', () => {
  let service: SCurveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SCurveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
