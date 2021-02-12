import { Component, OnInit } from '@angular/core';
import { MatomoTracker } from 'ngx-matomo';
import { UserService } from '../AppRestCall/user/user.service';

@Component({
  selector: 'app-dashboardofadminanalytics',
  templateUrl: './dashboardofadminanalytics.component.html',
  styleUrls: ['./dashboardofadminanalytics.component.css']
})
export class DashboardofadminanalyticsComponent implements OnInit {

  constructor(    
    private userService: UserService
    ) { }

  ngOnInit() {
  }

}
