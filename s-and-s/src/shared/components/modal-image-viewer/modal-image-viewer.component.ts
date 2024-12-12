///////////////////////////////////////////////////////////////////////////////
// Filename : modal-pdf-viewer.component.ts
// Description : Shared component that open PDF in a modal which can be used across the application
// Revision History: 
// Version  | Date        |  Change Description
// ---------------------------------------------
// 1.0      | 01-Jul-2019 |  Single Unit First Production Release
// 2.0      | 31-Jul-2019 |  Single Unit Second Production Release
// 3.0      | 01-Nov-2019 |  Multi Unit Production Release
// 4.0      | 06-Jan-2020 |  Release for Copyright
// Copyright : Detect Technologies Pvt Ltd.
///////////////////////////////////////////////////////////////////////////////

import { Component, OnInit } from '@angular/core';
declare var $: any;

import { ModalImageViewerService, Message } from './services/modal-image-viewer.service';

@Component({
  selector: 'app-modal-image-viewer',
  templateUrl: './modal-image-viewer.component.html',
  styleUrls: ['./modal-image-viewer.component.css']
})
export class ModalImageViewerComponent implements OnInit {

  name: string = '';
  url: string = '';

  constructor(private service: ModalImageViewerService) {
  }

  ngOnInit() {
    this.service.events.subscribe((message: Message) => {
      this.name = message.name;
      this.url = message.url;
      if (this.url.length > 0) {
        $('#modalImageViewer').modal('show');
      }
    });
  }

}
