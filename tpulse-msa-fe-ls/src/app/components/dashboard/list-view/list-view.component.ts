import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { LiveStreamingDataService } from '../../../shared/services/data.service';
import { LiveStreamingCommonService } from '../../../shared/services/common.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DateFormatPipe } from 'src/app/shared/pipes/date-format.pipe';
import { FilterComponent } from 'src/app/shared/components/filter/filter.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  providers: [DateFormatPipe],
})
export class ListViewComponent implements OnInit, OnChanges {
  private apiCallSubject = new Subject<any>();
  @Input() selectedLocation: any;
  @Input() isNotListView: boolean;
  @Input() selectedType: any;
  @Input() videoStopStreamUpdated: any;
  @Output() selectedVidoes: EventEmitter<any> = new EventEmitter();
  @Output() selectedTypeData: EventEmitter<any> = new EventEmitter();
  subscription: Subscription = new Subscription();

  msg: string = '';
  images: any = [1, 2, 3, 4];
  selectedImgCount: any = [];
  totalCount: any = 0;
  checks = false;
  liveStreamData: any = [];
  filteredLiveStreamData: any = [];
  liveStreamLocationData: any = [];
  selectedVideoData: any = [];
  dataLoaded: boolean = false;
  checkedAll: boolean = false;
  noData: boolean = false;
  searchValue: any = '';
  selectedVideosId = [];

  numberOfVideos: any;

  listViewDisplay = true;
  largeViewDisplay = true;
  hasShareAccess: boolean = false;
  shareShows: boolean = false;
  appUserList: any = [];
  sendObservationData: any = {
    imageData: null,
    emailID: '',
    emailIDList: [],
  };
  arrayLenght: number = 0;
  noOfRows: number = 10;
  activePage: number = 1;
  startWith: number;
  noTempOfRows: number;
  @Input() isPermitEnabled: boolean = false;
  filterData: any;
  offset: any;

  cdWebSocket: WebSocket;
  lsWebSocket: WebSocket;
  streamAccess: any = [];
  restoreSelectedVideos:any[] = []
  constructor(
    private filterComponent: FilterComponent,
    private spinnerDataService: LiveStreamingDataService,
    private liveStreamingCommonService: LiveStreamingCommonService,
    private snackbarService: SnackbarService,
    private liveStreamingDataService: LiveStreamingDataService
  ) {
    this.apiCallSubject.pipe(debounceTime(500)).subscribe((response) => {
      let restorePageNumber = JSON.parse(sessionStorage.getItem('restorePageNumber'))
      this.startWith = 0;
      if(restorePageNumber){
        this.changePage(restorePageNumber);
      }
      else{
        this.changePage(1);
      }
    });
    this.subscription.add(this.liveStreamingDataService.getSelectedFilterData.subscribe((res: any) => {
          let streaming = sessionStorage.getItem('searchStreaming');
          if (streaming) {
            let navigationData = JSON.parse(streaming);
            res.units = [navigationData.unit];
            res.zones = [navigationData.zone];
            if(Array.isArray(navigationData?.camera_name)){
              res.camera_name = navigationData.camera_name;
            }
            else{
              res.camera_name = [navigationData.camera_name];
            }
            this.filterData = res;
          }
          else{
            this.filterData = res;
          }
          this.totalCount = 0;
          this.checkedAll = false;
          this.selectedVideosId = [];
          this.selectedVidoes.emit(this.selectedVideosId);
          this.apiCallSubject.next();
        }
      )
    );

    window.addEventListener('navigate-to-live', (evt: any) => {
      window.dispatchEvent(
        new CustomEvent('reset-filters', { detail: evt.detail })
      );
    });
  }
 
