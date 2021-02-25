import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import { CommonUtility } from '../adapters/commonutility';
import { config } from '../appconstants/config';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { FreelanceserviceService } from '../AppRestCall/freelanceservice/freelanceservice.service';
import { ViewjobbyjobidPopupComponent } from '../viewjobbyjobid-popup/viewjobbyjobid-popup.component';

@Component({
  selector: 'app-viewfujobdetails',
  templateUrl: './viewfujobdetails.component.html',
  styleUrls: ['./viewfujobdetails.component.css']
})
export class ViewfujobdetailsComponent implements OnInit {

  userId: number;
  listofalljobs: any;
  role: string;
  isemptyjobs: boolean = false;
  modalRef: BsModalRef;

  constructor(
    private route: ActivatedRoute,
    private freelanceserviceService: FreelanceserviceService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    private modalService: BsModalService,
    public commonlogic: CommonUtility
  ) {
    route.params.subscribe(params => {
      this.userId = params.id;
      this.role = params.role
    });
  }

  ngOnInit() {
    this.getUserAllJobDetailsById();
  }

  getUserAllJobDetailsById() {
    this.isemptyjobs = false;
    this.listofalljobs = []
    if (this.role.toString() == config.shortkey_role_fu) {
      this.freelanceserviceService.getUserAllJobDetailsByFreelancerId(this.userId).subscribe((jobdetailsList: any) => {
        if (jobdetailsList != null) {
          this.listofalljobs = jobdetailsList;
        }
      },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        })
      setTimeout(() => {
        if (this.listofalljobs.length == 0) {
          this.isemptyjobs = true;
        }
      }, 500);

    }
    if (this.role.toString() == config.shortkey_role_cba) {
      this.freelanceserviceService.getUserAllJobDetailsByUserId(this.userId).subscribe((jobdetailsList: any) => {
        if (jobdetailsList != null) {
          this.listofalljobs = jobdetailsList;
        }
      },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        })
      setTimeout(() => {
        if (this.listofalljobs.length == 0) {
          this.isemptyjobs = true;
        }
      }, 400);
    }
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
}