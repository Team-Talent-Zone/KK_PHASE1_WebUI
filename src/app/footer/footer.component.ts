import { UserService } from './../AppRestCall/user/user.service';
import { SignupComponent } from './../signup/signup.component';
import { Component, OnInit } from '@angular/core';
import { config } from '../appconstants/config';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

   constructor(
    private signupComponent: SignupComponent,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    if (this.userService.currentUserValue != null) {
      this.signupComponent.getTermsofServicesAndPrivacyPolicyURLByLang(this.userService.currentUserValue.preferlang);
     } else {
      if (localStorage.getItem('langCode') === null) {
        localStorage.setItem('langCode', config.default_prefer_lang);
        localStorage.setItem('langLabel', config.lang_english_word);
      }
      this.signupComponent.getTermsofServicesAndPrivacyPolicyURLByLang(localStorage.getItem('langCode'));
    }
  }
}
