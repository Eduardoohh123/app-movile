import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GooglePage } from './google.page';

describe('GooglePage', () => {
  let component: GooglePage;
  let fixture: ComponentFixture<GooglePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GooglePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
