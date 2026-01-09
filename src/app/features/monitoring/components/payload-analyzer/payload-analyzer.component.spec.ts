import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayloadAnalyzerComponent } from './payload-analyzer.component';

describe('PayloadAnalyzerComponent', () => {
  let component: PayloadAnalyzerComponent;
  let fixture: ComponentFixture<PayloadAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayloadAnalyzerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayloadAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
