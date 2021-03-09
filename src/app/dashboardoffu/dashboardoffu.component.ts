import { ConfirmationDialogService } from './../AppRestCall/confirmation/confirmation-dialog.service';
import { UserService } from './../AppRestCall/user/user.service';
import { Component, OnInit } from '@angular/core';
import { config } from '../appconstants/config';
import { ReferenceService } from '../AppRestCall/reference/reference.service';
import { PaymentComponent } from '../payment/payment.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { FreelanceOnSvcService } from '../AppRestCall/freelanceOnSvc/freelance-on-svc.service';
import { FreelanceOnSvc } from '../appmodels/FreelanceOnSvc';
import { ConfigMsg } from '../appconstants/configmsg';
import { timer } from 'rxjs';
import { Router } from '@angular/router';
import { ReadMorePopupComponent } from '../read-more-popup/read-more-popup.component';
import { DatePipe } from '@angular/common';
import { CommonUtility } from '../adapters/commonutility';
import { FreelanceserviceService } from '../AppRestCall/freelanceservice/freelanceservice.service';

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
  upcomingpaytext: string;
  totalearnings: string;
  mapurl = 'http://maps.google.com/?z=16&q=';
  comma = ',';

  newjobsempty: boolean = false;
  upcomingjobsempty: boolean = false;
  completedjobsempty: boolean = false;
  voliationjobsempty: boolean = false;
  date = new Date();
  modalRef: any;
  indiaTimeFormat = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-MM-dd HH:mm:ss");

  constructor(
    public userService: UserService,
    private referService: ReferenceService,
    private modalService: BsModalService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    private freelanceSvc: FreelanceOnSvcService,
    private router: Router,
    public datepipe: DatePipe,
    public confirmationDialogService: ConfirmationDialogService,
    public commonlogic: CommonUtility,
    private freelanceserviceService: FreelanceserviceService,

  ) {
  }

  ngOnInit() {
    const sourcerefresh = timer(1000, 90000);
    sourcerefresh.subscribe(() => {
      if (this.router.url === '/_dashboard') {
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
        productinfoParam: ConfigMsg.reg_fee_msg
      }
    });
  }

  updateFreelancerAttendance(jobId: number) {
    this.spinnerService.show();
    this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
      objfreelanceservice.freelancerjobattendantdate = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "dd/MM/yyyy hh:mm:ss").toString();
      this.freelanceSvc.saveOrUpdateFreeLanceOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
        if (updatedobjfreelanceservice.jobId > 0) {
          this.alertService.success(ConfigMsg.update_attendance_msg + updatedobjfreelanceservice.joblocation + ConfigMsg.on_msg + this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "dd/MM/yyyy hh:mm:ss").toString());
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
          if (this.userService.currentUserValue.preferlang !== config.lang_code_en) {
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
            && element.isjobaccepted && !element.isjobamtpaidtocompany && !element.deactivefromupcomingjob) {
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
  }

  accept(jobId: number, tofreelanceamount: string, tocompanyamount: string) {
    this.spinnerService.show();
    this.getUserAllJobDetailsByUserId();
    setTimeout(() => {
      this.spinnerService.show();
      this.preparetoacceptjob(jobId, tofreelanceamount, tocompanyamount);
    }, 4000);
  }

  private preparetoacceptjob(jobId: number, tofreelanceamount: string, tocompanyamount: string) {
    if (this.listOfVolidationJobs != null && this.listOfVolidationJobs.length > 0) {
      this.referService.translatetext(ConfigMsg.accept_job_msg_1, this.userService.currentUserValue.preferlang).subscribe(
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
        this.referService.translatetext(ConfigMsg.accept_job_msg_2, this.userService.currentUserValue.preferlang).subscribe(
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
        this.referService.translatetext(ConfigMsg.accept_job_msg_3, this.userService.currentUserValue.preferlang).subscribe(
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
            freelancedetailsbyId.tocompanyamount = tocompanyamount;
            freelancedetailsbyId.tofreelanceamount = tofreelanceamount;
            freelancedetailsbyId.jobaccepteddate = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-MM-dd HH:mm:ss").toString();
            this.freelanceSvc.saveOrUpdateFreeLanceOnService(freelancedetailsbyId).subscribe(() => {
              this.referService.translatetext(ConfigMsg.accept_job_msg_4, this.userService.currentUserValue.preferlang).subscribe(
                (trantxt: any) => {
                  this.getUserAllJobDetailsByUserId();
                  this.spinnerService.hide();
                  this.alertService.success(trantxt);
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
            this.referService.translatetext(ConfigMsg.accept_job_msg_5, this.userService.currentUserValue.preferlang).subscribe(
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
    this.confirmationDialogService.confirm(ConfigMsg.confirmation_header_msg, ConfigMsg.confirmation_job_cancel_msg + jobId + ConfigMsg.confirmation_questionmark,
      ConfigMsg.confirmation_button_ok, ConfigMsg.confirmation_button_cancel)
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
                      freelancedetailsbyId.jobaccepteddate = null;
                      this.freelanceSvc.saveOrUpdateFreeLanceOnService(freelancedetailsbyId).subscribe(() => {
                        this.referService.translatetext(ConfigMsg.job_cancelled_msg, this.userService.currentUserValue.preferlang).subscribe(
                          (trantxt: any) => {
                            this.getUserAllJobDetailsByUserId();
                            this.spinnerService.hide();
                            this.alertService.success(trantxt);
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
                  this.referService.translatetext(ConfigMsg.job_cannot_cancel_msg, this.userService.currentUserValue.preferlang).subscribe(
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

  openReadMorePopup(fullcontent: string) {
    const initialState = {
      content: fullcontent
    };
    this.modalRef = this.modalService.show(ReadMorePopupComponent, Object.assign(
      {},
      this.commonlogic.configmd,
      {
        initialState
      }
    ));
  }

  openWorkingHours(jobId: number) {
    this.freelanceserviceService.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
      this.commonlogic.buildEndDateOfJob(objfreelanceservice.totalhoursofjob, new Date(objfreelanceservice.jobstartedon));
      setTimeout(() => {
        const initialState = {
          workinghourslist: this.commonlogic.workinghourslist
        };
        this.modalRef = this.modalService.show(ReadMorePopupComponent, Object.assign(
          {},
          this.commonlogic.configmdwithoutanimation,
          {
            initialState
          }
        ));
      }, 400);
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }


}

