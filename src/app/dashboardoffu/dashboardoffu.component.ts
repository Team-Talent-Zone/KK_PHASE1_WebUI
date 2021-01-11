import { CustomToastComponent } from './../app.component';
import { UserService } from './../AppRestCall/user/user.service';
import { Component, Input, OnInit } from '@angular/core';
import { config } from '../appconstants/config';
import { ReferenceService } from '../AppRestCall/reference/reference.service';
import { ReferenceAdapter } from '../adapters/referenceadapter';
import { PaymentComponent } from '../payment/payment.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { FreelanceOnSvcService } from '../AppRestCall/freelanceOnSvc/freelance-on-svc.service';
import { FreelanceOnSvc } from '../appmodels/FreelanceOnSvc';
import { ToastConfig, Toaster, ToastType } from 'ngx-toast-notifications';
import { ConfigMsg } from '../appconstants/configmsg';
import { timer, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboardoffu',
  templateUrl: './dashboardoffu.component.html',
  styleUrls: ['./dashboardoffu.component.css']
})
export class DashboardoffuComponent implements OnInit {

  stage1Img: string = '//placehold.it/200/dddddd/fff?text=1';
  stage2Img: string = '//placehold.it/200/dddddd/fff?text=2';
  stage3Img: string = '//placehold.it/200/dddddd/fff?text=3';
  stage4Img: string = '//placehold.it/200/dddddd/fff?text=4';
  stage5Img: string = '//placehold.it/200/dddddd/fff?text=5';
  stageCompletedImg: string = '//placehold.it/200/dddddd/fff?text=Completed';
  stageBgStatusApprovedImg: string = '//placehold.it/200/dddddd/fff?text=Approved';
  stageBgStatusRejectedImg: string = '//placehold.it/200/dddddd/fff?text=Rejected';
  usrObj: any;
  indiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  referenceobj: any;
  istimelap = false;
  listofalljobs: any;
  newJobList: any = [];
  upcomingJobList: any = [];
  completedJobList: any = [];
  freelancesvcobj: FreelanceOnSvc;
  freelancedetailsbyId: any;
  totalEarnings = 0;
  earnFlag = false;
  upcomingflag = false;
  totalupcomingEarnings = 0;
  infoCards = [];
  cancelminsdiff: number;
  private types: Array<ToastType> = ['success', 'danger', 'warning', 'info', 'primary', 'secondary', 'dark', 'light'];
  upcomingpaytext: string;
  totalearnings: string;

  constructor(
    public userService: UserService,
    private referService: ReferenceService,
    private referenceadapter: ReferenceAdapter,
    private modalRef: BsModalRef,
    private modalService: BsModalService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    private freelanceSvc: FreelanceOnSvcService,
    private toaster: Toaster,
    private router: Router,
  ) {
  }

  ngOnInit() {
    const source = timer(1000, 20000);
    const sourcerefresh = timer(1000, 30000);
    source.subscribe((val: number) => {
      //this.autoToastNotificationsForFU();
    });
    sourcerefresh.subscribe((val: number) => {
      if (this.router.url === '/dashboard') {
        if (this.userService.currentUserValue.freeLanceDetails.isregfeedone) {
          this.getUserAllJobDetailsByUserId();
        }
      }
    });
    if (!this.userService.currentUserValue.freeLanceDetails.isregfeedone) {
      setTimeout(() => {
        this.spinnerService.show();
        this.referService.getReferenceLookupByKey(config.refer_key_furegfee.toString()).pipe().subscribe((refObj: any) => {
          this.referenceobj = refObj;
          this.spinnerService.hide();
          this.istimelap = true;
        },
          error => {
            this.spinnerService.hide();
            this.alertService.error(error);
          });
      }, 500);
    }
    this.usrObj = this.userService.currentUserValue;
    if (this.usrObj.userroles.rolecode === config.user_rolecode_fu.toString()) {
      if (this.usrObj.freeLanceDetails.isprofilecompleted) {
        this.stage1Img = this.stageCompletedImg;
      }
      if (this.usrObj.freeLanceDetails.isprofilecompleted && this.usrObj.freeLanceDetails.isregfeedone) {
        this.stage2Img = this.stageCompletedImg;
      }
      if (this.usrObj.freeLanceDetails.isbgstarted) {
        this.stage3Img = this.stageCompletedImg;
      }
      if (this.usrObj.freeLanceDetails.isbgdone) {
        this.stage4Img = this.stageCompletedImg;
      }
      if (this.usrObj.freeLanceDetails.bgcurrentstatus === config.bg_code_approved.toString()) {
        this.stage5Img = this.stageBgStatusApprovedImg;
      } else
        if (this.usrObj.freeLanceDetails.bgcurrentstatus === config.bg_code_rejected.toString()) {
          this.stage5Img = this.stageBgStatusRejectedImg;
        }
    }
  }



