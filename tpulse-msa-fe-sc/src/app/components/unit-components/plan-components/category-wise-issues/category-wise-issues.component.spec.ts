import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryWiseIssuesComponent } from './category-wise-issues.component';

describe('CategoryWiseIssuesComponent', () => {
  let component: CategoryWiseIssuesComponent;
  let fixture: ComponentFixture<CategoryWiseIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryWiseIssuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryWiseIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
