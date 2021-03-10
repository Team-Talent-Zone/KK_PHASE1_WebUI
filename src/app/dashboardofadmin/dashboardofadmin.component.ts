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
import { FormBuilder } from '@angular/forms';
import { ReferenceAdapter } from '../adapters/referenceadapter';
import { map } from 'rxjs/operators';
import { UsersrvdetailsService } from '../AppRestCall/userservice/usersrvdetails.service';
import { NewsvcService } from '../AppRestCall/newsvc/newsvc.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ViewjobbyjobidPopupComponent } from '../viewjobbyjobid-popup/viewjobbyjobid-popup.component';
import { DbviewsService } from '../AppRestCall/dbviews/dbviews.service';
import { ChartOptions, ChartType } from 'chart.js';
import { Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, SingleDataSet } from 'ng2-charts';
import { CommonUtility } from '../adapters/commonutility';
import { ConfigMsg } from '../appconstants/configmsg';


@Component({
  selector: 'app-dashboardofadmin',
  templateUrl: './dashboardofadmin.component.html',
  styleUrls: ['./dashboardofadmin.component.css']
})
export class DashboardofadminComponent implements OnInit {

  todaysvoliationList: any = [];
  totalvoliationResolvedList: any = []
  todaysjobscheduledList: any = [];
  upcomingjobscheduledList: any = [];
  newjobsbutnotactiviatedList: any = [];
  newjobsactiviatedbutnotacceptedList: any = [];
  jobscompletedList: any = [];
  skilledworkerjustacceptedList: any = [];
  jobscompletedwithoutpaymentList: any = [];
  jobscompletedpayoutpendingList: any = [];
  startdateInputDate: Date;
  startdate: string;


  listofallvoliationscount: any = [];
  listofallvoliationsskilledworkername: any = [];
  tempplacejobIdholder: number;
  voliationcount: number = 0

  minstartDate = new Date();
  maxstartDate = new Date();
  newendjobdate: string;
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
  bufferhours: number = 0;
  onworkfreelancelistsbysubcategory: any;
  onnotworkfreelancelistsbysubcategory: any;
  isshowswithjobbycategory: boolean = false;
  isshowswithnojobbycategory: boolean = false;
  isshownofreelancerinsystem: boolean = false;
  enddatevalue: string;
  resolvedvoliationreason: string;
  modalRef: BsModalRef;

  /**
   * Chart Data Identifiers 
   */
  listofallratingcountgraphdata: any = [];
  listofallratingnamegraphdata: any = [];
  listofalluserservicenotpaidcountgraphdata: SingleDataSet = [];
  listofalluserservicenotpaidnamegraphdata: Label[] = [];

  listofalluserservicepaidcountgraphdata: SingleDataSet = [];
  listofalluserservicepaidnamegraphdata: Label[] = [];

  listofallinjobsbyskillcountgraphdata: SingleDataSet = [];
  listofallinjobsbyskillgraphdata: any = [];

  listofallnojobsbyskillgraphdata: Label[] = [];
  listofallnojobsbyskillcountgraphdata: any = []

  listofallvoliationcountgraphdata: any = [];
  listofallvoliationamegraphdata: any = [];

  listofallcompanyprofitcountgraphdata: SingleDataSet = [];
  listofallcompanyskillnamegraphdata: Label[] = [];
  totalprofilebyskill: number = 0;

  /*All - Service related varaible*/
  listofallpaidservices: any;
  listofallnotpaidservices: any;
  onlistofallactivenewservices: any;
  servicetableenabled: boolean = false;
  totalearningonservice: number = 0;
  totalearningallservices: number = 0;
  ispurchasedserviceempty: boolean = false;
  isnotpurchasedserviceempty: boolean = false;
  selectElementTextForService: string;


