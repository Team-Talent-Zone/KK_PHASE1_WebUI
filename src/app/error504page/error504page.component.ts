import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../AppRestCall/user/user.service';
import { config } from '../appconstants/config';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-error504page',
  templateUrl: './error504page.component.html',
  styleUrls: ['./error504page.component.css']
})
export class Error504pageComponent implements OnInit {
  id: number;
  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private userService: UserService,
    ) {
    route.params.subscribe(params => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    if (localStorage.getItem('langCode') === null) {
      localStorage.setItem('langCode', config.lang_code_en);
      localStorage.setItem('langLabel', config.lang_english_word);
    }
    this.translate.use(localStorage.getItem('langLabel'));
    this.userService.logout();
  }

}
