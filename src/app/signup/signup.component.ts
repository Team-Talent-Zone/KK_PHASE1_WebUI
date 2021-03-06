import { config } from 'src/app/appconstants/config';
import { Util } from 'src/app/appmodels/Util';
import { User } from 'src/app/appmodels/User';
import { ReferenceAdapter } from '../adapters/referenceadapter';
import { map, first } from 'rxjs/operators';
import { Component, OnInit, Inject } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { UserService } from '../AppRestCall/user/user.service';
import { UserAdapter } from '../adapters/useradapter';
import { ReferenceService } from '../AppRestCall/reference/reference.service';
import { ConfigMsg } from '../appconstants/configmsg';
import { SendemailService } from '../AppRestCall/sendemail/sendemail.service';
import { ReferenceLookUpTemplateAdapter } from '../adapters/referencelookuptemplateadapter';
import { ReferenceLookUpTemplate } from '../appmodels/ReferenceLookUpTemplate';
import { environment } from 'src/environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { UserNotification } from 'src/app/appmodels/UserNotification';
import { UserServiceDetails } from '../appmodels/UserServiceDetails';
import { UsersrvdetailsService } from '../AppRestCall/userservice/usersrvdetails.service';
import { ActivatedRoute } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { CommonUtility } from '../adapters/commonutility';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit {

  key: string;
  signupForm: FormGroup;
  userservicedetailsForm: FormGroup;
  userservicedetailsFormServicePack: FormGroup;
  issubmit = false;
  issubcatdisplay = false;
  referencedetailsmap = [];
  referencedetailsmapsubcat = [];
  referencedetailsmapsubcatselectedmapId: any = [];
  referencedetailsfullmap = [];
  usrObj: User;
  templateObj: ReferenceLookUpTemplate;
  util: Util;
  usernotification: UserNotification;
  today = new Date();
  user: User;
  reflookupdetails: any;
  fullRefLookupDetails: any;
  fullReferencedetailsmap = [];
  langcode: string;
  usersrvobj: UserServiceDetails;
  ourserviceids: any = [];
  termsofservice: string;
  privacypolicy: string;
  shortkeytermsofservices: string;
  shortkeyprivacypolicy: string;
  name: string;
  biztypelist: any;
  rolecode: string;
  skilllabel: string;

  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    public modalRef: BsModalRef,
    public modalRefLogin: BsModalRef,
    private formBuilder: FormBuilder,
    private refAdapter: ReferenceAdapter,
    private userAdapter: UserAdapter,
    private alertService: AlertsService,
    private userService: UserService,
    private referService: ReferenceService,
    private sendemailService: SendemailService,
    private reflookuptemplateAdapter: ReferenceLookUpTemplateAdapter,
    private usersrvDetails: UsersrvdetailsService,
    private modalService: BsModalService,
    public commonlogic: CommonUtility
  ) {
  }

  ngOnInit() {
    this.formValidations();
    if (this.key === config.shortkey_role_fu.toString()) {
      this.getAllCategories(this.langcode);
    }
    this.getTermsofServicesAndPrivacyPolicyURLByLang(this.langcode);
    this.prepareListBuzzTypes();
  }

  prepareListBuzzTypes() {
    if (this.key === config.shortkey_role_cba.toString()) {
      if (localStorage.getItem(config.keylangCode) == config.lang_code_en.toString()) {
        this.biztypelist = [ConfigMsg.biztype_ind_en, ConfigMsg.biztype_cmp_en];
      } else {
        if (localStorage.getItem(config.keylangCode) == config.lang_code_hi.toString()) {
          this.biztypelist = [ConfigMsg.biztype_ind_hi, ConfigMsg.biztype_cmp_hi];
        } else {
          this.biztypelist = [ConfigMsg.biztype_ind_te, ConfigMsg.biztype_cmp_te];
        }
      }
    }
  }

  formValidations() {
    if (this.key === config.shortkey_role_cba.toString()) {
      this.signupForm = this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}$/)]],
        username: ['', [Validators.required, Validators.email, Validators.maxLength(40)]],
        firstname: ['', [Validators.required, Validators.maxLength(40)]],
        lastname: ['', [Validators.required, Validators.maxLength(40)]],
        preferlang: config.lang_code_en,
        acceptsignupterms: [false, [Validators.requiredTrue]],
        biztype: ['', [Validators.required]]
      });
    } else {
      this.signupForm = this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}$/)]],
        username: ['', [Validators.required, Validators.email, Validators.maxLength(40)]],
        firstname: ['', [Validators.required, Validators.maxLength(40)]],
        lastname: ['', [Validators.required, Validators.maxLength(40)]],
        preferlang: ['', [Validators.required]],
        category: ['', [Validators.required]],
        subcategory: ['', [Validators.required]],
        acceptsignupterms: [false, [Validators.requiredTrue]]
      });
    }
  }

  getAllCategories(langcode: string) {
    this.reflookupdetails = [];
    this.referencedetailsmap = [];
    this.referencedetailsmapsubcat = [];
    this.referencedetailsfullmap = [];
    this.fullReferencedetailsmap = [];
    this.fullRefLookupDetails = [];
    this.spinnerService.show();
    this.referService.getReferenceLookupByKey(config.key_domain.toString()).pipe(map((data: any[]) =>
      data.map(item => this.refAdapter.adapt(item))),
    ).subscribe(
      data => {
        for (const reflookup of data) {
          if (reflookup.code !== config.domain_code_SE_P.toString()) {
            this.reflookupdetails.push(reflookup);
          }
          this.fullRefLookupDetails.push(reflookup);
          for (const reflookupmap of reflookup.referencelookupmapping) {
            if (reflookupmap.code !== config.category_code_FS_S.toString()) {
              if (langcode !== config.lang_code_en.toString()) {
                this.referService.translatetext(reflookupmap.label, langcode).subscribe(
                  (resptranslatetxt: string) => {
                    if (resptranslatetxt != null) {
                      reflookupmap.label = resptranslatetxt;
                      this.referencedetailsmap.push(reflookupmap);
                    }
                  },
                  error => {
                    this.alertService.error(error);
                    this.spinnerService.hide();
                  });
              } else {
                this.referencedetailsmap.push(reflookupmap);
              }
            }
            this.fullReferencedetailsmap.push(reflookupmap);
            for (const reflookupmapsubcat of reflookupmap.referencelookupmappingsubcategories) {
              if (langcode !== config.lang_code_en.toString()) {
                this.referService.translatetext(reflookupmapsubcat.label, langcode).subscribe(
                  (resptranslatetxt: string) => {
                    if (resptranslatetxt != null) {
                      reflookupmapsubcat.label = resptranslatetxt;
                      this.referencedetailsmapsubcat.push(reflookupmapsubcat);
                    }
                  },
                  error => {
                    this.alertService.error(error);
                    this.spinnerService.hide();
                  });
              } else {
                this.referencedetailsmapsubcat.push(reflookupmapsubcat);
              }
            }
          }
        }
        this.spinnerService.hide();
      },
      error => {
        this.modalRef.hide();
        this.alertService.error(error);
        this.spinnerService.hide();
      }
    );
  }

  subCategoryByMapId(value: number) {
    this.referencedetailsmapsubcatselectedmapId = [];
    this.referencedetailsmapsubcat.forEach(element => {
      if (element.mapId == value) {
        this.referencedetailsmapsubcatselectedmapId.push(element);
        this.referencedetailsmapsubcatselectedmapId.sort((a, b) => (a.orderid > b.orderid ? 1 : -1));
      }
    });
  }

  get f() {
    return this.signupForm.controls;
  }

  preparetoSaveUser() {
    this.issubmit = true;
    if (this.signupForm.invalid) {
      return;
    }
    this.spinnerService.show();
    this.skilllabel = null;
    this.rolecode = null;
    this.userService.checkusernamenotexist(
      this.signupForm.get('username').value
    ).subscribe(
      (isusernotexist: any) => {
        if (isusernotexist) {
          if (this.key === config.shortkey_role_cba.toString()) {
            this.rolecode = config.user_rolecode_cba.toString();
            this.saveUser();
          } else {
            this.rolecode = config.user_rolecode_fu.toString();
            this.referService.getReferenceLookupMappingSubCategoryByCode(this.signupForm.get('subcategory').value).subscribe(
              (codelabel: any) => {
                this.skilllabel = codelabel.label;
                this.saveUser();
              });
          }
        } else {
          if (this.langcode !== config.lang_code_en.toString()) {
            this.referService.translatetext(ConfigMsg.signup_successmsg_alreadyexisit, this.langcode).subscribe(
              (resptranslatetxt: string) => {
                if (resptranslatetxt != null) {
                  this.alertService.info(resptranslatetxt, true);
                  this.spinnerService.hide();
                }
              },
              error => {
                this.alertService.error(error);
                this.spinnerService.hide();
              });
          } else {
            this.alertService.info(ConfigMsg.signup_successmsg_alreadyexisit, true);
            this.spinnerService.hide();
          }
        }
      },
      error => {
        this.modalRef.hide();
        this.spinnerService.hide();
        this.alertService.error(error);
      }
    );
  }

  private saveUser() {
    this.userService.saveUser(
      this.signupForm.value, this.rolecode, this.key, this.signupForm.value, this.skilllabel
    ).pipe(first()).subscribe(
      (resp) => {
        this.usrObj = this.userAdapter.adapt(resp);
        if (this.usrObj.userId > 0) {
          this.referService.getLookupTemplateEntityByShortkey(config.shortkey_email_verificationemailaddress.toString()).subscribe(
            referencetemplate => {
              this.templateObj = this.reflookuptemplateAdapter.adapt(referencetemplate);
              this.util = new Util();
              this.util.preferlang = this.usrObj.preferlang;
              this.util.fromuser = ConfigMsg.email_default_fromuser;
              this.util.subject = ConfigMsg.email_verficationemailaddress_subj;
              this.util.touser = this.usrObj.username;
              this.util.templateurl = this.templateObj.url;
              this.util.templatedynamicdata = JSON.stringify({
                firstname: this.usrObj.firstname,
                platformURL: `${environment.uiUrl}` + config.confirmation_fullpathname.toString()
                  + '/' + this.usrObj.userId
              });
              this.sendemailService.sendEmail(this.util).subscribe(
                (util: any) => {
                  if (util.lastreturncode === 250) {
                    this.usernotification = new UserNotification();
                    this.usernotification.templateid = this.templateObj.templateid;
                    this.usernotification.sentby = this.usrObj.firstname;
                    this.usernotification.userid = this.usrObj.userId;
                    this.usernotification.senton = this.today.toString();
                    this.userService.saveUserNotification(this.usernotification).subscribe(
                      (notificationobj: any) => {
                        this.spinnerService.hide();
                        if (this.langcode !== config.lang_code_en.toString()) {
                          this.referService.translatetext(ConfigMsg.signup_successmsg, this.langcode).subscribe(
                            (resptranslatetxt: string) => {
                              if (resptranslatetxt != null) {
                                this.alertService.success(resptranslatetxt, true);
                                this.modalRef.hide();
                              }
                            },
                            error => {
                              this.alertService.error(error);
                              this.spinnerService.hide();
                            });
                        } else {
                          this.alertService.success(ConfigMsg.signup_successmsg, true);
                          this.modalRef.hide();
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
                  this.modalRef.hide();
                });
            },
            error => {
              this.spinnerService.hide();
              this.alertService.error(error);
              this.modalRef.hide();
            });
        }
        if (this.ourserviceids !== null && this.ourserviceids.length > 0) {
          if (this.ourserviceids[0].packwithotherourserviceid != null) {
            this.saveUserServiceDetailsForServicePkg(this.ourserviceids, this.usrObj);
          } else {
            if (this.ourserviceids[0].ourserviceid != null) {
              this.saveUserServiceDetailsForIndividual(this.ourserviceids[0].ourserviceid, this.usrObj);
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

  private saveUserServiceDetailsForIndividual(ourserviceid: number, usrObj: User) {
    this.referService.getReferenceLookupByShortKey(config.user_service_status_paymentpending_shortkey.toString()).subscribe(
      (refCodeStr: string) => {
        this.userservicedetailsForm = this.formBuilder.group({
          ourserviceId: ourserviceid,
          userid: this.usrObj.userId,
          createdby: this.usrObj.fullname,
          status: refCodeStr,
          isservicepack: false,
          amount: this.ourserviceids[0].amount,
          validPeriodLabel: this.ourserviceids[0].validPeriodLabel,
          validPeriodCode: this.ourserviceids[0].validPeriodCode,
          serviceendon: this.ourserviceids[0].serviceendon,
          servicestarton: this.ourserviceids[0].servicestarton,
          userServiceEventHistory: []
        });
        this.usersrvDetails.saveUserServiceDetails(this.userservicedetailsForm.value, refCodeStr).subscribe(
          (usersrvobj) => {
          }, error => {
            this.spinnerService.hide();
            this.alertService.error(error);
          });
      });
  }
  private saveUserServiceDetailsForServicePkg(ourserviceids: any, usrObj: User) {
    this.referService.getReferenceLookupByShortKey(config.user_service_status_paymentpending_shortkey.toString()).subscribe(
      (refCodeStr: string) => {
        this.userservicedetailsFormServicePack = this.formBuilder.group({
          ourserviceId: this.ourserviceids[0].packwithotherourserviceid,
          userid: this.usrObj.userId,
          createdby: this.usrObj.fullname,
          status: refCodeStr,
          isservicepack: true,
          amount: 0,
          validPeriodLabel: this.ourserviceids[0].validPeriodLabel,
          validPeriodCode: this.ourserviceids[0].validPeriodCode,
          serviceendon: this.ourserviceids[0].serviceendon,
          servicestarton: this.ourserviceids[0].servicestarton,
          userServiceEventHistory: []
        });
        this.usersrvDetails.saveUserServiceDetails(this.userservicedetailsFormServicePack.value, refCodeStr).subscribe(
          (servicepkgusersrvobj: UserServiceDetails) => {
            this.userservicedetailsForm = this.formBuilder.group({
              ourserviceId: this.ourserviceids[0].ourserviceid,
              userid: this.usrObj.userId,
              createdby: this.usrObj.fullname,
              status: refCodeStr,
              isservicepack: false,
              childservicepkgserviceid: servicepkgusersrvobj.serviceId,
              amount: this.ourserviceids[0].amount,
              validPeriodLabel: this.ourserviceids[0].validPeriodLabel,
              validPeriodCode: this.ourserviceids[0].validPeriodCode,
              serviceendon: this.ourserviceids[0].serviceendon,
              servicestarton: this.ourserviceids[0].servicestarton,
              userServiceEventHistory: []
            });
            this.usersrvDetails.saveUserServiceDetails(this.userservicedetailsForm.value, refCodeStr).subscribe(
              () => {
              },
              error => {
                this.spinnerService.hide();
                this.alertService.error(error);
              });
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
  }

  getTermsofServicesAndPrivacyPolicyURLByLang(langcode: string) {
    this.termsofservice = null;
    this.privacypolicy = null;
    this.shortkeytermsofservices = null;
    this.shortkeyprivacypolicy = null;

    if (langcode === config.lang_code_hi.toString()) {
      this.shortkeytermsofservices = config.shortkey_termsofservice_hindi;
      this.shortkeyprivacypolicy = config.shortkey_privacypolicy_hindi;
    }
    if (langcode === config.lang_code_te.toString()) {
      this.shortkeytermsofservices = config.shortkey_termsofservice_telugu;
      this.shortkeyprivacypolicy = config.shortkey_privacypolicy_telugu;
    }
    if (langcode === config.lang_code_en.toString()) {
      this.shortkeytermsofservices = config.shortkey_termsofservice_english;
      this.shortkeyprivacypolicy = config.shortkey_privacypolicy_english
    }
    this.referService.getLookupTemplateEntityByShortkey(this.shortkeytermsofservices).subscribe(
      (returnURL: any) => {
        this.termsofservice = returnURL.url
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
    this.referService.getLookupTemplateEntityByShortkey(this.shortkeyprivacypolicy).subscribe(
      (returnURL: any) => {
        this.privacypolicy = returnURL.url
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  openLoginModal() {
    const initialState = null;
    this.modalRefLogin = this.modalService.show(LoginComponent, Object.assign(
      {},
      this.commonlogic.configmd,
      {
        initialState
      }
    ));
    this.modalRef.hide();
  }
}
