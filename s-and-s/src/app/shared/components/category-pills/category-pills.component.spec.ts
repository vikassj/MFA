import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryPillsComponent } from './category-pills.component';

describe('CategoryPillsComponent', () => {
  let component: CategoryPillsComponent;
  let fixture: ComponentFixture<CategoryPillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryPillsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryPillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
