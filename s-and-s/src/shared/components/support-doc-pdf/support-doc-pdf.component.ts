import { Component, OnInit } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
declare var $: any;

import { CommonService } from 'src/shared/services/common.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SupportDocPdfViewerService, Message } from 'src/shared/services/support-doc-pdf-viewer.service';

@Component({
  selector: 'app-support-doc-pdf',
  templateUrl: './support-doc-pdf.component.html',
  styleUrls: ['./support-doc-pdf.component.css']
})
export class SupportDocPdfComponent implements OnInit {

  name: string = '';
  url: any = '';
  msg: string = '';
  viewer = false

  constructor(private service: SupportDocPdfViewerService,private commonService: CommonService,private snackbarService: SnackbarService,) {
    pdfDefaultOptions.assetsFolder = 'ngx-extended-pdf-viewer';

  }

  ngOnInit() {
    this.service.events.subscribe((message: Message) => {
      this.name = message.name;
      this.url = message.url;
      if (this.url && this.url.length > 0) {
        this.viewer = true
      }
    });
  }

  /**
   * download images.
   */
  downloadImg(imageUrl) {
      this.commonService.fetchImageData(imageUrl).subscribe(
        imageData => {
          let a: any = document.createElement('a');
          a.href = URL.createObjectURL(imageData);
          let imageName = imageUrl.split('/')
          a.download = imageName[imageName.length - 1];
          document.body.appendChild(a);
          a.click();
        },
        error => {
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        }
      )
  }

}
