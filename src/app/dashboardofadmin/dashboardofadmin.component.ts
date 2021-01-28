import { ManageuserComponent } from './../manageuser/manageuser.component';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { FreelanceserviceService } from '../AppRestCall/freelanceservice/freelanceservice.service';
import { UserService } from '../AppRestCall/user/user.service';
import { config } from '../appconstants/config';

@Component({
  selector: 'app-dashboardofadmin',
  templateUrl: './dashboardofadmin.component.html',
  styleUrls: ['./dashboardofadmin.component.css']
})
export class DashboardofadminComponent implements OnInit {

  indiaTime = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-mm-dd");
  todaysvoliationList: any = [];
  totalvoliationResolvedList: any = []
  todaysjobscheduledList: any = [];
  upcomingjobscheduledList: any = [];
  newjobsbutnotactiviatedList: any = [];
  newjobsactiviatedbutnotacceptedList: any = [];
  jobscompletedList: any = [];
  jobscompletedwithoutpaymentList: any = [];
  jobscompletedpayoutpendingList: any = [];

  totalmoneyearnedbycompanytilltoday: number = 0;
  totalmoneyearnedbyskilledworkerstilltoday: number = 0;
  totalmoneyyettopaybytheclientstilltoday: number = 0;
  totalcompletedjobswithoutpaymentbyclient: number = 0;

  allFreelancerUsersList: any = [];


  constructor(
    private freelanceserviceService: FreelanceserviceService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    public datepipe: DatePipe,
    public manageruser: ManageuserComponent,
    public userService: UserService
  ) { }

  ngOnInit() {
    this.dashboardSummaryOfSkilledWorkerSearchService();
  }

  dashboardSummaryOfSkilledWorkerSearchService() {
    this.freelanceserviceService.getUserAllJobDetails().subscribe((jobdetailsList: any) => {
      if (jobdetailsList != null) {
        jobdetailsList.forEach(element => {
          if (element.isjobvoliation && element.cbajobattendantdate == null && !element.isfreelancerjobattendant && !element.isjobactive) {
            this.todaysvoliationList.push(element);
          }
          if (element.isjobvoliation && element.isfreelancerjobattendant) {
            this.totalvoliationResolvedList.push(element);
          }
          if (element.isjobactive && element.isjobaccepted && this.getDate(element.jobstartedon) == this.indiaTime.toString()) {
            this.todaysjobscheduledList.push(element);
          }
          if (element.isjobactive && element.isjobaccepted && element.isupcoming == 'TRUE') {
            this.upcomingjobscheduledList.push(element);
          }
          if (!element.isjobactive && !element.isjobvoliation) {
            this.newjobsbutnotactiviatedList.push(element);
          }
          if (element.isjobactive && !element.isjobaccepted && !element.isjobvoliation) {
            this.newjobsactiviatedbutnotacceptedList.push(element);
          }
          if (element.isjobactive && element.iscompleted && element.isjobamtpaidtocompany && element.isjobamtpaidtofu) {
            this.jobscompletedList.push(element);
            console.log('Number ', Number.parseFloat(element.tocompanyamount) );
            this.totalmoneyearnedbycompanytilltoday = Number.parseFloat(element.tocompanyamount) + this.totalmoneyearnedbycompanytilltoday;
            this.totalmoneyearnedbyskilledworkerstilltoday = Number.parseFloat(element.tofreelanceamount) + this.totalmoneyearnedbyskilledworkerstilltoday;
            this.totalcompletedjobswithoutpaymentbyclient = Number.parseFloat(element.tocompanyamount) + this.totalcompletedjobswithoutpaymentbyclient;
          }
          if (element.isjobactive && element.iscompleted && !element.isjobamtpaidtocompany) {
            this.jobscompletedwithoutpaymentList.push(element);
          }

          if (element.isjobactive && element.iscompleted && !element.isjobamtpaidtofu) {
            this.jobscompletedpayoutpendingList.push(element);
          }

        });
        if (this.newjobsactiviatedbutnotacceptedList != null) {
          this.userService.getUsersByRole(config.user_rolecode_fu).subscribe((userList: any) => {
            if (userList != null) {
              userList.forEach(element => {
                if (element.isactive && element.freeLanceDetails.bgcurrentstatus == config.bg_code_approved) {
                  this.allFreelancerUsersList.push(element);
                }
              });
            }
          },
            error => {
              this.spinnerService.hide();
              this.alertService.error(error);
            });
        }
        console.log('this is test', this.newjobsbutnotactiviatedList);
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
