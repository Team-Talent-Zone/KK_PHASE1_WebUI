import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewjobbyjobidPopupComponent } from './viewjobbyjobid-popup.component';

describe('ViewjobbyjobidPopupComponent', () => {
  let component: ViewjobbyjobidPopupComponent;
  let fixture: ComponentFixture<ViewjobbyjobidPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewjobbyjobidPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewjobbyjobidPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