  openPaymentComponent() {
    this.modalRef = this.modalService.show(PaymentComponent, {
      initialState: {
        totalAmountToPay: this.referenceobj[0].code,
        displayUserServicesForCheckOut: null,
        productinfoParam: 'Registration Fee'
      }
    });
  }

  getUserAllJobDetailsByUserId() {
    this.newJobList = [];
    this.upcomingJobList = [];
    this.completedJobList = [];

    this.listofalljobs = [];
    // tslint:disable-next-line: max-line-length
    this.freelanceSvc.getUserAllJobDetails(this.userService.currentUserValue.freeLanceDetails.subCategory).subscribe((resp: FreelanceOnSvc) => {
      this.listofalljobs = resp;
      for (const element of this.listofalljobs) {
        this.spinnerService.show();
        if (this.userService.currentUserValue.preferlang !== config.default_prefer_lang) {
          this.spinnerService.show();
          this.referService.translatetext(element.bizname, this.userService.currentUserValue.preferlang).subscribe(
            (trantxt: any) => {
              element.bizname = trantxt;
            },
            error => {
              this.spinnerService.hide();
              this.alertService.error(error);
            }
          );
          this.referService.translatetext(element.joblocation, this.userService.currentUserValue.preferlang).subscribe(
            (trantxt: any) => {
              element.joblocation = trantxt;
            },
            error => {
              this.spinnerService.hide();
              this.alertService.error(error);
            }
          );
          this.referService.translatetext(element.jobdescription, this.userService.currentUserValue.preferlang).subscribe(
            (trantxt: any) => {
              element.jobdescription = trantxt;
            },
            error => {
              this.spinnerService.hide();
              this.alertService.error(error);
            }
          );
        }
        // tslint:disable-next-line: max-line-length
        if (element.isjobactive && element.freelanceuserId === null && element.scategory === this.userService.currentUserValue.freeLanceDetails.subCategory) {
          this.newJobList.push(element);
        }
        if (element.freelanceuserId == this.userService.currentUserValue.userId
          && !element.isjobcompleted) {
          this.upcomingJobList.push(element);
        }
        if (element.freelanceuserId == this.userService.currentUserValue.userId
          && element.scategory === this.userService.currentUserValue.freeLanceDetails.subCategory && element.isjobcompleted) {
          this.completedJobList.push(element);
        }
      }
      setTimeout(() => {
        this.builtEarningCard();
        this.spinnerService.hide();
      }, 1000);
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  builtEarningCard() {
    if (this.completedJobList.length > 0) {
      this.totalEarnings = 0;
      this.earnFlag = false;
      this.completedJobList.forEach(element => {
        if (element.isjobamtpaidtofu) {
          this.totalEarnings = this.totalEarnings + Number.parseFloat(element.tofreelanceamount);
        }
        this.earnFlag = true;
      });
    } else {
      this.totalEarnings = 0;
      this.earnFlag = true;
    }
    if (this.upcomingJobList.length > 0) {
      this.totalupcomingEarnings = 0;
      this.upcomingflag = false;

      this.upcomingJobList.forEach(element => {
        if (element.isupcoming === '1' && element.isjobaccepted) {
          this.totalupcomingEarnings = this.totalupcomingEarnings + Number.parseFloat(element.tofreelanceamount);
        }
        this.upcomingflag = true;
      });
    } else {
      this.totalupcomingEarnings = 0;
      this.upcomingflag = true;
    }

    if (this.earnFlag && this.upcomingflag) {
      this.spinnerService.show();
      this.referService.translatetext("Upcoming Payment", this.userService.currentUserValue.preferlang).subscribe(
        (trantxt: any) => {
          this.upcomingpaytext = trantxt;
        },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        }
      );
      this.referService.translatetext("Total Earnings", this.userService.currentUserValue.preferlang).subscribe(
        (trantxt: any) => {
          this.totalearnings = trantxt;
        },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        }
      );
      this.spinnerService.hide();
      setTimeout(() => {
        this.infoCards = [
          { name: this.upcomingpaytext, value: this.totalupcomingEarnings },
          { name: this.totalearnings, value: this.totalEarnings },
        ];
      }, 3000);
    }
  }

  accept(jobId: number) {
    this.spinnerService.show();
    this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe(
      (freelancedetailsbyId: FreelanceOnSvc) => {
        if (!freelancedetailsbyId.isjobaccepted) {
          freelancedetailsbyId.freelanceuserId = this.userService.currentUserValue.userId;
          freelancedetailsbyId.isjobaccepted = true;
          this.freelanceSvc.saveOrUpdateFreeLanceOnService(freelancedetailsbyId).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
            this.getUserAllJobDetailsByUserId();
            this.spinnerService.hide();
          },
            error => {
              this.spinnerService.hide();
              this.alertService.error(error);
            });
        } else {
          this.spinnerService.hide();
          // tslint:disable-next-line: max-line-length
          this.alertService.info('Sorry ' + this.userService.currentUserValue.firstname + '! This JobId#' + jobId + ' has been accepted by other freelancer');
        }
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });

  }

  cancel(jobId: number) {
    this.spinnerService.show();
    this.listofalljobs = [];
    // tslint:disable-next-line: max-line-length
    this.freelanceSvc.getUserAllJobDetails(this.userService.currentUserValue.freeLanceDetails.subCategory).subscribe((resp: FreelanceOnSvc) => {
      this.listofalljobs = resp;
      for (const element of this.listofalljobs) {
        if (element.freelanceuserId == this.userService.currentUserValue.userId && element.jobId == jobId
          && !element.isjobcompleted) {
          if (!element.diffinmins) {
            this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe(
              (freelancedetailsbyId: FreelanceOnSvc) => {
                freelancedetailsbyId.freelanceuserId = null;
                freelancedetailsbyId.isjobaccepted = false;
                freelancedetailsbyId.isjobcancel = false;
                // tslint:disable-next-line: max-line-length
                this.freelanceSvc.saveOrUpdateFreeLanceOnService(freelancedetailsbyId).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
                  this.spinnerService.show();
                  this.getUserAllJobDetailsByUserId();
                  this.spinnerService.hide();
                },
                  error => {
                    this.spinnerService.hide();
                    this.alertService.error(error);
                  });
              },
              error => {
                this.spinnerService.hide();
                this.alertService.error(error);
              });
          } else {
            // tslint:disable-next-line: max-line-length
            this.referService.translatetext("Cancellation only possible before 15 mins after accepting job .Any concerns, please call our core service support team", this.userService.currentUserValue.preferlang).subscribe(
              (trantxt: any) => {
                this.alertService.info(trantxt);
                this.spinnerService.hide();
              },
              error => {
                this.spinnerService.hide();
                this.alertService.error(error);
              }
            );
             }

        }
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }



  autoToastNotificationsForFU() {
    if (this.userService.currentUserValue.userroles.rolecode === config.user_rolecode_fu.toString()) {
      if (!this.userService.currentUserValue.freeLanceDetails.isprofilecompleted) {
        // tslint:disable-next-line: max-line-length
        let msg = 'Hi ' + this.userService.currentUserValue.fullname + ', ' + ConfigMsg.toast_notification_fu_isprofilenotcompelted;
        this.showToastNotificationForFU(msg, this.types[3], 'Profile');
      } else
        if (!this.userService.currentUserValue.freeLanceDetails.isregfeedone) {
          // tslint:disable-next-line: max-line-length
          let msg = 'Hi ' + this.userService.currentUserValue.fullname + ', ' + ConfigMsg.toast_notification_fu_isregfeenotcompelted;
          this.showToastNotificationForFU(msg, this.types[2], 'Payment');
        }
    }


  }
  showToastNotificationForFU(txtmsg: string, typeName: any, toastheader: string) {
    this.toaster.open({
      text: txtmsg,
      caption: toastheader + ' Notification',
      type: typeName,
      component: CustomToastComponent
    });
  }

}

