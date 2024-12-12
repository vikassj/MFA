import { Component, OnInit } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
declare var $: any;

import { ModalPdfViewerService, Message } from '../../services/modal-pdf-viewer.service';

@Component({
  selector: 'app-modal-pdf-viewer',
  templateUrl: './modal-pdf-viewer.component.html',
  styleUrls: ['./modal-pdf-viewer.component.scss']
})
export class ModalPdfViewerComponent implements OnInit {

  name:any = '';
  url: any = '';

  constructor(private service: ModalPdfViewerService) {
    pdfDefaultOptions.assetsFolder = 'ngx-extended-pdf-viewer';

  }

  ngOnInit() {
    console.log("hello")
    this.service.events.subscribe((message: Message) => {
      this.name = message.name;
      this.url = message.url;
      if (this.url && this.url.length > 0) {
        $('#modalPdfViewer').modal('show');
      }
    });
  }

}
