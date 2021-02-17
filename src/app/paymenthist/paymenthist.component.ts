import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../AppRestCall/payment/payment.service';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { UserService } from '../AppRestCall/user/user.service';
import { config } from '../appconstants/config';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-paymenthist',
  templateUrl: './paymenthist.component.html',
  styleUrls: ['./paymenthist.component.css']
})
export class PaymenthistComponent implements OnInit {

  fupaymenthistorydetails: any = [];
  cbapaymenthistorydetails: any = [];
  txnid: string;
  paymentdetails: any;
  ispaymentdetailCBUempty: boolean = false;
  ispaymentdetailFUempty: boolean = false;

  constructor(
    public userService: UserService,
    private route: ActivatedRoute,
    public paymentService: PaymentService,
    public alertService: AlertsService,
    public spinnerService: Ng4LoadingSpinnerService,
    public datepipe: DatePipe,
  ) {
    route.params.subscribe(params => {
      this.txnid = params.txnid;
    });
  }

  ngOnInit() {
    if (this.txnid != null) {
      this.getPaymentDetailsByTxnId(this.txnid);
    } else
      if (this.userService.currentUserValue.userroles.rolecode === config.user_rolecode_fu.toString()) {
        this.getPaymentFUDetailsByUserId(this.userService.currentUserValue.userId);
      } else
        if (this.userService.currentUserValue.userroles.rolecode === config.user_rolecode_cba.toString()) {
          this.getPaymentCBADetailsByUserId(this.userService.currentUserValue.userId);
        }
  }

  getPaymentDetailsByTxnId(txnid: string) {
    this.paymentdetails = null;
    this.spinnerService.show();
    this.paymentService.getPaymentDetailsByTxnId(txnid).subscribe((paymentobj: any) => {
      this.paymentdetails = paymentobj;
      this.spinnerService.hide();
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  getPaymentFUDetailsByUserId(userId: number) {
    this.fupaymenthistorydetails = [];
    this.spinnerService.show();
    this.paymentService.getPaymentFUDetailsByUserId(userId).subscribe((fupaymentobjlist: any) => {
      if (fupaymentobjlist != null) {
        fupaymentobjlist.forEach(element => {
          if (element.status != null) {
            this.fupaymenthistorydetails.push(element);
          }
        });
      } else {
        this.ispaymentdetailFUempty = true;
      }
      this.spinnerService.hide();
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }

  getPaymentCBADetailsByUserId(userId: number) {
    this.cbapaymenthistorydetails = [];
    this.spinnerService.show();
    this.paymentService.getPaymentCBADetailsByUserId(userId).subscribe((cbupaymentobjlist: any) => {
      if (cbupaymentobjlist != null) {
        cbupaymentobjlist.forEach(element => {
          if (element.status != null) {
            this.cbapaymenthistorydetails.push(element);
          }
        });
        this.spinnerService.hide();
      } else {
        this.ispaymentdetailCBUempty = true;
      }
    },
      error => {
        this.spinnerService.hide();
        this.alertService.error(error);
      });
  }
}
