import { ConfirmationDialogService } from './../AppRestCall/confirmation/confirmation-dialog.service';
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
import { Toaster, ToastType } from 'ngx-toast-notifications';
import { ConfigMsg } from '../appconstants/configmsg';
import { timer } from 'rxjs';
import { Router } from '@angular/router';
import { ModalOptions } from 'ngx-bootstrap/modal';
import { ReadMorePopupComponent } from '../read-more-popup/read-more-popup.component';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-dashboardoffu',
  templateUrl: './dashboardoffu.component.html',
  styleUrls: ['./dashboardoffu.component.css']
})
export class DashboardoffuComponent implements OnInit {

  usrObj: any;
  referenceobj: any;
  istimelap = false;
  listofalljobs: any;
  newJobList: any = [];
  upcomingJobList: any = [];
  completedJobList: any = [];
  listOfCompletedJobsWithoutPay: any = [];
  listOfVolidationJobs: any = [];
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
  config: ModalOptions = {
    class: 'modal-md', backdrop: 'static',
    keyboard: false
  };
  indiaTime = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "dd/MM/yyyy hh:mm:ss");
  indiaTimeFormat = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-MM-dd hh:mm:ss");

  newjobsempty: boolean = false;
  upcomingjobsempty: boolean = false;
  completedjobsempty: boolean = false;
  voliationjobsempty: boolean = false;

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
    public datepipe: DatePipe,
    public confirmationDialogService: ConfirmationDialogService
  ) {
  }

  ngOnInit() {
    const source = timer(1000, 60000);
    const sourcerefresh = timer(1000, 90000);
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
      this.getPaymentRegistrationFeeAmount();
    }
    this.usrObj = this.userService.currentUserValue;
  }

  getPaymentRegistrationFeeAmount() {
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

  openPaymentComponent() {
    this.modalRef = this.modalService.show(PaymentComponent, {
      initialState: {
        totalAmountToPay: this.referenceobj[0].code,
        displayUserServicesForCheckOut: null,
        productinfoParam: 'Registration Fee'
      }
    });
  }

  updateFreelancerAttendance(jobId: number) {
    this.spinnerService.show();
    this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
      objfreelanceservice.freelancerjobattendantdate = this.indiaTime.toString();
      this.freelanceSvc.saveOrUpdateFreeLanceOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
        if (updatedobjfreelanceservice.jobId > 0) {
          this.alertService.success('We have noted that your at work location at ' + updatedobjfreelanceservice.joblocation + ' on ' + this.indiaTime.toString());
          this.spinnerService.hide();
          this.getUserAllJobDetailsByUserId();
        }
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
  }
  getUserAllJobDetailsByUserId() {
    this.newJobList = [];
    this.upcomingJobList = [];
    this.completedJobList = [];
    this.listOfCompletedJobsWithoutPay = [];
    this.listOfVolidationJobs = [];
    this.freelanceSvc.getUserAllJobDetails(this.userService.currentUserValue.freeLanceDetails.subCategory).subscribe((responseBody: any) => {
      if (responseBody != null) {
        responseBody.forEach(element => {
          if (this.userService.currentUserValue.preferlang !== config.default_prefer_lang) {
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
          if (element.isjobactive && element.freelanceuserId === this.userService.currentUserValue.userId &&
            element.scategory === this.userService.currentUserValue.freeLanceDetails.subCategory &&
            !element.isjobaccepted) {
            this.newJobList.push(element);
          }
          if (element.isjobactive && element.freelanceuserId == this.userService.currentUserValue.userId
            && element.isjobaccepted && !element.isjobamtpaidtocompany ) {
            this.upcomingJobList.push(element);
          }
          if (element.isjobactive && element.freelanceuserId == this.userService.currentUserValue.userId
            && element.scategory === this.userService.currentUserValue.freeLanceDetails.subCategory &&
            element.isjobcompleted && element.isjobamtpaidtocompany) {
            this.completedJobList.push(element);
          }
          if (element.isjobactive && element.freelanceuserId == this.userService.currentUserValue.userId
            && element.scategory === this.userService.currentUserValue.freeLanceDetails.subCategory
            && element.isjobcompleted && !element.isjobamtpaidtocompany) {
            this.listOfCompletedJobsWithoutPay.push(element);
          }
          if (element.isjobactive && element.freelanceuserId == this.userService.currentUserValue.userId
            && element.scategory === this.userService.currentUserValue.freeLanceDetails.subCategory
            && element.deactivefromupcomingjob) {
            this.listOfVolidationJobs.push(element);
          }
        });
        if (this.upcomingJobList != null && this.upcomingJobList.length > 0) {
          this.upcomingjobsempty = false;
        } else {
          this.upcomingjobsempty = true;
        }
        if (this.newJobList != null && this.newJobList.length > 0) {
          this.newjobsempty = false;
        } else {
          this.newjobsempty = true;
        }
        if (this.completedJobList != null && this.completedJobList.length > 0) {
          this.completedjobsempty = false;
        } else {
          this.completedjobsempty = true;
        }
        if (this.listOfVolidationJobs != null && this.listOfVolidationJobs.length > 0) {
          this.voliationjobsempty = false;
        } else {
          this.voliationjobsempty = true;
        }
      } else {
        this.upcomingjobsempty = true;
        this.newjobsempty = true;
        this.completedjobsempty = true;
        this.voliationjobsempty = true;
      }
      this.builtEarningCard();
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
      if (this.userService.currentUserValue.preferlang == config.lang_code_te) {
        this.upcomingpaytext = ConfigMsg.upcomingpay_te;
        this.totalearnings = ConfigMsg.totalearnings_te;
      } else if (this.userService.currentUserValue.preferlang == config.lang_code_hi) {
        this.upcomingpaytext = ConfigMsg.upcomingpay_hi;
        this.totalearnings = ConfigMsg.totalearnings_hi;
      } else {
        this.upcomingpaytext = ConfigMsg.upcomingpay_en;
        this.totalearnings = ConfigMsg.totalearnings_en;
      }
      this.infoCards = [
        { name: this.upcomingpaytext, value: this.totalupcomingEarnings },
        { name: this.totalearnings, value: this.totalEarnings },
      ];
    }
    this.spinnerService.hide();
  }

  accept(jobId: number) {
    this.getUserAllJobDetailsByUserId();
    setTimeout(() => {
      this.spinnerService.show();
      this.preparetoacceptjob(jobId);
    }, 3000);
  }

  private preparetoacceptjob(jobId: number) {
    if (this.listOfVolidationJobs != null && this.listOfVolidationJobs.length > 0) {
      this.referService.translatetext('You can not accept this job as there are voliation jobs in upcoming list. Please call us as soon as possible. Util this violation issue not resolved you can not accept new jobs. ', this.userService.currentUserValue.preferlang).subscribe(
        (trantxt: any) => {
          this.alertService.info(trantxt);
          this.spinnerService.hide();
        },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        }
      );
    } else
      if (this.listOfCompletedJobsWithoutPay != null && this.listOfCompletedJobsWithoutPay.length > 0) {
        this.referService.translatetext('You can not accept this job until the previous completed job payment with the client is paid fully. Please arrange the payment with the client to accept new jobs.', this.userService.currentUserValue.preferlang).subscribe(
          (trantxt: any) => {
            this.alertService.info(trantxt);
            this.spinnerService.hide();
          },
          error => {
            this.spinnerService.hide();
            this.alertService.error(error);
          }
        );
      } else if (this.upcomingJobList != null && this.upcomingJobList.length == 3) {
        this.referService.translatetext('You can not accept this job until atleast one job is completed among 3 in the upcoming jobs.', this.userService.currentUserValue.preferlang).subscribe(
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
    if (this.listOfVolidationJobs.length == 0 && this.listOfCompletedJobsWithoutPay.length == 0 && this.upcomingJobList.length < 3) {
      this.spinnerService.show();
      this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe(
        (freelancedetailsbyId: FreelanceOnSvc) => {
          if (!freelancedetailsbyId.isjobaccepted) {
            freelancedetailsbyId.freelanceuserId = this.userService.currentUserValue.userId;
            freelancedetailsbyId.isjobaccepted = true;
            freelancedetailsbyId.jobaccepteddate = this.indiaTimeFormat.toString();
            this.freelanceSvc.saveOrUpdateFreeLanceOnService(freelancedetailsbyId).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
              this.referService.translatetext('Thank you for accepting the Job. Go to upcoming job tab to view', this.userService.currentUserValue.preferlang).subscribe(
                (trantxt: any) => {
                  this.getUserAllJobDetailsByUserId();
                  this.spinnerService.hide();
                  this.alertService.info(trantxt);
                },
                error => {
                  this.spinnerService.hide();
                  this.alertService.error(error);
                }
              );
            },
              error => {
                this.spinnerService.hide();
                this.alertService.error(error);
              });
          } else {
            this.referService.translatetext('Sorry! This job is accepted by another skilled worker.', this.userService.currentUserValue.preferlang).subscribe(
              (trantxt: any) => {
                this.spinnerService.hide();
                this.alertService.info(trantxt);
              },
              error => {
                this.spinnerService.hide();
                this.alertService.error(error);
              }
            );
          }
        },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        });
    }
  }

  cancel(jobId: number) {
    this.confirmationDialogService.confirm('Please confirm', 'Do you really want to cancel the Job Id#' + jobId + ' ?', 'Ok', 'Cancel')
      .then((confirmed) => {
        if (confirmed) {
          this.spinnerService.show();
          this.listofalljobs = [];
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
                      this.freelanceSvc.saveOrUpdateFreeLanceOnService(freelancedetailsbyId).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
                        this.referService.translatetext('Hello! The Job is cancelled succesfully.', this.userService.currentUserValue.preferlang).subscribe(
                          (trantxt: any) => {
                            this.getUserAllJobDetailsByUserId();
                            this.spinnerService.hide();
                            this.alertService.info(trantxt);
                          },
                          error => {
                            this.spinnerService.hide();
                            this.alertService.error(error);
                          }
                        );
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
                  this.referService.translatetext("Cancellation only possible before 15 mins of accepting the job. Any concerns, please call support@kaamkarega.com or read terms of services.", this.userService.currentUserValue.preferlang).subscribe(
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
      })
  }

  autoToastNotificationsForFU() {
    if (this.userService.currentUserValue.userroles.rolecode === config.user_rolecode_fu.toString()) {
      if (!this.userService.currentUserValue.freeLanceDetails.isprofilecompleted) {
        let msg = 'Hi ' + this.userService.currentUserValue.fullname + ', ' + ConfigMsg.toast_notification_fu_isprofilenotcompelted;
        this.showToastNotificationForFU(msg, this.types[3], 'Profile');
      } else
        if (!this.userService.currentUserValue.freeLanceDetails.isregfeedone) {
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

  openReadMorePopup(fullcontent: string) {
    const initialState = {
      content: fullcontent
    };
    this.modalRef = this.modalService.show(ReadMorePopupComponent, Object.assign(
      {},
      this.config,
      {
        initialState
      }
    ));
  }

}

