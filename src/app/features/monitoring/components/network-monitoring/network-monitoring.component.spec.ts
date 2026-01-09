import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkMonitoringComponent } from './network-monitoring.component';

describe('NetworkMonitoringComponent', () => {
  let component: NetworkMonitoringComponent;
  let fixture: ComponentFixture<NetworkMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkMonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
