import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalMapComponent } from './animal-map.component';

describe('AnimalMapComponent', () => {
  let component: AnimalMapComponent;
  let fixture: ComponentFixture<AnimalMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
