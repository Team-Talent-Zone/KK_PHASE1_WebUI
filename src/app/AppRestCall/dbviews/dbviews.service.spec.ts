import { TestBed } from '@angular/core/testing';

import { DbviewsService } from './dbviews.service';

describe('DbviewsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DbviewsService = TestBed.get(DbviewsService);
    expect(service).toBeTruthy();
  });
});
