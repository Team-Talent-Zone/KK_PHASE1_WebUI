import { NewService } from './../appmodels/NewService';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-viewnewsevicedetails',
  templateUrl: './viewnewsevicedetails.component.html',
  styleUrls: ['./viewnewsevicedetails.component.css']
})
export class ViewnewsevicedetailsComponent implements OnInit {

  newserviceobj: NewService;
  constructor(public modalRef: BsModalRef,
  ) { }

  ngOnInit() {
    console.log('newserviceobj', this.newserviceobj);
  }

}
