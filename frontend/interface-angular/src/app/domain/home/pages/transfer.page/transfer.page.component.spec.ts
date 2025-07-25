import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferPageComponent } from './transfer.page.component';

describe('TransferPageComponent', () => {
  let component: TransferPageComponent;
  let fixture: ComponentFixture<TransferPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
