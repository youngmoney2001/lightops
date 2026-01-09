import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkAdminComponent } from './network-admin.component';

describe('NetworkAdminComponent', () => {
  let component: NetworkAdminComponent;
  let fixture: ComponentFixture<NetworkAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