  constructor(
    private freelanceserviceService: FreelanceserviceService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    public datepipe: DatePipe,
    public manageruser: ManageuserComponent,
    public userService: UserService,
    public confirmationDialogService: ConfirmationDialogService,
    private freelanceSvc: FreelanceOnSvcService,
    private refAdapter: ReferenceAdapter,
    private referService: ReferenceService,
    private usersrvdetailsService: UsersrvdetailsService,
    private newService: NewsvcService,
    private modalService: BsModalService,
    public dbviewServic: DbviewsService,
    public commonlogic: CommonUtility
  ) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit() {
    this.dashboardSummaryOfSkilledWorkerSearchService();
    this.getAllAvailableFUSkills();
    this.getAllNewServiceDetails();
    this.getTotalEarningsFromServices();
    /**
     * The below methods are to load chart or graph.
     */
    this.getGraphFURatingData();
    this.getGraphUserServiceData();
    this.getGraphJobsData();
    this.getGraphSKVoliationData();
    this.getGraphSkillBasedData();
  }

  dashboardSummaryOfSkilledWorkerSearchService() {
    this.reset();
    this.todaysvoliationList = [];
    this.totalvoliationResolvedList = []
    this.todaysjobscheduledList = [];
    this.upcomingjobscheduledList = [];
    this.skilledworkerjustacceptedList = [];
    this.newjobsbutnotactiviatedList = [];
    this.newjobsactiviatedbutnotacceptedList = [];
    this.jobscompletedList = [];
    this.jobscompletedwithoutpaymentList = [];
    this.jobscompletedpayoutpendingList = [];
    this.totalmoneyearnedbycompanytilltoday = 0;
    this.totalmoneyearnedbyskilledworkerstilltoday = 0;
    this.totalmoneyyettopaybytheclientstilltoday = 0;
    this.totalcompletedjobswithoutpaymentbyclient = 0;
    this.listofallvoliationscount = [];
    this.listofallvoliationsskilledworkername = [];
    this.tempplacejobIdholder = 0;

    this.freelanceserviceService.getUserAllJobDetails().subscribe((jobdetailsList: any) => {
      if (jobdetailsList != null) {
        jobdetailsList.forEach(element => {
          if (element.isjobvoliation && element.cbajobattendantdate == null &&
            !element.isfreelancerjobattendant && element.isjobactive) {
            this.todaysvoliationList.push(element);
          }
          if (element.isjobvoliation && element.isfreelancerjobattendant) {
            this.totalvoliationResolvedList.push(element);
          }
          if (element.isjobactive && element.isjobaccepted && element.jobacceptdecisionflag && this.getDate(element.jobstartedon) == this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "dd/MM/yyyy hh:mm:ss").toString()
            && element.jobaccepteddate != null) {
            this.todaysjobscheduledList.push(element);
          }
          if (element.isjobactive && element.isjobaccepted && element.jobacceptdecisionflag && this.getDate(element.jobstartedon) > this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "dd/MM/yyyy hh:mm:ss").toString() && element.jobaccepteddate != null && !element.deactivefromupcomingjob) {
            this.upcomingjobscheduledList.push(element);
          }
          if (element.isjobactive && element.isjobaccepted && this.getDate(element.jobstartedon) > this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "dd/MM/yyyy hh:mm:ss").toString() && element.jobaccepteddate != null
            && !element.deactivefromupcomingjob && !element.jobacceptdecisionflag) {
            this.skilledworkerjustacceptedList.push(element);
          }
          if (!element.isjobactive && !element.isjobvoliation && !element.deactivefromnewjobs) {
            this.newjobsbutnotactiviatedList.push(element);
          }
          if (element.isjobactive && !element.isjobaccepted && !element.isjobvoliation && element.jobaccepteddate == null && element.freelanceuserId == null) {
            this.newjobsactiviatedbutnotacceptedList.push(element);
          }
          if (element.isjobactive && element.isjobcompleted && element.isjobamtpaidtocompany && element.isjobamtpaidtofu && element.jobaccepteddate != null) {
            this.jobscompletedList.push(element);
            this.totalmoneyearnedbycompanytilltoday = Number.parseFloat(element.tocompanyamount) + this.totalmoneyearnedbycompanytilltoday;
            this.totalmoneyearnedbyskilledworkerstilltoday = Number.parseFloat(element.tofreelanceamount) + this.totalmoneyearnedbyskilledworkerstilltoday;
          }
          if (element.isjobactive && element.isjobcompleted && !element.isjobamtpaidtocompany && !element.isjobamtpaidtofu && element.jobaccepteddate != null) {
            this.jobscompletedwithoutpaymentList.push(element);
            this.totalcompletedjobswithoutpaymentbyclient = Number.parseFloat(element.amount) + this.totalcompletedjobswithoutpaymentbyclient;
          }
          if (element.isjobactive && element.isjobcompleted && element.isjobamtpaidtocompany && !element.isjobamtpaidtofu && element.jobaccepteddate != null) {
            this.jobscompletedpayoutpendingList.push(element);
          }
        });
        this.spinnerService.hide();
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
    let selectElementCode = selectedOptions[selectedIndex].value;
    this.isshowswithjobbycategory = false;
    this.isshowswithnojobbycategory = false;
    this.isshownofreelancerinsystem = false;
    if (selectElementCode.length > 0) {
      this.freelanceserviceService.getUserAllJobDetailsBySubCategory(selectElementCode).subscribe((freelanceserviceList: any) => {
        if (freelanceserviceList != null) {
          freelanceserviceList.forEach(element => {
            if (element.isjobactive && !element.isjobvoliation && element.jobaccepteddate != null) {
              this.onworkfreelancelistsbysubcategory.push(element);
            }
          });
          setTimeout(() => {
            if (this.onworkfreelancelistsbysubcategory.length > 0) {
              this.isshowswithjobbycategory = true;
            }
            this.userService.getUsersByRole(config.user_rolecode_fu).subscribe((userList: any) => {
              if (userList != null) {
                if (this.onworkfreelancelistsbysubcategory.length > 0) {
                  userList.forEach(element => {
                    var isexist = this.onworkfreelancelistsbysubcategory.filter(e => e.freelanceuserId === element.userId);
                    if (isexist.length == 0 && element.isactive &&
                      element.freeLanceDetails.bgcurrentstatus == config.bg_code_approved &&
                      selectElementCode.toString() == element.freeLanceDetails.subCategory.toString()) {
                      this.onnotworkfreelancelistsbysubcategory.push(element);
                      this.isshowswithnojobbycategory = true;
                    }
                  });
                } else {
                  userList.forEach(element => {
                    if (element.isactive &&
                      element.freeLanceDetails.bgcurrentstatus == config.bg_code_approved &&
                      selectElementCode == element.freeLanceDetails.subCategory) {
                      this.onnotworkfreelancelistsbysubcategory.push(element);
                      this.isshowswithnojobbycategory = true;
                    }
                  })
                }
              }
              if (this.onnotworkfreelancelistsbysubcategory.length == 0 && this.onworkfreelancelistsbysubcategory == 0) {
                this.isshownofreelancerinsystem = true;
              }
            },
              error => {
                this.spinnerService.hide();
                this.alertService.error(error);
              });
          }, 800);
        }
      }, error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
    }
  }

  reassign(jobId: number) {
    this.confirmationDialogService.confirm(ConfigMsg.confirmation_header_msg, ConfigMsg.confirmation_msg_1 + jobId + ' to ' + this.fuFullName + ConfigMsg.confirmation_questionmark, ConfigMsg.confirmation_button_assign, ConfigMsg.confirmation_button_cancel)
      .then((confirmed) => {
        if (confirmed) {
          if (this.fuUserId > 0 && this.fuFullName != null) {
            this.spinnerService.show();
            this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
              if (!objfreelanceservice.isjobaccepted) {
                objfreelanceservice.freelanceuserId = this.fuUserId;
                objfreelanceservice.isjobaccepted = true;
                objfreelanceservice.jobaccepteddate = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-MM-dd HH:mm:ss");
                this.freelanceSvc.saveOrUpdateFreeLanceOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
                  if (updatedobjfreelanceservice.jobId > 0) {
                    this.alertService.success(ConfigMsg.job_assign_msg_1 + jobId + ConfigMsg.job_assign_msg_2 + this.fuFullName + ' on ' + this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "dd/MM/yyyy hh:mm:ss").toString());
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

  triggervoliationwork(jobId: number, index: number) {
    this.iscreatejobflag = false;
    this.allFreelancerUsersList = null;
    this.enddatevalue = null;
    this.startdate = null;
    this.fuFullName = null;
    this.fuUserId = null;
    this.resolvedvoliationreason = null;
    this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
      objfreelanceservice.associatedadminId = this.userService.currentUserValue.userId;
      this.freelanceSvc.saveOrUpdateFreeLanceOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
        if (updatedobjfreelanceservice.jobId > 0) {
          this.alertService.success(ConfigMsg.job_assign_msg_1 + jobId + ConfigMsg.trigger_voliation_msg_1);
          this.spinnerService.hide();
          this.dashboardSummaryOfSkilledWorkerSearchService();
          this.volationindex = index;
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

  reset() {
    this.volationindex = -1;
    this.iscreatejobflag = false;
    this.allFreelancerUsersList = null;
    this.enddatevalue = null;
    this.startdate = null;
    this.fuFullName = null;
    this.fuUserId = null;
    this.resolvedvoliationreason = null;
  }
  getHours(dt: Date) {
    var date = new Date(dt);
    return date.getHours();
  }
  savevoliationResolvedReason(jobId: number) {
    if (this.getHours(new Date(this.startdate)) >= 17 || this.getHours(new Date(this.startdate)) < 10) {
      this.alertService.info(ConfigMsg.job_startdate_msg);
      return;
    }
    if (this.resolvedvoliationreason == null) {
      this.alertService.info(ConfigMsg.voliation_resolve_required_msg_1);
      return;
    }
    if (this.allFreelancerUsersList != null) {
      if (this.startdate == null) {
        this.alertService.info(ConfigMsg.voliation_resolve_required_msg_2);
        return;
      }
      if (this.fuFullName == null) {
        this.alertService.info(ConfigMsg.voliation_resolve_required_msg_3);
        return;
      }
    }
    this.confirmationDialogService.confirm(ConfigMsg.confirmation_header_msg, ConfigMsg.confirmation_msg_2 + jobId + ConfigMsg.confirmation_questionmark, ConfigMsg.confirmation_button_ok, ConfigMsg.confirmation_button_cancel)
      .then((confirmed) => {
        if (confirmed) {
          this.spinnerService.show();
          if (this.resolvedvoliationreason) {
            this.freelanceSvc.getUserAllJobDetailsByJobId(jobId).subscribe((viewdata: any) => {
              this.freelanceSvc.getAllFreelanceOnServiceDetailsByJobId(jobId).subscribe((objfreelanceservice: FreelanceOnSvc) => {
                objfreelanceservice.isfreelancerjobattendant = true;
                objfreelanceservice.resolvedvoliationreason = this.resolvedvoliationreason;
                objfreelanceservice.isjobactive = false;
                this.freelanceSvc.saveOrUpdateFreeLanceOnService(objfreelanceservice).subscribe((updatedobjfreelanceservice: FreelanceOnSvc) => {
                  if (this.startdate != null) {
                    if (updatedobjfreelanceservice.jobId > 0) {
                      updatedobjfreelanceservice.jobId = null;
                      updatedobjfreelanceservice.isfreelancerjobattendant = false;
                      updatedobjfreelanceservice.isjobvoliation = false;
                      updatedobjfreelanceservice.jobstartedon = this.commonlogic.setEndDateFormat(new Date(this.startdate));
                      updatedobjfreelanceservice.jobendedon = this.enddatevalue.toString();
                      updatedobjfreelanceservice.freelanceuserId = this.fuUserId;
                      updatedobjfreelanceservice.jobaccepteddate = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-MM-dd HH:mm:ss").toString();
                      updatedobjfreelanceservice.associatedadminId = null;
                      updatedobjfreelanceservice.isjobactive = true;
                      updatedobjfreelanceservice.isjobaccepted = true;
                      updatedobjfreelanceservice.tofreelanceamount = viewdata.tofreelanceamount;
                      updatedobjfreelanceservice.tocompanyamount = viewdata.tocompanyamount;
                      this.freelanceserviceService.saveFreelancerOnService(updatedobjfreelanceservice).subscribe((obj: any) => {
                        if (obj.jobId > 0) {
                          this.spinnerService.hide();
                          this.alertService.success(ConfigMsg.resolved_voliation_msg_1 + obj.jobId + ConfigMsg.resolved_voliation_msg_2 + this.fuFullName);
                          this.dashboardSummaryOfSkilledWorkerSearchService();
                        }
                      },
                        error => {
                          this.spinnerService.hide();
                          this.alertService.error(error);
                        });
                    }
                  } else {
                    this.spinnerService.hide();
                    this.alertService.success(ConfigMsg.resolved_voliation_msg_3 + jobId);
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
            },
              error => {
                this.spinnerService.hide();
                this.alertService.error(error);
              });
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
          if (elementcategory.code !== config.domain_code_SE_P) {
            elementcategory.referencelookupmapping.forEach(elementlookupmapping => {
              elementlookupmapping.referencelookupmappingsubcategories.forEach(element => {
                this.listofAllFUSkills.push(element);
                this.listofAllFUSkills.sort((a, b) => (a.orderid > b.orderid ? 1 : -1));
              });
            })
          }
        })
      });
  }
  buildnewjobforvoliation(hours: number, index: number, subcat: string) {
    this.allFreelancerUsersList = [];
    this.iscreatejobflag = true;
    this.minstartDate = this.setDefaultTimeForStartDate(new Date(this.minstartDate.getTime() + (12 * 60 * 60 * 1000)));
    this.maxstartDate = this.setDefaultTimeForEndDate(new Date(this.maxstartDate.getTime() + (240 * 60 * 60 * 1000)));
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

  setDefaultTimeForStartDate(st: Date) {
    st.setDate(st.getDate());
    var dd = st.getDate();
    var mm = st.getMonth();
    var y = st.getFullYear();
    return new Date(y, mm, dd, 10, 0);
  }

  setDefaultTimeForEndDate(st: Date) {
    st.setDate(st.getDate());
    var dd = st.getDate();
    var mm = st.getMonth();
    var y = st.getFullYear();
    return new Date(y, mm, dd, 17, 30);
  }

  buildendateforvoliationcreatenewjob(event: any) {
    var selectstdate = event.value;
    this.iscreatejobflag = true;
    var totalhours = (this.totalhoursofjob + this.bufferhours);
    this.enddatevalue = this.commonlogic.buildEndDateOfJob(totalhours, new Date(selectstdate));;
    this.startdate = selectstdate;
  }


  /****
   * Summary  - All Services
   */

  getAllNewServiceDetails() {
    this.onlistofallactivenewservices = [];
    this.servicetableenabled = false;
    this.totalearningonservice = 0;
    this.totalearningallservices = 0;
    this.newService.getAllNewServiceDetails().subscribe((allnewservices: any) => {
      if (allnewservices != null) {
        this.onlistofallactivenewservices = allnewservices;
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  getTotalEarningsFromServices() {
    this.totalearningallservices = 0;

    this.usersrvdetailsService.getAllUserServiceDetailsView().subscribe((allservices: any) => {
      if (allservices != null) {
        allservices.forEach(element => {
          if (element.isservicepurchased) {
            this.totalearningallservices = element.amount + this.totalearningallservices;
          }
        });
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      }
    );
  }

  getServicesDetailsByServiceId(event: Event) {
    this.selectElementTextForService = null;
    this.listofallnotpaidservices = [];
    this.listofallpaidservices = [];
    this.totalearningonservice = 0;
    this.ispurchasedserviceempty = false;
    this.isnotpurchasedserviceempty = false;

    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    this.selectElementTextForService = selectedOptions[selectedIndex].text;
    let selectElementCode = selectedOptions[selectedIndex].value;
    this.usersrvdetailsService.getAllUserServiceDetailsView().subscribe((allservices: any) => {
      if (allservices != null) {
        allservices.forEach(element => {
          if (selectElementCode == element.ourserviceId) {
            if (element.isservicepurchased) {
              this.listofallpaidservices.push(element);
              this.totalearningonservice = element.amount + this.totalearningonservice;
            }
            if (!element.isservicepurchased) {
              this.listofallnotpaidservices.push(element);
            }
          }
        });
        this.servicetableenabled = true;
        setTimeout(() => {
          if (this.listofallpaidservices.length == 0) {
            this.ispurchasedserviceempty = true;
          }
          if (this.listofallnotpaidservices.length == 0) {
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
      this.commonlogic.configlg,
      {
        initialState
      }
    ));
  }

  /***
   * Chart Functionality
   */
  getGraphFURatingData() {
    this.dbviewServic.getGraphFURatingData().subscribe((furatingList: any) => {
      if (furatingList != null) {
        furatingList.forEach(element => {
          this.listofallratingcountgraphdata.push(element.starrate);
          this.listofallratingnamegraphdata.push(element.fullname)
        });
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }
  public pieChartData: SingleDataSet = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  public pieChartDataSrvPaid: SingleDataSet = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  getGraphUserServiceData() {
    this.dbviewServic.getGraphUserServiceData().subscribe((servicesList: any) => {
      if (servicesList != null) {
        servicesList.forEach(element => {
          if (element.type == config.keynotpurchased) {
            this.listofalluserservicenotpaidcountgraphdata.push(Number.parseInt(element.count));
            this.listofalluserservicenotpaidnamegraphdata.push(element.name);
          }
          if (element.type == config.keypurchased) {
            this.listofalluserservicepaidcountgraphdata.push(Number.parseInt(element.count));
            this.listofalluserservicepaidnamegraphdata.push(element.name);
          }
        });
        this.pieChartData = this.listofalluserservicenotpaidcountgraphdata;
        this.pieChartDataSrvPaid = this.listofalluserservicepaidcountgraphdata;
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }
  public pieChartDataAtNoWork: SingleDataSet = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  public pieChartDataAtWork: SingleDataSet = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  getGraphJobsData() {
    this.dbviewServic.getGraphJobsData().subscribe((jobList: any) => {
      if (jobList != null) {
        jobList.forEach(element => {
          if (element.type == config.keyinjobs) {
            this.listofallinjobsbyskillcountgraphdata.push(Number.parseInt(element.count));
            this.listofallinjobsbyskillgraphdata.push(element.skill);
          }
          if (element.type == config.keynojobs) {
            this.listofallnojobsbyskillcountgraphdata.push(Number.parseInt(element.count));
            this.listofallnojobsbyskillgraphdata.push(element.skill);
          }
        });
        this.pieChartDataAtNoWork = this.listofallnojobsbyskillcountgraphdata;
        this.pieChartDataAtWork = this.listofallinjobsbyskillcountgraphdata;
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }
  getGraphSKVoliationData() {
    this.dbviewServic.getGraphSKVoliationData().subscribe((voliationList: any) => {
      if (voliationList != null) {
        voliationList.forEach(element => {
          this.listofallvoliationcountgraphdata.push(Number.parseInt(element.voliationcount));
          this.listofallvoliationamegraphdata.push(element.fullname);
        });
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }
  public pieChartDataAtWGraphSkillBased: SingleDataSet = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  getGraphSkillBasedData() {
    this.dbviewServic.getGraphSkillBasedData().subscribe((proofilebyskill: any) => {
      if (proofilebyskill != null) {
        proofilebyskill.forEach(element => {
          this.listofallcompanyprofitcountgraphdata.push(Number.parseInt(element.totalcompanyamount));
          this.listofallcompanyskillnamegraphdata.push(element.subcategorylabel);
          this.totalprofilebyskill = this.totalprofilebyskill + element.totalcompanyamount;
        });
      }
      this.pieChartDataAtWGraphSkillBased = this.listofallcompanyprofitcountgraphdata;
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }


  /**
   *  Prepared for getGraphFURatingData
   */
  public lineChartData: Array<number> = this.listofallratingcountgraphdata;
  public lineChartLabels: Array<any> = this.listofallratingnamegraphdata;

  public SystemName: string = ConfigMsg.overallrating;
  firstCopy = false;

  public labelMFL: Array<any> = [
    {
      data: this.lineChartData,
      label: this.SystemName
    }
  ];

  public lineChartOptions: any = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          max: 5,
          min: 0,
        }
      }],
      xAxes: [{


      }],
    },
    plugins: {
      datalabels: {
        display: true,
        align: 'top',
        anchor: 'end',
        //color: "#2756B3",
        color: "#222",

        font: {
          family: 'FontAwesome',
          size: 14
        },

      },
      deferred: false

    },

  };

  _lineChartColors: Array<any> = [{
    backgroundColor: 'red',
    borderColor: 'red',
    pointBackgroundColor: 'red',
    pointBorderColor: 'red',
    pointHoverBackgroundColor: 'red',
    pointHoverBorderColor: 'red'
  }];
  public ChartType = 'bar';

  /*
    Below Chart to prepare getGraphUserServiceData
   */
  // Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = this.listofalluserservicenotpaidnamegraphdata;
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  public pieChartOptionsSrvPaid: ChartOptions = {
    responsive: true,
  };
  public pieChartLabelsSrvPaid: Label[] = this.listofalluserservicepaidnamegraphdata;
  public pieChartTypeSrvPaid: ChartType = 'pie';
  public pieChartLegendSrvPaid = true;
  public pieChartPluginsSrvPaid = [];

  /*
    Below Chart to prepare getGraphJobsData
   */

  // Pie skilled enagaged at work 
  public pieChartOptionsAtWork: ChartOptions = {
    responsive: true,
  };
  public pieChartLabelsAtWork: Label[] = this.listofallinjobsbyskillgraphdata;
  public pieChartTypeAtWork: ChartType = 'pie';
  public pieChartLegendAtWork = true;
  public pieChartPluginsAtWork = [];


  // Pie skilled notenagaged at work 
  public pieChartOptionsAtNoWork: ChartOptions = {
    responsive: true,
  };
  public pieChartLabelsAtNoWork: Label[] = this.listofallnojobsbyskillgraphdata;
  public pieChartTypeAtNoWork: ChartType = 'pie';
  public pieChartLegendAtNoWork = true;
  public pieChartPluginsAtNoWork = [];


  /**
*  Prepared for getGraphSKVoliationData
*/
  public lineChartDataVoliationData: Array<number> = this.listofallvoliationcountgraphdata;
  public lineChartLabelsVoliationData: Array<any> = this.listofallvoliationamegraphdata;

  public SystemNames: string = ConfigMsg.voliationcount;
  firstCopyVoliationData = false;

  public labelMFLVoliationData: Array<any> = [
    {
      data: this.lineChartDataVoliationData,
      label: this.SystemNames
    }
  ];

  public lineChartOptionsVoliationData: any = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          max: 5,
          min: 0,
        }
      }],
      xAxes: [{


      }],
    },
    plugins: {
      datalabels: {
        display: true,
        align: 'top',
        anchor: 'end',
        //color: "#2756B3",
        color: "#222",

        font: {
          family: 'FontAwesome',
          size: 14
        },

      },
      deferred: false
    },
  };

  public ChartTypeVoliationData = 'bar';

  /*Below Chart to prepare getGraphJobsData
   */

  // Pie skilled enagaged at work 
  public pieChartOptionsGraphSkillBased: ChartOptions = {
    responsive: true,
  };
  public pieChartLabelsGraphSkillBased: Label[] = this.listofallcompanyskillnamegraphdata;
  public pieChartTypeAtGraphSkillBased: ChartType = 'pie';
  public pieChartLegendAtGraphSkillBased = true;
  public pieChartPluginsAtGraphSkillBased = [];

}
