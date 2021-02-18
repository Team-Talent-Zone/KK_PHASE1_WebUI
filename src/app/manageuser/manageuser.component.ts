import { ProcessbgverificationComponent } from './../processbgverification/processbgverification.component';
import { ViewaccountdetailsComponent } from './../viewaccountdetails/viewaccountdetails.component';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../AppRestCall/user/user.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { UserAdapter } from '../adapters/useradapter';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { User } from '../appmodels/User';
import { first } from 'rxjs/operators';
import { ReferenceService } from '../AppRestCall/reference/reference.service';
import { config } from 'src/app/appconstants/config';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Toaster, ToastType } from 'ngx-toast-notifications';
import { timer } from 'rxjs';


@Component({
  selector: 'app-manageuser',
  templateUrl: './manageuser.component.html',
  styleUrls: ['./manageuser.component.css']
})
export class ManageuserComponent implements OnInit {

  usrObjCBAs: any = [];
  usrObjFUs: any = [];
  usrObjTotalUsers: any = [];
  usrObjPlatformAdmins: any = [];
  usrObjMyWork: any = [];
  usrObj: any = [];
  usrobjById: User;
  refDataObj: any = [];
  modalRef: BsModalRef;
  config: ModalOptions = { class: 'modal-lg' };
  mapusrObj: User[];
  private types: Array<ToastType> = ['success', 'danger', 'warning', 'info', 'primary', 'secondary', 'dark', 'light'];

  constructor(
    private modalService: BsModalService,
    public userService: UserService,
    private spinnerService: Ng4LoadingSpinnerService,
    private userAdapter: UserAdapter,
    private alertService: AlertsService,
    private referService: ReferenceService,
    private toaster: Toaster,
  ) { }

