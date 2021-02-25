import { Component, OnInit } from '@angular/core';
import { UserService } from '../AppRestCall/user/user.service';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboardofadminanalytics',
  templateUrl: './dashboardofadminanalytics.component.html',
  styleUrls: ['./dashboardofadminanalytics.component.css']
})
export class DashboardofadminanalyticsComponent implements OnInit {

  matomaUrl: SafeResourceUrl;

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.matomaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.matomoUrl}` + "/index.php?module=Widgetize&action=iframe&moduleToWidgetize=Dashboard&actionToWidgetize=index&idSite=1&period=week&date=yesterday&token_auth=ad11571d563d9c54ecf20ae11bddb253");
  }

}
