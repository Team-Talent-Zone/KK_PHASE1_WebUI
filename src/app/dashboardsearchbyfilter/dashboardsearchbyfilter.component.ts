import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { UserService } from '../AppRestCall/user/user.service';
import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { config } from '../appconstants/config';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { UserAdapter } from '../adapters/useradapter';
import { MouseEvent } from '@agm/core';
import { UsersrvdetailsService } from '../AppRestCall/userservice/usersrvdetails.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FreelanceserviceService } from '../AppRestCall/freelanceservice/freelanceservice.service';
import { ReferenceService } from '../AppRestCall/reference/reference.service';
import { ApiService, Maps } from '../adapters/api.service';
import { ManageuserComponent } from '../manageuser/manageuser.component';
import { SignupComponent } from '../signup/signup.component';
import { ConfigMsg } from '../appconstants/configmsg';
import { CommonUtility } from '../adapters/commonutility';

@Component({
  selector: 'app-dashboardsearchbyfilter',
  templateUrl: './dashboardsearchbyfilter.component.html',
  styleUrls: ['./dashboardsearchbyfilter.component.css']
})
export class DashboardsearchbyfilterComponent implements OnInit {

  @ViewChild('search', null)
  public searchElementRef: ElementRef;

  minstartDate = new Date();
  maxstartDate = new Date();
  startdate: Date;
  issearchbydate = false;
  markPoints: any;
  fulladdress: string;
  isfreelancerservicesubscribed = false;
  diffMs: any;
  actDate: any;
  purchaseDate: any;
  maxHours = 0;
  code: string;
  name: string;
  userFUObjList: any = [];
  timelaps = false;
  iscreatejobdiv = false;
  // google maps zoom level
  zoom: number = 11;
  markers: marker[] = [];
  enddatevalue: string;
  listofhourlyRateDetailsoffus: any = [];
  avgHourlyRate: number;
  createjobform: FormGroup;
  searchform: FormGroup;
  issubmit = false;
  serviceId: number;
  route: string;
  city: string = null;
  state: string;
  country: string;
  shortAddress: string;
  lat: number;
  lng: number;
  cityElementOne: string;
  cityElementTwo: string;
  totalhoursofjob: number;

  maxHourlyRateCal: number;

  bufferhours: number = 0;
  increaseminpercentage: number = 0.2;
  increasemaxpercentage: number = 0.2;

  constructor(
    private routeA: ActivatedRoute,
    public userService: UserService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    private userAdapter: UserAdapter,
    private usersrvDetails: UsersrvdetailsService,
    private formBuilder: FormBuilder,
    private freelanceserviceService: FreelanceserviceService,
    private referService: ReferenceService,
    private router: Router,
    private ngZone: NgZone,
    public apiService: ApiService,
    public manageuserComponent: ManageuserComponent,
    public signupComponent: SignupComponent,
    public commonlogic: CommonUtility,
  ) {
    setTimeout(() => {
      this.apiService.api.then(maps => {
        this.initAutocomplete(maps);
      });
    }, 2000);
    routeA.params.subscribe(params => {
      this.code = params.code;
      this.name = params.name;
    });
  }

  mapClicked($event: MouseEvent) {
    this.markers.push({
      lat: $event.coords.lat,
      lng: $event.coords.lng,
      draggable: true
    });
  }

