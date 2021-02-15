import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error504page',
  templateUrl: './error504page.component.html',
  styleUrls: ['./error504page.component.css']
})
export class Error504pageComponent implements OnInit {
  id: number;
  constructor(
    private route: ActivatedRoute,
    ) {
    route.params.subscribe(params => {
      this.id = params.id;
    });
  }

  ngOnInit() {
  }

}