  ngOnInit(): void {
    let accessible_plants = JSON.parse(
      sessionStorage.getItem('accessible-plants')
    );
    let selectedPlantId = JSON.parse(sessionStorage.getItem('selectedPlant'));
    this.streamAccess = [];
    accessible_plants?.forEach((ele) => {
      if (ele.id == selectedPlantId) {
        this.streamAccess = ele.access_type;
      }
    });
    /* ListView --> isShow = false, GalleryView --> isShow = true.
      isNotListView == false => isShow = false => Current View = List.
      isNotListView == true => isShow = false => Current View = Gallery. */
    let cdUrl =
      JSON.parse(sessionStorage.getItem('application-configuration'))[
        'websocketUrl'
      ] +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/' +
      'central_dashboard/notification/?token=' +
      sessionStorage.getItem('access-token');
    this.cdWebSocket = new WebSocket(cdUrl);
    this.initializeDeviceBatteryPerWS();
    let lsUrl =
      JSON.parse(sessionStorage.getItem('application-configuration'))[
        'websocketUrl'
      ] +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/' +
      'live_streaming/notification/?token=' +
      sessionStorage.getItem('access-token');
    this.lsWebSocket = new WebSocket(lsUrl);
    this.initializeDeviceCameraStatusWS();
    this.getUserApplicationAccessList();
    this.ValidateUserShareAccess();
  }

  ngOnChanges(changes) {
    this.checkedAll = false;
    this.checks = false
    this.filteredLiveStreamData?.forEach((element, i) => {
      this.filteredLiveStreamData[i].check = false;
    });
    this.selectedVideosId = []
    this.setFilteredVideo();
    let isUnitChanged =
      changes['selectedLocation'] &&
      changes['selectedLocation'].currentValue !=
        changes['selectedLocation'].previousValue;
    if (isUnitChanged) {
      this.shareShows = false;
      this.sendObservationData = {
        imageData: null,
        emailID: '',
        emailIDList: [],
      };
    }
    let isVideoStopStreamUpdated =
      changes['videoStopStreamUpdated'] &&
      changes['videoStopStreamUpdated'].currentValue !=
        changes['videoStopStreamUpdated'].previousValue;
    if (isVideoStopStreamUpdated) {
      this.getLiveStreamData(this.filterData);
    }
  }

