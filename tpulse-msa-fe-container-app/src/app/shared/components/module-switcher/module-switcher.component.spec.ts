import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleSwitcherComponent } from './module-switcher.component';

describe('ModuleSwitcherComponent', () => {
  let component: ModuleSwitcherComponent;
  let fixture: ComponentFixture<ModuleSwitcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModuleSwitcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuleSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
