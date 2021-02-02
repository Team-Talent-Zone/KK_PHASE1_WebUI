import { ReferenceService } from './../AppRestCall/reference/reference.service';
import { ManageuserComponent } from './../manageuser/manageuser.component';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { FreelanceserviceService } from '../AppRestCall/freelanceservice/freelanceservice.service';
import { UserService } from '../AppRestCall/user/user.service';
import { config } from '../appconstants/config';
import { ConfirmationDialogService } from '../AppRestCall/confirmation/confirmation-dialog.service';
import { FreelanceOnSvcService } from '../AppRestCall/freelanceOnSvc/freelance-on-svc.service';
import { FreelanceOnSvc } from '../appmodels/FreelanceOnSvc';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ReferenceAdapter } from '../adapters/referenceadapter';
import { map } from 'rxjs/operators';
import { UsersrvdetailsService } from '../AppRestCall/userservice/usersrvdetails.service';
import { timer } from 'rxjs';
import { NewsvcService } from '../AppRestCall/newsvc/newsvc.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ViewjobbyjobidPopupComponent } from '../viewjobbyjobid-popup/viewjobbyjobid-popup.component';

@Component({
  selector: 'app-dashboardofadmin',
  templateUrl: './dashboardofadmin.component.html',
  styleUrls: ['./dashboardofadmin.component.css']
})
export class DashboardofadminComponent implements OnInit {

  indiaTime = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-MM-dd");
  todaysvoliationList: any = [];
  totalvoliationResolvedList: any = []
  todaysjobscheduledList: any = [];
  upcomingjobscheduledList: any = [];
  newjobsbutnotactiviatedList: any = [];
  newjobsactiviatedbutnotacceptedList: any = [];
  jobscompletedList: any = [];
  jobscompletedwithoutpaymentList: any = [];
  jobscompletedpayoutpendingList: any = [];
  indiaTimeFormat = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-MM-dd hh:mm:ss");
  startdate: Date;
  minstartDate = new Date();
  maxstartDate = new Date();
  newendjobdate : string;
  totalhoursofjob: number;
  totalmoneyearnedbycompanytilltoday: number = 0;
  totalmoneyearnedbyskilledworkerstilltoday: number = 0;
  totalmoneyyettopaybytheclientstilltoday: number = 0;
  totalcompletedjobswithoutpaymentbyclient: number = 0;

  allFreelancerUsersList: any = [];
  listofAllFUSkills: any = [];
  isshowfualluser: boolean = false;
  fuUserId: number = 0;
  fuFullName: string;
  index: number;
  volationindex: number;
  issubmit = false;
  iscreatejobflag: boolean = false;
  bufferhours: number = 4;
  onworkfreelancelistsbysubcategory: any;
  onnotworkfreelancelistsbysubcategory: any;
  isshowswithjobbycategory : boolean = false;
  isshowswithnojobbycategory : boolean = false;
  isshownofreelancerinsystem : boolean = false;
  enddatevalue: string;
  resolvedvoliationreason: string;

  config: ModalOptions = {
    class: 'modal-lg', backdrop: 'static',
    keyboard: false
  };
  modalRef: BsModalRef;

  /*
  All - Service related varaible
  */

  listofallpaidservices: any;
  listofallnotpaidservices: any;
  onlistofallactivenewservices: any;
  servicetableenabled : boolean = false;
  totalearningonservice: number = 0;
  totalearningallservices: number = 0;
  ispurchasedserviceempty: boolean = false;
  isnotpurchasedserviceempty:boolean = false;

  constructor(
    private freelanceserviceService: FreelanceserviceService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    public datepipe: DatePipe,
    public manageruser: ManageuserComponent,
    public userService: UserService,
    public confirmationDialogService: ConfirmationDialogService,
    private freelanceSvc: FreelanceOnSvcService,
    private formBuilder: FormBuilder,
    private refAdapter: ReferenceAdapter,
    private referService: ReferenceService,
    private usersrvdetailsService: UsersrvdetailsService,
    private newService: NewsvcService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
    const sourcerefresh = timer(1000, 90000);
   // sourcerefresh.subscribe((val: number) => 
      this.dashboardSummaryOfSkilledWorkerSearchService();
      this.getAllAvailableFUSkills();
     
    //});
    this.getAllNewServiceDetails();
  }

