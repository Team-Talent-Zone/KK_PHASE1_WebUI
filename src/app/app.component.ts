import { Component, Input, OnInit } from '@angular/core';
import { MatomoInjector } from 'ngx-matomo';
import { MatomoTracker } from 'ngx-matomo';
import { Toast } from 'ngx-toast-notifications';

@Component({
  template:
  '<div style="padding: 1rem;">' +
  '<div>{{toast.text}}</div>' +
  '<button (click)="toast.close()">Close</button>' +
  '</div>',
})
export class CustomToastComponent {
  @Input() toast: Toast;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'APPMAINUIv1';

  constructor(
    private matomoInjector: MatomoInjector,
    private matomoTracker: MatomoTracker
  ) {
    this.matomoInjector.init('YOUR_MATOMO_URL', 1);
  }

  ngOnInit() {
    this.matomoTracker.setUserId('UserId');
    this.matomoTracker.setDocumentTitle('ngx-Matomo Test');
  }
}
