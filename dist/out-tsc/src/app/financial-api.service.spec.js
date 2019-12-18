import { TestBed } from '@angular/core/testing';
import { FinancialApiService } from './financial-api.service';
describe('FinancialApiService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));
    it('should be created', () => {
        const service = TestBed.get(FinancialApiService);
        expect(service).toBeTruthy();
    });
});
//# sourceMappingURL=financial-api.service.spec.js.map