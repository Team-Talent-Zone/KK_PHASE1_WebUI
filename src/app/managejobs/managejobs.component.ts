import { AlertsService } from './../AppRestCall/alerts/alerts.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../AppRestCall/user/user.service';
import { FreelanceserviceService } from '../AppRestCall/freelanceservice/freelanceservice.service';
import { FreelanceOnSvc } from '../appmodels/FreelanceOnSvc';
import { PaymentComponent } from '../payment/payment.component';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { timer } from 'rxjs';
import { FreelanceStarReview } from '../appmodels/FreelanceStarReview';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Toaster, ToastType } from 'ngx-toast-notifications';
import { ModalOptions } from 'ngx-bootstrap/modal';
import { ReadMorePopupComponent } from '../read-more-popup/read-more-popup.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { config } from '../appconstants/config';
import { UsersrvdetailsService } from '../AppRestCall/userservice/usersrvdetails.service';
import { DatePipe } from '@angular/common';
import { ConfigMsg } from '../appconstants/configmsg';
import { ConfirmationDialogService } from '../AppRestCall/confirmation/confirmation-dialog.service';
import { CommonUtility } from '../adapters/commonutility';

@Component({
  selector: 'app-managejobs',
  templateUrl: './managejobs.component.html',
  styleUrls: ['./managejobs.component.css']
})

export class ManagejobsComponent implements OnInit {

  @ViewChild('closeBtn', null) closeBtn: ElementRef;
  newlyPostedJobs: any = [];
  completedJobs: any = [];
  upComingPostedJobs: any = [];
  record: any = [];
  freelancestarobj: any;
  feedbackform: FormGroup;
  issubmit = false;
  isratingdisplay = false;
  private types: Array<ToastType> = ['success', 'danger', 'warning', 'info', 'primary', 'secondary', 'dark', 'light'];
  notifcationbellList: any = [];
  mapurl = 'http://maps.google.com/?z=16&q=';
  comma = ',';
  newjobsempty: boolean = false;
  upcomingjobsempty: boolean = false;
  completedjobsempty: boolean = false;

  constructor(
    private toaster: Toaster,
    public fb: FormBuilder,
    private route: ActivatedRoute,
    private alertService: AlertsService,
    public userService: UserService,
    private router: Router,
    private freelanceserviceService: FreelanceserviceService,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalRef: BsModalRef,
    private modalService: BsModalService,
    private dashboard: DashboardComponent,
    public usersrvdetails: UsersrvdetailsService,
    public datepipe: DatePipe,
    public confirmationDialogService: ConfirmationDialogService,
    public commonlogic: CommonUtility
  ) {
  }

  ngOnInit() {
    this.spinnerService.show();
    if (this.router.url.toString() === '/_job'.toString() && this.userService.currentUserValue != null) {
      const source = timer(1000, 60000);
      const sourcerefresh = timer(1000, 95000);
      sourcerefresh.subscribe((val: number) => {
        this.getUserAllJobDetailsByUserId();
      });
      source.subscribe((val: number) => {
        this.getToastNotificationUserByRole(config.rolecode_toast_notification_cba);
      });
    }
  }

  private getToastNotificationUserByRole(roleCode: string) {
    this.usersrvdetails.getAllBellNotificationsByRoleCode(roleCode).subscribe(
      (notifcationlist: any) => {
        if (notifcationlist != null) {
          notifcationlist.forEach(element => {
            this.showToastNotificationForFCBA(element.msg, this.types[3], ConfigMsg.keytoaster);
          });
        }
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      }
    );
  }

  showToastNotificationForFCBA(txtmsg: string, typeName: any, toastheader: string) {
    const type = typeName;
    this.toaster.open({
      text: txtmsg,
      caption: toastheader + ConfigMsg.keytoaster_1,
      type: type,
    });
  }

