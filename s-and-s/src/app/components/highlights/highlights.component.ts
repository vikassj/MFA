import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';
declare var $: any;
import * as moment from 'moment';
import * as panzoom from 'src/assets/js/imageZoom.js';
import { v4 as uuidv4 } from 'uuid';
import { IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker';
import * as html2canvas from 'html2canvas';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { PlantService } from '../../shared/service/plant.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { DataService } from '../../..//shared/services/data.service';
import { SafetyAndSurveillanceDataService } from '../../shared/service/data.service';
import { SafetyAndSurveillanceCommonService } from '../../shared/service/common.service';
import { CommonService } from '../../..//shared/services/common.service';
import { UnitService } from '../../../shared/components/unit-ss-dashboard/services/unit.service';
import { IogpService } from '../../../shared/components/unit-ss-dashboard/services/iogp.service';

import { ObservationStatusModel } from '../../shared/models/observations.model';

import { RiskFilterPipe } from '../../shared/pipes/risk-filter.pipe';
import { StatusFilterPipe } from '../../shared/pipes/status-filter.pipe';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { ObsStatusFilterPipe } from '../../shared/pipes/obs-status-filter.pipe';
import { DateFilterPipe } from './../../shared/pipes/date-filter.pipe';
@Component({
  selector: 'app-highlights',
  templateUrl: './highlights.component.html',
  styleUrls: ['./highlights.component.scss'],
  providers: [RiskFilterPipe, StatusFilterPipe, FilterPipe, ObsStatusFilterPipe, DateFilterPipe]
})
export class HighlightsComponent implements OnInit {

  @ViewChild('container', { read: ViewContainerRef }) containerRef: ViewContainerRef;
  @ViewChild('totalObservation') totalObservation: ElementRef;

  overAllUnitWiseCalenderOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'dd-mm Unit'
  };
  overAllUnitWiseCalenderModel: IMyDateModel = null;

  statusModel: ObservationStatusModel;

  readonly IMAGE = "Image"
  readonly VIDEO = "Video"
  selectedImageVideoButton = this.IMAGE;

  isRouteClicked: boolean = false;
  showMap: boolean;
  shareShows: boolean;
  confirmMailShow: boolean;

  selecteAddOrView = 'add';
  category: string = 'obs';
  chipTags: any = [];
  moduleType: string = '';
  images = 'assets/images/panel.png';

  selectedDays = ['Daywise', 'Monthwise', 'Yearwise'];
  selectedDay = 'Daywise';

  status = ['Closed-Action Taken', 'Open'];
  selectedStatus: string = '';
  msg: string = '';
  replyNumber: number;
  annotationNumber: number;
  selectedSideBarItem: string = '';
  newColumn: any;
  Vendors: any;
  checkboxValue: boolean = true;
  observation = [
    {
      zone: "Heat Exchange Bay4",
      status: "Closed-Action Taken",
      observation: "HK: Staiways Obstruction: Materials/ Equipments/ Toolsfound obstructing",
      recommendation: "Remove & Dump in waste material area",
      icon: "far fa-check-circle fs-4",
      date: "05-Mar-21",
      time: "09:49:00",
      bgColor: [
        { bgColor: "#e6ac00" },
        { bgColor: "#cc7a00" },
        { bgColor: "#ff4d4d" },
        { bgColor: "#b30000" },
        { bgColor: "#660000" }
      ]
    },
    {
      zone: "Heat Exchange Bay4",
      status: "Closed-Action Taken",
      observation: "HK: Staiways Obstruction: Materials/ Equipments/ Toolsfound obstructing",
      recommendation: "Remove & Dump in waste material area",
      icon: "far fa-check-circle fs-4",
      date: "05-Mar-21",
      time: "09:49:00",
      bgColor: [
        { bgColor: "#e6ac00" },
        { bgColor: "#cc7a00" },
        { bgColor: "#ff4d4d" },
        { bgColor: "#b30000" }
      ]
    },
    {
      zone: "Heat Exchange Bay4",
      status: "Open",
      observation: "HK: Staiways Obstruction: Materials/ Equipments/ Toolsfound obstructing",
      recommendation: "Remove & Dump in waste material area",
      icon: "far fa-check-circle fs-4",
      date: "05-Mar-21",
      time: "09:49:00",
      bgColor: [
        { bgColor: "#e6ac00" },
        { bgColor: "#cc7a00" },
        { bgColor: "#ff4d4d" },
        { bgColor: "#b30000" }
      ]
    },
    {
      zone: "Heat Exchange Bay4",
      status: "Open",
      observation: "HK: Staiways Obstruction: Materials/ Equipments/ Toolsfound obstructing",
      recommendation: "Remove & Dump in waste material area",
      icon: "far fa-check-circle fs-4",
      date: "05-Mar-21",
      time: "09:49:00",
      bgColor: [
        { bgColor: "#e6ac00" },
        { bgColor: "#cc7a00" },
        { bgColor: "#ff4d4d" },
        { bgColor: "#b30000" }
      ]
    },
  ];
  videoSpeedList: any[] = [
    {
      "value": 0.25,
      "label": "0.25x"
    },
    {
      "value": 0.5,
      "label": "0.5x"
    },
    {
      "value": 0.75,
      "label": "0.75x"
    },
    {
      "value": 1,
      "label": "Normal"
    },
    {
      "value": 1.25,
      "label": "1.25x"
    },
    {
      "value": 1.5,
      "label": "1.5x"
    },
    {
      "value": 1.75,
      "label": "1.75x"
    }
  ];


  units: any[] = [];

  imageTableToggle: boolean = false;
  obsData: any[] = [];
  bulkObs: any = [];
  selectedView: boolean = false;
  obsImageData: any;
  noDataMsg: string = '';
  subscription: Subscription = new Subscription();

  selectedCardData: any;

  bulkUpdateObservations: boolean = false;
  filteredObs: any[] = [];
  uniqueDates: any[] = [];
  selectedMultipleDate: any;
  selectedUnit: string = '';
  imageColumns: any[] = [
    {
      "prop": "thumbnailImageUrl",
      "width": 200,
      "name": "Image Name",
      "sortable": false,
      "draggable": false,
      "resizeable": false
    },
    {
      "prop": "riskLevel",
      "name": "Category",
      "width": 100,
      "sortable": true,
      "draggable": false,
      "resizeable": false
    },
    {
      "prop": "ratingDetails.rating",
      "name": "Zone",
      "sortable": true,
      "draggable": false,
      "resizeable": false
    },
    {
      "prop": "date",
      "name": "Date",
      "width": 120,
      "sortable": true,
      "draggable": false,
      "resizeable": false
    },
    {
      "prop": "observation",
      "name": "Observations",
      "sortable": false,
      "draggable": false,
      "resizeable": false
    },
    {
      "prop": "recommendation",
      "name": "Recommendations",
      "sortable": false,
      "draggable": false,
      "resizeable": false
    },
    {
      "prop": "isOpen",
      "name": "Status",
      "width": 200,
      "sortable": true,
      "draggable": false,
      "resizeable": false
    },
    {
      "prop": "remarks",
      "name": "Remarks",
      "sortable": false,
      "draggable": false,
      "resizeable": false
    },
    {
      "prop": "action",
      "name": "Submit",
      "width": 70,
      "sortable": false,
      "draggable": false,
      "resizeable": false
    }
  ];
  selectedRows: any[] = [];
  searchParams: any[] = ['faultId', 'riskLevel', 'observation', 'recommendation', 'zone', 'isOpen', 'remarks'];
  imageModalData: any = {};
  showMarkerMap: boolean = true;
  faultData: any[] = [];
  faultsChoice: any[] = [];
  faultChoiceColors: any = {};
  searchText: string = '';
  selectedRow: any;
  selectedMediaType: string = 'markedImage';
  selectedSpeed: number = 1;
  userGroup: any = [];
  nextBtn: boolean = false;
  prevBtn: boolean = false;
  zoom: any;
  canDraw: boolean = false;
  changeVideoDurationData: any = {
    duration: 0,
    remarks: ''
  };
  sendObservationData: any = {
    showAnimation: true,
    imageData: null,
    emailID: '',
    emailIDList: []
  };
  iogpCategories: any[] = [];
  riskRatingLevels: any[] = [];
  ratings: any[] = [];
  actionPoints: any[] = [];
  canvasHeight: number = 0;
  canvasWidth: number = 0;
  canvasRatio: number = 0;
  selectedType: boolean = true;
  selectedMode: boolean = false;
  multipleIssuesData: any = {
    ids: [],
    status: 'Open',
    remarks: ''
  };
  readOnly: boolean = true;
  snoozeDate: Date;
  trigger: number = 0;
  modalType: string = '';
  modalMessage: string = '';
  modalHeading: string = '';
  noImageAvailble: boolean = false;
  linkedIssueData: any = [];
  actionStatus: any;
  ratingChanges = false;
  constructor(private plantService: PlantService,
    private unitService: UnitService,
    private snackbarService: SnackbarService,
    private commonService: CommonService,
    private iogpService: IogpService,
    private dataService: DataService,
    public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,
    private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService,
    private route: ActivatedRoute,
    private riskFilterPipe: RiskFilterPipe, private obsStatusFilterPipe: ObsStatusFilterPipe, private statusFilterPipe: StatusFilterPipe, private filterPipe: FilterPipe, private dateFilterPipe: DateFilterPipe) {

    window.addEventListener('in-page-obs-nav', (evt: CustomEvent) => {
      this.safetyAndSurveillanceDataService.passGlobalSearch(evt.detail)   
    })  

  }

  ngOnInit(): void {
    this.dataService.passSpinnerFlag(true, true)
    this.selectedCardData = this.observation[0];
    this.status = this.selectedCardData.status
    this.statusModel = new ObservationStatusModel({});
    this.getTableView();
    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedDate.subscribe(date => {
      if (date.validFlag) {
        this.getTableView();
      }
    }));
  }

  ngOnChanges() {

  }

  selectFromUrl() {
    const unit = this.route.snapshot.queryParamMap.get('unit');
    const fault_id = this.route.snapshot.queryParamMap.get('id');
    const ob = {
      unit: unit,
      id: fault_id
    }
    return ob;
  }

  getTableView() {
    this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
      this.iogpCategories = data['module_configurations']['iogp_categories'].filter(cat => cat.show_hide);
      this.riskRatingLevels = data['module_configurations']['risk_rating_levels'];
      this.faultChoiceColors = data['module_configurations']['fault_choice_colors'];
      this.bulkUpdateObservations = data['page_configurations']['observations_page']['page_features']['bulk_update_observations'];
      this.ratings = this.riskRatingLevels.map(rating => rating.rating);
      this.fetchFaultsChoice();
    });

  }
  rowClick(row) {
    if (row) {
      this.imageModalData = {};
      // sessionStorage.removeItem('searchObservation');
      this.imageModalData = JSON.parse(JSON.stringify(row));
      this.selectedUnit = this.imageModalData.unit;
      this.selectedCardData.isOpen = this.imageModalData.is_open;
      this.selectedCardData.remarks = this.imageModalData.remarks;
      this.selectedCardData.vendor = this.imageModalData.vendor;
      this.userGroup = JSON.parse(sessionStorage.getItem('unitDetails')).find(unit => unit.unitName === this.selectedUnit).userGroup;
      this.canDraw = (this.userGroup.indexOf('draw') > -1) ? true : false;
      this.navigationBtnDisable(this.obsData);
      this.getActionsData(row.faultId)
      this.faultData = this.resetRiskRating(this.imageModalData.faults);
      $('#imageModal' + this.category).modal('show');
      this.showMarkerMap = true;
      this.selectedType = true;
      this.checkboxValue = true;
      this.selectedMediaType = (this.selectedType) ? 'markedImage' : (this.imageModalData.videoUrl) ? 'markedVideo' : (this.imageModalData.rawVideoUrl) ? 'unmarkedVideo' : '';
      this.initiateZoom();
    }
  }

  getActionsData(fault_id) {
    this.safetyAndSurveillanceCommonService.getActions('fault_id', fault_id, '', '', '', '', '','').subscribe(data => {
      this.linkedIssueData = data
      this.actionStatus = this.linkedIssueData.find(obs => obs.status == 'Open');
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    )
  }

  selectedVendor() {
    if (this.actionStatus && !(this.selectedCardData?.isOpen == 'Snooze' || this.selectedCardData?.isOpen == 'Open')) {
      this.msg = "All action(s) are to be closed to close the observation.";
      this.snackbarService.show(this.msg, false, false, false, true);
    } else {
      $('#exampleModalToggle').modal('show');
      if (!this.selectedCardData.vendor || this.selectedCardData?.isOpen == 'Open') {
        this.selectedCardData.vendor = ''
      }
    }
  }

  scrollToObs() {
    setTimeout(() => {
      $('#obsContainer').animate({
        scrollTop: $('#obs' + this.imageModalData.faultId).position().top - 200
      });
    }, 500);
  }

  ReInitialize() {
    if (this.selectedMode) {
      this.changeMode();
    }
  }
  saveRiskRating($event, observationId) {
    let index = this.imageModalData.faults.findIndex(fault => fault.observationId === observationId);
    this.imageModalData.faults[index].ratingDetails.editRating = $event;
    this.faultData = this.imageModalData.faults;
    this.ratingChanges = true;
  }

  updateRiskRating(observationId) {
    sessionStorage.setItem('type', 'HSSE/sif/rate_observation')
    window.dispatchEvent(new CustomEvent('button_click'))
    let index = this.imageModalData.faults.findIndex(fault => fault.observationId === observationId);
    let fault = this.imageModalData.faults[index];
    let rating = fault.ratingDetails.editRating;
    if (this.ratingChanges) {
      this.ratingChanges = false;
      this.safetyAndSurveillanceCommonService.updateRiskRating(rating, observationId, this.moduleType).subscribe(
        updateStatus => {
          this.msg = 'Risk Rating updated successfully.';
          this.snackbarService.show(this.msg, false, false, false, false);
          this.safetyAndSurveillanceDataService.passSelectedDate(this.imageModalData.date, true);
          this.safetyAndSurveillanceCommonService.sendMatomoEvent('Rating a observation', 'Observation rating');
          if (this.userGroup.indexOf('riskrating_mail_enable') > -1) {
            this.dataService.passSpinnerFlag(true, true);
            this.sendObservationData.showAnimation = false;
            setTimeout(() => {
              const h2c: any = html2canvas
              h2c($('#markedImageDiv')[0]).then(canvas => {
                this.dataService.passSpinnerFlag(false, true);
                this.sendObservationData.imageData = canvas.toDataURL('image/png');
                this.sendObservationData.showAnimation = true;
                this.openConfirmationModal(fault, 'rating');
              });
            }, 3500);
          }
        },
        error => {
          $('#confirmationModal' + this.category).modal('hide');
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        })
    }
  }

  openConfirmationModal(row, modalType) {
    this.selectedRow = (row === '') ? this.selectedRow : row;
    this.modalHeading = 'Confirmation'
    this.modalType = modalType;
    if (this.modalType === 'delete') {
      this.modalMessage = 'Are you sure you want to delete the observation?';
    }
    else if (this.modalType === 'rating') {
      this.modalHeading = 'Confirmation'
      this.modalMessage = 'On clicking Confirm, email notification will be sent to the user(s). Are you sure you want to proceed?';
    }
    else if (this.modalType === 'submit') {
      this.modalMessage = (this.selectedRow.isOpen === 'Snooze') ? 'Observation will be snoozed and reopened automatically post ' + this.commonService.formatDate(this.selectedRow.editSnoozeDate) + ', ' + this.commonService.formatTimeElement(this.selectedRow.editSnoozeDate) : (this.selectedRow.isOpen === 'Archive') ? 'Observation will be archived and will not be able to revert back.' : 'Changes cannot be reverted back. Are you sure you want to proceed with save?';
    }
    else {
      $('#' + modalType + this.category).modal('hide');
      this.modalMessage = (this.multipleIssuesData.status === 'Snooze') ? 'Observation(s) will be snoozed until reopened automatically post ' + this.commonService.formatDate(this.snoozeDate) + ', ' + this.commonService.formatTimeElement(this.snoozeDate) : (this.multipleIssuesData.status === 'Archive') ? 'Observation(s) will be archived and will not be able to revert back.' : 'Changes cannot be reverted back. Are you sure you want to proceed with save?';
    }
    this.showConfirmMail();
  }

  editValueChange($event, type, row) {
    if (type === 'observation') {
      this.obsData[this.obsData.findIndex(item => item['faultId'] === row['faultId'])]['editObservation'] = $event;
    }
    else {
      this.obsData[this.obsData.findIndex(item => item['faultId'] === row['faultId'])]['editRecommendation'] = $event;
    }
  }

  initiateZoom() {

    setTimeout(() => {
      let tab = document.getElementById('image');
      const element = tab.getElementsByClassName('img-zoom') as any | null;
      if (element) {
        this.zoom = panzoom(element[0], {
          minZoom: 1,
          smoothScroll: false,
          zoomDoubleClickSpeed: 1,
          bounds: true,
          boundsPadding: 1.0
        });
      }

    }, 50);
  }

  openSelectedAnnotation($event) {

    let annotation = this.actionPoints.find(item => item.index === $event.index);
    this.openAnnotationModal(annotation);
  }

  openSendObservationModal() {
    this.shareShow();
    this.dataService.passSpinnerFlag(true, true);
    this.sendObservationData.showAnimation = false;
    setTimeout(() => {
      const h2c: any = html2canvas;
      h2c($('#markedImageDiv')[0]).then(canvas => {
        this.dataService.passSpinnerFlag(false, true);
        this.sendObservationData.imageData = canvas.toDataURL('image/png');
        this.msg = '';
        this.sendObservationData.showAnimation = true;
      });
    }, 100);
  }

  openAnnotationModal(annotation) {
    $("[id^='content']").hide();
    var top = (annotation.left > this.canvasWidth - 360) ? (top + 50) : annotation.top;
    top = (annotation.top < 20) ? (annotation.top + 50) : top;
    top = (annotation.top > this.canvasHeight - 80) ? (annotation.top - 30) : annotation.top;
    var left = (annotation.left > this.canvasWidth - 360) ? (this.canvasWidth - 450) : annotation.left;

    $('#content' + annotation.index).css('left', left + 'px');
    $('#content' + annotation.index).css('top', top + 'px');
    $('#content' + annotation.index).show();
    this.showViewAll();
  }

  showViewAll() {
    if (!this.selectedMode) {
      this.changeMode();
    }
  }
  closeAnnotationModal(index) {
    $('#content' + index).hide();
  }


  navigationBtnDisable(masterImageRows) {
    if (masterImageRows && this.imageModalData) {
      if (masterImageRows.length <= 1) {
        this.prevBtn = true;
        this.nextBtn = true;
      }
      else {
        if (masterImageRows.filter(data => data.thumbnailImageUrl != '').findIndex(item => (item['faultId'] === this.imageModalData.faultId)) === masterImageRows.filter(data => data.thumbnailImageUrl != '').length - 1) {
          this.nextBtn = true;
        }
        else {
          this.nextBtn = false;
        }
        if (masterImageRows.findIndex(item => (item['faultId'] === this.imageModalData.faultId)) === 0) {
          this.prevBtn = true;
        }
        else {
          this.prevBtn = false;
        }
      }
    }
  }

  downloadImage() {
    if (this.selectedMediaType != '') {
      let imageUrl = document.getElementById('modalImage').getAttribute('src');
      if (imageUrl.includes('data:image/jpeg;base64')) {
        let a = document.createElement('a');
        a.href = imageUrl;
        a.download = this.imageModalData.imageName + '.jpg';
        document.body.appendChild(a);
        a.click();
      }
      else {
        this.commonService.fetchImageData(imageUrl).subscribe(
          imageData => {
            let a: any = document.createElement('a');
            a.href = URL.createObjectURL(imageData);
            a.download = (imageUrl.includes('.mp4') ? this.imageModalData.videoName + '.mp4' : this.imageModalData.imageName + '.jpg');
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
      if (this.selectedMediaType === 'markedImage') {
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Download marked observation image', 'Download observation');
      }
      else if (this.selectedMediaType === 'unmarkedImage') {
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Download unmarked observation image', 'Download observation');
      }
      else if (this.selectedMediaType === 'markedVideo') {
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Download marked observation video', 'Download observation');
      }
      else if (this.selectedMediaType === 'unmarkedVideo') {
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Download unmarked observation video', 'Download observation');
      }
    }
  }

  changeMediaType() {
    this.selectedMode = false;
    this.selectedSpeed = 1;
    this.selectedType = !this.selectedType;
    this.selectedMediaType = (this.selectedType) ? 'markedImage' : (this.imageModalData.videoUrl) ? 'markedVideo' : 'unmarkedVideo';
    this.checkboxValue = this.selectedMediaType.includes('unmarked') ? false : true;
    if (this.selectedMediaType === 'markedVideo') {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('View marked observation video', 'Observation media view');
    }
    else if (this.selectedMediaType === 'unmarkedVideo') {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('View unmarked observation video', 'Observation media view');
    }
    else if (this.selectedMediaType = 'markedImage') {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('View marked observation image', 'Observation media view');
    }
    else if (this.selectedMediaType = 'unmarkedImage') {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('View unmarked observation image', 'Observation media view');
    }
    if (this.selectedMediaType.includes('Image')) {
      this.trigger = Date.now();
    }
    else {
      this.imageModalData.uuid = uuidv4();
    }
  }

  navigateImages(direction) {
    if ((direction === 'next' && !this.nextBtn && this.imageModalData) || (direction === 'prev' && !this.prevBtn && this.imageModalData)) {
      this.selectedType = true;
      this.showMarkerMap = true;
      this.selectedMediaType = 'markedImage';
      this.resetZoom();
      let masterImageRows = this.obsData;
      this.imageModalData = (direction === 'next') ? JSON.parse(JSON.stringify(masterImageRows.filter(data => data.thumbnailImageUrl != '')[masterImageRows.filter(data => data.thumbnailImageUrl != '').findIndex(item => item.faultId === this.imageModalData.faultId) + 1])) : JSON.parse(JSON.stringify(masterImageRows.filter(data => data.thumbnailImageUrl != '')[masterImageRows.filter(data => data.thumbnailImageUrl != '').findIndex(item => item.faultId === this.imageModalData.faultId) - 1]));
      this.scaleAspectRatio();
      this.selectedMode = false;
      this.clearCanvas();
      this.faultData = this.resetRiskRating(this.imageModalData.faults);
      this.navigationBtnDisable(masterImageRows);
      this.initiateZoom();
    }
  }


  scaleAspectRatio() {
    this.actionPoints = [];
    this.imageModalData.annotations.forEach(item => {
      if (item.shape === 'rectangle') {
        let top = (item.coords[1] / this.canvasRatio) - 15;
        let left = (item.coords[0] / this.canvasRatio) - 15;
        this.actionPoints.push({ index: item.index, top: top, left: left, comment: item.comments[0].comment, coords: item.coords });
      }
      else if (item.shape === 'circle') {
        let top = ((item.coords[1] / this.canvasRatio) - (item.coords[2] / this.canvasRatio)) - 15
        let left = item.coords[0] / this.canvasRatio - 15;
        this.actionPoints.push({ index: item.index, top: top, left: left, comment: item.comments[0].comment, coords: item.coords });
      }
    });
  }

  resetZoom() {
    this.zoom.reset();
  }

  resetRiskRating(faults) {
    faults.forEach(item => {
      item.ratingDetails = { ...item.ratingDetails, editRating: item.ratingDetails.rating };
    });
    return faults;
  }

  clearCanvas() {
    let canvas: any = document.getElementById('canvas');
    canvas.getContext('2d').clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }


  onObsStatusChange() {

    this.searchText = '';
    let dateList = this.bulkObs.map(date => date.date);
    this.uniqueDates = dateList.filter((v, i, a) => a.indexOf(v) === i);
    this.selectedRows = [];
    this.obsData = this.obsData.slice();
    this.obsData = [...this.obsData];
    if (!$.isEmptyObject(this.imageModalData) && this.obsData.findIndex(fault => fault.faultId === this.imageModalData.faultId) > -1) {
      setTimeout(() => {
        this.imageModalData = this.obsData.find(fault => fault.faultId === this.imageModalData.faultId);
        this.faultData = this.imageModalData?.faults;
        this.scaleAspectRatio();
      }, 100);
    }
    this.disableRightClick();
  }

  fetchFaultsChoice() {
    this.safetyAndSurveillanceCommonService.fetchFaultsChoice().subscribe(
      (faultsChoice: any) => {
        let faults: any = faultsChoice;
        this.faultsChoice = faults.map(fault => fault.choice_name);
        if (faultsChoice.length > 0) {
          this.fetchHighlightData();
        } else {
          this.dataService.passSpinnerFlag(false, true)
        }

      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  fetchHighlightData() {
    this.iogpService.fetchHighlightData().subscribe(
      (obsData: any) => {
        if (obsData.images.length != 0) {
          let currentTime = this.commonService.formatTime();
          let obsImages = obsData['images'];
          this.obsData = [];
          obsImages.forEach(item => {
            let date: Date;
            let faults = [];
            item.faults.forEach((element, index) => {
              faults.push({
                'imageId': item.id,
                'faultId': element.id,
                'riskLevel': item.category,
                'isOpen': (element.is_open) ? 'Open' : element.status,
                'is_open': element.is_open,
                'editFlag': false,
                'remarks': element.remarks,
                'vendor': element.vendor,
                'observationId': element.observations[0].pk,
                'observation': element.observations[0].text,
                'editObservation': element.observations[0].text,
                'recommendation': element.observations[0].recommendations[0].text,
                'editRecommendation': element.observations[0].recommendations[0].text,
                'ratingDetails': (element.observations[0].ratings[0]) ? { ...element.observations[0].ratings[0], editRating: element.observations[0].ratings[0].rating } : { rating: 0, editRating: 0, updated_by: '' },
                'createdBy': element.observations[0].updated_by.username,
                'createdAt': moment(element.observations[0].created_at).format('YYYY-MM-DD'),
                'updatedAt': element.observations[0].updated_at.split('T')[0],
                'disabled': !element.is_open
              });
            }, item.faults.forEach((element, index) => {
              let annotations = [];
              item.annotations.forEach((annotation, index) => {
                let comments = [];
                annotation.commentlist.forEach(comm => {
                  comm.comments.forEach((a, i) => {
                    comments.push({
                      'index': i + 1,
                      'commentId': a.id,
                      'comment': a.text,
                      'commentedBy': a.commented_by
                    });
                  })
                }, annotations.push({
                  'index': index + 1,
                  'annotationId': annotation.id,
                  'coords': annotation.coordinates,
                  'shape': annotation.drawing_type,
                  'drawnBy': annotation.drawn_by,
                  'lineColor': (annotation.color) ? annotation.color : '#0412fb',
                  'lineThickness': (annotation.thickness) ? annotation.thickness : 3,
                  'createdIn': 'backend',
                  'comments': comments
                }))
              },
                this.obsData.push({
                  'imageId': item.id,
                  'unit': item.unit,
                  'zone': item.zone,
                  'category': item.job,
                  'date': item.date,
                  'time': item.time,
                  'faults': faults,
                  'annotations': annotations,
                  'name': item.name.split('.')[0],
                  'imageName': item.name.split('.')[0],
                  'imageUrl': item.path,
                  'rawImageUrl': (item.raw_path) ? item.raw_path : '',
                  'rawImageName': (item.raw_image_name) ? item.raw_image_name.split('.')[0] : '',
                  'thumbnailImageUrl': (index === 0) ? (item.thumbnail) ? item.thumbnail : item.path : '',
                  'videoUrl': (item.video_path) ? item.video_path : '',
                  'videoName': (item.video_name) ? item.video_name.split('.')[0] : '',
                  'rawVideoUrl': (item.raw_video_path) ? item.raw_video_path : '',
                  'rawVideoName': (item.raw_video_name) ? item.raw_video_name.split('.')[0] : '',
                  'faultId': element.id,
                  'riskLevel': item.category,
                  'is_open': (element.is_open) ? 'Open' : element.status,
                  'isOpen': (element.is_open) ? 'Open' : element.status,
                  'snoozeDate': (element.status === 'Snooze') ? this.returnDate(element.snooze_date.split('-').concat(element.snooze_time.split(':'))) : date,
                  'editSnoozeDate': (element.status === 'Snooze') ? this.returnDate(element.snooze_date.split('-').concat(element.snooze_time.split(':'))) : date,
                  'editFlag': false,
                  'editRemarks': element.remarks,
                  'remarks': element.remarks,
                  'vendor': element.vendor,
                  'observationId': element.observations[0].pk,
                  'observation': element.observations[0].text,
                  'editObservation': element.observations[0].text,
                  'recommendation': element.observations[0].recommendations[0].text,
                  'editRecommendation': element.observations[0].recommendations[0].text,
                  'x': element.observations[0].x_marker,
                  'y': element.observations[0].y_marker,
                  'ratingDetails': (element.observations[0].ratings[0]) ? { ...element.observations[0].ratings[0], editRating: element.observations[0].ratings[0].rating } : { rating: 0, editRating: 0, updated_by: '' },
                  'createdBy': element.observations[0].updated_by.username,
                  'createdAt': moment(element.observations[0].created_at).format('YYYY-MM-DD'),
                  'updatedAt': element.observations[0].updated_at.split('T')[0],
                  'disabled': !(element.is_open || element.status === 'Snooze')
                }));
            }));
          });
          this.obsData = JSON.parse(JSON.stringify(this.obsData));

          let masterImageRows = this.filterPipe.transform(this.obsData, this.searchText, this.searchParams);

          let selectedFirstElement = masterImageRows.filter(d => d.isOpen != 'Snooze' && d.isOpen != 'Archive').length > 0 ? masterImageRows.filter(d => d.isOpen != 'Snooze' && d.isOpen != 'Archive')[0] : {};
          if (Object.keys(selectedFirstElement).length > 0) {
            if (this.imageModalData && Object.keys(this.imageModalData).length > 0) {
              let existingElement = masterImageRows.find(el => el.faultId === this.imageModalData.faultId);
              let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'));
              if (searchObservation) {
                this.imageModalData = this.obsData.find(fault => fault.faultId === Number(searchObservation.id));
                this.scrollToObs();
                setTimeout(() => {
                  this.selectedData(this.imageModalData);
                }, 1000);
              }
              else if (existingElement) {
                this.selectedData(existingElement);
              }
              else {
                this.selectedData(selectedFirstElement);
              }
            }
            else {
              let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'));
              if (searchObservation) {
                this.imageModalData = this.obsData.find(fault => fault.faultId === Number(searchObservation.id));
                this.scrollToObs();
                setTimeout(() => {
                  this.selectedData(this.imageModalData);
                }, 1000);
              }
              else {
                this.selectedData(selectedFirstElement);
              }
            }

          }
          else {
            let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'));
            if (searchObservation) {
              this.imageModalData = this.obsData.find(fault => fault.faultId === Number(searchObservation.id));
              this.scrollToObs();
              setTimeout(() => {
                this.selectedData(this.imageModalData);
              }, 1000);
            }
          }
          this.onObsStatusChange();

          this.noDataMsg = 'No images available in this category.';
        } else {
          this.dataService.passSpinnerFlag(false, true)
          this.noDataMsg = "No highlights available in this category";
          this.snackbarService.show(this.noDataMsg, false, false, false, true)
        }

        this.rowClick(this.obsData[0])
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.commonService.resizeDatatable();
        this.dataService.passSpinnerFlag(false, true);
      }
    )

  }

  getObsData(date) {
    this.imageModalData = {};
    this.selectedCardData = {};
    this.safetyAndSurveillanceDataService.passSelectedDate(date, true);
  }

  disableRightClick() {
    setTimeout(() => {
      $('.leftCss, .overlayCss').on('contextmenu', () => {
        let flag = (this.userGroup.indexOf('download') > -1) ? true : false;
        if (flag) {
          $('.leftCss, .overlayCss').unbind('contextmenu');
        }
        else {
          return false;
        }
      });
    }, 1000);
  }

  returnDate(array) {
    let date = new Date(array[0], array[1], array[2], array[3], array[4], array[5]);
    return new Date(date.setMonth(date.getMonth() - 1));
  }

  getObservations() {
    this.unitService.getObservations().subscribe(
      (observations: any) => {
        this.bulkObs = observations.filter(obs => obs.unit === sessionStorage.getItem('selectedUnit') && !(['close', 'archive'].some(status => obs.fault_status.toLowerCase().includes(status)))).map(obs => { return { faultId: obs.id, date: obs.date, riskLevel: obs.category } });
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  onRouteClicked() {
    this.safetyAndSurveillanceDataService.passToggleSidebar(this.isRouteClicked);
  }


  sideBarSelectedItem(data: any) {
    this.dataService.passSpinnerFlag(true, true);
    this.selectedSideBarItem = data;
    sessionStorage.removeItem('selectedUnitDate');
    sessionStorage.setItem('selectedUnit', this.selectedSideBarItem);
    let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(unitDetails.find(unit => unit.unitName === this.selectedSideBarItem)));
    this.safetyAndSurveillanceDataService.passSelectedUnit(this.selectedSideBarItem, true);
    this.imageModalData = {};
  }

  fetchEncryptedImageData(imageId, imageUrl) {
    // this.noImageAvailble = true;
    var decryptionKey = 'su5k#_vyQ$_G[SPX';
    // var decryptionKey = JSON.parse(sessionStorage.getItem('site-config'))?.image_decryption_key
    if (imageUrl && imageId && imageUrl.includes('.enc')) {
      this.commonService.fetchEncryptedImageData(imageId, imageUrl, decryptionKey).subscribe(
        imageData => {
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


  returnCurrentDateTime() {
    let date = new Date();
    return date;
  }

  annotationSelect(data) {
    this.annotationNumber = data;
  }

  onSelectedTypeChange(type) {
    if (type == 'image') {
      if (this.checkboxValue) {
        this.selectedMediaType = 'markedImage';
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('View marked observation image', 'Observation media view');
      }
      else {
        this.selectedMediaType = 'unmarkedImage';
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('View unmarked observation image', 'Observation media view');
      }
      this.initiateZoom();
      this.trigger = Date.now();
    }
    else if (type == 'video') {
      if (this.checkboxValue) {
        this.selectedMediaType = 'markedVideo';
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('View marked observation video', 'Observation media view');
      }
      else {
        this.selectedMediaType = 'unmarkedVideo';
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('View unmarked observation video', 'Observation media view');
      }
      this.initiateZoom();
    }

    if (this.selectedMode) {
      this.changeMode();
    }
  }

  replyHere(data) {
    this.replyNumber = data
  }

  addViewSelect(data) {
    this.selecteAddOrView = data
  }

  clearTextArea($event, row) {
    this.selectedCardData.isOpen = $event;
    this.obsData[this.obsData.findIndex(item => item['faultId'] === row['faultId'])]['isOpen'] = $event;
    this.obsData[this.obsData.findIndex(item => item['faultId'] === row['faultId'])]['remarks'] = '';
  }

  textAreaChange(event, row) {
    this.obsData[this.obsData.findIndex(item => item['faultId'] === row['faultId'])]['remarks'] = event;
  }

  changeMode() {
    if (this.shareShows) {
      this.shareShows = false;
    }
    this.selectedMode = !this.selectedMode;
    let image: any = document.getElementById('modalImage');

    this.canvasHeight = image.height;
    this.canvasWidth = image.width;
    this.canvasRatio = 2160 / this.canvasHeight;
    this.zoom.reset();
    if (!this.selectedMode) {
      this.clearCanvas();
      this.zoom.resume();
    }
    else {
      this.zoom.pause();
    }
    this.scaleAspectRatio();
    this.trigger = Date.now();
  }

  showConfirmMail() {
    this.confirmMailShow = !this.confirmMailShow
  }

  shareShow() {
    if (this.selectedMode) {
      this.changeMode();
    }
    this.shareShows = !this.shareShows
  }


  addTag(data: any) {
    if (!data) {
      return
    }
    const regexp = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (regexp.test(this.sendObservationData.emailID) === false) {
      this.msg = 'Please enter a valid Email ID.';
      setTimeout(() => {
        this.msg = '';
      }, 5000);
    }
    else {
      if (this.sendObservationData.emailIDList.indexOf(this.sendObservationData.emailID) > -1) {
        this.msg = 'Email ID already added.';
        this.sendObservationData.emailID = '';
        setTimeout(() => {
          this.msg = '';
        }, 5000);
      }
      else {
        this.safetyAndSurveillanceCommonService.validateHighlightEmailID(this.sendObservationData.emailID, this.selectedCardData.unit).subscribe(
          validStatus => {
            if (validStatus) {
              this.msg = '';
              this.sendObservationData.emailIDList.push(this.sendObservationData.emailID);
              this.sendObservationData.emailID = '';
            }
            else {
              this.msg = 'Observation cannot be shared since ' + this.sendObservationData.emailID + ' does not have access to ' + sessionStorage.getItem('selectedUnit') + ' unit.';
            }
          },
          error => {
            this.msg = 'Error occured. Please try again.';
            this.snackbarService.show(this.msg, true, false, false, false);
          },
          () => {
            setTimeout(() => {
              this.msg = '';
            }, 5000);
          }
        )
      }
    }
  }

  removeItem(data: any) {
    let index = this.sendObservationData.emailIDList.findIndex((item: any) => item == data);
    this.sendObservationData.emailIDList.splice(index, 1);
  }

  sendObservation() {
    this.dataService.passSpinnerFlag(true, true);

    this.safetyAndSurveillanceCommonService.sendObservation(this.sendObservationData.imageData, this.imageModalData.imageId, this.imageModalData.faultId, this.sendObservationData.emailIDList.join(',')).subscribe(data => {
      $('#sendObservationModal' + this.category).modal('hide');
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Observation shared successfully.';
      this.snackbarService.show(this.msg, false, false, false, false);
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful observation share', 'Share observation');
    },
      error => {
        this.resetSendObservationData();
        $('#sendObservationModal' + this.category).modal('hide');
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.resetSendObservationData();
      }
    )
  }

  deleteFaults() {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.deleteFaults(this.selectedRow.faultId, this.moduleType).subscribe(
      deleteStatus => {
        $('#confirmationModal' + this.category).modal('hide');
        this.msg = 'Fault deleted successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.safetyAndSurveillanceDataService.passSelectedDate(this.selectedRow.date, true);
      },
      error => {
        $('#confirmationModal' + this.category).modal('hide');
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  sendRiskRatingMail() {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.sendRiskRatingMail(this.selectedRow.faultId, this.selectedRow.imageId, this.selectedRow.ratingDetails.editRating, this.sendObservationData.imageData).subscribe(
      sendMail => {
        this.dataService.passSpinnerFlag(false, true);
        this.showConfirmMail();
        this.msg = 'Mail sent successfully to the user(s).';
        this.snackbarService.show(this.msg, false, false, false, false);
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.showConfirmMail();
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  submitStatus(row) {
    sessionStorage.setItem('type', 'HSSE/sif/close_observation')
    window.dispatchEvent(new CustomEvent('button_click'))
    this.selectedRow = (row === '') ? this.selectedRow : row;
    this.updateFaults();
  }

  updateFaults() {
    this.dataService.passSpinnerFlag(true, true);
    let image: any = {};
    image['name'] = this.selectedRow['imageName'] + '.jpg';
    image['risk_level'] = this.selectedRow['riskLevel'];
    image['observations'] = this.selectedRow['observation'];
    image['vendor'] = this.selectedRow['vendor'];
    image['recommendations'] = this.selectedRow['recommendation'];
    image['is_open'] = this.selectedRow['isOpen'].includes('Open') ? true : false;
    image['id'] = this.selectedRow['faultId'];
    image['remarks'] = (this.selectedRow['isOpen'].includes('Open') || this.selectedRow['isOpen'] === 'Snooze') ? this.selectedRow['remarks'] : this.selectedRow['remarks'] + '\nBy ' + sessionStorage.getItem('userName').charAt(0).toUpperCase() + sessionStorage.getItem('userName').slice(1) + '\n' + new Date().toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    image['action'] = this.selectedRow['isOpen'];
    if (image['action'] === 'Snooze') {
      image['date'] = this.commonService.formatDate(this.selectedRow.editSnoozeDate);
      image['time'] = this.commonService.formatTimeElement(this.selectedRow.editSnoozeDate);
    }
    this.safetyAndSurveillanceCommonService.updateFaults(image).subscribe(
      updateStatus => {
        $('#exampleModalToggle').modal('hide');
        this.msg = 'Observation updated successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.safetyAndSurveillanceDataService.passSelectedDate(this.selectedRow.date, true);
        if (image.action.includes('Close')) {
          this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful observation closure', 'Close observation');
        }
        else if (image.action.includes('Snooze')) {
          this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful observation snooze', 'Snooze observation');
        }
        else if (image.action.includes('Archive')) {
          this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful observation archive', 'Archive observation');
        }
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  onStatusCancel(selectedCardData) {
    if (selectedCardData['isOpen'].includes('Close')) {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Incomplete observation closure', 'Close observation');
    }
    else if (selectedCardData['isOpen'].includes('Snooze')) {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Incomplete observation snooze', 'Snooze observation');
    }
    else if (selectedCardData['isOpen'].includes('Archive')) {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Incomplete observation archive', 'Archive observation');
    }
  }

  resetMultipleIssuesData() {
    this.selectedMultipleDate = [];
    this.multipleIssuesData = {
      ids: [],
      status: 'Open',
      remarks: '',
      vendor: ''
    };
    let date: Date
    this.snoozeDate = date;
  }

  updateMultipleFaults() {
    this.dataService.passSpinnerFlag(true, true);
    let image = {};
    image['is_open'] = this.multipleIssuesData.status.includes('Open') ? true : false;
    image['ids'] = (this.modalType.includes('bulk')) ? this.multipleIssuesData.ids.join(',') : this.selectedRows.map(row => row.faultId).join(',');
    image['remarks'] = (this.multipleIssuesData.status.includes('Open') || this.multipleIssuesData.status === 'Snooze') ? this.multipleIssuesData.remarks : this.multipleIssuesData.remarks + '\nBy ' + sessionStorage.getItem('userName').charAt(0).toUpperCase() + sessionStorage.getItem('userName').slice(1) + '\n' + new Date().toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    image['action'] = this.multipleIssuesData.status;
    image['units'] = this.selectedUnit
    if (image['action'] === 'Snooze') {
      image['date'] = this.commonService.formatDate(this.snoozeDate);
      image['time'] = this.commonService.formatTimeElement(this.snoozeDate);
    }
    image['vendor'] = this.multipleIssuesData['vendor'];
    this.safetyAndSurveillanceCommonService.updateMultipleFaults(image).subscribe(
      updateStatus => {
        $('#confirmationModal' + this.category).modal('hide');
        this.msg = 'Fault(s) updated successfully.';
        this.resetMultipleIssuesData();
        this.snackbarService.show(this.msg, false, false, false, false);
        this.safetyAndSurveillanceDataService.passSelectedDate(null, true);
        this.selectedRows = [];
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  onConfirmation() {
    if (this.modalType === 'delete') {
      this.deleteFaults();
    }
    else if (this.modalType === 'rating') {
      this.sendRiskRatingMail();
    }
    else if (this.modalType === 'submit') {
      this.updateFaults();
    }
    else {
      this.updateMultipleFaults();
    }
  }

  resetSendObservationData() {
    this.shareShow();
    this.sendObservationData = {
      showAnimation: true,
      imageData: null,
      emailID: '',
      emailIDList: []
    };
  }

  submitForm(form) {
  }

  onDateChanged(e) {

  }

  selectedData(data, fromMouseClick?: boolean) {
    if (this.searchText.length > 0) {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Usage of search observation in observations page', 'Search observation');
    }
    this.noImageAvailble = false;
    this.selectedCardData = data;
    this.status = this.selectedCardData.status
    this.confirmMailShow = false;
    this.shareShows = false;
    this.ratingChanges = false;
    this.rowClick(data);
    if (fromMouseClick) {
      this.ReInitialize();
    }
  }

  mapShow() {
    this.showMap = !this.showMap
  }

  selectedImageVideoButtons(data) {
    this.selectedImageVideoButton = data;
  }

  ngOnDestroy() {
    this.safetyAndSurveillanceDataService.passObservationsFilters('', '', '', '', '', '', '', '', '', '', '','','','','','' ,false, false);
    this.safetyAndSurveillanceDataService.passObsData('', '', '', '', false);
    this.safetyAndSurveillanceDataService.passSelectedDate('', false);
    this.safetyAndSurveillanceDataService.passBevData('', false);
    this.safetyAndSurveillanceDataService.passToggleSidebar(true);
    this.subscription.unsubscribe();
  }


}
