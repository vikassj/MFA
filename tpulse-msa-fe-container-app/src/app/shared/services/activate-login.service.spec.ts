import { TestBed } from '@angular/core/testing';

import { ActivateLoginService } from './activate-login.service';

describe('ActivateLoginService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActivateLoginService = TestBed.get(ActivateLoginService);
    expect(service).toBeTruthy();
  });
});
