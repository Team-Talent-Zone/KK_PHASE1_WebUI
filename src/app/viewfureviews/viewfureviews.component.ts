import { Component, OnInit } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { FreelanceserviceService } from '../AppRestCall/freelanceservice/freelanceservice.service';
import { ReferenceService } from '../AppRestCall/reference/reference.service';
import { UserService } from '../AppRestCall/user/user.service';
import { config } from 'src/app/appconstants/config';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-viewfureviews',
  templateUrl: './viewfureviews.component.html',
  styleUrls: ['./viewfureviews.component.scss']
})
export class ViewfureviewsComponent implements OnInit {

  fureviews: any;
  fureviewsempty: boolean = false;

  constructor(
    private freelanceserviceService: FreelanceserviceService,
    private userService: UserService,
    private spinnerService: Ng4LoadingSpinnerService,
    private alertService: AlertsService,
    private referService: ReferenceService,
    public datepipe: DatePipe,
  ) { }

  ngOnInit() {
    this.getFUFeebackDetailsByUserId();
  }

  getFUFeebackDetailsByUserId() {
    this.fureviews = [];
    this.spinnerService.show();
    this.freelanceserviceService.getFUFeebackDetailsByUserId(this.userService.currentUserValue.userId).subscribe(
      (reviews: any) => {
        if (reviews != null) {
          reviews.forEach((element: any) => {
            element.starrate = Array(element.starrate);
            if (this.userService.currentUserValue.preferlang === config.lang_code_te || this.userService.currentUserValue.preferlang === config.lang_code_hi) {
              this.referService.translatetext(element.feedbackcomment, this.userService.currentUserValue.preferlang).subscribe(
                (txt: string) => {
                  element.feedbackcomment = txt;
                }
              );
              this.referService.translatetext(element.fullname, this.userService.currentUserValue.preferlang).subscribe(
                (txt: string) => {
                  element.fullname = txt;
                }
              );
              this.referService.translatetext(element.feedbackby, this.userService.currentUserValue.preferlang).subscribe(
                (txt: string) => {
                  element.feedbackby = txt;
                }
              );
              this.referService.translatetext(element.label, this.userService.currentUserValue.preferlang).subscribe(
                (txt: string) => {
                  element.label = txt;
                }
              );
              this.fureviews.push(element);
              this.spinnerService.hide();
            } else {
              this.fureviews.push(element);
              this.spinnerService.hide();
            }
          });
        } else {
          this.fureviewsempty = true;
        }
      },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }
}
