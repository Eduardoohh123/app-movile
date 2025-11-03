import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplePage } from './apple.page';

describe('ApplePage', () => {
  let component: ApplePage;
  let fixture: ComponentFixture<ApplePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
