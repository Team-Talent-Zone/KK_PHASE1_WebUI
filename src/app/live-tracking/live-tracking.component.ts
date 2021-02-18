import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { FreelanceOnSvcService } from '../AppRestCall/freelanceOnSvc/freelance-on-svc.service';

@Component({
  selector: 'app-live-tracking',
  templateUrl: './live-tracking.component.html',
  styleUrls: ['./live-tracking.component.css']
})
export class LiveTrackingComponent implements OnInit {

  @ViewChild('gmap', null) gmapElement: any;
  map: google.maps.Map;

  jobId: number;
  isTracking = false;
  currentLat: any;
  currentLong: any;

  marker: google.maps.Marker;

  constructor(route: ActivatedRoute,
    private freelanceSvc: FreelanceOnSvcService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
  ) {
    route.params.subscribe(params => {
      this.jobId = params.jobid;
    });
  }

  ngOnInit() {
    this.trackMe();
  }

  getLocationCoordinates() {
    this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(this.jobId).subscribe(() => {
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }


  trackMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          this.showPosition(position);
        },
        function errorCallback(error) {
        },
        { timeout: 90000, enableHighAccuracy: true, maximumAge: 75000 });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  showPosition(position) {
    this.currentLat = position.coords.latitude;
    this.currentLong = position.coords.longitude;
    let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    this.map.panTo(location);

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: location,
        map: this.map,
        title: 'Got you!'
      });
    }
    else {
      this.marker.setPosition(location);
    }
  }
}
