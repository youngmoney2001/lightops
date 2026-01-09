import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertSystemComponent } from './alert-system.component';

describe('AlertSystemComponent', () => {
  let component: AlertSystemComponent;
  let fixture: ComponentFixture<AlertSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertSystemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
