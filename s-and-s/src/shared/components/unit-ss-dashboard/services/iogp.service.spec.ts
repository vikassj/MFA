import { TestBed } from '@angular/core/testing';

import { IogpService } from './iogp.service';

describe('IogpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IogpService = TestBed.get(IogpService);
    expect(service).toBeTruthy();
  });
});
