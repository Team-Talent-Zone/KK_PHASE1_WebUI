import { ReferenceService } from './../AppRestCall/reference/reference.service';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from './../AppRestCall/alerts/alerts.service';
import { FreelanceserviceService } from './../AppRestCall/freelanceservice/freelanceservice.service';
import { Component, OnInit } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { config } from 'src/app/appconstants/config';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ReadMorePopupComponent } from '../read-more-popup/read-more-popup.component';

@Component({
  selector: 'app-hometestimonials',
  templateUrl: './hometestimonials.component.html',
  styleUrls: ['./hometestimonials.component.css']
})
export class HometestimonialsComponent implements OnInit {

  listofTestimonals: any;
  startindex: number = 0;
  endindex: number = 3;
  modalRef: BsModalRef;
  config: ModalOptions = {
    class: 'modal-md', backdrop: 'static',
    keyboard: false
  };
  constructor(
    public freelanceserviceService: FreelanceserviceService,
    private alertService: AlertsService,
    private spinnerService: Ng4LoadingSpinnerService,
    private route: ActivatedRoute,
    private referService: ReferenceService,
    private modalService: BsModalService,
  ) {
  }

  ngOnInit() {
    this.getFUFeebackDetails();
  }
  getFUFeebackDetails() {
    this.spinnerService.show();
    this.listofTestimonals = [];
    this.freelanceserviceService.getFUFeebackDetails().subscribe((list: any) => {
      if (list != null) {
        list.forEach((element: any) => {
          element.starrate = Array(element.starrate);
          if (localStorage.getItem('langCode') === config.lang_code_te || localStorage.getItem('langCode') === config.lang_code_hi) {
            this.referService.translatetext(element.feedbackcomment, localStorage.getItem('langCode')).subscribe(
              (txt: string) => {
                element.feedbackcomment = txt;
              }
            );
            this.referService.translatetext(element.fullname, localStorage.getItem('langCode')).subscribe(
              (txt: string) => {
                element.fullname = txt;
              }
            );
            this.referService.translatetext(element.feedbackby, localStorage.getItem('langCode')).subscribe(
              (txt: string) => {
                element.feedbackby = txt;
              }
            );
            this.referService.translatetext(element.label, localStorage.getItem('langCode')).subscribe(
              (txt: string) => {
                element.label = txt;
              }
            );
            this.listofTestimonals.push(element);
          } else {
            this.listofTestimonals.push(element);
          }
        });
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }
  onTogglePrev() {
    if (this.startindex == 0) {
      this.onToggleNext();
    } else {
      this.endindex = this.startindex;
      this.startindex = this.endindex - 3;
    }
  }
  onToggleNext() {
    if (this.listofTestimonals.length == this.endindex) {
      this.onTogglePrev();
    } else {
      this.startindex = this.endindex;
      this.endindex = this.endindex + 2
    }
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
