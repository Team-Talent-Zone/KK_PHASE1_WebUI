import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { FreelanceserviceService } from '../AppRestCall/freelanceservice/freelanceservice.service';

@Component({
  selector: 'app-viewjobbyjobid-popup',
  templateUrl: './viewjobbyjobid-popup.component.html',
  styleUrls: ['./viewjobbyjobid-popup.component.css']
})
export class ViewjobbyjobidPopupComponent implements OnInit {

  @Input()  jobId: number;
  jobdetails:any;

  constructor(
    private route: ActivatedRoute,
    private freelanceserviceService : FreelanceserviceService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    public modalRef: BsModalRef,
  ) { }

  ngOnInit() {
    this.getAllFreelanceOnServiceDetailsByJobId();
  }

  getAllFreelanceOnServiceDetailsByJobId(){
    this.freelanceserviceService.getAllFreelanceOnServiceDetailsByJobId(this.jobId).subscribe((jobdata: any) =>
    {
    if(jobdata != null){
      this.jobdetails = jobdata;
    }
    },
    error => {
      this.spinnerService.hide();
      this.alertService.error(error);
    })
  }
}
