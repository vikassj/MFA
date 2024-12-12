import { Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform } from '@angular/core';
import { LiveStreamingDataService } from '../../services/data.service';
import { Subject, Subscription } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';
import { LiveStreamingCommonService } from '../../services/common.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  private filterApiCallSubject = new Subject<any>();
  @Input() isPermitEnabled:boolean = false;
  @Input() selectedType:any;
  @Input() selectedItems:any;
  @Input() selectedPermitNumber:any;
  @Output() filterApply:EventEmitter<any> = new EventEmitter();
  @Output() permitNumbers:EventEmitter<any> = new EventEmitter();
  subscription: Subscription = new Subscription();
  isRouteClicked: boolean = false;
  applyBtnDisabled: boolean = false;
  zones: any = [];
  selectedZones: any = [];
  source: any = ['IS Mobile', 'PTZ', 'CCTV'];
  selectedSource: any = [];
  camera: any = [];
  selectedCamera: any = [];
  permit: any = [];
  selectedPermit: any = [];
  typeOfPermit: any = [];
  selectedTypeOfPermit: any = [];
  sort: any = ['Date (Newest to Oldest)', 'Date (Oldest to Newest)'];
  selectedSort: any = this.sort[0];
  nature: any = [];
  selectedNature: any = [];
  selectedTime: any = [];
  msg: string;
  startDate: any;
  endDate: any;
  filterData:any = {};
  zoneNomenclature:string = 'Zone';
  selectedPlantDetails:any;
  constructor(private liveStreamingDataService: LiveStreamingDataService, private snackbarService: SnackbarService, private liveStreamingCommonService: LiveStreamingCommonService) {
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id);
    this.zoneNomenclature = this.selectedPlantDetails[0].zone_nomenclature;

    this.filterApiCallSubject.pipe(
      debounceTime(500),
    ).subscribe(response => {
      this.getFilterData();
    });
    this.subscription.add(this.liveStreamingDataService.getToggleFilter.subscribe((res: boolean) => {
      this.isRouteClicked = res;
    }));
    this.subscription.add(this.liveStreamingDataService.getSelectedFilterData.subscribe((res) => {
      let streaming = sessionStorage.getItem('searchStreaming');
      if (streaming) {
        let navigationData = JSON.parse(streaming);
        this.selectedZones = [navigationData.zone];
        this.selectedCamera = [navigationData.camera_name];
      }
      this.startDate = res.startDate ? res.startDate : null;
      this.endDate = res.endDate ? res.endDate : null;
    }));

    window.addEventListener('reset-filters', (evt: any) => {
      this.selectedItems = evt.detail
      this.selectedType = "Live"
      this.onObsFilterReset()
    })
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes) {
    this.selectedPermit = this.selectedPermitNumber
    let notificationNavigation = sessionStorage.getItem("global-search-notification")
    if(notificationNavigation){
     this.selectedPermit = []
    }
    let isSelectedItems = changes['selectedItems'] && changes['selectedItems'].currentValue != changes['selectedItems'].previousValue;
    if(isSelectedItems){
      // this.getFilterData();
      this.selectedZones = [];
      this.selectedTime = [];
      this.selectedSource = [];
      this.selectedCamera = [];
      this.selectedPermit = [];
      this.selectedTypeOfPermit = [];
      this.selectedSort = this.sort[0];
      this.selectedNature = [];
      let videoType = this.selectedType == 'Live' ? true : false
      this.filterApiCallSubject.next();
      this.liveStreamingDataService.passFilterData(this.selectedItems, this.selectedZones, this.selectedTime, this.selectedSource, this.selectedCamera, this.selectedPermit, this.selectedTypeOfPermit, this.selectedSort, this.selectedNature, videoType, this.startDate, this.endDate);
    }
    let isSelectedType = changes['selectedType'] && changes['selectedType'].currentValue != changes['selectedType'].previousValue;
    if(isSelectedType){
      let videoType = this.selectedType == 'Live' ? true : false
      this.filterApiCallSubject.next();
      this.liveStreamingDataService.passFilterData(this.selectedItems, this.selectedZones, this.selectedTime, this.selectedSource, this.selectedCamera, this.selectedPermit, this.selectedTypeOfPermit, this.selectedSort, this.selectedNature, videoType, this.startDate, this.endDate);
    }
  }
  onRouteClicked() {
    this.applyBtnDisabled = false;
    this.liveStreamingDataService.passToggleFilter(this.isRouteClicked);
  }

  getFilterData(){
    if(this.selectedItems.length > 0){
      this.liveStreamingDataService.passSpinnerFlag(true, true);
      let videoType:any = this.selectedType == 'Live' ? 'True' : 'False'
      let streaming = sessionStorage.getItem('searchStreaming');
      if (streaming) {
        let navigationData = JSON.parse(streaming);
        this.selectedItems = [navigationData.unit];
      }
      const selectedStreamNavigation = JSON.parse(sessionStorage.getItem('selectedStreamNavigation'))
      if(selectedStreamNavigation && selectedStreamNavigation?.module){
        this.selectedItems = [parseInt(selectedStreamNavigation?.unit_id)];
        this.selectedZones = [parseInt(selectedStreamNavigation?.zone_id)];
        videoType = selectedStreamNavigation.is_live == 'False'? 'False' : 'True'
      }
        this.liveStreamingCommonService.getFilterData(this.selectedItems, videoType).subscribe((data: any) => {
          this.filterData = data;
          this.onObsFilterChange();
        },
        (err) => {
          // Error handling
          this.liveStreamingDataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
            this.liveStreamingDataService.passSpinnerFlag(false, true);
        })
    }
  }
  applyFilters(){
    this.filterApply.emit(false)
    this.applyBtnDisabled = false;
    this.liveStreamingDataService.passToggleFilter(true);
    let videoType = this.selectedType == 'Live' ? true : false
    this.liveStreamingDataService.passFilterData(this.selectedItems, this.selectedZones, this.selectedTime, this.selectedSource, this.selectedCamera, this.selectedPermit, this.selectedTypeOfPermit, this.selectedSort, this.selectedNature, videoType, this.startDate, this.endDate);

  }

  onObsFilterReset(){
    this.filterApply.emit(false)
    this.applyBtnDisabled = false;
    this.liveStreamingDataService.passToggleFilter(true);
    this.selectedZones = [];
    this.selectedTime = [];
    this.selectedSource = [];
    this.selectedCamera = [];
    this.selectedPermit = [];
    this.selectedTypeOfPermit = [];
    this.selectedSort = this.sort[0];
    this.selectedNature = [];
    let videoType = this.selectedType == 'Live' ? true : false;
    this.onObsFilterChange();
    this.liveStreamingDataService.passFilterData(this.selectedItems, this.selectedZones, this.selectedTime, this.selectedSource, this.selectedCamera, this.selectedPermit, this.selectedTypeOfPermit, this.selectedSort, this.selectedNature, videoType, this.startDate, this.endDate);
  }

  onFilterChange(item){
    this.applyBtnDisabled = true;
    if(item == 'zone'){
      this.selectedCamera = [];
      this.selectedPermit = [];
      this.selectedTypeOfPermit = [];
      this.selectedNature = [];
    }
    if(item == 'source'){
      this.selectedCamera = [];
    }
    if(item == 'camera'){
      this.selectedPermit = [];
      this.selectedTypeOfPermit = [];
      this.selectedNature = [];
    }
    this.onObsFilterChange();
  }

  selectedAllItems(item){
    this.applyBtnDisabled = true;
    if(item == 'zone'){
      this.selectedZones = this.zones.map(ele => {return ele.zone_id});
      this.selectedCamera = [];
      this.selectedPermit = [];
      this.selectedTypeOfPermit = [];
      this.selectedNature = [];
    }else if(item == 'camera'){
      this.selectedCamera = this.camera;
      this.selectedPermit = [];
      this.selectedTypeOfPermit = [];
      this.selectedNature = [];
    }else if(item == 'permit'){
      this.selectedPermit = this.permit;
    }else if(item == 'typeOfPermit'){
      this.selectedTypeOfPermit = this.typeOfPermit;
    }else if(item == 'nature'){
      this.selectedNature = this.nature;
    }else if(item == 'source'){
      this.selectedSource = this.source;
      this.selectedCamera = [];
    }
    this.onObsFilterChange();
  }

  unSelectAllItems(item){
    this.applyBtnDisabled = true;
    if(item == 'zone'){
      this.selectedZones = [];
      this.selectedCamera = [];
      this.selectedPermit = [];
      this.selectedTypeOfPermit = [];
      this.selectedNature = [];
    }else if(item == 'camera'){
      this.selectedCamera = [];
      this.selectedPermit = [];
      this.selectedTypeOfPermit = [];
      this.selectedNature = [];
    }else if(item == 'permit'){
      this.selectedPermit = [];
    }else if(item == 'typeOfPermit'){
      this.selectedTypeOfPermit = [];
    }else if(item == 'nature'){
      this.selectedNature = [];
    }else if(item == 'source'){
      this.selectedSource = [];
      this.selectedCamera = [];
    }
    this.onObsFilterChange();
  }

  selectStartTime(){
    this.selectEndTime();
  }

  selectEndTime(){
    let date = new Date('10/10/2023 ' + this.selectedTime[0])
    let date2 = new Date('10/10/2023 ' + this.selectedTime[1])
    if (this.selectedTime[0]?.length > 0) {
      if (this.selectedTime[1]?.length > 0) {
        if (date.getTime() > date2.getTime()) {
          this.selectedTime[1] = this.selectedTime[0]
          this.msg = 'Please select End time greater than Start time';
          this.snackbarService.show(this.msg, false, false, false, true);
        }
        this.applyBtnDisabled = true;
      }
    } else {
      this.msg = 'Please select Start time';
      this.snackbarService.show(this.msg, false, false, false, true);
    }
  }

  onObsFilterChange() {
    this.zones = [];
    this.camera = [];
    this.permit = [];
    this.typeOfPermit = [];
    this.nature = [];
    this.permitNumbers.emit(this.filterData)
    this.filterData?.zones?.forEach(zone =>{
      this.zones.push({"zone_id": zone.zone_id, "zone_name": zone.zone_name, "zone_order": zone.zone_order,});
      if(this.selectedZones?.length > 0){
        let zoneIndex = this.selectedZones.findIndex(indexOfzone => { return indexOfzone == zone.zone_id});
        if(zoneIndex >= 0){
          zone?.source?.forEach(source =>{
            if(this.selectedSource?.length > 0 && this.selectedSource == source?.name){
              source?.cameras?.forEach(cameras =>{
                this.camera.push(cameras.name)
              })
            }else if(this.selectedSource?.length == 0){
              source?.cameras?.forEach(cameras =>{
                this.camera.push(cameras.name)
              })
            }
            if(this.selectedCamera?.length > 0){
              source?.cameras?.forEach(cameras =>{
                let cameraIndex = this.selectedCamera.findIndex(indexOfCamera =>{ return indexOfCamera == cameras.name});
                if(cameraIndex >= 0){
                  this.permit = [...this.permit, ...cameras.permit_number];
                  this.typeOfPermit = [...this.typeOfPermit, ...cameras.type_of_permit];
                  this.nature = [...this.nature, ...cameras.nature_of_work];
                }
              })
            } else if(this.selectedCamera?.length == 0 && this.selectedSource?.length > 0){
              if(this.selectedSource == source?.name){
                source?.cameras?.forEach(cameras =>{
                  this.permit = [...this.permit, ...cameras.permit_number];
                  this.typeOfPermit = [...this.typeOfPermit, ...cameras.type_of_permit];
                  this.nature = [...this.nature, ...cameras.nature_of_work];
                })
              }
            }else if(this.selectedCamera?.length == 0 && this.selectedSource?.length == 0){
              source?.cameras?.forEach(cameras =>{
                this.permit = [...this.permit, ...cameras.permit_number];
                this.typeOfPermit = [...this.typeOfPermit, ...cameras.type_of_permit];
                this.nature = [...this.nature, ...cameras.nature_of_work];
              })
            }
          })
        }
      }else{
        zone?.source?.forEach(source =>{
            source?.cameras?.forEach(cameras =>{
              this.camera.push(cameras.name)
            })
            source?.cameras?.forEach(cameras =>{
              this.permit = [...this.permit, ...cameras.permit_number];
              this.typeOfPermit = [...this.typeOfPermit, ...cameras.type_of_permit];
              this.nature = [...this.nature, ...cameras.nature_of_work];
            })
        })
      }
      this.camera = this.removeDuplicates(this.camera);
      this.permit = this.removeDuplicates(this.permit);
      this.typeOfPermit = this.removeDuplicates(this.typeOfPermit);
      this.nature = this.removeDuplicates(this.nature);
    })
  }

  removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }
}



@Pipe({
  name: 'hideInfo',
  pure: true,
})
export class HideInfoPipe implements PipeTransform {
  locale: string;
  transform(value: any, ...args: any) {
    let val: string = value + '';

    if (val && val.length >= 5) {
      val = val.slice(0, 5) + "...";
    }
    return val;
  }
}
