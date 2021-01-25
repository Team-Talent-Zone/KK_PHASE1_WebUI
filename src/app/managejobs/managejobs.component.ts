import { AlertsService } from './../AppRestCall/alerts/alerts.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../AppRestCall/user/user.service';
import { FreelanceserviceService } from '../AppRestCall/freelanceservice/freelanceservice.service';
import { FreelanceOnSvc } from '../appmodels/FreelanceOnSvc';
import { PaymentComponent } from '../payment/payment.component';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { timer } from 'rxjs';
import { FreelanceStarReview } from '../appmodels/FreelanceStarReview';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Toaster, ToastType } from 'ngx-toast-notifications';
import { ModalOptions } from 'ngx-bootstrap/modal';
import { ReadMorePopupComponent } from '../read-more-popup/read-more-popup.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { config } from '../appconstants/config';
import { UsersrvdetailsService } from '../AppRestCall/userservice/usersrvdetails.service';

@Component({
  selector: 'app-managejobs',
  templateUrl: './managejobs.component.html',
  styleUrls: ['./managejobs.component.css']
})

export class ManagejobsComponent implements OnInit {

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
  config: ModalOptions = {
    class: 'modal-md', backdrop: 'static',
    keyboard: false
  };
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
  ) {
  }

  ngOnInit() {
    this.spinnerService.show();
    if (this.router.url.toString() === '/job'.toString()) {
      const source = timer(1000, 20000);
      const sourcerefresh = timer(1000, 90000);
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
            this.showToastNotificationForFCBA(element.msg, this.types[3], 'Friendly');
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
      caption: toastheader + ' Notification',
      type: type,
    });
  }

  jobDone(jobId: number) {
    this.spinnerService.show();
    this.freelanceserviceService.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
      objfreelanceservice.isjobcompleted = true;
      this.freelanceserviceService.saveOrUpdateFreelancerOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
        if (updatedobjfreelanceservice.jobId > 0) {
          this.alertService.success('The Job is completed successfully. Please click on the Pay. ');
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

  activateJob(jobId: number) {
    if (this.newlyPostedJobs !== null) {
      this.newlyPostedJobs.forEach(element => {
        if (element.jobId == jobId) {
          this.spinnerService.show();
          this.freelanceserviceService.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
            objfreelanceservice.isjobactive = true;
            objfreelanceservice.tocompanyamount = element.tocompanyamount;
            objfreelanceservice.tofreelanceamount = element.tofreelanceamount;
            this.freelanceserviceService.saveOrUpdateFreelancerOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
              if (updatedobjfreelanceservice.jobId > 0) {
                this.alertService.success('The JobId: ' + jobId + ' is activiated succesfully . We will notify once the skilled worker accepts the job. ');
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
    this.spinnerService.show();
    this.freelanceserviceService.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
      this.freelanceserviceService.deleteFreelanceSVCDetails(objfreelanceservice).subscribe((bol: boolean) => {
        if (bol) {
          this.alertService.success('The JobId: ' + jobId + ' is cancelled successfully.');
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
    this.newlyPostedJobs = [];
    this.completedJobs = [];
    this.upComingPostedJobs = [];
    this.spinnerService.show();
    this.freelanceserviceService.getUserAllJobDetailsByUserId(this.userService.currentUserValue.userId).subscribe((onserviceList: any) => {
      if (onserviceList != null && onserviceList.length > 0) {
        console.log('onserviceList ==>', onserviceList.length);
        onserviceList.forEach((element: any) => {
          if (element.isjobactive && element.isjobaccepted && !element.isjobamtpaidtocompany) {
            this.upComingPostedJobs.push(element);
          }
          if (!element.isjobcancel && !element.isjobcompleted && !element.isjobamtpaidtocompany && !element.isjobaccepted) {
            this.newlyPostedJobs.push(element);
          }
          if (element.isjobactive && element.isjobcompleted && element.isjobamtpaidtocompany && element.isjobaccepted) {
            this.completedJobs.push(element);
          }
        });
        if (this.upComingPostedJobs != null) {
          this.upcomingjobsempty = true;
        } else
          if (this.newlyPostedJobs != null) {
            this.newjobsempty = true;
          } else {
            this.completedjobsempty = true;
          }
        this.spinnerService.hide();
      } else {
        this.newjobsempty = true;
        this.upcomingjobsempty = true;
        this.completedjobsempty = true;
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
        productinfoParam: subcategorylabel + 'JobId#' + jobId
      }
    });
  }

  feedback(jobId: number) {
    this.record = [];
    this.feedbackformvalidation();
    this.isratingdisplay = true;
    for (let element of this.completedJobs) {
      if (element.jobId == jobId) {
        this.record = element;
      }
    }
  }

  feedbackformvalidation() {
    this.feedbackform = this.fb.group({
      starrate: ['', Validators.required],
      feedbackcomment: ['', Validators.required]
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
        this.alertService.success('Thank you for the feedback');
        this.spinnerService.hide();
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
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
      this.config,
      {
        initialState
      }
    ));
  }
}
