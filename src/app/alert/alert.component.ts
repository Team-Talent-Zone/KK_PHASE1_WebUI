import { ReferenceService } from './../AppRestCall/reference/reference.service';
import { Component, TemplateRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { ConfigMsg } from '../appconstants/configmsg';
import { config } from '../appconstants/config';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  public modalRef: BsModalRef;
  @ViewChild('template', null) modalTemplate: TemplateRef<any>;

  private subscription: Subscription;
  message: any;
  config: ModalOptions = { class: 'modal-md' };
  errorCallCount: number = 0;
  errormsg: string;
  loginfailedmsg: string;
  activateLink = false;

  constructor(
    private alertService: AlertsService,
    private modalService: BsModalService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.subscription = this.alertService.getMessage()
      .subscribe(message => {
        switch (message && message.type) {
          case 'success':
            message.cssClass = 'alert alert-success';
            break;
          case 'error':
            message.cssClass = 'alert alert-danger';
            break;
          case 'info':
            message.cssClass = 'alert alert-info';
            break;
          case 'warning':
            message.cssClass = 'alert alert-warning';
            break;
        }
        this.message = message;
        if (this.message != null) {
          this.openModal(this.modalTemplate);
        }
      });
  }

  openModal(template: TemplateRef<any>) {
    if (this.message.type == 'warning') {
      document.getElementById('demo').innerHTML = 'hello';
      this.modalRef = this.modalService.show(template, this.config);
    } else {
      if (this.message.type === 'error') {
        if (Number.parseInt(this.message.text.status) != 401) {
          this.router.navigate(['_error', this.message.text.status]);
        } else {
          if (Number.parseInt(this.message.text.status) === 401) {
            if (localStorage.getItem('langCode') === config.lang_code_hi) {
              this.loginfailedmsg = ConfigMsg.invalid_username_password_hi;
            } else
              if (localStorage.getItem('langCode') === config.lang_code_te) {
                this.loginfailedmsg = ConfigMsg.invalid_username_password_te;
              } else {
                this.loginfailedmsg = ConfigMsg.invalid_username_password;
              }
            this.errormsg = this.loginfailedmsg;
            this.modalRef = this.modalService.show(template, this.config);
          } else {
            if (this.errorCallCount === 0 && this.errormsg != null) {
              this.modalRef = this.modalService.show(template, this.config);
              this.errorCallCount = this.errorCallCount + 1;
            } else {
              this.modalRef = this.modalService.show(template, this.config);
            }
          }
        }
      } else {
        this.errormsg = this.message.text;
        this.modalRef = this.modalService.show(template, this.config);
      }
    }

  }
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
 
}
