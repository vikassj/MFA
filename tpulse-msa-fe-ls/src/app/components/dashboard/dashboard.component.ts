import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SnackbarService } from 'src/app//shared/services/snackbar.service';
import { LiveStreamingDataService } from '../../shared/services/data.service';
import { LiveStreamingCommonService } from '../../shared/services/common.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit,OnDestroy {
  isShow = false;
  selectedLocation: any;
  liveStreamData: any = [];
  liveStreamLocationData: any = [];
  msg: string = '';
  searchValue: string = '';

  toggleDisabled:boolean = true;

  selectedVideos :any= [];

  equipmentDropdownWidth: number = 150;

  listOfType:any = ['Live', 'Time lapse (Video summary)'];
  selectedType:string = '';
  isPermitEnabled:boolean = false;
  unitList: any =[];
  selectedUnitItems: any = [];
  selectedItems: any = [];
  selectedValue : boolean = false;
  videoStopStreamUpdated: any;

  //global search variables
  permitNumberList: any = [];
  selectedPermit: any [] = [];
  isbeingSearched: boolean = false;
  @ViewChild('permit') obsSearch: NgSelectComponent;
  subscription: Subscription = new Subscription();
  startDate: any;
  endDate: any;
  filterOptions:any;
  selectedSort:any;
  savedPermitSatus:any[] = []
  unitNomenclature:string = 'Unit';
  selectedPlantDetails:any;
  constructor(private liveStreamingDataService:LiveStreamingDataService ,private liveStreamingCommonService: LiveStreamingCommonService, private snackbarService: SnackbarService) {
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id);
    this.unitNomenclature = this.selectedPlantDetails[0].unit_nomenclature;
    const selectedStreamNavigation = JSON.parse(sessionStorage.getItem('selectedStreamNavigation'))
    if(selectedStreamNavigation && selectedStreamNavigation.module){
      this.selectedType = selectedStreamNavigation.is_live == 'False'? this.listOfType[0]:this.listOfType[1]
    }
    else{
      window.addEventListener('navigate-from-notification', (evt) => {
        this.selectedType = "Live"
        window.dispatchEvent(new CustomEvent('navigate-to-live', {detail: this.selectedUnitItems}))
      })
      this.subscription.add(this.liveStreamingDataService.getSelectedFilterData.subscribe((res) => {
        this.filterOptions = res
        this.startDate = res.startDate ? res.startDate : null;
        this.endDate = res.endDate ? res.endDate : null;
        this.selectedSort = res.sort ? res.sort : null;
      }));
    }
   }

  ngOnInit(): void {
    if(sessionStorage.getItem('mode')){
      this.isShow = JSON.parse(sessionStorage.getItem('mode'))
    }
    else{
      this.isShow = false
    }
    this.getUnitData();
    let selectedPlantId = JSON.parse(sessionStorage.getItem("selectedPlant"));
    if(selectedPlantId){
      let plantPermit = JSON.parse(sessionStorage.getItem("permitPlantMap"));
      let selectedPlant = plantPermit.filter(key  => { return key.plant_id == selectedPlantId });
      this.isPermitEnabled = selectedPlant[0].isPermitEnabled;
    }
    this.selectedType = sessionStorage.getItem('selected-type') ? sessionStorage.getItem('selected-type') : this.listOfType[0];
  }

  // Get all available units.
  getUnitData(){
    this.liveStreamingDataService.passSpinnerFlag(true, true);
      this.liveStreamingCommonService.getUnitData().subscribe((data: any) => {
        this.unitList = data;
        this.unitList.sort((a, b)=>{return b.unit_order - a.unit_order});
        this.selectedItems = this.unitList.map(ele => { return ele.unit_id});
        const selectedStreamNavigation = JSON.parse(sessionStorage.getItem('selectedStreamNavigation'))
        if(selectedStreamNavigation && selectedStreamNavigation.module){
          this.selectedUnitItems = [parseInt(selectedStreamNavigation?.unit_id)];
        }
        else{
          this.selectedUnitItems = this.selectedItems
        }
        let streaming = sessionStorage.getItem('searchStreaming');
        if (streaming) {
          let navigationData = JSON.parse(streaming);
          this.selectedUnitItems = [navigationData.unit];
        }
        this.unitList.reverse();
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

  selectedVidoes(value){
    this.selectedVideos = value;
    let restoreSelectedVideos = JSON.parse(sessionStorage.getItem('restoreSelectedVideos'))
    if(this.selectedVideos.length){
      this.toggleDisabled = false;
    }else{
      this.toggleDisabled = true;
    }
    if(restoreSelectedVideos?.length > 0){
      this.toggleDisabled = false;
    }
  }

  // When user lands in home page if user don't have any data for live than it will the time-lapse data.
  selectedTypeData(data){
    if(this.selectedType == 'Live' && !this.selectedValue){
      this.selectedValue = true;
      let index = data.findIndex(ele =>{ return ele.is_stop == false});
      if(index == -1){
        this.selectedType = 'Time lapse (Video summary)'
      }
    }
    let array = [];

    data.forEach(ele =>{
      let index = this.selectedVideos.findIndex(ele1 => { return ele1.id == ele.id});
      if(index >= 0){
        array.push(ele);
      }
    })
    this.selectedVideos = array;
    this.liveStreamingDataService.passSpinnerFlag(false, true)
  }

  getLiveStreamData(location: string) {
    // this.liveStreamingCommonService.fetchListFeed(location).subscribe((data: any) => {
    //   this.liveStreamData = data;
    //   let liveStreamLocation = [];
    //   for (var i = 0; i < this.liveStreamData.length; i++) {
    //     liveStreamLocation[i] = data[i]["location"]
    //     let newId = this.liveStreamLocationData.find(findId=>{return findId.id == liveStreamLocation[i].id})
    //     if(!newId){
    //       this.liveStreamLocationData.push(data[i]["location"])
    //     }
    //   }
    //   this.selectedLocation = this.liveStreamLocationData[0].name;
    //   setTimeout(() => {
    //     this.liveStreamingDataService.passSpinnerFlag(false, true);
    //   }, 500);
    // },
    //   (err) => {
    //     //Handle Error Callback
    //     this.liveStreamingDataService.passSpinnerFlag(false, true);
    //     this.msg = 'Error occured. Please try again.';
    //     this.snackbarService.show(this.msg, true, false, false, false);
    //   },
    //   () => {
    //     //Complete Callback
    //     this.liveStreamingDataService.passSpinnerFlag(false, true);
    //   })
  }

  // Toggle to show the list view page or gallery page.
  toggle() {
    this.searchValue = '';
    this.isShow = !this.isShow;
    sessionStorage.setItem('mode',this.isShow.toString())
    if(!this.isShow){
      this.selectedVideos = []
      sessionStorage.removeItem('currentVideos')
      let restoreSelectedVideos = JSON.parse(sessionStorage.getItem('restoreSelectedVideos'))
     if(restoreSelectedVideos.length > 0){
      this.toggleDisabled = false
     }else{
      this.toggleDisabled = true
     }
    }
  }

  selectLocation(event: any) {
    this.liveStreamingDataService.passSpinnerFlag(true, true);
    this.selectedLocation = event.target.value;
    // this.liveStreamingCommonService.fetchListFeed(this.selectedLocation);
    setTimeout(() => {
      this.liveStreamingDataService.passSpinnerFlag(false, true);
    }, 500);
  }

  selectType(event){

  }

  openFilter(){
    sessionStorage.removeItem('searchStreaming')
    this.liveStreamingDataService.passToggleFilter(false);
  }


  toggleCheckAll(values: any,dropdownName:any) {
    if(values.currentTarget.checked){
      this.selectAll(dropdownName);
    } else {
      this.unselectAll(dropdownName);
    }
  }

  applyBtn(select: NgSelectComponent,dropdownName){
    if(dropdownName == 'permit'){
      this.savedPermitSatus = this.selectedPermit
      this.isbeingSearched = true
      let videoType = this.selectedType == 'Live' ? true : false
      if(this.selectedPermit.length < 1){
        this.liveStreamingDataService.passFilterData(this.selectedItems, this.filterOptions.zones, this.filterOptions.time, this.filterOptions.source, this.filterOptions.camera_name, this.filterOptions.permit_number, this.filterOptions.type_of_permit, this.selectedSort, this.filterOptions.nature_of_work, videoType, this.startDate, this.endDate);
      }
      else{
        this.liveStreamingDataService.passFilterData(this.selectedItems, this.filterOptions.zones, this.filterOptions.time, this.filterOptions.source, this.filterOptions.camera_name, this.selectedPermit, this.filterOptions.type_of_permit, this.selectedSort, this.filterOptions.nature_of_work, videoType, this.startDate, this.endDate);
      }
      sessionStorage.removeItem('searchStreaming')
      select.close()
    }
    else{
      select.close()
      this.selectedValue = false;
      this.selectedItems = this.selectedUnitItems;
      this.permitNumberList = []
      this.selectedPermit = []
      sessionStorage.removeItem('selectedStreamNavigation')
      sessionStorage.removeItem('searchStreaming')
    }
  }

  selectAll(dropdownName) {
    if(dropdownName == 'permit'){
    this.selectedPermit = this.permitNumberList
    }
    else{
      this.selectedUnitItems = this.unitList.map(key=>{return key.unit_id})
    }
  }

   /**
   * unselect all units.
   */
  unselectAll(dropdownName) {
    if(dropdownName == 'permit'){
      this.selectedPermit = []
    }
    else{
      this.selectedUnitItems = [];
    }
  }

  videoStopStream(event){
    this.videoStopStreamUpdated = event;
  }

  emitGalleryMode(event){
    if(event == null){
      this.isShow = false
      var ele:any = document.getElementById('flexSwitchCheckDefault')
      ele.checked = false
      if(this.selectedVideos.length){
        this.toggleDisabled = false;
      }else{
        this.toggleDisabled = true;
      }     
    }
    else{
      this.toggleDisabled = event
      var ele:any = document.getElementById('flexSwitchCheckDefault')
      ele.checked = true
      console.log(event)
    }
  }

  filterApply(event){
    this.selectedValue = false;
    this.selectedPermit = null;
  }

  changeType(event) {
   sessionStorage.removeItem('searchStreaming')
   sessionStorage.removeItem('restoreSelectedVideos')
   sessionStorage.removeItem('restorePageNumber')
   sessionStorage.setItem('selected-type', event)
   this.selectedPermit = []
  }

  OnOpen() {
    if (!this.isbeingSearched) {
      this.obsSearch.close()
    }
  }

  OnSearch(event: any) {
    if(event.term.length > 0) {
      this.isbeingSearched = true;
      this.obsSearch.open()
    } else {
      this.isbeingSearched = false;
      this.obsSearch.close();
    }
  }

  OnBlue() {
    this.isbeingSearched = false;
    this.obsSearch.close()
  }

  permitNumbers(permitNumbers) {
    let allpermits = []
    permitNumbers?.zones.map((permit,ind) => {
      allpermits = [...allpermits,...permit?.source?.[0]?.cameras]
    })
    let allPermitNumbers:any = allpermits.sort((a,b) =>  b.id - a.id)
    let removeDupPermits =  allPermitNumbers.filter((item, index) => {
      return index === allPermitNumbers.findIndex(o => o?.id === item?.id)
    });
    this.permitNumberList = []
    removeDupPermits.map((permit,index) => {
      this.permitNumberList = [...this.permitNumberList,...permit?.permit_number]
    })
    this.permitNumberList = this.removeDuplicates(this.permitNumberList);
    this.selectAll('permit')
  }

  removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  navigateFromSearch(){
    this.obsSearch.close();
    this.selectedPermit = []
    let videoType = this.selectedType == 'Live' ? true : false
      this.liveStreamingDataService.passFilterData(this.selectedItems, this.filterOptions.zones, this.filterOptions.time, this.filterOptions.source, this.filterOptions.camera_name,[], this.filterOptions.type_of_permit, this.selectedSort, this.filterOptions.nature_of_work, videoType, this.startDate, this.endDate);
  }

  testSearch(term: string, item) {
    let a = item
    term = term.toLocaleLowerCase();
    a = a.toLowerCase();
    return a.includes(term);
  }

  onOpenStatus(dropdownName){
    if(dropdownName == 'permit'){
     this.savedPermitSatus = this.selectedPermit
    }
  }

  onCloseStatus(dropdownName){
    if(dropdownName == 'permit'){
      this.selectedPermit = this.savedPermitSatus
     }
  }

   // code piece to call before refresh of page 
  @HostListener('window:beforeunload', ['$event'])   beforeUnloadHandler(event: Event) {     
    sessionStorage.removeItem('selectedStreamNavigation')
  }
  ngOnDestroy(): void {
    sessionStorage.removeItem('selectedStreamNavigation')
    sessionStorage.removeItem('mode')
    sessionStorage.removeItem('selected-type')
    sessionStorage.removeItem('currentVideos')
    sessionStorage.removeItem('restoreSelectedVideos')
    sessionStorage.removeItem('restorePageNumber')
  }

}
