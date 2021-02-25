/// <reference types="googlemaps" />
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatomoInjector } from 'ngx-matomo';
import { MatomoTracker } from 'ngx-matomo';
import { UserService } from './AppRestCall/user/user.service';
import { environment } from 'src/environments/environment';

declare let google: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'APPMAINUIv1';


  @HostListener("window:unload", ["$event"])
  unloadHandler(event) { sessionStorage.clear(); }

  constructor(
    private matomoInjector: MatomoInjector,
    private matomoTracker: MatomoTracker,
    private userService: UserService,
  ) {
    this.matomoInjector.init(`${environment.matomoUrl}`, 1);
  }

  ngOnInit() {
    this.matomoTracker.setUserId('UserId');
    this.matomoTracker.setDocumentTitle('ngx-Matomo Test');
  }
}