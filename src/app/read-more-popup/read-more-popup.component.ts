import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-read-more-popup',
  templateUrl: './read-more-popup.component.html',
  styleUrls: ['./read-more-popup.component.scss']
})
export class ReadMorePopupComponent implements OnInit {

  @Input() content: string;
  @Input() headerlabel: string;
  @Input() contentList: any;
  @Input() notificationEnable: boolean;

  constructor(
    public modalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

}
