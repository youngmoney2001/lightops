import { TestBed } from '@angular/core/testing';

import { LoraDataService } from './lora-data.service';

describe('LoraDataService', () => {
  let service: LoraDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoraDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
