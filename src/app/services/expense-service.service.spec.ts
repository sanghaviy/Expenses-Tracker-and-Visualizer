import { TestBed } from '@angular/core/testing';

import { ExpenseService } from './expense-service.service';

describe('ExpenseServiceService', () => {
  let service: ExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
