import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { FreelanceserviceService } from '../AppRestCall/freelanceservice/freelanceservice.service';

@Component({
  selector: 'app-dashboardofadmin',
  templateUrl: './dashboardofadmin.component.html',
  styleUrls: ['./dashboardofadmin.component.css']
})
export class DashboardofadminComponent implements OnInit {

  indiaTime = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-mm-dd");
  todaysvoliationList: any = [];
  totalvoliationList: any = []
  todaysjobscheduled: any = [];
  tommorwsjobscheduled: any = [];
  newjobsbutnotactiviated: any = [];
  newjobsactiviatedbutnotaccepted: any = [];
  jobspaymentpaidbyclient: any = [];
  jobspaymentcompletedbycompany: any = [];
  completedjobswithoutpaymentbyclient: any = [];

  totalmoneyearnedbyskilledworkerstilltoday: number;
  totalmoneyearnedbycompanytilltoday: number;
  totalmoneyyettopaybytheclientstilltoday: number;
  totalcompletedjobswithoutpaymentbyclient: number;

  constructor(
    private freelanceserviceService: FreelanceserviceService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    public datepipe: DatePipe,
  ) { }

  ngOnInit() {
    console.log('this is india date', this.indiaTime);
  }

  dashboardSummaryOfSkilledWorkerSearchService() {
    this.freelanceserviceService.getUserAllJobDetails().subscribe((jobdetailsList: any) => {
      if (jobdetailsList != null) {
        jobdetailsList.forEach(element => {
          if (element.isfreelancerjobattendant) {
            this.todaysvoliationList.push(element);
          }
          if (element.isjobvoliation) {
            this.totalvoliationList.push(element);
          }
          if (!element.isjobactive) {
            this.newjobsbutnotactiviated.push(element);
          }
          if (element.isjobactive && !element.isjobaccepted) {
            this.newjobsbutnotactiviated.push(element);
          }
          if (element.isjobactive && element.isjobamtpaidtofu) {
            this.jobspaymentcompletedbycompany.push(element);
            this.totalmoneyearnedbyskilledworkerstilltoday = Number.parseFloat(element.tofreelanceamount) + this.totalmoneyearnedbyskilledworkerstilltoday;
          }
          if (element.isjobactive && element.isjobamtpaidtocompany) {
            this.jobspaymentpaidbyclient.push(element);
            this.totalmoneyearnedbycompanytilltoday = Number.parseFloat(element.tocompanyamount) + this.totalmoneyearnedbycompanytilltoday;
          }
          if (element.isjobcompleted && !element.isjobamtpaidtocompany) {
            this.completedjobswithoutpaymentbyclient.push(element);
            this.totalcompletedjobswithoutpaymentbyclient = Number.parseFloat(element.tocompanyamount) + this.totalcompletedjobswithoutpaymentbyclient;
          }
          console.log('element.jobstartedon', this.getDate(element.jobstartedon));
        });
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      })
  }

  getDate(dt: Date) {
    console.log('inside the get Date', dt);
    var date = new Date(dt);
    var year = date.getFullYear();
    var tempmonth = date.getMonth() + 1;
    var tempday = date.getDate();
    var tempmin = date.getMinutes();
    var month = tempmonth > 10 ? tempmonth : '0' + tempmonth;
    var day = tempday > 10 ? tempday : '0' + tempday;
    var formatted = year + '-' + month + '-' + day;
    return formatted;
  }

}