  jobDone(jobId: number) {
    this.spinnerService.show();
    this.freelanceserviceService.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
      objfreelanceservice.isjobcompleted = true;
      this.freelanceserviceService.saveOrUpdateFreelancerOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
        if (updatedobjfreelanceservice.jobId > 0) {
          this.alertService.success(ConfigMsg.job_msg_1);
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

  updateFreelancerAttendance(jobId: number) {
    this.confirmationDialogService.confirm(ConfigMsg.confirmation_header_msg, ConfigMsg.confirmation_msg_jobattendance, ConfigMsg.confirmation_button_present, ConfigMsg.confirmation_button_cancel)
      .then((confirmed) => {
        if (confirmed) {
          this.spinnerService.show();
          this.freelanceserviceService.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
            objfreelanceservice.isfreelancerjobattendant = true;
            objfreelanceservice.cbajobattendantdate = this.commonlogic.indiaTimeFormat.toString();
            this.freelanceserviceService.saveOrUpdateFreelancerOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
              if (updatedobjfreelanceservice.jobId > 0) {
                this.alertService.success(ConfigMsg.job_sw_atlocation + updatedobjfreelanceservice.joblocation + ConfigMsg.on_msg + this.commonlogic.indiaTime.toString());
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
      })
  }
  activateJob(jobId: number) {
    if (this.newlyPostedJobs !== null) {
      this.newlyPostedJobs.forEach(element => {
        if (element.jobId == jobId) {
          this.spinnerService.show();
          this.freelanceserviceService.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
            objfreelanceservice.isjobactive = true;
            objfreelanceservice.tocompanyamount = element.tocompanyamount;
            objfreelanceservice.tofreelanceamount = element.tofreelanceamount;
            objfreelanceservice.isfreelancerjobattendant = false;
            objfreelanceservice.isjobvoliation = false;
            this.freelanceserviceService.saveOrUpdateFreelancerOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
              if (updatedobjfreelanceservice.jobId > 0) {
                this.alertService.success(ConfigMsg.job_assign_msg_1 + jobId + ConfigMsg.job_success_msg);
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
      });
    }
  }

  cancelJob(jobId: number) {
    this.confirmationDialogService.confirm(ConfigMsg.confirmation_header_msg, ConfigMsg.confirmation_job_cancel_msg + jobId + ConfigMsg.confirmation_questionmark,
      ConfigMsg.confirmation_button_ok, ConfigMsg.confirmation_button_cancel)
      .then((confirmed) => {
        if (confirmed) {
          this.spinnerService.show();
          this.freelanceserviceService.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
            this.freelanceserviceService.deleteFreelanceSVCDetails(objfreelanceservice).subscribe((bol: boolean) => {
              if (bol) {
                this.alertService.success(ConfigMsg.job_assign_msg_1 + jobId + ConfigMsg.job_canclled_msg);
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
      })
  }

  deactivateJob(jobId: number, reason: string) {
    this.confirmationDialogService.confirm(ConfigMsg.confirmation_header_msg, ConfigMsg.job_decision_msg_1, ConfigMsg.confirmation_button_yes, ConfigMsg.confirmation_button_no)
      .then((confirmed) => {
        if (confirmed) {
          this.spinnerService.show();
          this.freelanceserviceService.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
            if (reason == config.voliation.toString()) {
              objfreelanceservice.isjobvoliation = true;
            } else {
              objfreelanceservice.isjobactive = false;
            }
            this.freelanceserviceService.saveOrUpdateFreelancerOnService(objfreelanceservice).subscribe((bol: boolean) => {
              if (bol) {
                if (reason != config.voliation.toString()) {
                  this.alertService.success(ConfigMsg.job_assign_msg_1 + jobId + ConfigMsg.job_canclled_msg);
                } else {
                  this.alertService.success(ConfigMsg.voliation_msg + ConfigMsg.job_assign_msg_1 + jobId + ConfigMsg.job_hold_msg);
                }
                this.getUserAllJobDetailsByUserId();
                this.spinnerService.hide();
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
      })
  }

  getUserAllJobDetailsByUserId() {
    this.newlyPostedJobs = [];
    this.completedJobs = [];
    this.upComingPostedJobs = [];
    this.spinnerService.show();
    this.freelanceserviceService.getUserAllJobDetailsByUserId(this.userService.currentUserValue.userId).subscribe((onserviceList: any) => {
      if (onserviceList != null && onserviceList.length > 0) {
        onserviceList.forEach((element: any) => {
          if (element.isjobactive && element.jobacceptdecisionflag && !element.isjobamtpaidtocompany) {
            this.upComingPostedJobs.push(element);
          }
          if (!element.isjobcancel && !element.isjobcompleted &&
            !element.isjobamtpaidtocompany && !element.jobacceptdecisionflag &&
            (element.freelanceuserId == null || element.jobaccepteddate != null)) {
            this.newlyPostedJobs.push(element);
          }
          if (element.isjobactive && element.isjobcompleted && element.isjobamtpaidtocompany && element.isjobaccepted) {
            this.completedJobs.push(element);
          }
        });
        if (this.upComingPostedJobs != null && this.upComingPostedJobs.length > 0) {
          this.upcomingjobsempty = false;
        } else {
          this.upcomingjobsempty = true;
        }
        if (this.newlyPostedJobs != null && this.newlyPostedJobs.length > 0) {
          this.newjobsempty = false;
        } else {
          this.newjobsempty = true;
        }
        if (this.completedJobs != null && this.completedJobs.length > 0) {
          this.completedjobsempty = false;
        } else {
          this.completedjobsempty = true;
        }
        this.spinnerService.hide();
      } else {
        this.newjobsempty = true;
        this.upcomingjobsempty = true;
        this.completedjobsempty = true;
        this.spinnerService.hide();
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  openPaymentComponent(amount: number, jobId: string, subcategorylabel: string) {
    this.modalRef = this.modalService.show(PaymentComponent, {
      initialState: {
        totalAmountToPay: amount,
        jobids: jobId,
        productinfoParam: subcategorylabel + ConfigMsg.job_assign_msg_1 + jobId
      }
    });
  }

  feedback(jobId: number) {
    this.record = [];
    for (let element of this.completedJobs) {
      if (element.jobId == jobId) {
        this.record = element;
      }
    }
    this.isratingdisplay = true;
    this.feedbackform = new FormGroup({
      starrate: new FormControl('', Validators.required),
      feedbackcomment: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9.,/\n]+[a-zA-Z0-9.,/\n ]+')])
    });
  }

  savefeedback() {
    this.issubmit = true;
    if (this.feedbackform.invalid) {
      return;
    }
    this.freelancestarobj = new FreelanceStarReview();
    this.freelancestarobj.feedbackcomment = this.feedbackform.get('feedbackcomment').value;
    this.freelancestarobj.userId = this.userService.currentUserValue.userId;
    this.freelancestarobj.freelanceuserId = this.record.freelanceuserId;
    this.freelancestarobj.jobId = this.record.jobId;
    this.freelancestarobj.starrate = this.feedbackform.get('starrate').value;
    this.freelancestarobj.feedbackby = this.userService.currentUserValue.userbizdetails.bizname;
    this.spinnerService.show();
    this.freelanceserviceService.saveFreeLanceStarReviewFB(this.freelancestarobj).subscribe((response: FreelanceStarReview) => {
      if (response.id > 0) {
        this.alertService.success(ConfigMsg.feedback_msg);
        this.spinnerService.hide();
        this.closeModal();
        this.getUserAllJobDetailsByUserId();
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  private closeModal(): void {
    this.closeBtn.nativeElement.click();
  }

  get f() {
    return this.feedbackform.controls;
  }

  openReadMorePopup(fullcontent: string) {
    const initialState = {
      content: fullcontent
    };
    this.modalRef = this.modalService.show(ReadMorePopupComponent, Object.assign(
      {},
      this.commonlogic.configmdwithoutanimation,
      {
        initialState
      }
    ));
  }

}
