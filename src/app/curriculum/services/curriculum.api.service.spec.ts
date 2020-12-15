import { TestBed } from '@angular/core/testing';

import { CurriculumApiService } from './curriculum.api.service';

describe('CurriculumApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CurriculumApiService = TestBed.get(CurriculumApiService);
    expect(service).toBeTruthy();
  });
});
