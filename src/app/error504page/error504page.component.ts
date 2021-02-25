import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../AppRestCall/user/user.service';

@Component({
  selector: 'app-error504page',
  templateUrl: './error504page.component.html',
  styleUrls: ['./error504page.component.css']
})
export class Error504pageComponent implements OnInit {
  id: number;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    ) {
    route.params.subscribe(params => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    this.userService.logout();
  }

}
