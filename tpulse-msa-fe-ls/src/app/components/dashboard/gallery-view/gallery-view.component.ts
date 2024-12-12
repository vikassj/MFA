import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { LiveStreamingCommonService } from '../../../shared/services/common.service';

import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { LiveStreamingDataService } from '../../../shared/services/data.service';
import { DateFormatPipe } from 'src/app/shared/pipes/date-format.pipe';

@Component({
  selector: 'app-gallery-view',
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.scss'],
  providers:[DateFormatPipe]
})

export class GalleryViewComponent implements OnInit {

  @Input() selectedLocation: any;
  @Input() isGalleryView: boolean;
  @Input() searchValue: string;
  @Input() selectedVideos: [];
  @Input() selectedType: any;
  @Input() isPermitEnabled:boolean = false;
  @Output() videoStopStream:EventEmitter<any> = new EventEmitter();
  @Output() emitGalleryMode:EventEmitter<boolean> = new EventEmitter();

  liveStreamData: any = [];
  liveStreamLocationData: any = [];
  galleryLength:number= 100;
  noOfRows:number = 10;
  activePage: number = 1;
  startWith: number;
  noTempOfRows: number;
  galleryData: any;
  tempgalleryData: { [x: string]: unknown }[];
  msg: string = '';
  liveStreamingFilters: any;
  videoData: any[] = [];
  subscription: Subscription = new Subscription();
  boxes: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2];
  pages = [];
  videosPerPage = 12;
  currentPage = 0;
  emptyArray = [];
  refreshInterval: any;

  filteredLiveStreamData: any = [];
  selectedVideoData: any = [];

  dataLoaded: boolean = false;
  streamAccess: any = [];
  mode:boolean;

  constructor(private spinnerDataService:LiveStreamingDataService, private liveStreamingCommonService: LiveStreamingCommonService, private liveStreamingDataService: LiveStreamingDataService, private snackbarService: SnackbarService) {
  }

  ngOnInit(): void {
   
  }

  ngOnChanges(changes) {
    if(JSON.parse(sessionStorage.getItem('mode')) == null){
      this.emitGalleryMode.emit(null)
      this.mode = JSON.parse(sessionStorage.getItem('mode'))
    }
    else{
    let selectedVideos:any = JSON.parse(sessionStorage.getItem('selectedVideos'))
    if(this.selectedVideos.length < 1 && this.isGalleryView){
      this.selectedVideos = selectedVideos
      this.emitGalleryMode.emit(false)
      this.mode = JSON.parse(sessionStorage.getItem('mode'))
    }
     this.mode = JSON.parse(sessionStorage.getItem('mode'))
   }
    sessionStorage.setItem('selectedVideos',JSON.stringify(this.selectedVideos))
    // console.log('selectedVideos',this.selectedVideos)
    let isSelectedVideos = changes['selectedVideos'] && changes['selectedVideos'].currentValue != changes['selectedVideos'].previousValue;
    if(this.isGalleryView || isSelectedVideos) {
      // this.selectedVideos.sort((id1, id2)=>{
      //   return id1['id'] - id2['id']
      // })
      // this.dataService.passSpinnerFlag(true, true);
      // this.getLiveStreamingData();
      this.setFilteredVideo();
    } else {
      // this.spinnerDataService.passSpinnerFlag(false, true);
    }
    let accessible_plants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    let selectedPlantId = JSON.parse(sessionStorage.getItem("selectedPlant"));
    this.streamAccess = [];
    accessible_plants?.forEach(ele =>{
      if(ele.id == selectedPlantId){
        this.streamAccess = ele.access_type;
      }
    })
  }

  getLiveStreamingData() {
    this.liveStreamingCommonService.fetchLiveStreamingLocationData().subscribe((data: any) => {
        this.liveStreamData = data;
        for (var i = 0; i < this.liveStreamData.length; i++) {
          this.liveStreamLocationData[i] = data[i]["location"]
        }
        setTimeout(() => {
          this.spinnerDataService.passSpinnerFlag(false, true);
        }, 500);
      },
        (err) => {
          //Handle error callback.
          this.spinnerDataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          //Subscribe method on complete callback.
          this.dataLoaded = true;
          this.setFilteredVideo();
        })
  }

  createPagination() {
    const length = this.videoData.length;
    this.pages = [];
    var noOfPages = 1;
    if (length > 0) {
      noOfPages = Math.ceil(length / this.videosPerPage);
    }
    for (var i = 0; i < noOfPages; i++) {
      this.pages.push(this.videoData.slice(i * this.videosPerPage, i * this.videosPerPage + this.videosPerPage));
    }
    this.emptyArray = new Array(12 - this.pages[this.currentPage].length);
  }

  selectPage(page) {
    this.currentPage = page;
    this.emptyArray = new Array(12 - this.pages[page].length);
  }

  setFilteredVideo() {
    this.dataLoaded = true;
    // this.filteredLiveStreamData = this.liveStreamData.filter(video => video.location.name == this.selectedLocation)
    let currentVideos = JSON.parse(sessionStorage.getItem('restoreSelectedVideos'))
    if(currentVideos?.length > 0){
      this.filteredLiveStreamData = currentVideos;
    }
    else{
      this.filteredLiveStreamData = this.selectedVideos;
    }
    // this.filteredLiveStreamData.forEach((element, i) => {
    //   let selectedId = this.selectedVideosId.findIndex(data =>{return data.id == element.id});
    //   if(selectedId >= 0){
    //     this.filteredLiveStreamData[i].check = true;
    //   }else{
    //     this.filteredLiveStreamData[i].check = false;
    //   }
    // });
    this.selectedVideoData = this.filteredLiveStreamData[0];
  }

  // Stop the stream camera.
  stopVideo(video){
    this.spinnerDataService.passSpinnerFlag(true, true);
    this.liveStreamingCommonService.updateCamera(video.id, true).subscribe(data => {
      this.videoStopStream.emit(Math.random())
      this.spinnerDataService.passSpinnerFlag(false, true);
    },
      error => {
        this.spinnerDataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.selectedVideos.forEach((val:any,index) =>{
          if(val?.id == video?.id ){
            this.selectedVideos.splice(index,index+1)
          }
        } )
        sessionStorage.setItem('currentVideos',JSON.stringify(this.selectedVideos))
      }
    )
  }

  ngOnDestroy() {
    this.pages = [];
    clearInterval(this.refreshInterval);
    this.subscription.unsubscribe();
    this.liveStreamingDataService.passLiveStreamingFilters('', '', false);
  }

}
