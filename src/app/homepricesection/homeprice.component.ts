import { ActivatedRoute } from '@angular/router';
import { NewServiceAdapter } from './../adapters/newserviceadapter';
import { NewsvcService } from './../AppRestCall/newsvc/newsvc.service';
import { Component, OnInit } from '@angular/core';
import { DashboardofcbaComponent } from '../dashboardofcba/dashboardofcba.component';
import { ManageserviceComponent } from '../manageservice/manageservice.component';
import { config } from 'src/app/appconstants/config';
import { SignupComponent } from '../signup/signup.component';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { ReferenceService } from '../AppRestCall/reference/reference.service';
import { ReadMorePopupComponent } from '../read-more-popup/read-more-popup.component';


@Component({
  selector: 'app-homeprice',
  templateUrl: './homeprice.component.html',
  styleUrls: ['./homeprice.component.css']
})
export class HomepriceComponent implements OnInit {
  modalRef: BsModalRef;
  listofAllIndividualServices: any = [];
  listofAllPackageServices: any = [];
  config: ModalOptions = {
    class: 'modal-md', backdrop: 'static',
    keyboard: false
  };
  listOfAllApprovedNewServices: any = [];
  contentMore = false;
  priceMore = false;
  priceMore1 = false;
  countoffullcontent : number ;
  constructor(
    private newsvcservice: NewsvcService,
    private route: ActivatedRoute,
    private newsvcadapter: NewServiceAdapter,
    public dashboardofcbaobj: DashboardofcbaComponent,
    private modalService: BsModalService,
    public manageserviceComponent: ManageserviceComponent,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    private referService: ReferenceService,
  ) {
  }

  viewMore() {
    this.contentMore = true;
  }

  viewLess() {
    this.contentMore = false;
  }

  pricemore() {
    this.priceMore = true;
  }

  priceless() {
    this.priceMore = false;
  }

  pricemore1() {
    this.priceMore1 = true;
  }

  priceless1() {
    this.priceMore1 = false;
  }

  ngOnInit() {
    setTimeout(() => {
      this.getAllNewServiceDetails();
    }, 2000);
  }

  getAllNewServiceDetails() {
    this.listOfAllApprovedNewServices = [];
    this.newsvcservice.getAllNewServiceDetails().subscribe(
      (allNewServiceObjs: any) => {
        if (allNewServiceObjs != null) {
          allNewServiceObjs.forEach(element => {
            if (localStorage.getItem('langCode') === config.lang_code_hi || localStorage.getItem('langCode') === config.lang_code_te) {
              this.referService.translatetext(element.name, localStorage.getItem('langCode')).subscribe(
                (txt: string) => {
                  element.name = txt;
                }
              );
              this.referService.translatetext(element.description, localStorage.getItem('langCode')).subscribe(
                (txt: string) => {
                  element.description = txt;
                }
              );
              this.referService.translatetext(element.validPeriodLabel, localStorage.getItem('langCode')).subscribe(
                (txt: string) => {
                  element.validPeriodLabel = txt;
                }
              );
              var array = element.fullcontent.split(',');
              // tslint:disable-next-line: no-shadowed-variable
              this.referService.translatetext(array, localStorage.getItem('langCode')).subscribe(
                (txt: string) => {
                  element.fullcontent = txt;
                  var arry = element.fullcontent.split(',');
                  element.fullcontent = arry;
                }
              );
              this.listOfAllApprovedNewServices.push(element);
            } else {
              var array = element.fullcontent.split(',');
              element.fullcontent = array;
              this.listOfAllApprovedNewServices.push(element);
            }
            if (this.listOfAllApprovedNewServices != null) {
              this.divideByIndOrPackageService();
            }
          });
        }
        this.spinnerService.hide();
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  divideByIndOrPackageService() {
    this.listofAllIndividualServices = [];
    this.listofAllPackageServices = [];
    this.listOfAllApprovedNewServices.forEach(element => {
      if (element.packwithotherourserviceid === null) {
        this.listofAllIndividualServices.push(element);
      } else {
        this.listofAllPackageServices.push(element);
      }
    });
  }
  // tslint:disable-next-line: max-line-length
  openSignupModal(ourserviceid: number, packwithotherourserviceid: number, amount: string, validPeriodLabel: string, validPeriodCode: string, serviceendon: string, servicestarton: string) {
    // tslint:disable-next-line: max-line-length
    var ourserviceidList = [{ ourserviceid, packwithotherourserviceid, amount, validPeriodLabel, validPeriodCode, serviceendon, servicestarton }];
    const initialState = {
      key: config.shortkey_role_cba,
      ourserviceids: ourserviceidList,
      langcode: localStorage.getItem('langCode')
    };
    this.modalRef = this.modalService.show(SignupComponent, Object.assign(
      {},
      this.config,
      {
        initialState
      }
    ));
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
