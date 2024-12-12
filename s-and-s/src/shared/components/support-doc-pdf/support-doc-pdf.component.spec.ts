import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportDocPdfComponent } from './support-doc-pdf.component';

describe('SupportDocPdfComponent', () => {
  let component: SupportDocPdfComponent;
  let fixture: ComponentFixture<SupportDocPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupportDocPdfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportDocPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
