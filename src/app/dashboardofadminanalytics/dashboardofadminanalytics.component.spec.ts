import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardofadminanalyticsComponent } from './dashboardofadminanalytics.component';

describe('DashboardofadminanalyticsComponent', () => {
  let component: DashboardofadminanalyticsComponent;
  let fixture: ComponentFixture<DashboardofadminanalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardofadminanalyticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardofadminanalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
