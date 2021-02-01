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
  voliationResolvedForm: FormGroup;
  issubmit = false;

  onworkfreelancelistsbysubcategory: any;
  onnotworkfreelancelistsbysubcategory: any;
  isshowswithjobbycategory : boolean = false;
  isshowswithnojobbycategory : boolean = false;
  isshownofreelancerinsystem : boolean = false;

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
  ) { }

  ngOnInit() {
    const sourcerefresh = timer(1000, 90000);
   // sourcerefresh.subscribe((val: number) => {
      this.formValidations();
      this.dashboardSummaryOfSkilledWorkerSearchService();
      this.getAllAvailableFUSkills();
     
    //});
    this.getAllNewServiceDetails();
  }

  formValidations() {
    this.voliationResolvedForm = this.formBuilder.group({
      resolvedvoliationreason: ['', [Validators.required]],
    });
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

  get f() {
    return this.voliationResolvedForm.controls;
  }

  savevoliationResolvedReason(jobId: number) {
    this.issubmit = true;
    if (this.voliationResolvedForm.invalid) {
      return;
    }
    this.confirmationDialogService.confirm('Please confirm', 'Do you want to voliation get resolved for the JobId#' + jobId + ' ?', 'Ok', 'Cancel')
      .then((confirmed) => {
        if (confirmed) {
          this.spinnerService.show();
          if (this.voliationResolvedForm.get('resolvedvoliationreason').value != null) {
            this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
              objfreelanceservice.isfreelancerjobattendant = true;
              objfreelanceservice.resolvedvoliationreason = this.voliationResolvedForm.get('resolvedvoliationreason').value;
              this.freelanceSvc.saveOrUpdateFreeLanceOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
                if (updatedobjfreelanceservice.jobId > 0) {
                  this.alertService.success('Voliation is resolved for the  JobId# ' + jobId + ' on ' + this.indiaTime.toString());
                  this.spinnerService.hide();
                  this.dashboardSummaryOfSkilledWorkerSearchService();
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
        console.log('listofallpaidservices' ,this.listofallpaidservices);
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      }
    );
  }

}
