import { SignupComponent } from './../signup/signup.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { config } from '../appconstants/config';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(
    private signupComponent: SignupComponent,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    if (localStorage.getItem('langCode') === null) {
      localStorage.setItem('langCode', config.default_prefer_lang);
      localStorage.setItem('langLabel', config.lang_english_word);
    }
    this.signupComponent.getTermsofServicesAndPrivacyPolicyURLByLang(localStorage.getItem('langCode'));
  }

}
