/// <reference types="googlemaps" />
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatomoInjector } from 'ngx-matomo';
import { MatomoTracker } from 'ngx-matomo';
import { UserService } from './AppRestCall/user/user.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';

declare let google: any;
export let browserRefresh = false;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'APPMAINUIv1';
  subscription: Subscription;


  // Handle session on browser tab close . . .
  /*@HostListener('window:unload', [ '$event' ])
  unloadHandler(event) {
    //If you want to do something when page gets reloaded or on leaving page
    event.preventDefault();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    event.preventDefault();
    this.subscription = this.router.events.subscribe((eventname) => {
      if (eventname instanceof NavigationStart) {
        browserRefresh = !this.router.navigated;
        if (!browserRefresh) {
          this.userService.logout();
        }
      }
    });
  }*/

  constructor(
    private router: Router,
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}