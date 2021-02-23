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
import { ReferenceAdapter } from '../adapters/referenceadapter';
import { map } from 'rxjs/internal/operators/map';
import { LoginComponent } from '../login/login.component';
import { CommonUtility } from '../adapters/commonutility';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
@HostListener('window:scroll', ['$event'])
export class HeaderComponent implements OnInit {

  modalRef: BsModalRef;
  shortkey: string;

  ban1videoURL: string;
  ban2videoURL: string;
  shortkeyvideo1: string;
  shortkeyvideo2: string;
  list: any = [];

  Removeclass() {
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
    private alertService: AlertsService,
    private refAdapter: ReferenceAdapter,
    public commonlogic: CommonUtility
  ) {
    translate.addLangs(['English', 'తెలుగు', 'हिंदी']);
    translate.setDefaultLang('English');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/English|తెలుగు|हिंदी/) ? browserLang : 'English');
    this.getAllAvailableFUSkills();
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
    this.commonlogic.setLangCode(langSelect);
    this.router.navigateByUrl('home', { skipLocationChange: false }).
      then(() => {
        this.router.navigate(['_region', { hash: langSelect }]);
      });
  }

  setBannerVideoByLang() {
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
  }
  loadBannerVideoByLangSelected() {
    this.shortkeyvideo1 = null;
    this.shortkeyvideo2 = null;
    this.ban1videoURL = null;
    this.ban2videoURL = null;
    this.setBannerVideoByLang();
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
      this.commonlogic.configmd,
      {
        initialState
      }
    ));
  }

  openLoginModal() {
    const initialState = null;
    this.modalRef = this.modalService.show(LoginComponent, Object.assign(
      {},
      this.commonlogic.configmd,
      {
        initialState
      }
    ));
  }

  getAllAvailableFUSkills() {
    this.list = [];
    this.referService.getReferenceLookupByKey(config.key_domain.toString()).pipe(map((data: any[]) =>
      data.map(item => this.refAdapter.adapt(item))),
    ).subscribe(
      data => {
        data.forEach(element => {
          if (element.code !== config.domain_code_SE_P) {
            element.referencelookupmapping.forEach(elementlookupmapping => {
              elementlookupmapping.referencelookupmappingsubcategories.forEach(element => {
                if (localStorage.getItem('langCode') == config.lang_code_hi || localStorage.getItem('langCode') == config.lang_code_te) {
                  this.referService.translatetext(element.label, localStorage.getItem('langCode')).subscribe(
                    (trantxt: any) => {
                      element.label = trantxt;
                      this.list.push(element);;
                    },
                    error => {
                      this.spinnerService.hide();
                      this.alertService.error(error);
                    }
                  );
                }
                else {
                  this.list.push(element);
                }
              });
            })
          }
        })
      });
  }

}
