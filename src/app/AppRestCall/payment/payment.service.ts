import { Payment } from './../../appmodels/Payment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PayoutVerifyAccount } from 'src/app/appmodels/PayoutVerifyAccount';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  payment: PayoutVerifyAccount

  constructor(
    private http: HttpClient,
  ) { }

  savePayments(payment: Payment) {
    return this.http.post(`${environment.apiUrl}/savePayments/`, payment);
  }

  getPaymentDetailsByTxnId(txnid: string) {
    return this.http.get(`${environment.apiUrl}/getPaymentDetailsByTxnId/` + txnid + '/');
  }

  getPaymentFUDetailsByUserId(userId: number) {
    return this.http.get(`${environment.apiUrl}/getPaymentFUDetailsByUserId/` + userId + '/');
  }

  getPaymentCBADetailsByUserId(userId: number) {
    return this.http.get(`${environment.apiUrl}/getPaymentCBADetailsByUserId/` + userId + '/');
  }

  verifyAccountPayout(accountNumber: string, ifscCode: string) {
    this.payment = new PayoutVerifyAccount();
    this.payment.accountnumber = accountNumber;
    this.payment.ifsccode = ifscCode;
    return this.http.post(`${environment.apiUrl}/verifyAccountPayout/`, this.payment);
  }

  createBenificiaryPayout(userId: number, accountNumber: string, ifscCode: string, accountname: string) {
    this.payment = new PayoutVerifyAccount();
    this.payment.userid = userId;
    this.payment.accountnumber = accountNumber;
    this.payment.ifsccode = ifscCode;
    this.payment.accountname = accountname;
    return this.http.post(`${environment.apiUrl}/createBenificiaryPayout/`, this.payment);
  }
}
