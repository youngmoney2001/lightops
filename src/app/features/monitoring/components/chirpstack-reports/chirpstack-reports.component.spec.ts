import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChirpstackReportsComponent } from './chirpstack-reports.component';

describe('ChirpstackReportsComponent', () => {
  let component: ChirpstackReportsComponent;
  let fixture: ComponentFixture<ChirpstackReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChirpstackReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChirpstackReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
