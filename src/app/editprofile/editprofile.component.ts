import { PaymentService } from './../AppRestCall/payment/payment.service';
import { SignupComponent } from './../signup/signup.component';
import { UserService } from '../AppRestCall/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { first } from 'rxjs/operators';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { User } from '../appmodels/User';
import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, NgZone } from '@angular/core';
import { UtilService } from '../AppRestCall/util/util.service';
import { UserAdapter } from '../adapters/useradapter';
import { config } from 'src/app/appconstants/config';

import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ApiService, Maps } from '../adapters/api.service';
import { ReferenceService } from '../AppRestCall/reference/reference.service';
import { ConfigMsg } from '../appconstants/configmsg';
@Component({
  selector: 'app-editprofile',
  templateUrl: './editprofile.component.html',
  styleUrls: ['./editprofile.component.css']
})

export class EditprofileComponent implements OnInit {

  @ViewChild('search', null)
  public searchElementRef: ElementRef;
  id: number;
  edituserobj: User;
  roleCode: string;
  issubmit = false;
  defaultTxtImg: string = '//placehold.it/200/dddddd/fff?text=' + this.getNameInitials(this.userService.currentUserValue.fullname);
  /*########################## File Upload ########################*/
  avatarURL: any;
  avatarReturnURL: any;
  nationalIDURL: any;
  nationalIDReturnURL: any;
  editprofileuserId: number;
  editprofileForm: FormGroup;
  pwdForm: FormGroup;
  usrObj: User;
  filename: string;
  typeavt: string;
  typenationalid: string;
  msgflag = false;
  msgflagboth = false;
  route: string;
  city: string;
  state: string;
  country: string;
  shortAddress: string;
  lat: number;
  lng: number;
  cityElementOne: string;
  cityElementTwo: string;
  isbiznamexist = false;
  allUserCBAList: any;
  ispwdsubmit = false;
  isbankenabled = false;

  constructor(
    public fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public userService: UserService,
    route: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private userAdapter: UserAdapter,
    public signupComponent: SignupComponent,
    apiService: ApiService,
    private referService: ReferenceService,
    private ngZone: NgZone,
    private paymentService: PaymentService
  ) {
    route.params.subscribe(params => {
      this.id = params.id;
    });
    apiService.api.then(maps => {
      this.initAutocomplete(maps);
    });
  }

