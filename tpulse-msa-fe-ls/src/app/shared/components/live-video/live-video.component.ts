import { Component, Input, OnInit } from '@angular/core';

declare var $: any;
import Hls from 'hls.js';


@Component({
  selector: 'app-live-video',
  templateUrl: './live-video.component.html',
  styleUrls: ['./live-video.component.scss']
})


export class LiveVideoComponent implements OnInit {

  @Input() video: any;
  @Input() selectedVideoId: any;
  hls: any;
  @Input() mode:any;
  constructor() { }

  ngOnInit() {
   
  }

  ngOnChanges() {
    if (this.video.live_url && this.video.live_url.includes('.m3u8')) {
      setTimeout(() => {
        var video: any = document?.getElementById(this.video.id);
        this.hls = new Hls();
        // bind them together
        this.hls.attachMedia(video);
        this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          this.hls.loadSource(this.video.live_url);
        });
        // this.hls.on(Hls.Events.)
        if (this.selectedVideoId == true) {
          video.play();
        } else {
          video.pause();
        }

      }, 500);
    }
  }

  returnLiveVideoUrl(video) {
    // const iframe = document.getElementById(video.id);
    // iframe.requestFullscreen();
    var url = video.live_url + "&allowFullscreen=true" 
    return url;
  }

  ngOnDestroy() {
    this.video = null;
    this.hls && this.hls.destroy();
  }


}
