import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UsersrvdetailsService } from './../AppRestCall/userservice/usersrvdetails.service';
import { ReferenceAdapter } from './../adapters/referenceadapter';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../AppRestCall/user/user.service';
import { Router } from '@angular/router';
import { config } from '../appconstants/config';
import { ActivatedRoute } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { PaymentService } from '../AppRestCall/payment/payment.service';
import { ReferenceService } from '../AppRestCall/reference/reference.service';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { timer } from 'rxjs';
import { ReadMorePopupComponent } from '../read-more-popup/read-more-popup.component';
import { ConfigMsg } from '../appconstants/configmsg';
import { MatomoTracker } from 'ngx-matomo';
import { CommonUtility } from '../adapters/commonutility';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  name: string;
  list = [];
  filteredList: string[] = [];
  templist: any;
  // two way binding for input text
  inputItem: any;
  selectedItem: any;
  // enable or disable visiblility of dropdown
  listHidden = true;
  showError = false;
  selectedIndex = -1;
  // the list to be shown after filtering
  modalRef: BsModalRef;

  filterOn = '0';
  inputItemCode: string;
  txtid: string;
  ispaysuccess = false;

  fullname: string;
  defaultTxtImg: string = '//placehold.it/200/dddddd/fff?text=' + this.getNameInitials();
  notifcationbellList: any = [];
  notificationCount: number;
  isbellenable: boolean = false;

  constructor(
    public userService: UserService,
    private router: Router,
    route: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    private refAdapter: ReferenceAdapter,
    private paymentsvc: PaymentService,
    private referService: ReferenceService,
    public translate: TranslateService,
    public usersrvdetails: UsersrvdetailsService,
    private modalService: BsModalService,
    private matomoTracker: MatomoTracker,
    private commonlogic: CommonUtility,
  ) {
    route.params.subscribe(params => {
      this.txtid = params.txtid;
    });
  }

  ngOnInit() {
    if (this.userService.currentUserValue != null) {
      this.matomoTracker.setUserId(this.userService.currentUserValue.userId.toString());
      if (this.txtid != null) {
        this.getPaymentDetailsByTxnId(this.txtid);
      }
      setTimeout(() => {
        this.resetLoggedInUser();
      }, 1000);
      if (this.userService.currentUserValue.userroles.rolecode !== config.user_rolecode_fu.toString()) {
        this.getAllAvailableFUSkills();
      }
      const source = timer(1000, 90000);
      source.subscribe(() => {
        this.isbellenable = false;
        this.getAllBellNotifications();
      });
    }
  }

  getAllBellNotifications() {
    this.notifcationbellList = [];
    if (this.userService.currentUserValue != null) {
      if (this.userService.currentUserValue.userroles.rolecode == config.user_rolecode_fu.toString()) {
        this.getNotificationUserByUserId();
      } else {
        if (this.userService.currentUserValue.userroles.rolecode == config.user_rolecode_cba.toString()) {
          this.getNotificationUserByUserId();
        } else {
          this.getNotificationUserByRole(this.userService.currentUserValue.userroles.rolecode);
        }
      }
    }
  }

  getNotificationUserByUserId() {
    this.usersrvdetails.getAllBellNotifications(this.userService.currentUserValue.userId, this.userService.currentUserValue.userroles.rolecode).subscribe(
      (notifcationlist: any) => {
        if (notifcationlist != null) {
          if (this.userService.currentUserValue.preferlang !== config.lang_code_en) {
            notifcationlist.forEach((element: any) => {
              if (element.subcategory.toString() == this.userService.currentUserValue.freeLanceDetails.subCategory) {
                this.referService.translatetext(element.msg.toString(), this.userService.currentUserValue.preferlang).subscribe(
                  (trantxt: any) => {
                    element.msg = trantxt;
                    this.notifcationbellList.push(element);
                  },
                  error => {
                    this.spinnerService.hide();
                    this.alertService.error(error);
                  }
                );
              }
            });
          } else {
            notifcationlist.forEach((element: any) => {
              this.notifcationbellList.push(element);
            });
          }
        }
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      }
    );
  }

  getNotificationUserByRole(roleCode: string) {
    this.usersrvdetails.getAllBellNotificationsByRoleCode(roleCode).subscribe(
      (notifcationlist: any) => {
        if (notifcationlist != null) {
          if (this.userService.currentUserValue.preferlang !== config.lang_code_en && this.userService.currentUserValue.userroles.rolecode == config.user_rolecode_fu.toString()) {
            notifcationlist.forEach((element: any) => {
              if (element.subcategory.toString() == this.userService.currentUserValue.freeLanceDetails.subCategory.toString()) {
                this.referService.translatetext(element.msg.toString(), this.userService.currentUserValue.preferlang).subscribe(
                  (trantxt: any) => {
                    element.msg = trantxt;
                    this.notifcationbellList.push(element);
                  },
                  error => {
                    this.spinnerService.hide();
                    this.alertService.error(error);
                  }
                );
                this.spinnerService.hide();
              }
            });
          } else {
            if (this.userService.currentUserValue.userroles.rolecode == config.user_rolecode_fu.toString()) {
              notifcationlist.forEach((element: any) => {
                if (element.subcategory.toString() == this.userService.currentUserValue.freeLanceDetails.subCategory.toString()) {
                  this.notifcationbellList.push(element);
                }
              });
              this.spinnerService.hide();
            } else {
              this.notifcationbellList = notifcationlist;
            }
          }
        }
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      }
    );
  }

  openNotifcationWindow() {
    const initialState = {
      notificationEnable: true,
      contentList: this.notifcationbellList
    };
    this.modalRef = this.modalService.show(ReadMorePopupComponent, Object.assign(
      {},
      this.commonlogic.configlg,
      {
        initialState
      }
    ));
  }

  getFullNameByPreferLang() {
    this.fullname = null;
    if (this.userService.currentUserValue.userroles.rolecode === config.user_rolecode_fu.toString()) {
      if (this.userService.currentUserValue.preferlang !== config.lang_code_en) {
        this.referService.translatetext(this.userService.currentUserValue.fullname, this.userService.currentUserValue.preferlang).subscribe(
          (trantxt: any) => {
            this.fullname = trantxt;
          },
          error => {
            this.spinnerService.hide();
            this.alertService.error(error);
          }
        );
      } else {
        this.fullname = this.userService.currentUserValue.fullname;
      }
    } else {
      this.fullname = this.userService.currentUserValue.fullname;
    }
  }

  getPaymentDetailsByTxnId(txnid: string) {
    this.paymentsvc.getPaymentDetailsByTxnId(txnid).subscribe((paymentobj: any) => {
      if (paymentobj.paymentsCBATrans != null) {
        if (paymentobj.paymentsCBATrans.status === config.payment_success.toString()) {
          this.ispaysuccess = true;
          this.alertService.success(ConfigMsg.payment_sucesss_alert_en);
        } else {
          this.alertService.info(ConfigMsg.payment_fail_alert_en);
        }
      }
      if (paymentobj.paymentsFUTrans != null) {
        this.ispaysuccess = true;
        var paymentsucess;
        var paymentfailed;
        if (paymentobj.paymentsFUTrans.status === config.payment_success.toString()) {
          if (this.userService.currentUserValue.preferlang == config.lang_code_en) {
            paymentsucess = ConfigMsg.payment_sucesss_alert_en.toString();
          } else {
            if (this.userService.currentUserValue.preferlang == config.lang_code_hi) {
              paymentsucess = ConfigMsg.payment_sucesss_alert_hi.toString();
            } else {
              paymentsucess = ConfigMsg.payment_sucesss_alert_te.toString();
            }
          }
          this.alertService.success(paymentsucess);
        } else {
          if (this.userService.currentUserValue.preferlang == config.lang_code_en) {
            paymentfailed = ConfigMsg.payment_fail_alert_en.toString();
          } else {
            if (this.userService.currentUserValue.preferlang == config.lang_code_hi) {
              paymentfailed = ConfigMsg.payment_fail_alert_hi.toString();
            } else {
              paymentfailed = ConfigMsg.payment_fail_alert_te.toString();
            }
          }
          this.alertService.info(paymentfailed);
        }
      }
    },
      error => {
        this.alertService.error(error);
        this.spinnerService.hide();
      });
  }

  private resetLoggedInUser() {
    this.userService.getUserByUserId(this.userService.currentUserValue.userId).subscribe(
      (userresp: any) => {
        this.userService.setCurrentUserValue(userresp);
        this.translateToLanguage(userresp.preferlang.toString());
        this.spinnerService.hide();
      },
      error => {
        this.alertService.error(error);
        this.spinnerService.hide();
      });
    this.getFullNameByPreferLang();
  }

  logout() {
    this.userService.logout();
    localStorage.setItem(config.keylangCode, config.lang_code_en);
    localStorage.setItem(config.keylangLabel, config.lang_english_word);
    this.router.navigate(['/home']);
  }

  search(inputItem: string) {
    this.templist = [];
    if (inputItem == null) {
      this.alertService.info(ConfigMsg.searh_empty);
    } else {
      this.templist = this.list.filter((item) => item.label.toLowerCase().startsWith(this.inputItem.toLowerCase()));
      if (this.templist.length == 0) {
        this.alertService.info(ConfigMsg.nosearch_keyword + inputItem);
      } else {
        this.router.navigateByUrl('fusearch/', { skipLocationChange: true }).
          then(() => {
            this.router.navigate(['dashboard/' + this.templist[0].code + '/' + this.templist[0].label]);
          });
      }
    }
  }

  getAllAvailableFUSkills() {
    this.list = [];
    this.referService.getReferenceLookupByKey(config.key_domain.toString()).pipe(map((data: any[]) =>
      data.map(item => this.refAdapter.adapt(item))),
    ).subscribe(
      data => {
        data.forEach(elementcategory => {
          if (elementcategory.code !== config.domain_code_SE_P) {
            elementcategory.referencelookupmapping.forEach(elementlookupmapping => {
              elementlookupmapping.referencelookupmappingsubcategories.forEach(element => {
                this.list.push(element);
              });
            })
          }
        })
      });
  }

  getFilteredList() {
    this.listHidden = false;
    if (!this.listHidden && this.inputItem !== undefined) {
      this.filteredList = this.list.filter((item) => item.label.toLowerCase().startsWith(this.inputItem.toLowerCase()));
    }
  }

  selectItem(ind) {
    if (ind > -1) {
      const obj = this.refAdapter.adapt(this.filteredList[ind]);
      this.inputItem = obj.label;
      this.listHidden = true;
      this.selectedIndex = ind;
      this.inputItemCode = obj.code;
    }
  }

  onKeyPress(event) {
    if (!this.listHidden) {
      if (event.key === config.escape) {
        this.selectedIndex = -1;
        this.toggleListDisplay(0);
      }
      if (event.key === config.enter) {
        this.toggleListDisplay(0);
      }
      if (event.key === config.ArrowDown) {
        this.listHidden = false;
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredList.length;
        if (this.filteredList.length > 0 && !this.listHidden) {
          document.getElementsByTagName('list-item')[this.selectedIndex].scrollIntoView();
        }
      } else if (event.key === config.ArrowUp) {
        this.listHidden = false;
        if (this.selectedIndex <= 0) {
          this.selectedIndex = this.filteredList.length;
        }
        this.selectedIndex = (this.selectedIndex - 1) % this.filteredList.length;
        if (this.filteredList.length > 0 && !this.listHidden) {
          document.getElementsByTagName('list-item')[this.selectedIndex].scrollIntoView();
        }
      }
    }
  }

  toggleListDisplay(sender: number) {
    if (sender === 1) {
      this.listHidden = false;
      this.getFilteredList();
    } else {
      setTimeout(() => {
        this.selectItem(this.selectedIndex);
        this.listHidden = true;
        if (!this.list.filter(items => items.label.toLowerCase().includes(this.inputItem.toLowerCase()))) {
          this.showError = true;
          this.filteredList = this.list;
        } else {
          this.showError = false;
        }
      }, 500);
    }
  }

  getNameInitials() {
    if (this.userService.currentUserValue != null) {
      if (this.userService.currentUserValue.fullname !== null) {
        let initials = this.userService.currentUserValue.fullname.match(/\b\w/g) || [];
        let initialsfinal = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
        return initialsfinal;
      }
    }
  }

  translateToLanguage(preferedLang: string) {
    var lang = this.commonlogic.getLangLabel(preferedLang);
    this.translate.use(lang);
  }

}
