import { Component, OnDestroy, OnInit } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
declare var $: any;

import { CommonService } from 'src/shared/services/common.service';
import { Message, ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';


@Component({
  selector: 'app-modal-pdf-viewer',
  templateUrl: './modal-pdf-viewer.component.html',
  styleUrls: ['./modal-pdf-viewer.component.scss']
})
export class ModalPdfViewerComponent implements OnInit {

  name: string = '';
  url: any = '';
  msg: string = '';

  constructor(private service: ModalPdfViewerService,private commonService: CommonService,private snackbarService: SnackbarService,) {
    pdfDefaultOptions.assetsFolder = 'ngx-extended-pdf-viewer';

  }

  ngOnInit(): void {
    this.service.events.subscribe((message: Message) => {
      this.name = message.name;
      this.url = message.url;
      if (this.url && this.url.length > 0) {
        $('#modalPdfViewer').modal('show');
      }else{
        $('#modalPdfViewer').modal('hide');
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
