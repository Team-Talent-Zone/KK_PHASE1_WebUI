import { Router, ActivatedRoute } from '@angular/router';
import { SignupComponent } from './../signup/signup.component';
import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';
import { config } from 'src/app/appconstants/config';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ReferenceService } from '../AppRestCall/reference/reference.service';
import { AlertsService } from '../AppRestCall/alerts/alerts.service';
import { AnimationStyleMetadata } from '@angular/animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
@HostListener('window:scroll', ['$event'])
export class HeaderComponent implements OnInit {

  modalRef: BsModalRef;
  shortkey: string;
  config: ModalOptions = {
    class: 'modal-md', backdrop: 'static',
    keyboard: false
  };
  ban1videoURL: string;
  ban2videoURL: string;
  shortkeyvideo1: string;
  shortkeyvideo2: string;

  Removeclass() {
    // var body = document.body;
    // body.classList.remove("sidebar-open");
    var element = document.getElementById("navBtn");
    element.classList.add("collapsed");
    var element12 = document.getElementById("navbarNav");
    element12.classList.remove("show");

  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    public translate: TranslateService,
    private spinnerService: Ng4LoadingSpinnerService,
    private referService: ReferenceService,
    private alertService: AlertsService
  ) {
    translate.addLangs(['en-English', 'te-తెలుగు', 'hi-हिंदी']);
    translate.setDefaultLang('en-English');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en-English|te-తెలుగు|hi-हिंदी/) ? browserLang : 'en-English');
  }

  onWindowScroll(e) {
    let element = document.querySelector('.navbar');
    if (window.pageYOffset > element.clientHeight) {
      element.classList.add('navbar-inverse');
    } else {
      element.classList.remove('navbar-inverse');
    }
  }

  ngOnInit() {
    this.translate.use(localStorage.getItem('langLabel'));
    this.loadBannerVideoByLangSelected();
  }

  translateToLanguage(langSelect: string) {
    this.translate.use(langSelect);
    if (langSelect === config.lang_hindi_word.toString()) {
      localStorage.setItem('langCode', config.lang_code_hi);
      localStorage.setItem('langLabel', langSelect);
    } else
      if (langSelect === config.lang_telugu_word.toString()) {
        localStorage.setItem('langCode', config.lang_code_te);
        localStorage.setItem('langLabel', langSelect);
      } else {
        localStorage.setItem('langCode', config.default_prefer_lang);
        localStorage.setItem('langLabel', langSelect);
      }
    this.router.navigateByUrl('home', { skipLocationChange: true }).
      then(() => {
        this.router.navigate(['region', { hash: langSelect }]);
      });
  }

  loadBannerVideoByLangSelected() {
    this.shortkeyvideo1 = null;
    this.shortkeyvideo2 = null;
    this.ban1videoURL = null;
    this.ban2videoURL = null;
    if (localStorage.getItem('langCode') == config.lang_code_te) {
      this.shortkeyvideo1 = config.banner_video1_te;
      this.shortkeyvideo2 = config.banner_video2_te;
    } else if (localStorage.getItem('langCode') == config.lang_code_hi) {
      this.shortkeyvideo1 = config.banner_video1_hi;
      this.shortkeyvideo2 = config.banner_video2_hi;
    } else {
      this.shortkeyvideo1 = config.banner_video1_en;
      this.shortkeyvideo2 = config.banner_video2_en;
    }
    this.spinnerService.show();
    setTimeout(() => {
      this.referService.getLookupTemplateEntityByShortkey(this.shortkeyvideo1).subscribe(
        (videourl: any) => {
          this.ban1videoURL = videourl.url;
          this.spinnerService.hide();
        },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        });
      this.referService.getLookupTemplateEntityByShortkey(this.shortkeyvideo2).subscribe(
        (videourl: any) => {
          this.ban2videoURL = videourl.url;
          this.spinnerService.hide();
        },
        error => {
          this.spinnerService.hide();
          this.alertService.error(error);
        });
    }, 2000);

    console.log('this is ban1videoURL', this.ban1videoURL);
    console.log('this is ban2videoURL', this.ban2videoURL);
  }
  openSignupModalButton() {
    document.getElementById('clickModal').click();
  }
  openSignupModal(shortkey: string) {
    document.getElementById('clickModalClose').click();
    const initialState = {
      key: shortkey,
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

}
