import { TestBed } from '@angular/core/testing';

import { FinancialApiService } from './financial-api.service';

describe('FinancialApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FinancialApiService = TestBed.get(FinancialApiService);
    expect(service).toBeTruthy();
  });
});
