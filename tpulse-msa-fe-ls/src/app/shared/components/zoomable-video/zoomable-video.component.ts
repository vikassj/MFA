import { Component, Input, OnInit } from '@angular/core';

import * as panzoom from '../../../../assets/js/imageZoom.js';

@Component({
  selector: 'app-zoomable-video',
  templateUrl: './zoomable-video.component.html',
  styleUrls: ['./zoomable-video.component.scss']
})
export class ZoomableVideoComponent implements OnInit {
  @Input() uuid: string = '';
  @Input() url: string = '';
  zoom: any;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.uuid && this.url) {
      this.initiateZoom();
    }
  }

  initiateZoom() {
    setTimeout(() => {
      this.zoom = panzoom(document.getElementById('player' + this.uuid), {
        minZoom: 1,
        smoothScroll: false,
        zoomDoubleClickSpeed: 1,
        bounds: true,
        boundsPadding: 1.0
      });
    }, 50);
  }

  resetZoom() {
    this.zoom.reset();
  }

}
