import { Router, ActivatedRoute } from '@angular/router';
import { SignupComponent } from './../signup/signup.component';
import { Component, OnInit,HostListener } from '@angular/core';
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
  langSelected = config.lang_english_word;
  name: string;
  langcode: string;
  config: ModalOptions = {
    class: 'modal-md', backdrop: 'static',
    keyboard: false
  };

  Removeclass(){
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
    route.params.subscribe(params => {
      this.name = params.name;
    });
    translate.addLangs([config.lang_english_word.toString(), config.lang_telugu_word.toString(), config.lang_hindi_word.toString()]);
    translate.setDefaultLang(config.lang_english_word.toString());
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/English|తెలుగు|हिंदी/) ? browserLang : config.lang_english_word.toString());
  }

  onWindowScroll(e) {
    let element = document.querySelector('.navbar');
    if (window.pageYOffset > element.clientHeight) {
      element.classList.add('navbar-inverse');
    } else {
      element.classList.remove('navbar-inverse');
    }
    console.log('test  navbar',element)
  }

  ngOnInit() {
    if (this.name != null) {
      this.translate.use(this.name);
      this.langSelected = this.name;
    }
  }

  translateToLanguage(langSelect: string) {
    this.langSelected = langSelect;
    this.translate.use(this.langSelected);
    this.router.navigateByUrl('home/', { skipLocationChange: true }).
      then(() => {
        this.router.navigate(['region/' + this.langSelected]);
      });
  }
  openSignupModalButton(){
    document.getElementById('clickModal').click();
  }
  openSignupModal(shortkey: string) {
    document.getElementById('clickModalClose').click();
    if (this.langSelected === config.lang_hindi_word.toString()) {
      this.langcode = config.lang_code_hi.toString();
    }
    if (this.langSelected === config.lang_telugu_word.toString()) {
      this.langcode = config.lang_code_te.toString();
    }
    if (this.langSelected === config.lang_english_word.toString()) {
      this.langcode = config.default_prefer_lang.toString();
    }
    const initialState = {
      key: shortkey,
      langcode: this.langcode
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
