import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as panzoom from 'src/assets/js/imageZoom.js';
@Component({
  selector: 'app-zoomable-video',
  templateUrl: './zoomable-video.component.html',
  styleUrls: ['./zoomable-video.component.css']
})
export class ZoomableVideoComponent implements OnInit, OnChanges {
  @Input() uuid: string = '';
  @Input() url: string = '';
  zoom: any;
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.uuid && this.url) {
      this.initiateZoom();
    }
  }

  ngOnInit(): void {
  }


  initiateZoom() {
    setTimeout(() => {
      this.zoom = panzoom(document.getElementById('player' + this.uuid), {
        minZoom: 1,
        maxZoom: 10,
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