  // get the All user list
  getUserApplicationAccessList() {
    this.liveStreamingCommonService.getApplicationUserList().subscribe(
      (userList) => {
        this.appUserList = userList;
      },
      (err) => {
        this.spinnerDataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    );
  }

  // Check the logged-in user having share mail access.
  ValidateUserShareAccess() {
    this.liveStreamingCommonService.getUserAccessDetails().subscribe(
      (data) => {
        this.hasShareAccess = false;
        data?.['plant_access'].forEach((plant) => {
          let selectedPlantId = JSON.parse(
            sessionStorage.getItem('selectedPlant')
          );
          if (selectedPlantId == plant.id) {
            plant.application.forEach((app) => {
              if (
                app.key === 'live_streaming' &&
                app.plant_access_type.includes('share_ls')
              ) {
                this.hasShareAccess = true;
              }
            });
          }
        });
      },
      (err) => {
        this.spinnerDataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    );
  }

  // get live stream data.
  getLiveStreamData(filterData) {
    this.spinnerDataService.passSpinnerFlag(true, true);
    this.selectedVideoData = [];
    this.selectedVideosId = [];
    this.filteredLiveStreamData = [];
    this.liveStreamData = [];
    this.checkedAll = false;
    this.arrayLenght = 0;
    const selectedStreamNavigation = JSON.parse(sessionStorage.getItem('selectedStreamNavigation'))
    if(selectedStreamNavigation && selectedStreamNavigation?.module){
      filterData.units = [parseInt(selectedStreamNavigation?.unit_id)]
      filterData.zones = [parseInt(selectedStreamNavigation?.zone_id)]
      filterData.id = parseInt(selectedStreamNavigation?.id)
      filterData.videoType = selectedStreamNavigation.is_live == 'False'?false:true;
    }
    this.liveStreamingCommonService
      .fetchListFeed(
        filterData.id,
        filterData.units,
        filterData.zones,
        filterData.time,
        filterData.source,
        filterData.camera_name,
        filterData.permit_number,
        filterData.type_of_permit,
        filterData.sort,
        filterData.nature_of_work,
        filterData.videoType,
        filterData.startDate,
        filterData.endDate,
        this.startWith,
        this.offset
      ) .subscribe((data: any) => {
          this.arrayLenght = data['pagination']?.total;
          this.liveStreamData = data['list_feed'];
          for (var i = 0; i < this.liveStreamData.length; i++) {
            this.liveStreamLocationData[i] = data['list_feed'][i]['location'];
          }
          this.selectedTypeData.emit(this.liveStreamData);
          this.dataLoaded = true;
          this.setFilteredVideo();
        },
        (err) => {
          //Handle Error Callback.
          this.spinnerDataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          //Subscribe method on complete callback.
          if (
            this.selectedVideoData &&
            this.filteredLiveStreamData.length > 0
          ) {
            this.noData = false;
          } else {
            this.noData = true;
          }
        }
      );
  }

  // we are calling this API every 5min for get the latest data.
  getLiveStreamBatteryData(filterData) {
    const selectedStreamNavigation = JSON.parse(sessionStorage.getItem('selectedStreamNavigation'))
      if(selectedStreamNavigation && selectedStreamNavigation?.module){
        filterData.units = [parseInt(selectedStreamNavigation?.unit_id)]
        filterData.zones = [parseInt(selectedStreamNavigation?.zone_id)]
        filterData.id = parseInt(selectedStreamNavigation?.id)
        filterData.videoType = selectedStreamNavigation.is_live == 'False'?false:true;
      }
    this.liveStreamingCommonService
      .fetchListFeed(
        filterData.id,
        filterData.units,
        filterData.zones,
        filterData.time,
        filterData.source,
        filterData.camera_name,
        filterData.permit_number,
        filterData.type_of_permit,
        filterData.sort,
        filterData.nature_of_work,
        filterData.videoType,
        filterData.startDate,
        filterData.endDate,
        this.startWith,
        this.offset
      )
      .subscribe(
        (data: any) => {
          this.arrayLenght = data['pagination']?.total;
          this.liveStreamData = data['list_feed'];
          for (var i = 0; i < this.liveStreamData.length; i++) {
            this.liveStreamLocationData[i] = data['list_feed'][i]['location'];
          }
          this.filteredLiveStreamData = this.liveStreamData;
          this.filteredLiveStreamData.forEach((element, i) => {
            let selectedId = this.selectedVideosId.findIndex((data) => {
              return data.id == element.id;
            });
            if (selectedId >= 0) {
              this.filteredLiveStreamData[i].check = true;
            } else {
              this.filteredLiveStreamData[i].check = false;
            }
          });
          let filteredLiveStreamIndex = this.filteredLiveStreamData.findIndex(
            (ele) => {
              return ele.id == this.selectedVideoData.id;
            }
          );
          if (filteredLiveStreamIndex >= 0) {
            this.selectedVideoData =
              this.filteredLiveStreamData[filteredLiveStreamIndex];
          } else {
            this.selectedVideoData = this.filteredLiveStreamData[0];
          }
          this.selectedTypeData.emit(this.liveStreamData);
        },
        (err) => {
          //Handle Error Callback.
          this.spinnerDataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          //Subscribe method on complete callback.
        }
      );
  }

  // Selected all videos in list view to show that videos in gallery page.
  bulk(e) {
    this.selectedVideosId = [];
    this.filteredLiveStreamData.forEach((element, i) => {
      this.filteredLiveStreamData[i].check = false;
    });
    if (e.target.checked == true) {
      this.checkedAll = true;
      this.checks = true;

      setTimeout(() => {
        this.filteredLiveStreamData.forEach((element, i) => {
          if (this.selectedVideosId.length >= 30) {
            // if selected videos greater than 30
            this.msg =
              'To avoid performance issues, only upto 30 windows can be viewed at a time';
            this.snackbarService.show(this.msg, false, false, false, true);
          } else {
            // if selected videos less than 30
            this.filteredLiveStreamData[i].check = true;
            this.selectedVideosId.push(element);
          }
        });
        this.totalCount = this.selectedVideosId.length;
        sessionStorage.setItem('mode',JSON.stringify(false))
        sessionStorage.setItem('restoreSelectedVideos',JSON.stringify(this.selectedVideosId))
        let restoreSelectedVideoId = JSON.parse(sessionStorage.getItem('restoreSelectedVideos'))
        if(this.filterData?.videoType){
          this.restoreSelectedVideos = restoreSelectedVideoId?.map(video => video?.id)
          console.log(this.restoreSelectedVideos)
        }
        else{
          this.restoreSelectedVideos = restoreSelectedVideoId?.map(video => video?.video_id)
        }
        console.log(this.restoreSelectedVideos)
        this.selectedVidoes.emit(this.selectedVideosId);
      }, 1);
    } else {
      this.checkedAll = false;
      this.checks = false;
      this.totalCount = 0;
      this.selectedVideosId = [];
      this.filteredLiveStreamData.forEach((element, i) => {
        this.filteredLiveStreamData[i].check = false;
      });
      sessionStorage.setItem('restoreSelectedVideos',JSON.stringify(this.selectedVideosId))
      let restoreSelectedVideoId = JSON.parse(sessionStorage.getItem('restoreSelectedVideos'))
      if(this.filterData?.videoType){
        this.restoreSelectedVideos = restoreSelectedVideoId?.map(video =>{return video?.id})
      }
      else{
        this.restoreSelectedVideos = restoreSelectedVideoId?.map(video =>{return video?.video_id})
      }
      console.log(this.restoreSelectedVideos)
      this.selectedVidoes.emit(this.selectedVideosId);
    }
  }

  // Select what are all videos need to show in gallery page.
  selectImg(e: any, video) {
    let restoreSelectedVideos = JSON.parse(sessionStorage.getItem('restoreSelectedVideos'))
    if(restoreSelectedVideos){
      this.selectedVideosId = [];
      this.selectedVideosId = restoreSelectedVideos;
    }
    else{
      this.selectedVideosId = [];
    }
    //e.preventDefault used to prevent the user from selecting anymore videos.
    var thirtySelected = this.selectedVideosId.length >= 30 ? true : false;
    // this.checkedAll = this.selectedVideosId.length  === 30 ? true:false ;
    if (this.checkedAll == false && e.target.checked == true) {
      if (thirtySelected) {
        // if selected videos greater than 30
        e.target.checked = false;
        e.preventDefault();
        this.msg =
          'To avoid performance issues, only upto 30 windows can be viewed at a time';
        this.snackbarService.show(this.msg, false, false, false, true);
      } else {
        // if selected videos less than 30
        var totalVideos: any =
          this.filteredLiveStreamData.length >= 30
            ? 30
            : this.filteredLiveStreamData.length;
        if (this.totalCount + 1 == totalVideos) {
          this.checkedAll = true;
          this.filteredLiveStreamData.forEach((element, i) => {
            if (i < totalVideos) {
              this.filteredLiveStreamData[i].check = true;
            }
          });
        }
        this.selectedVideosId.push(video);
        this.totalCount += 1;
      }
    } else if (this.checkedAll == false && e.target.checked == false) {
      if (thirtySelected) {
        // if selected videos greater than 30
        e.target.checked = false;
        e.preventDefault();
        this.msg =
          'To avoid performance issues, only upto 30 windows can be viewed at a time';
        this.snackbarService.show(this.msg, false, false, false, true);
      } else {
        this.totalCount -= 1;
        let selectedVideo = this.selectedVideosId.findIndex((data) => {
          return data.id == video.id;
        });
        this.selectedVideosId.splice(selectedVideo, 1);
        this.checkedAll = false;
      }
    } else if (this.checkedAll == true && e.target.checked == true) {
      if (thirtySelected) {
        // if selected videos greater than 30
        e.target.checked = false;
        e.preventDefault();
        this.msg =
          'To avoid performance issues, only upto 30 windows can be viewed at a time';
        this.snackbarService.show(this.msg, false, false, false, true);
      } else {
        let selectedVideo = this.selectedVideosId.findIndex((data) => {
          return data.id == video.id;
        });
        this.selectedVideosId.splice(selectedVideo, 1);
        this.totalCount -= 1;
        this.checkedAll = false;
      }
    } else if (this.checkedAll == true && e.target.checked == false) {
      let selectedVideo = this.selectedVideosId.findIndex((data) => {
        return data.id == video.id;
      });
      this.selectedVideosId.splice(selectedVideo, 1);
      this.totalCount -= 1;
      this.checkedAll = false;
    }
    // this.filteredLiveStreamData = this.filteredLiveStreamData;

    // if(e.target.checked){
    //   this.selectedVideosId.push(video);
    //   let selectedVideo = this.selectedVideosId.findIndex(data =>{return data.id == video.id});
    //   if(this.selectedVideosId.length == this.numberOfVideos) {
    //     this.checkedAll = true;
    //   }
    //   this.filteredLiveStreamData[selectedVideo].check = true;
    // }else{
    //   let selectedVideo = this.selectedVideosId.findIndex(data =>{return data.id == video.id});
    //   this.selectedVideosId.splice(selectedVideo, 1);
    //   this.filteredLiveStreamData[selectedVideo].check = false;
    //   this.checkedAll = false;
    // }
    sessionStorage.setItem('restoreSelectedVideos',JSON.stringify(this.selectedVideosId))
    let restoreSelectedVideoId = JSON.parse(sessionStorage.getItem('restoreSelectedVideos'))
    if(this.filterData?.videoType){
      this.restoreSelectedVideos = restoreSelectedVideoId?.map(video =>{return video?.id})
    }
    else{
      this.restoreSelectedVideos = restoreSelectedVideoId?.map(video =>{return video?.video_id})
    }
    this.selectedVidoes.emit(this.selectedVideosId);
  }

  // What ever video selected in list view that video play in large screen.
  playSelectedVideo(selectedVideo) {
    this.listViewDisplay = false;
    this.largeViewDisplay = false;
    this.shareShows = false;
    this.sendObservationData = {
      imageData: null,
      emailID: '',
      emailIDList: [],
    };

    this.spinnerDataService.passSpinnerFlag(true, true);
    this.selectedVideoData = selectedVideo;
    // const selectedStreamNavigation = JSON.parse(sessionStorage.getItem('selectedStreamNavigation'))
    // if(selectedStreamNavigation && selectedStreamNavigation.module){
    //   let selectedType:boolean = selectedStreamNavigation.is_live == 'False'? false:true;
    //   if(!selectedType){
    //     this.selectedVideoData = selectedVideo;
    //   }
    //   else{
    //     this.selectedVideoData = selectedVideo;
    //   }
    // }
    // else{
    // }
    setTimeout(() => {
      this.listViewDisplay = true;
    }, 1);
    setTimeout(() => {
      this.largeViewDisplay = true;
    }, 2);
    setTimeout(() => {
      this.spinnerDataService.passSpinnerFlag(false, true);
    }, 500);
  }

  // Reformatting the live stream data after getting the data from API.
  setFilteredVideo() {
    this.searchValue = '';
    // this.selectedLocation = 'Unsecure Streams'
    // if(this.selectedVideosId[0]?.location.name != this.selectedLocation){
    //   this.selectedVideosId = [];
    //   this.totalCount = 0;
    //   this.checkedAll = false;
    //   this.checks = false;
    //   this.selectedVidoes.emit(this.selectedVideosId);
    // }
    let restoreSelectedVideos = JSON.parse(sessionStorage.getItem('restoreSelectedVideos'))
    if(this.filterData?.videoType){
      this.restoreSelectedVideos = restoreSelectedVideos?.map(video =>{return video?.id})
    }else{
      this.restoreSelectedVideos = restoreSelectedVideos?.map(video =>{return video?.video_id})
    }
    this.filteredLiveStreamData = this.liveStreamData;
    if (sessionStorage.getItem('global-search-notification')) {
      this.filteredLiveStreamData.forEach((element, i) => {
        var notificationData = JSON.parse(
          sessionStorage.getItem('global-search-notification')
        );
        if (notificationData.cameraId == element.id) {
          this.selectedVideoData = this.filteredLiveStreamData[i];
        } 
        // else {
        //   let selectedId = this.selectedVideosId.findIndex((data) => {
        //     return data.id == element.id;
        //   });
        //   if (selectedId >= 0) {
        //     this.selectedVideoData = this.filteredLiveStreamData[i];
        //   } else {
        //     this.selectedVideoData = this.filteredLiveStreamData[0];
        //   }
        // }
      });
    }
    const selectedStreamNavigation = JSON.parse(sessionStorage.getItem('selectedStreamNavigation'))
    if(selectedStreamNavigation && selectedStreamNavigation.module){
      let selectedType:boolean = selectedStreamNavigation.is_live == 'False'? false:true;
      if(!selectedType){
        this.filteredLiveStreamData.forEach((element, i) => {
          if (selectedStreamNavigation?.id == element?.video_id) {
            this.selectedVideoData = this.filteredLiveStreamData[i];
          }
        });      
      } else{
        this.filteredLiveStreamData.forEach((element, i) => {
          if (selectedStreamNavigation?.id == element?.id) {
            this.selectedVideoData = this.filteredLiveStreamData[i];
          }
        });      
      }
    }
    else {
      this.filteredLiveStreamData.forEach((element, i) => {
        let selectedId = this.selectedVideosId.findIndex((data) => {
          return data.id == element.id;
        });
        if (selectedId >= 0) {
          this.selectedVideoData = this.filteredLiveStreamData[i];
        } else {
          this.selectedVideoData = this.filteredLiveStreamData[0];
        }
      });
    }
    this.listViewDisplay = false;
    this.largeViewDisplay = false;
    this.numberOfVideos = this.filteredLiveStreamData.length;
    setTimeout(() => {
      this.listViewDisplay = true;
    }, 1);
    setTimeout(() => {
      this.largeViewDisplay = true;
    }, 2);
    setTimeout(() => {
      sessionStorage.removeItem('global-search-notification');
    }, 10000);
  }

  // Show the share feature if user having share access.
  openSendObservationModal() {
    if (this.hasShareAccess) {
      this.msg = '';
      this.shareShows = !this.shareShows;
    }
  }

  // Remove the user email id in share mail if that is not required.
  removeItem(data: any) {
    let index = this.sendObservationData.emailIDList.findIndex(
      (item: any) => item == data
    );
    this.sendObservationData.emailIDList.splice(index, 1);
  }

  // Add user email id to send mail.
  addTag(data: any) {
    if (!data) {
      return;
    }
    const regexp =
      /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (regexp.test(this.sendObservationData.emailID) === false) {
      this.msg = 'Please enter a valid Email ID.';
      setTimeout(() => {
        this.msg = '';
      }, 5000);
    } else {
      if (
        this.sendObservationData.emailIDList.indexOf(
          this.sendObservationData.emailID
        ) > -1
      ) {
        this.msg = 'Email ID already added.';
        this.sendObservationData.emailID = '';
        setTimeout(() => {
          this.msg = '';
        }, 5000);
      } else {
        if (this.appUserList.includes(this.sendObservationData.emailID)) {
          this.msg = '';
          this.sendObservationData.emailIDList.push(
            this.sendObservationData.emailID
          );
          this.sendObservationData.emailID = '';
        } else {
          this.msg =
            'Video link cannot be shared since ' +
            this.sendObservationData.emailID +
            ' does not have access to Live Streaming';
          setTimeout(() => {
            this.msg = '';
          }, 5000);
        }
      }
    }
  }

  // Send mail to added email ids with relevant data.
  sendCameraImageEmail() {
    this.spinnerDataService.passSpinnerFlag(true, true);
    let params = {}
    if(this.selectedType != 'Live'){
      params['video_id']  = this.selectedVideoData?.video_id
      params['unit_id']  = this.selectedVideoData?.unit_id
      params['zone_id']  = this.selectedVideoData?.zone_id
      params['camera_id'] = null
      params['is_live']   = false
      params['email_id']  = this.sendObservationData.emailIDList
    }
    else{
      params['video_id']  = null
      params['camera_id'] = this.selectedVideoData?.id
      params['unit_id']  = this.selectedVideoData?.unit_id
      params['zone_id']  = this.selectedVideoData?.zone_id
      params['is_live']   = true
      params['email_id']  = this.sendObservationData.emailIDList
    }
    this.liveStreamingCommonService.sendStreamMail(params).subscribe(
        (data) => {
          this.spinnerDataService.passSpinnerFlag(false, true);
          this.msg = 'Stream shared successfully.';
          this.snackbarService.show(this.msg, false, false, false, false);
        },
        (error) => {
          this.resetSendObservationData();
          this.spinnerDataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          this.resetSendObservationData();
        }
      );
  }

  resetSendObservationData() {
    this.shareShows = false;
    this.sendObservationData = {
      showAnimation: true,
      imageData: null,
      emailID: '',
      emailIDList: [],
    };
  }

  /**
   * change page number in pagination.
   * @param activePageNumber page number.
   */
  changePage(activePageNumber: number) {
    this.activePage = activePageNumber;
    this.noOfRows = 10;
    let startWith = (this.activePage - 1) * this.noOfRows + 1;
    if (startWith >= 0 && this.startWith != startWith) {
      this.startWith = startWith;
      this.offset = this.startWith + (this.noOfRows - 1);
      this.noTempOfRows = this.noOfRows;
      this.spinnerDataService.passSpinnerFlag(true, true);
      this.getLiveStreamData(this.filterData);
    }
    sessionStorage.setItem('restorePageNumber',JSON.stringify(this.activePage))
  }

  // Stop the stream camera.
  updateCamera() {
    this.spinnerDataService.passSpinnerFlag(true, true);
    this.liveStreamingCommonService
      .updateCamera(this.selectedVideoData.id, true)
      .subscribe(
        (data) => {
          this.getLiveStreamData(this.filterData);
          this.spinnerDataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.spinnerDataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
  }

  initializeDeviceBatteryPerWS() {
    // Initialize WebSocket connection
    let url =
      JSON.parse(sessionStorage.getItem('application-configuration'))[
        'websocketUrl'
      ] +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/' +
      'central_dashboard/notification/?token=' +
      sessionStorage.getItem('access-token');
    this.cdWebSocket = new WebSocket(url);
    this.cdWebSocket.onopen = (event) => {
      //When websocket is opened.
      console.info('WBS CD websocket conneted.');
    };
    this.cdWebSocket.onmessage = (event: any) => {
      if (JSON.parse(event.data).Status == 'Connected') {
        // On web socket connected message recieve.
      } else {
        // If data is received in the response
        if (
          JSON.parse(event.data)?.message?.Message ==
          'Battery percentage updated successfully'
        ) {
          let obj = JSON.parse(event.data)?.message;
          let liveStreamIndex = this.liveStreamData.findIndex((ele) => {
            return ele.id == obj.camera_id;
          });
          if (liveStreamIndex >= 0) {
            this.liveStreamData[liveStreamIndex].battery_percentage =
              obj.battery_percentage;
          }
          let filteredLiveStreamIndex = this.filteredLiveStreamData.findIndex(
            (ele) => {
              return ele.id == obj.camera_id;
            }
          );
          if (filteredLiveStreamIndex >= 0) {
            this.filteredLiveStreamData[
              filteredLiveStreamIndex
            ].battery_percentage = obj.battery_percentage;
          }
          // this.selectedTypeData.emit(this.liveStreamData)
        } else if (JSON.parse(event.data)?.message?.type == 'stop_stream') {
          let obj = JSON.parse(event.data)?.message;
          let liveStreamIndex = this.liveStreamData.findIndex((ele) => {
            return ele.id == obj.camera_id;
          });
          if (liveStreamIndex >= 0) {
            this.liveStreamData[liveStreamIndex].is_stop = true;
          }
          let filteredLiveStreamIndex = this.filteredLiveStreamData.findIndex(
            (ele) => {
              return ele.id == obj.camera_id;
            }
          );
          if (filteredLiveStreamIndex >= 0) {
            this.filteredLiveStreamData[filteredLiveStreamIndex].is_stop = true;
          }
          this.getLiveStreamData(this.filterData);
          // this.selectedTypeData.emit(this.liveStreamData)
        } else if (JSON.parse(event.data).message?.type == 'start_stream') {
          let obj = JSON.parse(event.data)?.message;
          let liveStreamIndex = this.liveStreamData.findIndex((ele) => {
            return ele.id == obj.camera_id;
          });
          if (liveStreamIndex >= 0) {
            this.liveStreamData[liveStreamIndex].is_stop = false;
          }
          let filteredLiveStreamIndex = this.filteredLiveStreamData.findIndex(
            (ele) => {
              return ele.id == obj.camera_id;
            }
          );
          if (filteredLiveStreamIndex >= 0) {
            this.filteredLiveStreamData[filteredLiveStreamIndex].is_stop =
              false;
          }
          if (this.selectedType == 'Live') {
            this.getLiveStreamData(this.filterData);
          }
        }
      }
    };
  }

  initializeDeviceCameraStatusWS() {
    // Initialize WebSocket connection
    let url =
      JSON.parse(sessionStorage.getItem('application-configuration'))[
        'websocketUrl'
      ] +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/' +
      'live_streaming/notification/?token=' +
      sessionStorage.getItem('access-token');
    this.lsWebSocket = new WebSocket(url);
    this.lsWebSocket.onopen = (event) => {
      //When websocket is opened.
      console.info('WBS camera websocket conneted.');
    };
    this.lsWebSocket.onmessage = (event: any) => {
      if (JSON.parse(event.data).Status == 'Connected') {
        // On web socket connected message recieve.
      } else {
        // If data is received in the response
        if (JSON.parse(event.data)?.message?.type == 'stop_stream') {
          let obj = JSON.parse(event.data)?.message;
          let liveStreamIndex = this.liveStreamData.findIndex((ele) => {
            return ele.id == obj.entity_id;
          });
          if (liveStreamIndex >= 0) {
            this.liveStreamData[liveStreamIndex].is_stop = obj.stop_stream;
          }
          let filteredLiveStreamIndex = this.filteredLiveStreamData.findIndex(
            (ele) => {
              return ele.id == obj.entity_id;
            }
          );
          if (filteredLiveStreamIndex >= 0) {
            this.filteredLiveStreamData[filteredLiveStreamIndex].is_stop =
              obj.stop_stream;
          }
          if (this.selectedType == 'Live') {
            this.selectedTypeData.emit(this.liveStreamData);
          }
        }
      }
    };
  }

  ngOnDestroy() {}
}
