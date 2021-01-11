import { Router, ActivatedRoute } from '@angular/router';
import { SignupComponent } from './../signup/signup.component';
import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';
import { config } from 'src/app/appconstants/config';

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
    public translate: TranslateService) {
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