  ngOnInit() {
    this.minstartDate = this.setDefaultTimeForStartDate(new Date(this.minstartDate.getTime() + (12 * 60 * 60 * 1000)));
    this.maxstartDate = this.setDefaultTimeForEndDate(new Date(this.maxstartDate.getTime() + (240 * 60 * 60 * 1000)));
    this.isfreelancerservicesubscribed = false;
    this.searchResults(null);
    this.createFormValidation();
    this.searchFormValidation();
  }
  searchFormValidation() {
    this.searchform = this.formBuilder.group({
      startdate: ['', [Validators.required]],
      fulladdress: ['', [Validators.required]],
    });
  }
  createFormValidation() {
    this.createjobform = this.formBuilder.group({
      totalhoursofjob: ['', [Validators.required, Validators.min(1), Validators.maxLength(2), Validators.pattern('^[0-9]*$')]],
      jobendedon: [''],
      jobstartedon: [''],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      jobdescription: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9.,/\n]+[a-zA-Z0-9.,/\n ]+')]],
      joblocation: ['', [Validators.required]],
      userId: this.userService.currentUserValue.userId,
      subcategory: this.code,
      updatedby: this.userService.currentUserValue.fullname,
      serviceId: [''],
      status: [''],
      route: [''],
      city: [''],
      state: [''],
      country: [''],
      lat: [''],
      lng: [''],
      acceptjobterms: [false, [Validators.requiredTrue]]
    });
  }

  initAutocomplete(maps: Maps) {
    let autocomplete = new maps.places.Autocomplete(this.searchElementRef.nativeElement);
    autocomplete.addListener(config.keygmap_1, () => {
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
  preparetosavefreelanceonservice() {
    this.issubmit = true;
    if (this.createjobform.invalid) {
      return;
    }
    if (this.createjobform.get('amount').value >= this.avgHourlyRate) {
      this.spinnerService.show();
      this.referService.getReferenceLookupByShortKey(config.fu_job_created_shortkey.toString()).subscribe(
        refCode => {
          this.createjobform.patchValue({ status: refCode });
          if (this.shortAddress !== null) {
            this.createjobform.patchValue({ route: this.route });
            this.createjobform.patchValue({ city: this.city });
            this.createjobform.patchValue({ state: this.state });
            this.createjobform.patchValue({ country: this.country });
            this.createjobform.patchValue({ lat: this.lat });
            this.createjobform.patchValue({ lng: this.lng });
          }
          this.freelanceserviceService.saveFreelancerOnService(this.createjobform.value).subscribe((obj: any) => {
            if (obj.jobId > 0) {
              this.spinnerService.hide();
              this.router.navigate(['/_job']);
              this.alertService.success(ConfigMsg.job_assign_msg_1 + obj.jobId + ConfigMsg.search_job_msg_1);
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
    } else {
      this.alertService.info(ConfigMsg.search_job_msg_2 + this.avgHourlyRate);
    }

  }

  openCreateJobInterface() {
    this.usersrvDetails.getAllUserServiceDetailsByUserId(this.userService.currentUserValue.userId).subscribe(
      (listofusersrvDetails: any) => {
        if (listofusersrvDetails != null) {
          listofusersrvDetails.forEach((element: any) => {
            if (element.category.toString() === config.category_code_FS_S.toString() && element.isservicepurchased) {
              this.isfreelancerservicesubscribed = true;
              this.createjobform.patchValue({ serviceId: element.serviceId });
            }
          });
          this.createjobform.patchValue({ jobstartedon: this.getDateTimeFormat(this.startdate) });
        }
        if (this.userService.currentUserValue.phoneno === null) {
          this.alertService.info(ConfigMsg.search_job_msg_3 + this.name + ConfigMsg.search_job_msg_4);
        } else
          if (this.isfreelancerservicesubscribed) {
            this.iscreatejobdiv = true;
          }
          else {
            if (!this.isfreelancerservicesubscribed) {
              var atag = document.createElement('a');
              atag.href = "/_dashboard";
              atag.innerText = ConfigMsg.search_job_msg_6;
              let errorMsg = ConfigMsg.search_job_msg_5 + this.name + atag;
              var str = (<HTMLAnchorElement>atag);
              //this.alertService.warning(str);
              this.alertService.info(ConfigMsg.search_job_msg_5 + this.name + ConfigMsg.search_job_msg_6);
            }
          }
      },
      error => {
        this.alertService.error(error);
        this.spinnerService.hide();
      });
  }


  backToSearch() {
    this.iscreatejobdiv = false;
    this.issearchbydate = false;
    this.createjobform.patchValue({ totalhoursofjob: null });
    this.createjobform.patchValue({ amount: null });
    this.createjobform.patchValue({ jobendedon: null });
    this.avgHourlyRate = null;
    this.maxHourlyRateCal = null;
    setTimeout(() => {
      this.apiService.api.then(maps => {
        this.initAutocomplete(maps);
      });
    }, 2000);
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

  get f() {
    return this.createjobform.controls;
  }
  get s() {

    return this.searchform.controls;
  }


  addHoursToJobStartDateAndMinMaxAmount(event: any) {
    var hours = event.target.value;
    if (hours > 0) {
      this.totalhoursofjob = hours;
      this.enddatevalue = this.commonlogic.buildEndDateOfJob(hours, this.startdate);
      this.listofhourlyRateDetailsoffus = [];
      if (this.userFUObjList != null) {
        this.userFUObjList.forEach(element => {
          this.listofhourlyRateDetailsoffus.push(element.hourlyRate);
        });
        var maxAmt = Math.max.apply(null, this.listofhourlyRateDetailsoffus);
        var minAmt = Math.min.apply(null, this.listofhourlyRateDetailsoffus);
        var maxHourlyRate = maxAmt * hours;
        var minHourlyRate = minAmt * hours;

        /**
         * Increasing 20% more to avghourly to built the min rate
         */

        let increasedminrate = (minHourlyRate) * (this.increaseminpercentage);
        this.avgHourlyRate = (minHourlyRate) + increasedminrate;
        //this.avgHourlyRate = minHourlyRate;

        /**
         * Increasing 20% more to avghourly to built the max rate
         */
        let increasedmaxrate = (maxHourlyRate) * (this.increasemaxpercentage);
        this.maxHourlyRateCal = (maxHourlyRate) + increasedmaxrate;

        this.createjobform.patchValue({ jobendedon: this.enddatevalue });
      }
    } else {
      this.enddatevalue = null;
    }
  }



  getDateTimeFormat(dt: Date) {
    var date = new Date(dt);
    var year = date.getFullYear();
    var tempmonth = date.getMonth() + 1; //getMonth is zero based;
    var tempday = date.getDate();
    var hr = date.getHours();
    var tempmin = date.getMinutes();
    var month = tempmonth > 10 ? tempmonth : '0' + tempmonth;
    var day = tempday > 10 ? tempday : '0' + tempday;
    var min = tempmin > 10 ? tempmin : '0' + tempmin;
    var formatted = year + '-' + month + '-' + day + ' ' + hr + ':' + min;
    return formatted;
  }
  getHours(dt: Date) {
    var date = new Date(dt);
    return date.getHours();
  }
  /* Search Functionality is below */
  searchByFilterFreelancer() {
    this.issubmit = true;
    if (this.searchform.invalid) {
      return;
    }
    if (this.getHours(this.searchform.get('startdate').value) >= 17 || this.getHours(this.searchform.get('startdate').value) < 10) {
      this.alertService.info(ConfigMsg.job_startdate_msg);
      return;
    }
    this.createjobform.patchValue({ joblocation: this.searchElementRef.nativeElement.value });
    this.searchform.patchValue({ fulladdress: this.searchElementRef.nativeElement.value });
    this.iscreatejobdiv = false;
    this.timelaps = false;
    this.enddatevalue = null;
    this.searchResults(this.searchform.get('startdate').value);
    this.startdate = this.searchform.get('startdate').value;
  }
  searchResults(startdate: Date) {
    this.issearchbydate = false;
    this.timelaps = false;
    this.markPoints = [];
    this.markers = [];
    this.userFUObjList = [];
    if (this.userService.currentUserValue.userroles.rolecode !== config.user_rolecode_fu.toString()) {
      if (startdate === null) {
        this.spinnerService.show();
        this.userService.getUserDetailsByJobAvailable().subscribe(
          (userObjList: any) => {
            if (userObjList !== null) {
              setTimeout(() => {
                userObjList.forEach(element => {
                  this.setuserObjList(element);
                });
                if (this.userFUObjList != null) {
                  if (this.userFUObjList.length > 0) {
                    this.timelaps = true;
                  }
                } else {
                  this.timelaps = false;
                }
                this.spinnerService.hide();
              }, 1000);
            }
          },
          error => {
            this.spinnerService.hide();
            this.alertService.error(error);
          });
      } else {
        this.spinnerService.show();
        let sdate = this.getDateTimeFormat(startdate);
        this.userService.getUserDetailsByJobAvailableByCreateOn(sdate, this.code).subscribe(
          (userObjList: any) => {
            if (userObjList !== null) {
              setTimeout(() => {
                userObjList.forEach(element => {
                  if (this.city !== null) {
                    if (element.city === this.city) {
                      this.setuserObjList(element);
                    }
                  }
                });
                this.timelaps = true;
                this.issearchbydate = true;
                this.spinnerService.hide();
              }, 1000);
            } else {
              this.issearchbydate = true;
              this.spinnerService.hide();
              this.timelaps = true;
            }
          },
          error => {
            this.spinnerService.hide();
            this.alertService.error(error);
          });
      }
    }
  }
  setuserObjList(element: any) {
    if (element.subCategory === this.code) {
      if (element.starRate != null) {
        element.starRate = Array(element.starRate);
      }
      this.userFUObjList.push(element);
      this.markPoints = {
        lat: element.lat,
        lng: element.lng,
        label: element.fullname,
        draggable: false,
        shortaddress: element.shortaddress,
        abt: element.abt,
        avtarurl: element.avtarurl
      };
      this.markers.push(this.markPoints);
    }
  }
}

// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