  ngOnInit() {
    this.getAllUser();
    const source = timer(1000, 90000);
    source.subscribe((val: number) => {
      //   this.getlistOfNewUsersToastNofications();
    });
  }
  getReferenceDataByKey(key: string) {
    this.referService.getReferenceLookupByKey(key).subscribe(
      (refdata: any) => {
        this.refDataObj = refdata;
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }
  getAllUser() {
    this.usrObjCBAs = [];
    this.usrObjFUs = [];
    this.usrObjTotalUsers = [];
    this.usrObjPlatformAdmins = [];
    this.usrObjMyWork = [];
    this.usrObj = [];

    this.getReferenceDataByKey(config.key_bgstatus.toString());
    this.spinnerService.show();
    this.userService.getAllUsers().subscribe(
      (usrObjRsp: any) => {
        if (usrObjRsp != null) {
          usrObjRsp.forEach((element: any) => {
            if (element.userroles.rolecode !== config.user_rolecode_basicauth.toString() &&
              element.userroles.rolecode !== config.user_rolecode_directors.toString()) {
              this.usrObjTotalUsers.push(element);
            }
          });
          usrObjRsp.forEach((element: any) => {
            this.usrObj = this.userAdapter.adapt(element);
            if (this.usrObj.userroles.rolecode === config.user_rolecode_cba.toString()) {
              this.usrObjCBAs.push(this.usrObj);
            }
            if (this.usrObj.freelancehistoryentity != null && this.usrObj.userroles.rolecode === config.user_rolecode_fu.toString()) {
              this.usrObj.freelancehistoryentity.forEach((elementFhistory: any) => {
                if (elementFhistory.islocked && elementFhistory.decisionbyemailid ===
                  this.userService.currentUserValue.username) {
                  this.usrObj.freelancehistoryentity = elementFhistory;
                  this.usrObjMyWork.push(this.usrObj);
                }
                if (elementFhistory.islocked &&
                  this.usrObj.freeLanceDetails.bgcurrentstatus === elementFhistory.bgstatus
                ) {
                  this.usrObj.freelancehistoryentity = elementFhistory;
                  this.usrObjFUs.push(this.usrObj);
                } else
                  if (!elementFhistory.islocked &&
                    elementFhistory.bgstatus.toString() == config.bg_code_incompleteprofile.toString() ||
                    elementFhistory.bgstatus.toString() == config.bg_code_completedprofile.toString() ||
                    elementFhistory.bgstatus.toString() == config.bg_code_approved.toString() ||
                    elementFhistory.bgstatus.toString() == config.bg_code_rejected.toString()
                  ) {
                    this.usrObj.freelancehistoryentity = elementFhistory;
                    this.usrObjFUs.push(this.usrObj);
                  }
              });
            }
            if (this.usrObj.userroles.rolecode === config.user_rolecode_csct.toString() ||
              this.usrObj.userroles.rolecode === config.user_rolecode_cscm.toString()) {
              this.usrObjPlatformAdmins.push(this.usrObj);
            }
          });
        }
        this.spinnerService.hide();
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      }
    );
  }
  executeBGVerificationCheck(userId: number) {
    this.spinnerService.show();
    this.userService.getUserByUserId(userId).pipe(first()).subscribe(
      (respuser: any) => {
        this.usrobjById = respuser;
        this.usrobjById.freeLanceDetails.isbgstarted = true,
          this.usrobjById.freeLanceDetails.isbgdone = false,
          this.referService.getReferenceLookupByShortKey(config.shortkey_bg_sentocsst.toString()).subscribe(
            (refCode: any) => {
              this.usrobjById.freeLanceDetails.bgcurrentstatus = refCode.toString();
              this.usrobjById.freelancehistoryentity[0].bgstatus = refCode.toString();
              this.usrobjById.freelancehistoryentity[0].decisionby = this.userService.currentUserValue.fullname;
              this.usrobjById.freelancehistoryentity[0].decisionbyemailid = this.userService.currentUserValue.username;
              this.usrobjById.freelancehistoryentity[0].islocked = true;
              this.usrobjById.freelancehistoryentity[0].managerid = this.userService.currentUserValue.usermanagerdetailsentity.managerid;
              this.usrobjById.freelancehistoryentity[0].csstid = this.userService.currentUserValue.userId;
              this.userService.saveorupdate(this.usrobjById).subscribe(
                (userObj: any) => {
                  this.usrObj = this.userAdapter.adapt(userObj);
                  if (this.userService.currentUserValue.userId === this.usrObj.userId) {
                    this.userService.currentUserValue.avtarurl = this.usrObj.avtarurl;
                    this.userService.currentUserValue.firstname = this.usrObj.firstname;
                  }
                  this.usrObjTotalUsers = [];
                  this.usrObjFUs = [];
                  this.usrObjCBAs = [];
                  this.usrObjPlatformAdmins = [];
                  this.usrObjMyWork = [];
                  this.alertService.success(this.usrObj.firstname + ' background verification started');
                  this.spinnerService.hide();
                  this.getAllUser();
                },
                error => {
                  this.spinnerService.hide();
                  this.alertService.error(error);
                });
            },
            error => {
              this.alertService.error(error);
              this.spinnerService.hide();
            });
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  openViewAccountDetailsModalByUserId(userId: number) {
    this.spinnerService.show();
    this.userService.getUserByUserId(userId).pipe(first()).subscribe(
      (respuser: any) => {
        const initialState = { usrdetailsObj: respuser };
        this.modalRef = this.modalService.show(ViewaccountdetailsComponent, Object.assign(
          {},
          this.config,
          {
            initialState
          }
        ));
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }
  openViewAccountDetailsModal(userId: number) {
    this.userService.getUserByUserId(userId).pipe(first()).subscribe((element: any) => {
      const initialState = { usrdetailsObj: element };
      if (element.userId === userId) {
        this.modalRef = this.modalService.show(ViewaccountdetailsComponent, Object.assign(
          {},
          this.config,
          {
            initialState
          }
        ));
      }
    });
  }

  processbgverficiationopenmodal(userId: number) {
    this.usrObjTotalUsers.forEach((element: any) => {
      if (element.userId === userId) {
        this.usrObjMyWork.forEach((myworkusrobj: any) => {
          if (myworkusrobj.userId === userId) {
            const initialState = { usrdetailsObj: element, usrObjMyWork: myworkusrobj };
            this.modalRef = this.modalService.show(ProcessbgverificationComponent, Object.assign(
              {},
              this.config,
              {
                initialState
              }
            )
            );
          }
        });
      }
    });
  }

  getlistOfNewUsersToastNofications() {
    this.usrObjFUs.forEach((element: any) => {
      if (element.freeLanceDetails.isprofilecompleted && !element.freeLanceDetails.isregfeedone) {
        let msg = 'Skilled Worker ' + element.fullname + ' has not registrated yet to the platform';
        this.showToastNotification(msg, this.types[3], 'On Boarding Skilled User');
      }
      if (element.freeLanceDetails.bgcurrentstatus === config.bg_code_approved) {
        let msg = 'Skilled Worker ' + element.fullname + ' the  background check is approved  .';
        this.showToastNotification(msg, this.types[0], 'On Boarding Skilled User');
      }
      if (element.freeLanceDetails.bgcurrentstatus === config.bg_code_rejected) {
        let msg = 'Skilled Worker ' + element.fullname + ' has  background check is  rejected .';
        this.showToastNotification(msg, this.types[1], 'On Boarding Skilled User');
      }
    });
    this.usrObjCBAs.forEach((element: any) => {
      if (element.isactive) {
        let msg = 'New CBA  ' + element.fullname + ' has signedup';
        this.showToastNotification(msg, this.types[3], 'CBA User Notification');
      }
    })
  }

  showToastNotification(txtmsg: string, typeName: any, toastheader: string) {
    this.toaster.open({
      text: txtmsg,
      caption: toastheader + ' Notification',
      type: typeName
    });
  }

  getDate(st: Date) {
    st.setDate(st.getDate());
    var dd = st.getDate();
    var mm = st.getMonth() + 1;
    var y = st.getFullYear();
    var startDtFmt = mm + '/' + dd + '/' + y;
    st = new Date(startDtFmt);
    return st;
  }

  userAction(userId: number, actionName: string) {
    this.spinnerService.show();
    this.userService.getUserByUserId(userId).pipe(first()).subscribe(
      (respuser: any) => {
        if (actionName == 'deactive') {
          respuser.isactive = false;
        } else {
          respuser.isactive = true;
        }
        this.userService.saveorupdate(respuser).subscribe(
          (userObj: any) => {
            this.usrObj = this.userAdapter.adapt(userObj);
            if (this.usrObj.userId > 0) {

              if (actionName == 'deactive') {
                this.alertService.success('User successfully deactivaited.');
              } else {
                this.alertService.success('User successfully activiated again.');
              }
              this.getAllUser();
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

  formatPhoneNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      var intlCode = (match[1] ? '+1 ' : '')
      return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
    }
    return null
  }
}