  ngOnInit() {
    this.roleCode = this.userService.currentUserValue.userroles.rolecode;
    this.openEditUser();
    this.editProfileFormValidations();
    this.pwdFormValidation();
    if (this.roleCode === config.user_rolecode_fu.toString()) {
      this.signupComponent.getAllCategories(this.userService.currentUserValue.preferlang);
      this.signupComponent.getTermsofServicesAndPrivacyPolicyURLByLang(this.userService.currentUserValue.preferlang);
    }
    if (this.userService.currentUserValue.userroles.rolecode === config.user_rolecode_cba.toString()) {
      this.signupComponent.getTermsofServicesAndPrivacyPolicyURLByLang(this.userService.currentUserValue.preferlang);
      this.userService.getUsersByRole(config.user_rolecode_cba.toString()).subscribe((usrobjlist: any) => {
        this.allUserCBAList = usrobjlist;
      },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        });
    }
  }

  getNameInitials(fullname: string) {
    let initials = fullname.match(/\b\w/g) || [];
    let initialsfinal = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    return initialsfinal;
  }

  initAutocomplete(maps: Maps) {
    let autocomplete = new maps.places.Autocomplete(this.searchElementRef.nativeElement);
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        this.route = null;
        this.city = null;
        this.state = null;
        this.country = null;
        this.shortAddress = null;
        this.lng = -1;
        this.lat = -1;
        const place = autocomplete.getPlace();
        this.lat = place.geometry.location.lat();
        this.lng = place.geometry.location.lng();
        autocomplete.getPlace().address_components.forEach(element => {
          if (element.types[0] === config.keygmap_2) {
            this.route = element.long_name;
          }
          if (element.types[0] === config.keygmap_3) {
            this.cityElementOne = element.long_name;
          } else
            if (element.types[0] === config.keygmap_4) {
              this.cityElementTwo = element.long_name;
            }
          if (element.types[0] === config.keygmap_5) {
            this.state = element.long_name;
          }
          if (element.types[0] === config.keygmap_6) {
            this.country = element.short_name;
          }
        });
        this.route = this.route != null ? this.route : '';
        this.city = this.cityElementOne != null ? this.cityElementOne : this.cityElementTwo;
        let routeDup = this.route.length > 0 ? this.route + ',' : '';
        let cityDup = this.city.length > 0 ? this.city + ',' : '';
        let stateDup = this.state.length > 0 ? this.state + ',' : '';
        let countryDup = this.country.length > 0 ? this.country + ',' : '';
        this.shortAddress = routeDup + cityDup + stateDup + countryDup;
      });
    });
  }

  editProfileFormValidations() {
    if (this.roleCode === config.user_rolecode_cba.toString() && this.userService.currentUserValue.userbizdetails.biztype == ConfigMsg.biztype_ind_en) {
      this.editprofileForm = this.formBuilder.group({
        username: ['', [Validators.required]],
        firstname: ['', [Validators.required, Validators.maxLength(40)]],
        lastname: ['', [Validators.required, Validators.maxLength(40)]],
        preferlang: ['', [Validators.required]],
        fulladdress: ['', [Validators.required]],
        accepteditprofileterms: [false, [Validators.requiredTrue]],
        phoneno: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern("[0-9 ]{10}")]]
      });
    } else
      if (this.roleCode === config.user_rolecode_cba.toString() && this.userService.currentUserValue.userbizdetails.biztype == ConfigMsg.biztype_cmp_en) {
        this.editprofileForm = this.formBuilder.group({
          username: ['', [Validators.required]],
          firstname: ['', [Validators.required, Validators.maxLength(40)]],
          lastname: ['', [Validators.required, Validators.maxLength(40)]],
          preferlang: ['', [Validators.required]],
          fulladdress: ['', [Validators.required]],
          bizname: ['', [Validators.required, Validators.maxLength(40)]],
          biztype: [],
          bizwebsite: ['', [Validators.maxLength(40)]],
          abtbiz: ['', [Validators.required]],
          purposeofsignup: ['', [Validators.required]],
          designation: ['', [Validators.required, Validators.maxLength(40)]],
          accepteditprofileterms: [false, [Validators.requiredTrue]],
          phoneno: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern("[0-9 ]{10}")]]
        });
      } else
        if (this.roleCode === config.user_rolecode_fu.toString()) {
          this.editprofileForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            firstname: ['', [Validators.required, Validators.maxLength(40)]],
            lastname: ['', [Validators.required, Validators.maxLength(40)]],
            preferlang: ['', [Validators.required]],
            fulladdress: ['', [Validators.required]],
            subCategory: ['', [Validators.required]],
            category: ['', [Validators.required]],
            experienceInField: ['', [Validators.required, Validators.maxLength(2), Validators.pattern('^[0-9]*$')]],
            abt: [''],
            uploadValidPhotoidImgUrl: ['', [Validators.required]],
            avtarurl: ['', [Validators.required]],
            hourlyRate: ['', [Validators.required, Validators.maxLength(5), Validators.pattern('^[0-9]*$')]],
            accountname: ['', [Validators.required, Validators.maxLength(20), Validators.pattern('^[a-zA-Z ]*$')]],
            accountno: ['', [Validators.required, Validators.maxLength(15), Validators.pattern('^[0-9]*$')]],
            verfiyaccountno: ['', [Validators.required]],
            ifsc: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
            accepteditprofileterms: [false, [Validators.requiredTrue]],
            phoneno: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern("[0-9 ]{10}")]]
          });
        } else {
          this.editprofileForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            firstname: ['', [Validators.required, Validators.maxLength(40)]],
            lastname: ['', [Validators.required, Validators.maxLength(40)]],
            preferlang: ['', [Validators.required]],
            fulladdress: ['', [Validators.required]],
            phoneno: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern("[0-9 ]{10}")]],
            accepteditprofileterms: [false, [Validators.requiredTrue]],

          });
        }
  }

  get f() {
    return this.editprofileForm.controls;
  }

  openEditUser() {
    if (this.id > 0) {
      this.spinnerService.show();
      this.userService.getUserByUserId(this.id).pipe(first()).subscribe(
        (respuser: any) => {
          this.edituserobj = respuser;
          this.userService.currentUserValue.avtarurl = this.edituserobj.avtarurl;
          this.avatarURL = this.edituserobj.avtarurl;
          this.editprofileuserId = this.edituserobj.userId;
          this.spinnerService.hide();
          this.editprofileForm.patchValue({ username: this.edituserobj.username });
          this.editprofileForm.patchValue({ firstname: this.edituserobj.firstname });
          this.editprofileForm.patchValue({ lastname: this.edituserobj.lastname });
          this.editprofileForm.patchValue({ preferlang: this.edituserobj.preferlang });
          this.editprofileForm.patchValue({ phoneno: this.edituserobj.phoneno });
          this.editprofileForm.patchValue({ fulladdress: this.edituserobj.userbizdetails.fulladdress });
          if (this.roleCode === config.user_rolecode_cba.toString() && this.userService.currentUserValue.userbizdetails.biztype === ConfigMsg.biztype_cmp_en) {
            this.editprofileForm.patchValue({ bizname: this.edituserobj.userbizdetails.bizname });
            this.editprofileForm.patchValue({ biztype: this.edituserobj.userbizdetails.biztype });
            this.editprofileForm.patchValue({ bizwebsite: this.edituserobj.userbizdetails.bizwebsite });
            this.editprofileForm.patchValue({ abtbiz: this.edituserobj.userbizdetails.abtbiz });
            this.editprofileForm.patchValue({ purposeofsignup: this.edituserobj.userbizdetails.purposeofsignup });
            this.editprofileForm.patchValue({ designation: this.edituserobj.userbizdetails.designation });
          }
          if (this.roleCode === config.user_rolecode_fu.toString()) {
            this.editprofileForm.patchValue({ category: this.edituserobj.freeLanceDetails.category });
            this.editprofileForm.patchValue({ experienceInField: this.edituserobj.freeLanceDetails.experienceInField });
            this.editprofileForm.patchValue({ subCategory: this.edituserobj.freeLanceDetails.subCategory });
            this.editprofileForm.patchValue({ abt: this.edituserobj.freeLanceDetails.abt });
            this.editprofileForm.patchValue({ hourlyRate: this.edituserobj.freeLanceDetails.hourlyRate });
            this.nationalIDURL = this.edituserobj.freeLanceDetails.uploadValidPhotoidImgUrl;
            this.editprofileForm.patchValue({ uploadValidPhotoidImgUrl: this.edituserobj.freeLanceDetails.uploadValidPhotoidImgUrl });
            this.editprofileForm.patchValue({ accountname: this.edituserobj.freeLanceDetails.accountname });
            this.editprofileForm.patchValue({ accountno: this.edituserobj.freeLanceDetails.accountno });
            this.editprofileForm.patchValue({ ifsc: this.edituserobj.freeLanceDetails.ifsc });
          }
        },
        error => {
          this.alertService.error(error);
          this.spinnerService.hide();
        });
    }
  }

  preparetosaveorupdateeditprofile() {
    if (this.userService.currentUserValue.userroles.rolecode === config.user_rolecode_cba.toString() &&
      this.userService.currentUserValue.userbizdetails.biztype === ConfigMsg.biztype_cmp_en) {
      this.isBizNameAlreadyExist(this.editprofileForm.get('bizname').value);
    }
    if (!this.isbiznamexist) {
      this.saveorupdateeditprofile();
    }
  }

  saveorupdateeditprofile() {
    if (this.roleCode === config.user_rolecode_fu.toString()) {
      this.editprofileForm.patchValue({ uploadValidPhotoidImgUrl: this.nationalIDURL });
    }
    if (this.roleCode === config.user_rolecode_fu.toString()) {
      this.editprofileForm.patchValue({ avtarurl: this.avatarURL });
    }
    this.issubmit = true;
    if (this.editprofileForm.invalid) {
      return;
    }
    this.spinnerService.show();
    this.edituserobj.username = this.editprofileForm.get('username').value;
    this.edituserobj.firstname = this.editprofileForm.get('firstname').value;
    this.edituserobj.lastname = this.editprofileForm.get('lastname').value;
    this.edituserobj.preferlang = this.editprofileForm.get('preferlang').value;
    this.edituserobj.phoneno = this.editprofileForm.get('phoneno').value;
    this.edituserobj.userbizdetails.fulladdress = this.searchElementRef.nativeElement.value;
    if (this.shortAddress != null) {
      this.edituserobj.userbizdetails.route = this.route;
      this.edituserobj.userbizdetails.city = this.city;
      this.edituserobj.userbizdetails.state = this.state;
      this.edituserobj.userbizdetails.country = this.country;
      this.edituserobj.userbizdetails.shortaddress = this.shortAddress;
      this.edituserobj.userbizdetails.lat = this.lat;
      this.edituserobj.userbizdetails.lng = this.lng;
    }
    if (this.roleCode === config.user_rolecode_cba.toString() && this.userService.currentUserValue.userbizdetails.biztype === ConfigMsg.biztype_cmp_en) {
      this.edituserobj.userbizdetails.bizname = this.editprofileForm.get('bizname').value;
      this.edituserobj.userbizdetails.biztype = this.editprofileForm.get('biztype').value;
      this.edituserobj.userbizdetails.bizwebsite = this.editprofileForm.get('bizwebsite').value;
      this.edituserobj.userbizdetails.abtbiz = this.editprofileForm.get('abtbiz').value;
      this.edituserobj.userbizdetails.purposeofsignup = this.editprofileForm.get('purposeofsignup').value;
      this.edituserobj.userbizdetails.designation = this.editprofileForm.get('designation').value;
    }
    if (this.roleCode === config.user_rolecode_fu.toString()) {
      this.edituserobj.freeLanceDetails.category = this.editprofileForm.get('category').value;
      this.edituserobj.freeLanceDetails.experienceInField = this.editprofileForm.get('experienceInField').value;
      this.edituserobj.freeLanceDetails.subCategory = this.editprofileForm.get('subCategory').value;
      this.edituserobj.freeLanceDetails.abt = this.editprofileForm.get('abt').value;
      this.edituserobj.freeLanceDetails.hourlyRate = this.editprofileForm.get('hourlyRate').value;
      this.edituserobj.freeLanceDetails.uploadValidPhotoidImgUrl = this.editprofileForm.get('uploadValidPhotoidImgUrl').value;
      this.edituserobj.freeLanceDetails.accountno = this.editprofileForm.get('accountno').value;
      this.edituserobj.freeLanceDetails.accountname = this.editprofileForm.get('accountname').value;
      this.edituserobj.freeLanceDetails.ifsc = this.editprofileForm.get('ifsc').value;
      if (this.edituserobj.freeLanceDetails.experienceInField != null &&
        this.edituserobj.freeLanceDetails.hourlyRate != null &&
        this.edituserobj.freeLanceDetails.uploadValidPhotoidImgUrl != null &&
        this.edituserobj.userbizdetails.fulladdress != null &&
        !this.edituserobj.freeLanceDetails.isprofilecompleted) {
        this.edituserobj.freeLanceDetails.isprofilecompleted = true;
        this.edituserobj.freeLanceDetails.bgcurrentstatus = config.bg_code_completedprofile;
        this.edituserobj.freelancehistoryentity[0].bgstatus = config.bg_code_completedprofile;
      }
      if (this.editprofileForm.get('verfiyaccountno').value.toString() !== this.editprofileForm.get('accountno').value.toString()) {
        this.referService.translatetext(ConfigMsg.profile_msg_7, this.userService.currentUserValue.preferlang).subscribe(
          (trantxt: any) => {
            this.alertService.info(trantxt);
            this.spinnerService.hide();
          },
          error => {
            this.spinnerService.hide();
            this.alertService.error(error);
          }
        );
        return;
      }
      if (this.editprofileForm.get('accountno').value.toString() !== null && this.editprofileForm.get('ifsc').value.toString() != null &&
        this.editprofileForm.get('verfiyaccountno').value.toString() !== null) {
        this.paymentService.verifyAccountPayout(this.editprofileForm.get('accountno').value.toString(), this.editprofileForm.get('ifsc').value.toString()).subscribe(
          (beneficiaryName: string) => {
            if (beneficiaryName.length == 0) {
              this.referService.translatetext(ConfigMsg.profile_msg_1, this.userService.currentUserValue.preferlang).subscribe(
                (trantxt: any) => {
                  this.alertService.info(trantxt);
                  this.spinnerService.hide();
                },
                error => {
                  this.spinnerService.hide();
                  this.alertService.error(error);
                }
              );
              return;
            } else {
              this.paymentService.createBenificiaryPayout(this.userService.currentUserValue.userId, this.editprofileForm.get('accountno').value.toString(), this.editprofileForm.get('ifsc').value.toString(),
                this.editprofileForm.get('accountname').value.toString()).subscribe(
                  (beneficiaryId: string) => {
                    if (beneficiaryId !== null) {
                      this.buildedituserobjtosave(this.edituserobj);
                    }
                  },
                  error => {
                    this.spinnerService.hide();
                    this.alertService.error(error);
                  })
            }
          },
          error => {
            this.spinnerService.hide();
            this.alertService.error(error);
          }
        );
      }
    } else {
      this.buildedituserobjtosave(this.edituserobj);
    }

  }
  private buildedituserobjtosave(edituserobj: any) {
    this.edituserobj = edituserobj;
    if (this.typeavt === config.profiletype_avatar.toString() &&
      this.typenationalid !== config.profiletype_nationalid.toString()) {
      this.msgflag = true;
    } else
      if (this.typeavt !== config.profiletype_avatar.toString() &&
        this.typenationalid === config.profiletype_nationalid.toString()) {
        this.msgflag = true;
      } else
        if (this.typenationalid !== config.profiletype_nationalid.toString() && this.typeavt !== config.profiletype_avatar.toString()) {
          this.msgflag = true;
        }
    if (this.typenationalid !== config.profiletype_nationalid.toString() && this.typeavt !== config.profiletype_avatar.toString()) {
      this.saveorupdateedituser(this.edituserobj);
      if (this.msgflag) {
        this.referService.translatetext(this.edituserobj.firstname + ConfigMsg.profile_msg_2, this.userService.currentUserValue.preferlang).subscribe(
          (trantxt: any) => {
            this.alertService.success(trantxt);
            this.msgflag = false;
            this.spinnerService.hide();
          },
          error => {
            this.spinnerService.hide();
            this.alertService.error(error);
          }
        );
      }
    } else
      if (this.typeavt === config.profiletype_avatar.toString()) {
        this.utilService.uploadAvatarsInS3(this.avatarURL, this.editprofileuserId, this.filename).subscribe(
          (returnURL: string) => {
            this.edituserobj.avtarurl = returnURL;
            this.saveorupdateedituser(this.edituserobj);
            if (this.msgflag) {
              this.referService.translatetext(this.edituserobj.firstname + ConfigMsg.profile_msg_2, this.userService.currentUserValue.preferlang).subscribe(
                (trantxt: any) => {
                  this.alertService.success(trantxt);
                  this.msgflag = false;
                  this.typeavt = null;
                  this.spinnerService.hide();
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
          })
      }
    if (this.typenationalid === config.profiletype_nationalid.toString()) {
      this.utilService.uploadBgDocsInS3(this.nationalIDURL, this.editprofileuserId, this.filename).subscribe(
        (returnURL: string) => {
          if (this.typenationalid === config.profiletype_nationalid.toString()
            && this.typeavt === config.profiletype_avatar.toString()) {
            this.msgflagboth = true;
          }
          this.edituserobj.freeLanceDetails.uploadValidPhotoidImgUrl = returnURL;
          this.saveorupdateedituser(this.edituserobj);
          if (this.msgflag) {
            this.referService.translatetext(this.edituserobj.firstname + ConfigMsg.profile_msg_2, this.userService.currentUserValue.preferlang).subscribe(
              (trantxt: any) => {
                this.alertService.success(trantxt);
                this.msgflag = false;
                this.typenationalid = null;
                this.spinnerService.hide();
              },
              error => {
                this.spinnerService.hide();
                this.alertService.error(error);
              }
            );
          }
          if (this.msgflagboth) {
            this.referService.translatetext(this.edituserobj.firstname + ConfigMsg.profile_msg_2, this.userService.currentUserValue.preferlang).subscribe(
              (trantxt: any) => {
                this.alertService.success(trantxt);
                this.msgflagboth = false;
                this.typenationalid = null;
                this.typeavt = null;
                this.spinnerService.hide();
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
  private saveorupdateedituser(edituserobj: User) {
    this.userService.saveorupdate(edituserobj).subscribe(
      (userObj: any) => {
        this.usrObj = this.userAdapter.adapt(userObj);
        if (this.userService.currentUserValue.userId === this.usrObj.userId) {
          this.userService.currentUserValue.avtarurl = this.usrObj.avtarurl;
          this.userService.currentUserValue.fullname = this.usrObj.fullname;
          this.userService.currentUserValue.preferlang = this.usrObj.preferlang;
          this.userService.currentUserValue.phoneno = this.usrObj.phoneno;
          this.userService.currentUserValue.userbizdetails.fulladdress = this.usrObj.userbizdetails.fulladdress;
          this.userService.currentUserValue.userbizdetails.lat = this.usrObj.userbizdetails.lat;
          this.userService.currentUserValue.userbizdetails.lng = this.usrObj.userbizdetails.lng;
          this.userService.currentUserValue.userbizdetails.city = this.usrObj.userbizdetails.city;
          this.userService.currentUserValue.userbizdetails.shortaddress = this.usrObj.userbizdetails.shortaddress;
          this.userService.currentUserValue.userbizdetails.bizname = this.usrObj.userbizdetails.bizname;
        }
        this.edituserobj = userObj;
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });

  }

  uploadFile(event, type) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    let fileSize = event.target.files[0].size;
    if (fileSize < 2000000) {
      if (file.type === config.imgtype_png.toString() ||
        file.type === config.imgtype_jpeg.toString() ||
        file.type === config.imgtype_jpg.toString()) {
        if (event.target.files && event.target.files[0]) {
          reader.readAsDataURL(file);
          // When file uploads set it to file formcontrol
          reader.onload = () => {
            this.filename = file.name;
            if (type === config.profiletype_avatar.toString()) {
              this.typeavt = type;
              this.avatarURL = reader.result;
            }
            if (type === config.profiletype_nationalid.toString()) {
              this.typenationalid = type;
              this.nationalIDURL = reader.result;
            }
            this.spinnerService.show();
            this.spinnerService.hide();
          };
          // ChangeDetectorRef since file is loading outside the zone
          this.cd.markForCheck();
        }
      } else {
        this.referService.translatetext(ConfigMsg.profile_msg_3, this.userService.currentUserValue.preferlang).subscribe(
          (trantxt: any) => {
            this.alertService.info(trantxt);
          },
          error => {
            this.spinnerService.hide();
            this.alertService.error(error);
          }
        );
      }
    } else {
      this.referService.translatetext(ConfigMsg.profile_msg_4, this.userService.currentUserValue.preferlang).subscribe(
        (trantxt: any) => {
          this.alertService.info(trantxt);
        },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        }
      );
    }
  }

  isBizNameAlreadyExist(bizname: string) {
    this.isbiznamexist = false;
    if (this.allUserCBAList != null && bizname != null) {
      this.allUserCBAList.forEach(element => {
        if (element.userbizdetails.bizname === bizname &&
          element.userId !== this.userService.currentUserValue.userId) {
          this.alertService.info(ConfigMsg.profile_cba_msg_1);
          this.isbiznamexist = true;
        }
      });
    }
  }

  get p() {
    return this.pwdForm.controls;
  }
  pwdFormValidation() {
    this.pwdForm = this.formBuilder.group({
      newpassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}$/)]],
      verifypassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}$/)]],
    });
  }
  savePwdDetails() {
    this.ispwdsubmit = true;
    if (this.pwdForm.invalid) {
      return;
    }
    if (this.pwdForm.get('newpassword').value !== this.pwdForm.get('verifypassword').value) {
      this.referService.translatetext(ConfigMsg.profile_msg_5, this.userService.currentUserValue.preferlang).subscribe(
        (trantxt: any) => {
          this.alertService.info(trantxt);
          this.spinnerService.hide();
        },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        }
      );
    } else {
      this.spinnerService.show();
      this.usrObj = this.userAdapter.adapt(this.userService.currentUserValue);
      this.usrObj.password = this.pwdForm.get('newpassword').value;
      this.usrObj.isrecoverypwd = true;
      this.userService.saveorupdate(this.usrObj).subscribe(
        (userObj: any) => {
          this.referService.translatetext(ConfigMsg.profile_msg_6, this.userService.currentUserValue.preferlang).subscribe(
            (trantxt: any) => {
              this.alertService.success(trantxt);
              this.spinnerService.hide();
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
  }
}