  dashboardSummaryOfSkilledWorkerSearchService() {
    this.todaysvoliationList = [];
    this.totalvoliationResolvedList = []
    this.todaysjobscheduledList = [];
    this.upcomingjobscheduledList = [];
    this.newjobsbutnotactiviatedList = [];
    this.newjobsactiviatedbutnotacceptedList = [];
    this.jobscompletedList = [];
    this.jobscompletedwithoutpaymentList = [];
    this.jobscompletedpayoutpendingList = [];
    this.totalmoneyearnedbycompanytilltoday = 0;
    this.totalmoneyearnedbyskilledworkerstilltoday = 0;
    this.totalmoneyyettopaybytheclientstilltoday = 0;
    this.totalcompletedjobswithoutpaymentbyclient = 0;

    this.freelanceserviceService.getUserAllJobDetails().subscribe((jobdetailsList: any) => {
      if (jobdetailsList != null) {
        jobdetailsList.forEach(element => {
          if (element.isjobvoliation && element.cbajobattendantdate == null && !element.isfreelancerjobattendant && !element.isjobactive) {
            this.todaysvoliationList.push(element);
          }
          if (element.isjobvoliation && element.isfreelancerjobattendant) {
            this.totalvoliationResolvedList.push(element);
          }
          if (element.isjobactive && element.isjobaccepted && this.getDate(element.jobstartedon) == this.indiaTime.toString() && element.jobaccepteddate != null) {
            this.todaysjobscheduledList.push(element);
          }
          if (element.isjobactive && element.isjobaccepted && element.isupcoming && element.jobaccepteddate != null && !element.deactivefromupcomingjob) {
            this.upcomingjobscheduledList.push(element);
          }
          if (!element.isjobactive && !element.isjobvoliation) {
            this.newjobsbutnotactiviatedList.push(element);
          }
          if (element.isjobactive && !element.isjobaccepted && !element.isjobvoliation && element.jobaccepteddate == null) {
            this.newjobsactiviatedbutnotacceptedList.push(element);
          }
          if (element.isjobactive && element.isjobcompleted && element.isjobamtpaidtocompany && element.isjobamtpaidtofu && element.jobaccepteddate != null) {
            this.jobscompletedList.push(element);
            this.totalmoneyearnedbycompanytilltoday = Number.parseFloat(element.tocompanyamount) + this.totalmoneyearnedbycompanytilltoday;
            this.totalmoneyearnedbyskilledworkerstilltoday = Number.parseFloat(element.tofreelanceamount) + this.totalmoneyearnedbyskilledworkerstilltoday;
          }
          if (element.isjobactive && element.isjobcompleted && !element.isjobamtpaidtocompany && element.jobaccepteddate != null) {
            this.jobscompletedwithoutpaymentList.push(element);
            this.totalcompletedjobswithoutpaymentbyclient = Number.parseFloat(element.tocompanyamount) + this.totalcompletedjobswithoutpaymentbyclient;
          }
          if (element.isjobactive && element.isjobcompleted && !element.isjobamtpaidtofu && element.jobaccepteddate != null) {
            this.jobscompletedpayoutpendingList.push(element);
          }
        });
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      })
  }

  getDate(dt: Date) {
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

  getFUUsersByCategory(subcat: string, index: number) {
    this.fuUserId = 0;
    this.fuFullName = null;
    this.isshowfualluser = false;
    this.index = index;
    this.allFreelancerUsersList = [];
    this.userService.getUsersByRole(config.user_rolecode_fu).subscribe((userList: any) => {
      if (userList != null) {
        userList.forEach(element => {
          if (element.isactive && element.freeLanceDetails.bgcurrentstatus == config.bg_code_approved && element.freeLanceDetails.subCategory == subcat.toString()) {
            this.allFreelancerUsersList.push(element);
          }
        });
        this.isshowfualluser = true;
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  captureUserDetails(event: Event) {
    this.fuUserId = null;
    this.fuFullName = null;
    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    let selectElementText = selectedOptions[selectedIndex].text;
    let selectElementUserId = selectedOptions[selectedIndex].value;
    this.fuUserId = selectElementUserId;
    this.fuFullName = selectElementText;
  }

  getFUWorkStatus(event: Event) {
    this.onworkfreelancelistsbysubcategory = [];
    this.onnotworkfreelancelistsbysubcategory = [];
    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    let selectElementText = selectedOptions[selectedIndex].text;
    let selectElementCode = selectedOptions[selectedIndex].value;
    this.isshowswithjobbycategory = false;
    this.isshowswithnojobbycategory = false;
    this.isshownofreelancerinsystem = false;
    if(selectElementCode.length > 0){
        this.freelanceserviceService.getUserAllJobDetailsBySubCategory(selectElementCode).subscribe((freelanceserviceList: any) => {
          if (freelanceserviceList != null) {
            freelanceserviceList.forEach(element => {
              if (element.isjobactive && !element.isjobvoliation && element.jobaccepteddate != null) {
                this.onworkfreelancelistsbysubcategory.push(element);
              }
            });
              setTimeout(() => {
                if(this.onworkfreelancelistsbysubcategory.length > 0){
                  this.isshowswithjobbycategory = true;
                }
                this.userService.getUsersByRole(config.user_rolecode_fu).subscribe((userList: any) => {
                  if (userList != null) {
                    if(this.onworkfreelancelistsbysubcategory.length > 0){
                      userList.forEach(element => {
                        var isexist = this.onworkfreelancelistsbysubcategory.filter(e => e.freelanceuserId === element.userId);
                        if (isexist == null && element.isactive && 
                          element.freeLanceDetails.bgcurrentstatus == config.bg_code_approved && 
                          selectElementCode == element.freeLanceDetails.subCategory ) {
                          this.onnotworkfreelancelistsbysubcategory.push(element);
                          this.isshowswithnojobbycategory = true;
                          }
                    });
                  } else{
                    userList.forEach(element => {
                      if (element.isactive && 
                        element.freeLanceDetails.bgcurrentstatus == config.bg_code_approved && 
                        selectElementCode == element.freeLanceDetails.subCategory ) {
                        this.onnotworkfreelancelistsbysubcategory.push(element);
                        this.isshowswithnojobbycategory = true;
                      }
                    })
                  }
                  }
                },
                  error => {
                    this.spinnerService.hide();
                    this.alertService.error(error);
                  });
                  if(this.onnotworkfreelancelistsbysubcategory.length == 0 && this.onworkfreelancelistsbysubcategory == 0 ){
                    this.isshownofreelancerinsystem = true;
                  }
              }, 500);
          }
        }, error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        });
      }
  }

  reassign(jobId: number) {
    this.confirmationDialogService.confirm('Please confirm', 'Do you want to assign the JobId#' + jobId + ' to ' + this.fuFullName + '?', 'Assign', 'Cancel')
      .then((confirmed) => {
        if (confirmed) {
          if (this.fuUserId > 0 && this.fuFullName != null) {
            this.spinnerService.show();
            this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
              if (!objfreelanceservice.isjobaccepted) {
                objfreelanceservice.freelanceuserId = this.fuUserId;
                objfreelanceservice.isjobaccepted = true;
                objfreelanceservice.jobaccepteddate = this.indiaTimeFormat.toString();
                this.freelanceSvc.saveOrUpdateFreeLanceOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
                  if (updatedobjfreelanceservice.jobId > 0) {
                    this.alertService.success('The JobId# ' + jobId + ' is successfully assigned to ' + this.fuFullName + ' on ' + this.indiaTime.toString());
                    this.spinnerService.hide();
                    this.isshowfualluser = false;
                    this.dashboardSummaryOfSkilledWorkerSearchService();
                  }
                },
                  error => {
                    this.spinnerService.hide();
                    this.alertService.error(error);
                  });
              }
            },
              error => {
                this.spinnerService.hide();
                this.alertService.error(error);
              });
          }
        }
      });
  }

  triggervoliationwork(index: number){
    this.volationindex = index;
  }

  reset(){
    this.volationindex = -1;
    this.iscreatejobflag = false;
    this.allFreelancerUsersList = null;
    this.enddatevalue = null;
    this.startdate = null;
    this.fuFullName = null;
    this.fuUserId = null;
    this.resolvedvoliationreason = null;
  }

  savevoliationResolvedReason(jobId: number) {
   if(this.resolvedvoliationreason == null){
    this.alertService.info('Voliation Comment is required');
    return;
   } 
   if(this.allFreelancerUsersList != null){
    if(this.startdate == null){
      this.alertService.info('Start Date is required');
      return;
    }
    if(this.fuFullName == null){
      this.alertService.info('Select Assignee is required');
      return;
    }
  }
    this.confirmationDialogService.confirm('Please confirm', 'Do you want to voliation get resolved for the JobId#' + jobId + ' ?', 'Ok', 'Cancel')
      .then((confirmed) => {
        if (confirmed) {
          this.spinnerService.show();
          if (this.resolvedvoliationreason) {
            this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
              objfreelanceservice.isfreelancerjobattendant = true;
              objfreelanceservice.resolvedvoliationreason = this.resolvedvoliationreason;
              if(this.startdate != null){
              this.freelanceSvc.saveOrUpdateFreeLanceOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
                if (updatedobjfreelanceservice.jobId > 0) {
                  updatedobjfreelanceservice.jobId  = null;
                  updatedobjfreelanceservice.isjobaccepted = true;
                  updatedobjfreelanceservice.isjobactive = true;
                  updatedobjfreelanceservice.jobstartedon = this.startdate.toString();
                  updatedobjfreelanceservice.jobendedon = this.enddatevalue.toString();
                  updatedobjfreelanceservice.jobaccepteddate = this.indiaTimeFormat.toString();
                  this.freelanceserviceService.saveFreelancerOnService(updatedobjfreelanceservice).subscribe((obj: any) => {
                    if (obj.jobId > 0) {
                      this.spinnerService.hide();
                      this.spinnerService.hide();
                      this.dashboardSummaryOfSkilledWorkerSearchService();
                      this.alertService.success('The Job Id : ' + obj.jobId + ' is created successfully. Go to New Job Tab to activate. ');
                    }
                  },
                    error => {
                      this.spinnerService.hide();
                      this.alertService.error(error);
                    });
                }
              },
                error => {
                  this.spinnerService.hide();
                  this.alertService.error(error);
                });
              } else {
                  this.alertService.success('The voliation is resolved for the the Job Id:' +jobId + '.');
                }
            },
              error => {
                this.spinnerService.hide();
                this.alertService.error(error);
              })
          }
        }
      });
  }

  getAllAvailableFUSkills() {
    this.listofAllFUSkills = [];
    this.referService.getReferenceLookupByKey(config.key_domain.toString()).pipe(map((data: any[]) =>
      data.map(item => this.refAdapter.adapt(item))),
    ).subscribe(
      data => {
        data.forEach(elementcategory => {
          if (elementcategory.code !== 'SE_P') {
            elementcategory.referencelookupmapping.forEach(elementlookupmapping => {
              elementlookupmapping.referencelookupmappingsubcategories.forEach(element => {
                this.listofAllFUSkills.push(element);
              });
            })
          }
        })
      });
  }
  buildnewjobforvoliation(hours: number, index: number , subcat: string){
    this.allFreelancerUsersList = [];
    this.iscreatejobflag = true;
    this.minstartDate.setTime(this.minstartDate.getTime() + (24 * 60 * 60 * 1000));
    this.maxstartDate.setTime(this.maxstartDate.getTime() + (144 * 60 * 60 * 1000));
    this.totalhoursofjob = hours;
    this.volationindex = index;
    this.userService.getUsersByRole(config.user_rolecode_fu).subscribe((userList: any) => {
      if (userList != null) {
        userList.forEach(element => {
          if (element.isactive && element.freeLanceDetails.bgcurrentstatus == config.bg_code_approved && 
            element.freeLanceDetails.subCategory == subcat.toString()) {
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
  buildendateforvoliationcreatenewjob(event: any ){
    var selectstdate = event.value;
    this.iscreatejobflag = true;
    var totalhours = (this.totalhoursofjob + this.bufferhours);
    var jobEndDate = new Date();
    jobEndDate.setTime(selectstdate.getTime() + (totalhours * 60 * 60 * 1000));
    var dd = jobEndDate.getDate();
    var mm = jobEndDate.getMonth() + 1;
    var y = jobEndDate.getFullYear();
    var hr = jobEndDate.getHours();
    var min = jobEndDate.getMinutes();
    var month = mm > 10 ? mm : '0' + mm;
    var day = dd > 10 ? dd : '0' + dd;
    var mins = min > 10 ? min : '0' + min;
    var addedhourstodate = y + '-' + month + '-' + day + ' ' + hr + ':' + mins;
    this.enddatevalue = addedhourstodate;
    this.startdate = this.setDefaultTimeForStartDate(selectstdate);
  }

  private setDefaultTimeForStartDate(st: Date) {
    st.setDate(st.getDate());
    var dd = st.getDate();
    var mm = st.getMonth() + 1;
    var y = st.getFullYear();
    var startDtFmt = mm + '/' + dd + '/' + y + ' 10:00';
    st = new Date(startDtFmt);
    return st;
  }
   
  /****
   * Summary  - All Services
   */

  getAllNewServiceDetails(){
    this.onlistofallactivenewservices = [];
    this.servicetableenabled = false;
    this.totalearningonservice = 0;
    this.totalearningallservices = 0;
    this.newService.getAllNewServiceDetails().subscribe((allnewservices: any) => {
      if (allnewservices != null) {
        this.onlistofallactivenewservices = allnewservices;
      }},
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  getServicesDetailsByServiceId(event : Event) {
    this.listofallnotpaidservices = [];
    this.listofallpaidservices = [];
    this.totalearningonservice = 0;
    this.totalearningallservices = 0;
    this.ispurchasedserviceempty = false;
    this.isnotpurchasedserviceempty = false;

    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    let selectElementText = selectedOptions[selectedIndex].text;
    let selectElementCode = selectedOptions[selectedIndex].value;
    this.usersrvdetailsService.getAllUserServiceDetailsView().subscribe((allservices: any) => {
      if (allservices != null) {
        allservices.forEach(element => {
          if(selectElementCode == element.ourserviceId){
            if (element.isservicepurchased) {
              this.listofallpaidservices.push(element);
              this.totalearningonservice = element.amount + this.totalearningonservice;
            }
            if (!element.isservicepurchased) {
              this.listofallnotpaidservices.push(element);
            }
        }
        if (element.isservicepurchased) {
          this.totalearningallservices = element.amount + this.totalearningallservices;
        }
        });
        this.servicetableenabled = true;
        setTimeout(() => {
          if(this.listofallpaidservices.length == 0){
            this.ispurchasedserviceempty = true;
          }
          if(this.listofallnotpaidservices.length == 0){
            this.isnotpurchasedserviceempty = true;
          }
        }, 500);
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      }
    );
  }

  openViewJobDetailsModal(jobNo: number) {
    const initialState = {
      jobId: jobNo,
    };
    this.modalRef = this.modalService.show(ViewjobbyjobidPopupComponent, Object.assign(
      {},
      this.config,
      {
        initialState
      }
    ));
  }
}
