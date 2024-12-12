import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IogpPillsComponent } from './iogp-pills.component';

describe('IogpPillsComponent', () => {
  let component: IogpPillsComponent;
  let fixture: ComponentFixture<IogpPillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IogpPillsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IogpPillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
