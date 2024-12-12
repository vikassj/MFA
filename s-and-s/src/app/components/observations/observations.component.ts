import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, Renderer2, HostListener, Input, SimpleChanges, AfterViewInit } from '@angular/core';
import * as moment from 'moment';
declare var $: any;
import * as panzoom from 'src/assets/js/imageZoom.js';
import { v4 as uuidv4 } from 'uuid';
import { IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker';
import * as html2canvas from 'html2canvas';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgSelectComponent } from '@ng-select/ng-select';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
declare var $: any;
import { data } from 'jquery';
import "moment-timezone";

import { ObservationStatusModel } from '../../shared/models/observations.model';

import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
import { PlantService } from '../../shared/service/plant.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { DataService } from 'src/shared/services/data.service';
import { SafetyAndSurveillanceDataService } from '../../shared/service/data.service';
import { SafetyAndSurveillanceCommonService } from '../../shared/service/common.service';
import { CommonService } from 'src/shared/services/common.service';
import { UnitService } from 'src/shared/components/unit-ss-dashboard/services/unit.service';
import { IogpService } from 'src/shared/components/unit-ss-dashboard/services/iogp.service';
import { SupportDocPdfViewerService } from 'src/shared/services/support-doc-pdf-viewer.service';

import { RiskFilterPipe } from '../../shared/pipes/risk-filter.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { StatusFilterPipe } from '../../shared/pipes/status-filter.pipe';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { ObsStatusFilterPipe } from '../../shared/pipes/obs-status-filter.pipe';
import { DateFilterPipe } from './../../shared/pipes/date-filter.pipe';
import "moment-timezone";
import * as CryptoJS from 'crypto-js';


const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'MM/DD/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'DD-MMM-YYYY', // How to display your date on the input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};
export interface PermitDetails{
  permit_number: string;
  type_of_permit: string;
  nature_of_work: string;
  vendor_name: string;
  issuer_name: string;
  permit_mode: string;
  permit_id: string;
  camera_id:string;
}
@Component({
  selector: 'app-observations',
  templateUrl: './observations.component.html',
  styleUrls: ['./observations.component.scss'],
  providers: [RiskFilterPipe, StatusFilterPipe, FilterPipe, ObsStatusFilterPipe, DateFilterPipe, DateFormatPipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT }]
})
export class ObservationsComponent implements OnInit,AfterViewInit {

  @ViewChild('container', { read: ViewContainerRef }) containerRef: ViewContainerRef;
  @ViewChild('bulkContainer', { read: ViewContainerRef }) bulkContainerRef: ViewContainerRef;
  @ViewChild('totalObservation') totalObservation: ElementRef;
  @ViewChild('divToScroll') divToScroll: ElementRef;

  @Input() selectedTab: string;
  ColumnMode: ColumnMode;
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
  obs: string;
  zoneNum: number;
  categoryId: number;
  sims: any
  sim1: any;
  sim2: any;
  sim3: any;
  simObs: any;
  simOb: any;
  sim: any;
  simCat: any;
  cat: any;
  c: any;
  simZone: any;
  zoneKey: any;
  zoneValue: any;
  z: any;
  l: any;
  obData: any;
  zonesList = [];
  mapped: any[] = [];
  selecteAddOrView = 'add';
  category: string = 'obs';
  chipTags: any = [];
  moduleType: string = '';
  images = 'assets/images/panel.png';

  selectedDays = ['Daywise', 'Monthwise', 'Yearwise'];
  selectedDay = 'Daywise';

  status = ['Closed-Action Taken', 'Open'];
  selectedStatus: string = ''
  msg: string = '';
  replyNumber: number;
  annotationNumber: number;
  selectedSideBarItem: string = '';
  newColumn: any;
  Vendors: any;
  checkboxValue: boolean = true;
  configureStatusCount : any;
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
  units: any[] = [];
  lists: any[] = [];

  imageTableToggle: boolean = false;
  obsFilters: any = {
    riskRating: [],
    status: []
  };
  obsData: any[] = [];
  bulkObs: any = [];
  openCloseCount = {
    open: 0,
    close: 0,
    snooze: 0,
    archive: 0
  };
  selectedView: boolean = false;
  birdsEyeView: boolean = false;
  obsImageData: any = {};
  obsImageDetails: any = {};
  noDataMsg: string = '';
  subscription: Subscription = new Subscription();

  selectedCardData: any;
  observationsArr = [{ name: 'Zone1', count: 38 }, { name: 'Zone2', count: 28 }, { name: 'Zone3', count: 7 }]
  bulkUpdateObservations: boolean = false;
  filteredObs: any[] = [];
  uniqueDates: any[] = [];
  selectedMultipleDate: any[] = [];
  selectedUnit: string = '';
  obsStatus: any[] = [
    { label: 'Open/ Close', value: 'openClose', key: 'openClose' },
    { label: 'Snooze', value: 'snooze', key: 'snooze' },
    { label: 'Archive', value: 'archive', key: 'archive' }
  ];
  selectedObsStatus: string = 'openClose';
  filterDates: any[] = [];
  selectedFilterDate: string = '';
  imageColumns: any[] = [];
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
  videoSpeedList: any[] = [];
  selectedSpeed: number = 1;
  userGroup: any[] = [];
  vendors: any[] = [];
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
    vendor: undefined,
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
  submitObservation: boolean;
  userActivityData: any;

  listOfZones: any[];
  observationImage: any = '';
  markedImageUrl = '';
  manulaObservationSelectedDetails = {};
  observationImgHeight = 0;
  observationImgWidth = 0;
  observationImgRatio = 0;
  unmarkedImage = '';
  imageName = '';
  imagePath: any[] = [];
  annotation = false;
  manualActionPoints: any[] = [];
  multiObservations = [];
  selectedAnnotation = {};
  editIndex = -1;
  deleteIndex = -1;
  observationCategoryList = [];
  selectedManualMarkedImage = '';
  selectedRiskRating = {};
  base64Image: any[] = [];
  manualObservationRawImagePath = '';
  manualObservationRawImageName = '';
  manualObservationImagePath = '';
  manualObservationImageName = '';
  manualObservationFound: boolean;
  ratingChanges = false;
  dateScroll = false;

  linkedIssueData: any = [
  ]
  statusDropdown = -1;
  dropdownList = ['Open', 'Close']
  addingSubObs = -1;
  listOfUsers: any = []
  newSubTask = { assignee: this.listOfUsers[0], status: 'Open' };
  loginUserId: any;
  selectedAssigneeId: any[];
  newDate = new Date();
  actionFound: boolean = true;
  commentFound: boolean = true;
  actionStatus: boolean = true;
  commentTagging: any[];

  unitsList: any[] = [{ id: 1, name: 'unit-1' }, { id: 2, name: 'unit-2' }, { id: 3, name: 'unit-3' }, { id: 4, name: 'unit-4' }, { id: 5, name: 'unit-5' }, { id: 6, name: 'unit-6' }, { id: 7, name: 'unit-7' }, { id: 8, name: 'unit-8' }, { id: 9, name: 'unit-9' }, { id: 10, name: 'unit-10' }, { id: 11, name: 'unit-12' }, { id: 12, name: 'unit-12' }, { id: 13, name: 'unit-13' }, { id: 14, name: 'unit-14' }, { id: 15, name: 'unit-15' }, { id: 16, name: 'unit-16' }, { id: 17, name: 'unit-17' }, { id: 18, name: 'unit-18' }]

  noOfRows: number = 10;
  arrayLenght: number;
  screenHeight: number = 0;
  activePage: number = 1;
  disabledApplyBtn = true;

  statusList = ['Snooze', 'Closed-Action Taken', 'Closed-False Positive', 'Closed-No Action', 'Open', 'Archive'];
  selectingStatus = ['Snooze', 'Closed-Action Taken', 'Closed-False Positive', 'Closed-No Action', 'Open', 'Archive'];
  tempObsData: any;
  selectedUnitItems: any;
  custom_start_date: any;
  custom_end_date: any;
  uploadStatusFiles: any;
  uploadStatusFilesList = [];
  noTempOfRows: number;
  startWith: number;
  is_highlight: any;
  supportingDocuments: any;
  userMail: string;
  evidenceDocuments: any;
  evidenceMode: boolean;
  evidenceImageModalData: any;
  selectedImageName: any;
  selectedImage: any;
  arrayOfImages: any;
  observationStatusDropdown: boolean;
  globalSearch: any;
  globalSearchSelectedPage: any;
  createActionStatusDropdown = false;

  noSupportingDocsFound: boolean = true;
  evidenceImageId: any;
  initialLoadFlag: boolean = false;
  GlobalUsed: boolean = false;
  preserved_startDate: any;
  preserved_endDate: any;
  unitList: any[];
  selectedItems: any;
  unitListOfUsers: Object;
  allListOfUsers: any;
  closeAccessUsers: any;
  today: string;
  observationStatement: string;
  storedActivePage:any
  insightsAvailable: boolean = true;
  insightBody: any;
  pinnedInsights: [] = []
  actionId: any;
  editSymbol: any = {tab: false, annotation: false};
  insightsFound : boolean = false;
  imageHide : boolean = false;
  isPermitEnabled: boolean;
  selectedPermitDetails:PermitDetails = {permit_number:'',type_of_permit:'',nature_of_work:'',vendor_name:'',issuer_name:'',permit_mode:'ptz',permit_id:'',camera_id:''};
  permitNumberDropdown: boolean =false;
  selectedPermitNumber:any='';
  permitList: any;
  selectedZones: any;
  selectedZone: any;
  newPermitList: any;
  selectedPlantDetails:any;
  auditData:any =[];
  constructor(private plantService: PlantService,
    private supportDocPdfViewerService: SupportDocPdfViewerService,
    private router: Router,
    private unitService: UnitService,
    private snackbarService: SnackbarService,
    private commonService: CommonService,
    private iogpService: IogpService,
    private dataService: DataService,
    public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,
    private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private el: ElementRef,
    private riskFilterPipe: RiskFilterPipe,private dateFormat: DateFormatPipe, private obsStatusFilterPipe: ObsStatusFilterPipe, private statusFilterPipe: StatusFilterPipe, private filterPipe: FilterPipe, private dateFilterPipe: DateFilterPipe, private http: HttpClient, private sanitizer: DomSanitizer, private modalPdfViewerService: ModalPdfViewerService,) {

    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
    pdfDefaultOptions.assetsFolder = 'ngx-extended-pdf-viewer';
    window.addEventListener('scroll', this.ngSelectDropdownPosition, true)
    window.addEventListener("noDatesFound", (ev) => {
      this.filterDates = [];
    })
    this.safetyAndSurveillanceDataService.passObservationPopupFlag(false, false, false, false);
    this.subscription.add(this.safetyAndSurveillanceDataService.getObservationPopupFlag.subscribe(obsFilters => {
      if (obsFilters.filter) {
        this.onRouteClicked()
        $('#exampleModal').modal('hide');
      } else if (obsFilters.bulk_update) {
        // this.getObservations();
        $('#exampleModal').modal('show');
        this.safetyAndSurveillanceDataService.passToggleSidebar(true);
      } else if (obsFilters.export_file) {
        this.downloadObsCsv();
        $('#exampleModal').modal('hide');
        this.safetyAndSurveillanceDataService.passToggleSidebar(true);
      } else if (obsFilters.birds_eye_view) {
        this.mapShow(true)
        $('#exampleModal').modal('hide');
        this.safetyAndSurveillanceDataService.passToggleSidebar(true);
      }
    }))

    window.addEventListener('exit-global-search', (evt) => {
      this.GlobalUsed = false;
    })

    window.addEventListener('in-page-obs-nav', (evt: CustomEvent) => {
        this.safetyAndSurveillanceDataService.passGlobalSearch(evt.detail)
    })

  }
  ngAfterViewInit(){
    window.dispatchEvent(new CustomEvent('reset-date-filters', {detail:JSON.parse(sessionStorage.getItem('searchObservation'))}))
  }

  onOutsideClick(type) {
    // Handle the click outside event here
    if(type === 'units'){
      window.dispatchEvent(new CustomEvent('close-filter'))
    }else if(type == 'permits'){
      window.dispatchEvent(new CustomEvent('permits-close-filter'))
    }
  }

  ngOnInit(): void {
    sessionStorage.removeItem('selectedUnitStartAudit')
    sessionStorage.removeItem('selectedZoneStartAudit')
    let selectedPlantId = JSON.parse(sessionStorage.getItem("selectedPlant"));
    // To add the isPermitEnabled Access from the permitPlantMap
    if(selectedPlantId){
      let plantPermit = JSON.parse(sessionStorage.getItem("permitPlantMap"));
      let selectedPlant = plantPermit.filter(key  => { return key.plant_id == selectedPlantId });
      this.isPermitEnabled = selectedPlant[0].isPermitEnabled;

    }
    this.dataService.passSpinnerFlag(true, true)
    let timeZone =  JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    let newDate = moment()?.tz(timeZone)?.format("YYYY-MM-DD HH:mm:ss")
    sessionStorage.setItem('selectedLocationDate', newDate)
    this.newDate = new Date()
    this.fetchPlantDetails()
    this.getObservations()
    /* Subscription to get the dates and units whenever they are passed. */
    this.subscription.add(
      this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
        let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
        let selectedUnitItems = JSON.parse(sessionStorage.getItem('manually-selected-units'))
        if(searchObservation){
          this.custom_start_date = searchObservation['date']
          this.custom_end_date = data?.['data']?.['endDate']
          this.selectedUnitItems = selectedUnitItems
        }
        else{
          this.custom_start_date = data['data']['startDate']
          this.custom_end_date = data?.['data']?.['endDate']
          this.selectedUnitItems = data?.['data']?.['units']
        }
        // this.custom_start_date = data?.['data']?.['startDate']
        this.activePage = sessionStorage.getItem('selectedActivePage') ? JSON.parse(sessionStorage.getItem('selectedActivePage')) :JSON.parse(sessionStorage.getItem('selectedActivePage'));
        if (this.selectedUnitItems?.length > 0) {
          if (this.obsFilters.displayType != null && this.obsFilters.displayType != "") {
            if (this.obsFilters.displayType === 'Images' || !this.obsFilters.displayType) {
              this.fetchZonewiseFaultCount(true, 'Images');
            }
            else {
              this.fetchZonewiseFaultCount(false, 'Videos');
            }
          }
        } else {
          this.obsData = [];
          this.dataService.passSpinnerFlag(false, true)
        }
      })
    )

    /* Subscription to get the global search object whenever user uses the global search or in case of any navigation. */
    this.subscription.add(this.safetyAndSurveillanceDataService.getGlobalSearch.subscribe(globalSearch => {
      this.globalSearch = globalSearch
      if (globalSearch.id) {
        this.is_highlight = 'False';
        this.obsFilters = {
          riskRating: [],
          status: [],
          zone: [],
          category: []
        };
        let obbsFilterData = JSON.parse(sessionStorage.getItem('filterData')) ? JSON.parse(sessionStorage.getItem('filterData')) : {};
        obbsFilterData.rating = [];
        obbsFilterData.status = [];
        obbsFilterData.zones = [];
        obbsFilterData.category = [];
        sessionStorage.setItem('filterData', JSON.stringify(obbsFilterData));
        this.safetyAndSurveillanceDataService.passSelectedPage('unsif');
        let today = new Date(globalSearch.end_date);
        let dd: any = today.getDate();
        let mm: any = today.getMonth() + 1;//January is 0!`

        let yyyy = today.getFullYear();
        if(dd<10){dd='0'+dd}
        if(mm<10){mm='0'+mm}
        let time_zone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone
        let toDay = moment().tz(time_zone).format("YYYY-MM-DD");
        sessionStorage.setItem('startAndEndDate', JSON.stringify([globalSearch.start_date ,toDay]))
        this.safetyAndSurveillanceDataService.passSelectedDates(globalSearch.start_date ,toDay);
        this.safetyAndSurveillanceDataService.passSelectedUnits([globalSearch.unit_id]);
        this.safetyAndSurveillanceDataService.passDatesAndUnits([globalSearch.unit_id], globalSearch.start_date, toDay)
        this.iogpService.fetchobservationsPageNum([], [], globalSearch.start_date, toDay, [], [], 1, 10, [globalSearch.unit_id], this.is_highlight, [], [], 'dateDesc', 'Images', globalSearch.id ,this.obsFilters.permit, this.obsFilters.permitType, this.obsFilters.nature, this.obsFilters.vendors, this.obsFilters.issuers).subscribe(
          selectedPage => {
            this.GlobalUsed=true;
            this.selectedMode = false;
            this.preserved_startDate=this.custom_start_date;
            this.preserved_endDate=this.custom_end_date;
            this.globalSearchSelectedPage = selectedPage;
          },
          (err) => {

          }, 
          () => {
            // sessionStorage.removeItem('global-search-notification')
            sessionStorage.removeItem('notification-data')
          })
      }
      // this.getGlobalSearch(globalSearch);
    }))


    this.safetyAndSurveillanceCommonService.getAllUsersList('', '', false, false).subscribe(data => {
      this.allListOfUsers = data
      const encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
      const key = CryptoJS.enc.Hex.parse(encryptionKey);
      this.allListOfUsers.forEach(item => {
      // Decrypt email
      item.email = this.decryptUrl(item.email).replace(/^"(.*)"$/, '$1');

      // Decrypt id
      item.id = this.decryptUrl(item.id).replace(/^"(.*)"$/, '$1');

      // Decrypt name
      item.name = this.decryptUrl(item.name).replace(/^"(.*)"$/, '$1');


      // Decrypt username
      item.username = this.decryptUrl(item.username).replace(/^"(.*)"$/, '$1');
    });
        // this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    )
  }

  /**
   * get global search subscription logic.
   * @param globalSearch global search object.
   */
  getGlobalSearch(globalSearch) {
    this.globalSearch = globalSearch
    if (globalSearch.id) {
      this.is_highlight = 'False';
      this.obsFilters = {
        riskRating: [],
        status: [],
        zone: [],
        category: []
      };
      let obbsFilterData = JSON.parse(sessionStorage.getItem('filterData')) ? JSON.parse(sessionStorage.getItem('filterData')) : {};
        obbsFilterData.rating = [];
        obbsFilterData.status = [];
        obbsFilterData.zones = [];
        obbsFilterData.category = [];
        sessionStorage.setItem('filterData', JSON.stringify(obbsFilterData));
      this.safetyAndSurveillanceDataService.passSelectedPage('unsif');

      let today = new Date();
      let dd: any = today.getDate();
      let mm: any = today.getMonth() + 1;//January is 0!`
      let yyyy = today.getFullYear();
      if (dd < 10) { dd = '0' + dd }
      if (mm < 10) { mm = '0' + mm }
      let timeZone =  JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
      let toDay = moment()?.tz(timeZone)?.format("YYYY-MM-DD")
      this.today = toDay
      sessionStorage.setItem('startAndEndDate', JSON.stringify([globalSearch.start_date, toDay]))
      this.safetyAndSurveillanceDataService.passSelectedDates(globalSearch.start_date, toDay);
      this.safetyAndSurveillanceDataService.passSelectedUnits([globalSearch.unit_id]);
      this.safetyAndSurveillanceDataService.passDatesAndUnits([globalSearch.unit_id], globalSearch.start_date, toDay)
      if(globalSearch?.unit_id?.length >= 1){
        this.iogpService.fetchobservationsPageNum([], [], globalSearch.start_date, toDay, [], [], 1, 10, [...globalSearch.unit_id], this.is_highlight, [], [], 'dateDesc', 'Images', globalSearch.id,this.obsFilters.permit, this.obsFilters.permitType, this.obsFilters.nature, this.obsFilters.vendors, this.obsFilters.issuers).subscribe(
          selectedPage => {
            this.GlobalUsed = true;
            this.selectedMode = false;
            this.preserved_startDate = this.custom_start_date;
            this.preserved_endDate = this.custom_end_date;
            this.globalSearchSelectedPage = selectedPage;
          })
      }
    }
  }
  ngAfterViewChecked(): void {
    $('[data-toggle="tooltip"]').tooltip();
}

  ngOnChanges(changes: SimpleChanges): void {
    let isSelectedTabChanged = changes['selectedTab'] &&
      changes['selectedTab'].currentValue != changes['selectedTab'].previousValue;
    if (isSelectedTabChanged) {
      this.is_highlight = this.selectedTab == 'observations' ? 'False' : 'True'
      if (this.selectedTab == 'observations') {
        this.safetyAndSurveillanceDataService.passSelectedPage('unsif');
      } else {
        this.safetyAndSurveillanceDataService.passSelectedPage('sif');
      }
    }
    this.userActivityData = JSON.parse(sessionStorage.getItem('userActivity') as any)
    this.selectedCardData = this.observation[0];
    this.status = this.selectedCardData.status
    this.statusModel = new ObservationStatusModel({});

      this.selectedSideBarItem = this.selectFromUrl().unit ? this.selectFromUrl().unit : sessionStorage.getItem('selectedUnit');
      if(this.selectedTab == "observations") {
        this.getAvailableUnits();
      } else {
        this.getUnitsData(this.selectedTab);
      }
  }

  /**
   * get screen size on window resize event.
   */
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    let screenSize = window.innerHeight;
    this.noOfRows = 10;
    this.displayActivePage(this.activePage);
    // if (this.screenHeight != screenSize) {
    //   this.screenHeight = screenSize;
    //   if (this.screenHeight <= 600) {
    //     let ss = (this.screenHeight - 225) / 130;
    //     this.noOfRows = 10;
    //     this.displayActivePage(this.activePage);
    //   } else if (this.screenHeight > 600 && this.screenHeight <= 700) {
    //     let ss = (this.screenHeight - 225) / 120;
    //     this.noOfRows = 10;
    //     this.displayActivePage(this.activePage);
    //   } else {
    //     let ss = (this.screenHeight - 225) / 100;
    //     this.noOfRows = 10;
    //     this.displayActivePage(this.activePage);
    //   }
    // }


  }


  /**
   * change page number in pagination.
   * @param activePageNumber page number.
   */
  changePage(activePageNumber: number) {
    this.selectedMode = false;
    this.evidenceMode = false;
    if(this.globalSearch?.id){
      this.activePage = this.globalSearchSelectedPage;
    }
    else{
      this.activePage = activePageNumber;
      // sessionStorage.removeItem('searchObservation');
    }
    sessionStorage.setItem('selectedActivePage', JSON.stringify(this.activePage))
    this.noOfRows = 10;
    let startWith = ((Number(this.activePage) - 1) * this.noOfRows) + 1;
    if (startWith >= 0 && (this.startWith != startWith)) {
      this.startWith = startWith
      this.noTempOfRows = this.noOfRows;
      this.selectedMode = false;
      let date = sessionStorage.getItem('date') ? sessionStorage.getItem('date') : '';
      //All comments in this commit will be cleaned up after testing is done.
      // if(this.arrayLenght > 0){
      $('#obsContainer').scrollTop(0);
      // if(manualFlag != "" && manualFlag != undefined) {
      this.fetchObsData(date, startWith, this.noOfRows)
      // }
      //
      // }else{
      //   this.obsData = []
      //   this.openCloseCount = {
      //     open: 0,
      //     close: 0,
      //     snooze: 0,
      //     archive: 0
      //   };
      setTimeout(()=>{
        this.safetyAndSurveillanceDataService.passObservationsSearchText(this.obsData, '')
        // this.dataService.passSpinnerFlag(false, true);
      },600)

      // }
    }
  }

  decryptDatas(encryptedData: string, key: any){
    // Decrypt the value
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });

    // Convert the decrypted data to a UTF-8 string and return it
    return decrypted.toString(CryptoJS.enc.Utf8)
   }

  decryptData(encryptedData: string, key: any){
    // Decrypt the value
   const keyhex = CryptoJS.enc.Hex.parse(key);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, keyhex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    // console.log('decrypted', decrypted.toString(CryptoJS.enc.Utf8) );

    // Convert the decrypted data to a UTF-8 string and return it
    //return decrypted.toString(CryptoJS.enc.Utf8)
    const decryptedString = decrypted?.toString(CryptoJS.enc.Utf8);
    const urlStartIndex = decryptedString?.indexOf('https');
    const urlEndIndex = decryptedString?.search(/\.(jpg|jpeg|mp4|pdf)/i) + 8; // including 'jpg' or 'jpeg'
    const extractedURL = decryptedString?.substring(urlStartIndex, urlEndIndex);
    const decryptedUrl = extractedURL.split('"').join('')
    return decryptedUrl;

   /*    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    const urlStartIndex = decryptedString.indexOf('https');
    const extractedURL = decryptedString.substring(urlStartIndex);

    console.log('Decrypted:', decryptedString);
    console.log('Extracted URL:', extractedURL);

    return extractedURL; */

  }
  /**
   * logic to get the active page.
   * @param activePageNumber page number
   */
  displayActivePage(activePageNumber: number) {
    this.selectedMode = false;
    this.evidenceMode = false;
    if (this.globalSearch?.id) {
      this.activePage = this.globalSearchSelectedPage;
    } else {
      this.activePage = activePageNumber;
    }
    this.noOfRows = 10;
    let startWith = ((this.activePage - 1) * this.noOfRows) + 1;
    if (startWith >= 0 && (this.startWith != startWith)) {
      this.startWith = startWith
      this.noTempOfRows = this.noOfRows;
      let date = sessionStorage.getItem('date') ? sessionStorage.getItem('date') : '';
      // if(this.arrayLenght > 0){
      $('#obsContainer').scrollTop(0);
      this.fetchObsData('',this.startWith,this.noOfRows)
      // if(manualFlag != "" && manualFlag != undefined) {
      // this.getNumberOfObs()
      // }
      //
      // }else{
      //   this.obsData = []
      //   this.openCloseCount = {
      //     open: 0,
      //     close: 0,
      //     snooze: 0,
      //     archive: 0
      //   };
      setTimeout(()=>{
        this.safetyAndSurveillanceDataService.passObservationsSearchText(this.obsData, '')
        this.dataService.passSpinnerFlag(false, true);
      },600)
      this.changePage(activePageNumber)
      // }
    }
  }


  selectStatusList(event) {
    this.disabledApplyBtn = false
  }

  /**
   * setting the selected statuses list.
   */
  selectAllStatus() {
    this.disabledApplyBtn = false
    if (this.selectingStatus?.length == this.statusList?.length) {
      this.selectingStatus = [];
    } else {
      this.selectingStatus = this.statusList;
    }
  }

  /**
   * apply button logic for ng-select component.
   * @param select ng-select component
   */
  applyBtn(select: NgSelectComponent) {
    this.disabledApplyBtn = true;
    select.close();
    this.onStatusChange('');
  }

  getTotalObsCount() {
    // this.dataService.passSpinnerFlag(true, true)
    // this.getNumberOfObs();
  }

  /**
   * main function to get all the observations page by page.
   */
  getNumberOfObs() {
    if (this.GlobalUsed) {
      this.obsFilters = {
        riskRating: [],
        zone: [],
        category: []
      }
      let obbsFilterData = JSON.parse(sessionStorage.getItem('filterData')) ? JSON.parse(sessionStorage.getItem('filterData')) : {};
        obbsFilterData.rating = [];
        obbsFilterData.zones = [];
        obbsFilterData.category = [];
        sessionStorage.setItem('filterData', JSON.stringify(obbsFilterData));
    }
    let zoneId = [];
    let categoryIds = [];
    let data = JSON.parse(sessionStorage.getItem('obsData'))
    let allZones = []
    for (const [key, value] of Object.entries(data)) {
      if (this.obsFilters.zone == 'All Zones') {
        if (key != 'All Zones' && value['id']) {
          allZones.push(key)
          zoneId.push(value['id'])
        }
      } else {
        let index = this.obsFilters?.zone?.find(data => data == key);
        if (index) {
          if (key != 'All Zones' && value['id']) {
            zoneId.push(value['id'])
          }
        }
      }

    }
    if (this.obsFilters.zone == 'All Zones') {
      allZones.forEach(zone => {
        for (const [key, value] of Object.entries(data[zone])) {
          let index = this.obsFilters.category.find(category => category == key)
          let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
          if (!categoryId && index) {
            if (key != 'All Categories' && value['category_id']) {
              categoryIds.push(value['category_id'])
            }
          }
        }
      })
    } else {
      if (this.obsFilters?.zone?.length) {
        this.obsFilters?.zone?.forEach(zone => {
          for (const [key, value] of Object.entries(data[zone])) {
            let index = this.obsFilters.category.find(category => category == key)
            let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
            if (!categoryId && index) {
              if (key != 'All Categories' && value['category_id']) {
                categoryIds.push(value['category_id'])
              }
            }
          }
        })
      }
    }
    if (this.obsFilters.zone == 0) {
      for (const [zoneKey, zoneValue] of Object.entries(data)) {
        if (zoneKey != 'All Zones' && zoneValue['id']) {
          for (const [key, value] of Object.entries(data[zoneKey])) {
            let index = this.obsFilters.category.find(category => category == key)
            let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
            if (!categoryId && index) {
              if (key != 'All Categories' && value['category_id']) {
                categoryIds.push(value['category_id'])
              }
            }
          }
        }
      }
    }
    let time = this.obsFilters.time ? this.obsFilters.time : [];
    this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(units => {
      this.selectedUnitItems = units
   })
   this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
    let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
    if(searchObservation){
      this.custom_start_date = searchObservation['date']
    }
    else{
      this.custom_start_date = data['data']['startDate']
    }
    this.custom_end_date = data['data']['endDate']
    this.selectedUnitItems = data['data']['units']
   })
      if(this.selectedUnitItems?.length > 0 ) {
        window.dispatchEvent(new CustomEvent('enable-units'))
        if(this.GlobalUsed) {
          categoryIds = [];
          zoneId = [];
        }
        let manuallySelectedPermits = JSON.parse(sessionStorage.getItem('manuallySelectedPermits'))
        if(manuallySelectedPermits?.length > 0){
         this.obsFilters.permit = manuallySelectedPermits
         }
      this.iogpService.fetchObsData(zoneId, categoryIds, this.custom_start_date, this.custom_end_date, time, this.obsFilters.mode, 1, 1, this.selectedUnitItems, this.is_highlight, this.obsFilters.riskRating, this.obsFilters.status, this.obsFilters.sortBy, this.obsFilters.displayType, this.obsFilters.permit, this.obsFilters.permitType, this.obsFilters.nature, this.obsFilters.vendors, this.obsFilters.issuers,this.obsFilters.auditObs).subscribe(
        obsData => {
            this.arrayLenght = obsData['pagination']?.total;
          let obsImages = obsData['images']
          let screenSize = window.innerHeight;
          let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
          if(searchObservation){
            if(this.isPermitEnabled){
                this.startWith = 0
                this.displayActivePage(this.activePage);
            }
          }
          else {
            this.startWith = 0
            this.displayActivePage(this.activePage);
          }
          if(obsImages.length == 0) {
            var msg = "No data available."
            this.snackbarService.show(msg, false, false, false, true)
            this.dataService.passSpinnerFlag(false, true)
            window.dispatchEvent(new CustomEvent('disable-bulk-update'))
          }

          //getting observations
          // let obsImages = obsData['images']
          let currentTime = this.commonService.formatTime();
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
                'remarks': element?.remarks,
                'vendor': element.vendor,
                'observationId': element.observations[0].pk,
                'observation': element.observations[0].text,
                'editObservation': element.observations[0].text,
                'recommendation': element.observations[0].recommendations[0].text,
                'editRecommendation': element.observations[0].recommendations[0].text,
                'ratingDetails': (element.observations[0].ratings[0]) ? { ...element.observations[0].ratings[0], editRating: element.observations[0].ratings[0].rating } : { rating: 0, editRating: 0, updated_by: { username: '' } },
                'createdBy': element.observations[0].updated_by?.username,
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
                  'zone': item.zone,
                  'unit': item.unit,
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
                  'isHighlight': element.observations[0].is_highlight,
                  'riskLevel': item.category,
                  'is_open': (element.is_open) ? 'Open' : element.status,
                  'isOpen': (element.is_open) ? 'Open' : element.status,
                  'snoozeDate': (element.status === 'Snooze') ? this.returnDate(element.snooze_date.split('-').concat(element.snooze_time.split(':'))) : date,
                  'editSnoozeDate': (element.status === 'Snooze') ? this.returnDate(element.snooze_date.split('-').concat(element.snooze_time.split(':'))) : date,
                  'editFlag': false,
                  'editRemarks': element?.remarks,
                  'remarks': element?.remarks,
                  'vendor': element.vendor,
                  'observationId': element.observations[0].pk,
                  'observation': element.observations[0].text,
                  'editObservation': element.observations[0].text,
                  'recommendation': element.observations[0].recommendations[0].text,
                  'editRecommendation': element.observations[0].recommendations[0].text,
                  'x': element.observations[0].x_marker,
                  'y': element.observations[0].y_marker,
                  'ratingDetails': (element.observations[0].ratings[0]) ? { ...element.observations[0].ratings[0], editRating: element.observations[0].ratings[0].rating } : { rating: 0, editRating: 0, updated_by: { username: '' } },
                  'createdBy': element.observations[0].updated_by?.username,
                  'createdAt': moment(element.observations[0].created_at).format('YYYY-MM-DD'),
                  'updatedAt': element.observations[0].updated_at.split('T')[0],
                  'disabled': !(element.is_open || element.status === 'Snooze')
                }));
            }));
          });
          this.obsData = JSON.parse(JSON.stringify(this.obsData));
          this.safetyAndSurveillanceDataService.passObservationsSearchText(this.obsData, this.searchText);
          this.tempObsData = JSON.parse(JSON.stringify(this.obsData));

          // this.getObservations();

          let masterImageRows = this.filterPipe.transform(this.obsData, this.searchText, this.searchParams);
          masterImageRows = this.riskFilterPipe.transform(masterImageRows, this.obsFilters.riskRating);
          masterImageRows = this.statusFilterPipe.transform(masterImageRows, this.obsFilters.status);
          masterImageRows = this.obsStatusFilterPipe.transform(masterImageRows, this.selectedObsStatus);

          let selectedFirstElement = {};
          let dates = this.obsData.map(data => { return data.date })
          dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          this.obsData = JSON.parse(JSON.stringify(this.obsData));

          // let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))

          let date = '';
          if (Object.keys(selectedFirstElement)?.length > 0 || this.obsData.length >= 1) {

            if (this.imageModalData && Object.keys(this.imageModalData).length > 0) {

              let existingElement = this.obsData.filter(el => el.faultId === this.imageModalData.faultId);
              if (searchObservation) {
                this.imageModalData = this.obsData.find(fault => fault.faultId === Number(searchObservation.id));
                this.selectedObsStatus = this.imageModalData.isOpen.includes('Archive') ? 'archive' : this.imageModalData.isOpen.includes('Snooze') ? 'snooze' : 'openClose';
                setTimeout(() => {
                  this.selectedData(this.imageModalData);
                }, 1000);
              }
              else if (existingElement[0]) {
                this.selectedData(existingElement[0]);
              }
              else {
                if (Object.keys(selectedFirstElement)?.length > 0) {
                  this.selectedData(selectedFirstElement);
                } else {
                  this.selectedData(this.obsData[0]);
                }
              }
            }
            else {
              if (searchObservation) {
                this.imageModalData = this.obsData.find(fault => fault.faultId === Number(searchObservation.id));
                this.selectedObsStatus = this.imageModalData?.isOpen.includes('Archive') ? 'archive' : this.imageModalData?.isOpen.includes('Snooze') ? 'snooze' : 'openClose';
                this.scrollToObs();
                setTimeout(() => {
                  this.selectedData(this.imageModalData);
                }, 1000);

              }
              else {
                if (Object.keys(selectedFirstElement)?.length > 0) {
                  this.selectedData(selectedFirstElement);
                  date = selectedFirstElement['date'];
                } else {
                  this.selectedData(this.obsData[0]);
                  date = this.obsData[0]['date'];
                }
              }
            }

          }
          else {
            if (searchObservation) {
              this.imageModalData = this.obsData.find(fault => fault.faultId === Number(searchObservation.id));
              this.selectedObsStatus = this.imageModalData?.isOpen.includes('Archive') ? 'archive' : this.imageModalData?.isOpen.includes('Snooze') ? 'snooze' : 'openClose';
              this.scrollToObs();
              setTimeout(() => {
                this.selectedData(this.imageModalData);
              }, 1000);
            } else {
              this.imageModalData = {};
              this.obsData = [];
            }
          }
          this.noDataMsg = 'No images available in this category.';
        },
        error => {
        this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          this.commonService.resizeDatatable();
        }
      )
    } else {
      this.openCloseCount = {
        open: 0,
        close: 0,
        snooze: 0,
        archive: 0
      };
      this.arrayLenght = 0;
        this.dataService.passSpinnerFlag(false, true);
      if (sessionStorage.getItem('removed-from-filter') == 'true') {
        window.dispatchEvent(new CustomEvent('no-units-selected'))
        sessionStorage.removeItem('removed-from-filter')
      } else {
        window.dispatchEvent(new CustomEvent('disable-units'))
      }

    }
  }
  PermitDropdownShow(){
    this.permitNumberDropdown = !this.permitNumberDropdown;
    if(this.permitNumberDropdown){
      this.fetchPermitDetails()
    }
  }
  selectPermitDetails(selectItem) {

    this.selectedPermitDetails.permit_number = selectItem;

    this.permitNumberDropdown = false;
    let permit = this.permitList.filter((item)=>
      item.permit_number== this.selectedPermitDetails.permit_number
    )

    this.selectedPermitDetails = permit[0]
    this.selectedPermitDetails.permit_mode= 'ptz'



  }

  fetchPermitDetails() {
      this.dataService.passSpinnerFlag(true, true);
      var zoneIds = JSON.parse(sessionStorage.getItem("zoneIds"))
      this.safetyAndSurveillanceCommonService.fetchAllPermitDetails(this.custom_start_date, this.custom_end_date,zoneIds, true).subscribe((data:any) => {
    
      this.permitList = data.filter((item)=>item.permit_number !=null)

      this.newPermitList = this.permitList.map((item)=>item.permit_number)
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


  /**
   * url decode logic.
   */
  selectFromUrl() {
    const unit = this.route.snapshot.queryParamMap.get('unit');
    const fault_id = this.route.snapshot.queryParamMap.get('id');
    const ob = {
      unit: unit,
      id: fault_id
    }
    return ob;
  }

  /**
   * get the filters for observations from subscription and apply.
   */
  getObsFilters() {
    this.dataService.passSpinnerFlag(true, true)
    this.subscription.add(this.safetyAndSurveillanceDataService.getObservationsFilters.subscribe(obsFilters => {
      this.scrollToDate();
      this.activePage = sessionStorage.getItem('selectedActivePage') ? JSON.parse(sessionStorage.getItem('selectedActivePage')) :JSON.parse(sessionStorage.getItem('selectedActivePage'));
      this.dateScroll = true;
      if (this.selectedUnitItems !== "") {

        if (obsFilters.validFlag) {
          this.selectedFilterDate = '';
          if (!(this.obsFilters.unit === obsFilters.unit && this.obsFilters.category === obsFilters.category && this.obsFilters.date === obsFilters.date && this.obsFilters.displayType === obsFilters.displayType && this.obsFilters.mode === obsFilters.mode && this.obsFilters.riskRating?.length === obsFilters.riskRating?.length && this.obsFilters.sortBy === obsFilters.sortBy && this.obsFilters.status?.length === obsFilters.status?.length && this.obsFilters.time === obsFilters.time && this.obsFilters.availableDates?.length === obsFilters.availableDates?.length && this.obsFilters.zone === obsFilters.zone)) {
            this.noDataMsg = 'Just a moment, we\'re getting things ready for you...';
            if (obsFilters.displayType === 'Videos') {
              this.obsData = [];
              this.obsFilters = obsFilters;
              this.fetchZonewiseFaultCount(false, 'Videos');
            }
            else {
              if (this.obsImageData && Object.keys(this.obsImageData)?.length > 0) {
                this.obsImageDetails = (this.birdsEyeView) ? ((this.obsImageData[sessionStorage.getItem('selectedUnit')]) ? this.obsImageData[sessionStorage.getItem('selectedUnit')] : {}) : {};
                this.obsImageDetails = { ...this.obsImageDetails };
                this.obsData = [];
                this.imageModalData = {};
                this.obsFilters = obsFilters;
                if (this.obsFilters.displayType === 'Images') {
                  this.fetchZonewiseFaultCount(true, 'Images');
                }
                else {
                  this.fetchZonewiseFaultCount(false, 'Videos');
                }
              }
              this.noDataMsg = 'No images available in this category.';
            }
          }
        }
        else {
          if (!(obsFilters.unit && obsFilters.zone && obsFilters.category && obsFilters.date && obsFilters.time && obsFilters.displayType)) {
            this.obsImageDetails = {};
            this.openCloseCount = {
              open: 0,
              close: 0,
              snooze: 0,
              archive: 0
            };
            this.safetyAndSurveillanceDataService.passOpenCloseCount(this.openCloseCount);
            this.obsFilters = {
              riskRating: [],
              status: []
            };
            let obbsFilterData = JSON.parse(sessionStorage.getItem('filterData')) ? JSON.parse(sessionStorage.getItem('filterData')) : {};
            obbsFilterData.rating = [];
            obbsFilterData.status = [];
            sessionStorage.setItem('filterData', JSON.stringify(obbsFilterData));
            this.filterDates = [];
            this.noDataMsg = 'No images available in this category.';
        this.dataService.passSpinnerFlag(false, true);
          }
        }
      } else {
        this.openCloseCount = {
          open: 0,
          close: 0,
          snooze: 0,
          archive: 0
        };
        this.arrayLenght = 0;
        this.dataService.passSpinnerFlag(false, true)
      }
    },
      (error) => {

      },
      () => {
      }));
  }

  /**
   * get BEV data.
   */
  getBirdEyeView() {
    this.dataService.passSpinnerFlag(true, true)
    this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
      this.manualObservationFound = data['module_configurations']['application_features']['manual_observation_found'];
      this.imageTableToggle = true;
      this.birdsEyeView = data['module_configurations']['application_features']['birds_eye_view'];
      this.actionFound = data['module_configurations']['application_features']['action_found'];
      this.obsFilters.unit = sessionStorage.getItem('selectedUnit');
      this.insightsFound = data['page_configurations']?.['observations_page']?.['page_features']?.['insights_found'];
      this.unitService.fetchBirdsEyeViewData().subscribe(item => {
        if (JSON.stringify(item).includes('locationMap')) {
          this.obsImageData = item;
          this.getObsFilters();
          this.getTableView();
        }
      });
    });
  }

  /**
   * fetch faults choice api call.
   */
  getTableView() {
    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedDate.subscribe(date => {
      if (date !== "") {
        if (date.validFlag) {
          this.fetchFaultCount(true, 'Images', date.date);
          this.dateScroll = false;
        }
      }

    }));

    // this.fetchFaultCount(true, 'Images', '');
    this.subscription.add(this.safetyAndSurveillanceDataService.getBevData.subscribe(trigger => {
      if (trigger.validFlag) {
        this.unitService.fetchBirdsEyeViewData().subscribe(item => {
          this.obsImageData = item;
          this.obsImageDetails = (this.birdsEyeView) ? ((this.obsImageData[sessionStorage.getItem('selectedUnit')]) ? this.obsImageData[sessionStorage.getItem('selectedUnit')] : {}) : {};
          this.obsImageDetails = { ...this.obsImageDetails };
          this.activePage = sessionStorage.getItem('selectedActivePage') ? JSON.parse(sessionStorage.getItem('selectedActivePage')) :JSON.parse(sessionStorage.getItem('selectedActivePage'));
          this.fetchZonewiseFaultCount(true, 'Images');
        });
      }
    }));

    let data = JSON.parse(sessionStorage.getItem("s-and-s-json"))
    let riskRatingLevels = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'))['module_configurations']['risk_rating_levels']
    this.iogpCategories = data['iogpCategories'];
    this.riskRatingLevels = riskRatingLevels;
    this.faultChoiceColors = data['unitModule'].faultChoiceColors;
    this.videoSpeedList = data['unitModule'].videoSpeedList;
    this.bulkUpdateObservations = data['unitModule'].obsDetails.bulkUpdateObservations;
    this.ratings = riskRatingLevels.map(rating => rating.rating);
    this.imageColumns = data['unitModule'].tableViewColumns;
    this.observationCategoryList = [];
    let categories = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'));
    categories['module_configurations']['iogp_categories']?.forEach(ele => {
      if (ele?.show_hide) {
        this.observationCategoryList.push([ele?.acronym, ele?.name])
      }
    })

    this.fetchFaultsChoice();

    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnit.subscribe(selectedUnit => {
      if (selectedUnit.validFlag || selectedUnit.validFlag == undefined) {
        if (sessionStorage.getItem('selectedUnitDetails') != null) {
          this.selectedUnit = sessionStorage.getItem('selectedUnit');
          this.userGroup = JSON.parse(sessionStorage.getItem('selectedUnitDetails')).userGroup;
        }
      }
    }));
  }

  /**
   * on select of observation from the datatable.
   * @param row observation selected
   */
  rowClick(row) {
    if (row) {
      this.imageModalData = {};
      this.imageHide = false;
      setTimeout(()=>{
        this.imageHide = true;
        // sessionStorage.removeItem('searchObservation');
        sessionStorage.removeItem('selectedRiskRatingDate');
        this.imageModalData = JSON.parse(JSON.stringify(row));
        this.selectedCardData.isOpen = this.imageModalData.is_open;
        this.selectedCardData.remarks = this.imageModalData?.remarks;
        this.selectedCardData.vendor = this.imageModalData?.vendor;
        let obss = this.imageModalData.observation

        let masterImageRows = this.obsData;
        masterImageRows = this.obsStatusFilterPipe.transform(masterImageRows, this.selectedObsStatus);
        this.getObservationsList()
        this.navigationBtnDisable(this.obsData);
        this.faultData = this.resetRiskRating(this.imageModalData.faults);
        $('#imageModal' + this.category).modal('show');
        // this.scaleAspectRatio();
        // this.ReInitialize();
        this.showMarkerMap = true;
        this.selectedType = true;
        this.checkboxValue = true;
        this.selectedMediaType = (this.selectedType) ? 'markedImage' : (this.imageModalData.videoUrl) ? 'markedVideo' : (this.imageModalData.rawVideoUrl) ? 'unmarkedVideo' : '';
        let postData: any[] = [];
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var faultId = row.faultId
        let postDataObject = { 'fault_id': faultId, 'count': 1, 'date': date, 'time': time };
        postData.push(postDataObject);
        this.initiateZoom();
        this.scaleAspectRatio();
        this.commentTagging = [];
        this.commentFound = false
        if (this.imageModalData.faultId) {
          this.selectedUnit = row.unit
          setTimeout(()=>{
            this.getObservationsList()
          },1000)
          this.getAssigneeList(this.selectedUnit)
          this.setUserActivityData(postData)
          this.getActionsData(faultId)
          this.getAuditData(faultId)
          this.getEvidence()
        }
        setTimeout(() => {
          this.commentFound = true
        }, 500)
        this.addingSubObs = -1
        $('#overviewSection').scrollTop(0);
        let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
        sessionStorage.setItem('selectedUnitDetails', JSON.stringify(unitDetails.find(unit => unit.unitName === this.imageModalData.unit)));
        if (JSON.parse(sessionStorage.getItem('selectedUnitDetails'))?.userGroup != undefined) {
          this.userGroup = JSON.parse(sessionStorage.getItem('selectedUnitDetails'))?.userGroup;
        }
        this.canDraw = (this.userGroup.indexOf('draw') > -1) ? true : false;
        setTimeout(() => {
          this.safetyAndSurveillanceDataService.passGlobalSearch({});
        }, 1000)
      }, 10);
    }
    if (this.userGroup.indexOf('close') < 0) {
      window.dispatchEvent(new CustomEvent('disable-bulk-update'))
    } else {
      window.dispatchEvent(new CustomEvent('enable-bulk-update'))
    }
  }

  /**
   * scrolling the observation in to view.
   */
  scrollToObs() {
    setTimeout(() => {
      $('#obsContainer').animate({
        scrollTop: $('#obs' + this.imageModalData?.faultId).position()?.top - 250
      });
    }, 500);
  }

  /**
   * reset the datatable and view.
   */
  ReInitialize() {
    if (this.selectedMode) {
      this.changeMode();
    }
  }

  /**
   * submit risk rating.
   * @param $event risk rating
   * @param observationId obs-id
   */
  saveRiskRating($event, observationId) {
    let index = this.imageModalData.faults.findIndex(fault => fault.observationId === observationId);
    this.imageModalData.faults[index].ratingDetails.editRating = $event;
    this.faultData = this.imageModalData.faults;
    this.ratingChanges = true;
  }

  /**
   * update risk rating api call.
   * @param observationId obs-id
   */
  updateRiskRating(observationId) {

    sessionStorage.setItem('type', 'HSSE/observations/rate_observation')
    window.dispatchEvent(new CustomEvent('button_click'))

    let index = this.imageModalData.faults.findIndex(fault => fault.observationId === observationId);
    let fault = this.imageModalData.faults[index];
    let rating = fault.ratingDetails.editRating;
    if (this.ratingChanges) {
      this.ratingChanges = false;
      this.safetyAndSurveillanceCommonService.updateRiskRating(rating, observationId, this.moduleType).subscribe(
        updateStatus => {
          sessionStorage.setItem('ratingUpdate', 'True')
          this.safetyAndSurveillanceDataService.passSelectedDate(this.imageModalData.date, true);
          this.safetyAndSurveillanceCommonService.sendMatomoEvent('Rating a observation', 'Observation rating');
          if (this.userGroup.indexOf('riskrating_mail_enable') > -1) {
            this.confirmMailShow = false
            this.dataService.passSpinnerFlag(true, true);
            this.sendObservationData.showAnimation = false;
            setTimeout(() => {
              let imageUrl = this.imageModalData.imageUrl.split('.')
              if (imageUrl[imageUrl?.length - 1] == 'enc') {
                const h2c: any = html2canvas
                h2c($('#markedImageDiv')[0]).then(canvas => {
        this.dataService.passSpinnerFlag(false, true);
                  this.sendObservationData.imageData = canvas.toDataURL('image/png');
                  this.sendObservationData.showAnimation = true;
                  setTimeout(() => {
                    this.openConfirmationModal(fault, 'rating');
                  }, 1500)
                });
              } else {
                this.http.get(this.imageModalData.imageUrl, { responseType: 'blob' }).subscribe(blob => {
                  const reader = new FileReader();
                  reader.readAsDataURL(blob);
                  reader.onloadend = () => {
                    const base64data = reader.result.toString().split(',')[1];
        this.dataService.passSpinnerFlag(false, true);
                    this.sendObservationData.imageData = this.sanitizer.bypassSecurityTrustUrl(`data:image/png;base64,${base64data}`)['changingThisBreaksApplicationSecurity'];
                    this.sendObservationData.showAnimation = true;
                    setTimeout(() => {
                      this.openConfirmationModal(fault, 'rating');
                    }, 1500)
                  }
                })
              }
            }, 1000);
          }
        })
    }
  }

  /**
   * confirmation modal for risk-rating, submit, delete.
   * @param row selected observation
   * @param modalType type of confirmation pop-up to show.
   */
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

  /**
   * export button funtionality.
   */
  downloadObsCsv() {
    let zoneId = [];
    let categoryIds = [];
    let data = JSON.parse(sessionStorage.getItem('obsData'))
    for (const [key, value] of Object.entries(data)) {
      let index = this.obsFilters?.zone?.find(data => data == key);
      if (index) {
        if (key != 'All Zones' && value['id']) {
          zoneId.push(value['id'])
        }
      }

    }
    this.obsFilters?.zone?.forEach(zone => {
      for (const [key, value] of Object.entries(data[zone])) {
        let index = this.obsFilters.category.find(category => category == key)
        let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
        if (!categoryId && index) {
          if (key != 'All Categories' && value['category_id']) {
            categoryIds.push(value['category_id'])
          }
        }
      }
    })
    if (this.obsFilters.zone == 0) {
      for (const [zoneKey, zoneValue] of Object.entries(data)) {
        if (zoneKey != 'All Zones' && zoneValue['id']) {
          for (const [key, value] of Object.entries(data[zoneKey])) {
            let index = this.obsFilters.category.find(category => category == key)
            let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
            if (!categoryId && index) {
              if (key != 'All Categories' && value['category_id']) {
                categoryIds.push(value['category_id'])
              }
            }
          }
        }
      }
    }
    let time = this.obsFilters.time ? this.obsFilters.time : [];
    let manuallySelectedPermits = JSON.parse(sessionStorage.getItem('manuallySelectedPermits'))
        if(manuallySelectedPermits?.length > 0){
         this.obsFilters.permit = manuallySelectedPermits
         }
    this.safetyAndSurveillanceCommonService.fetchObsCsv(this.selectedUnitItems, zoneId, categoryIds,this.custom_start_date, this.custom_end_date, time, this.obsFilters.mode, this.obsFilters.riskRating, this.obsFilters.status.join(','), this.is_highlight, this.obsFilters.permit, this.obsFilters.permitType, this.obsFilters.nature, this.obsFilters.vendors, this.obsFilters.issuers,).subscribe(
      obsCsc => {
        let url = window.URL.createObjectURL(obsCsc.body);
        let a = document.createElement('a');
        a.href = url;
        let downloadText = 'T-pulse'
        let allUnits = JSON.parse(sessionStorage.getItem('allUnits'));
        let count = 0;
        allUnits.forEach((ele, i) => {
          let index = this.selectedUnitItems.findIndex(unit => { return unit == ele.id });
          if (index >= 0) {
            if (count <= 2) {
              count += 1
              downloadText = downloadText + '-' + ele.name
            }

          }
        })
        downloadText = downloadText + (this.selectedUnitItems?.length > 2 ? (this.selectedUnitItems?.length == 3 ? '+1 unit' : '+' + (this.selectedUnitItems?.length - 2) + 'units') : '')
        a.download = downloadText + '_Observations.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Usage of export to CSV', 'Export to CSV');
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  /**
   * edit observation or recommendation based on type.
   * @param $event edited value.
   * @param type obs or rec.
   * @param row selected obs or rec.
   */
  editValueChange($event, type, row) {
    if (type === 'observation') {
      this.obsData[this.obsData.findIndex(item => item['faultId'] === row['faultId'])]['editObservation'] = $event;
    }
    else {
      this.obsData[this.obsData.findIndex(item => item['faultId'] === row['faultId'])]['editRecommendation'] = $event;
    }
  }

  /**
   * initialize panzoom
   */
  initiateZoom() {
    setTimeout(() => {
      let tab = document.getElementById('image');
      const element = tab?.getElementsByClassName('img-zoom') as any | null;
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

  /**
   * open selected annotation with detailed view.
   */
  openSelectedAnnotation($event) {
    let annotation = this.actionPoints.find(item => item.index === $event.index);
    this.openAnnotationModal(annotation);
  }

  /**
   * send observation modal logic.
   */
  openSendObservationModal() {
    this.msg = '';
    this.shareShow();
    this.dataService.passSpinnerFlag(true, true);
    this.sendObservationData.showAnimation = false;
    setTimeout(() => {
      let imageUrl = this.imageModalData.imageUrl.split('.')
      if (imageUrl[imageUrl?.length - 1] == 'enc') {
        const h2c: any = html2canvas
        h2c($('#markedImageDiv')[0]).then(canvas => {
        this.dataService.passSpinnerFlag(false, true);
          this.sendObservationData.imageData = canvas.toDataURL('image/png');
          this.msg = '';
          this.sendObservationData.showAnimation = true;
        });
      } else {
        this.http.get(this.imageModalData.imageUrl, { responseType: 'blob' }).subscribe(blob => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result.toString().split(',')[1];
        this.dataService.passSpinnerFlag(false, true);
            this.sendObservationData.imageData = this.sanitizer.bypassSecurityTrustUrl(`data:image/png;base64,${base64data}`)['changingThisBreaksApplicationSecurity'];
            this.msg = '';
            this.sendObservationData.showAnimation = true;
          }
        })
      }
    }, 600);
  }

  /**
   * date change in bulk-update observation logic.
   */
  dateChange() {
    this.filteredObs = this.bulkObs.filter(obs => this.selectedMultipleDate.indexOf(obs.date) > -1);
    this.filteredObs.sort((val, ind) => {
      return ind.faultId - val.faultId
    })
    this.multipleIssuesData = {
      ids: [],
      status: 'Open',
      vendor: undefined,
      remarks: ''
    };
  }

  /**
   * status changed for multiple observations.
   */
  onMultipleStatusChange() {
    this.multipleIssuesData = {
      ids: this.multipleIssuesData.ids,
      status: this.multipleIssuesData.status,
      vendor: undefined,
      remarks: ''
    };
    let date: Date
    this.snoozeDate = date;
  }

  /**
   * get background color for the status to be displayed in dropdown.
   */
  getBackgroundColor(fault) {
    return (this.faultChoiceColors[fault]) ? this.faultChoiceColors[fault] : 'grey';
  }

  /**
   * add annotation logic.
   */
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

  /**
   * show or hide all annotations.
   */
  showViewAll() {
    if (!this.selectedMode) {
      this.changeMode();
    }
  }

  /**
   * close add annotation modal logic.
   */
  closeAnnotationModal(index) {
    $('#content' + index).hide();
  }


  /**
   * disable navigation buttons in pagination.
   */
  navigationBtnDisable(masterImageRows) {
    if (masterImageRows && this.imageModalData) {
      if (masterImageRows?.length <= 1) {
        this.prevBtn = true;
        this.nextBtn = true;
      }
      else {
        if (masterImageRows.filter(data => data.thumbnailImageUrl != '').findIndex(item => (item['faultId'] === this.imageModalData.faultId)) === masterImageRows.filter(data => data.thumbnailImageUrl != '')?.length - 1) {
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

  /**
   * download observation image logic.
   */
  downloadImage() {
    if (this.evidenceMode == false) {
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
          let videoSrc = document.querySelector('#modalImage video source')?.getAttribute('src');
          if (videoSrc?.includes('blob')){
              let a: any = document.createElement('a');
              a.href = videoSrc;
              var videoName = this.imageModalData.videoName != "" ? this.imageModalData.videoName : this.imageModalData.rawVideoName;
              a.download = (imageUrl.includes('.mp4') ? videoName + '.mp4' : this.imageModalData.imageName + '.jpg');
              document.body.appendChild(a);
              a.click();
          }
          else{
            this.commonService.fetchImageData(imageUrl).subscribe(
              imageData => {
                let a: any = document.createElement('a');
                a.href = URL.createObjectURL(imageData);
                var videoName = this.imageModalData.videoName != "" ? this.imageModalData.videoName : this.imageModalData.rawVideoName
                a.download = (imageUrl.includes('.mp4') ? videoName + '.mp4' : this.imageModalData.imageName + '.jpg');
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
    } else {
      this.downloadImg(this.evidenceImageModalData.file)
    }
  }
  routeAudit(route,store){
    sessionStorage.setItem(store.key,store.value)
    this.router.navigateByUrl(route)
  }

  /**
   * toggle image and video logic.
   */
  changeMediaType() {
    this.selectedMode = false;
    this.evidenceMode = false;
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
    else if (this.selectedMediaType == 'markedImage') {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('View marked observation image', 'Observation media view');
    }
    else if (this.selectedMediaType == 'unmarkedImage') {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('View unmarked observation image', 'Observation media view');
    }
    this.initiateZoom();
    if (this.selectedMediaType.includes('Image')) {
      this.trigger = Date.now();
    }
    else {
      this.imageModalData.uuid = uuidv4();
    }
  }

  /**
   * navigate the images uploaded for an observation.
   */
  navigateImages(direction) {
    if ((direction === 'next' && !this.nextBtn && this.imageModalData) || (direction === 'prev' && !this.prevBtn && this.imageModalData)) {
      this.selectedType = true;
      this.showMarkerMap = true;
      this.selectedMediaType = 'markedImage';
      this.resetZoom();
      let masterImageRows = this.obsData;
      masterImageRows = this.obsStatusFilterPipe.transform(masterImageRows, this.selectedObsStatus);
      this.imageModalData = (direction === 'next') ? JSON.parse(JSON.stringify(masterImageRows.filter(data => data.thumbnailImageUrl != '')[masterImageRows.filter(data => data.thumbnailImageUrl != '').findIndex(item => item.faultId === this.imageModalData.faultId) + 1])) : JSON.parse(JSON.stringify(masterImageRows.filter(data => data.thumbnailImageUrl != '')[masterImageRows.filter(data => data.thumbnailImageUrl != '').findIndex(item => item.faultId === this.imageModalData.faultId) - 1]));
      this.scaleAspectRatio();
      this.selectedMode = false;
      this.evidenceMode = false;
      this.clearCanvas();
      this.faultData = this.resetRiskRating(this.imageModalData.faults);
      this.navigationBtnDisable(masterImageRows);
      this.initiateZoom();
    }
  }


  scaleAspectRatio() {
    this.actionPoints = [];
    this.imageModalData?.annotations?.forEach(item => {
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

  /**
   * reset risk ratings to default.
   */
  resetRiskRating(faults) {
    faults?.forEach(item => {
      item.ratingDetails = { ...item.ratingDetails, editRating: item.ratingDetails.rating };
    });
    return faults;
  }

  /**
   * clears annotation canvas.
   */
  clearCanvas() {
    let canvas: any = document.getElementById('canvas');
    canvas.getContext('2d').clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }


  onObsStatusChange(date) {

    this.searchText = '';
    this.selectedRows = [];
    if (this.obsFilters.sortBy === 'dateDesc') {
      this.obsData.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }
    else if (this.obsFilters.sortBy === 'dateAsc') {
      this.obsData.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    }
    else if (this.obsFilters.sortBy === 'ratingDesc') {
      this.obsData.sort((a, b) => {
        return b.ratingDetails.rating - a.ratingDetails.rating;
      });
    }
    else if (this.obsFilters.sortBy === 'ratingAsc') {
      this.obsData.sort((a, b) => {
        return a.ratingDetails.rating - b.ratingDetails.rating;
      });
    }
    else if (this.obsFilters.sortBy === 'zone') {
      this.obsData.sort((a, b) => {
        if (a.zone < b.zone) {
          return -1;
        }
        if (b.zone < a.zone) {
          return 1;
        }
        return 0;
      });
    }
    else if (this.obsFilters.sortBy === 'category') {
      this.obsData.sort((a, b) => {
        if (a.riskLevel < b.riskLevel) {
          return -1;
        }
        if (b.riskLevel < a.riskLevel) {
          return 1;
        }
        return 0;
      });
    }
    else if (this.obsFilters.sortBy === 'status') {
      this.obsData.sort((a, b) => {
        if (a.isOpen < b.isOpen) {
          return -1;
        }
        if (b.isOpen < a.isOpen) {
          return 1;
        }
        return 0;
      });
    }
    if (this.obsFilters.availableDates?.length) {
      this.obsFilters.availableDates = typeof (this.obsFilters.availableDates) == 'string' ? [this.obsFilters.availableDates] : this.obsFilters.availableDates
      this.filterDates = this.obsFilters.availableDates.filter(date => date != 'All Dates');

      if (this.obsFilters.sortBy === 'dateAsc') {
        this.filterDates.sort((a, b) => {
          return new Date(a).getTime() - new Date(b).getTime();
        });
      }
      else {
        this.filterDates.sort((a, b) => {
          return new Date(b).getTime() - new Date(a).getTime();
        });
      }
      if (date) {
        this.selectedFilterDate = date;
      } else {
        let searchObservationDate = JSON.parse(sessionStorage.getItem('searchObservation'));
        if (searchObservationDate) {
          this.selectedFilterDate = searchObservationDate.date
        }
      }
      if (!this.selectedFilterDate) {
        this.selectedFilterDate = (this.filterDates?.length > 0) ? this.filterDates[0] : '';
      }
      if (this.dateScroll) {
        this.scrollToDate();
      }
    }
    else {
      this.filterDates = [];
      this.selectedFilterDate = '';
    }
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

  /**
   * fetch faults choice logic.
   */
  fetchFaultsChoice() {
    this.dataService.passSpinnerFlag(true, true)
    this.safetyAndSurveillanceCommonService.fetchFaultsChoice().subscribe(
      faultsChoice => {
        let faults: any = faultsChoice;
        this.faultsChoice = faults.map(fault => fault.choice_name);
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  scrollToDate() {
    setTimeout(() => {
      $('#selectedDate').animate({
        scrollLeft: $('#dates' + this.selectedFilterDate).position()?.left - 200
      });
    }, 500);
  }

  /**
   * fetch category wise fault count api call.
   */
  fetchZonewiseFaultCount(tabChangeFlag, displayType) {
    this.iogpService.fetchZonewiseFaultCount().subscribe(
      faultCount => {
        if (this.obsImageDetails['locationMap']) {
          this.obsImageDetails['locationMap'].forEach(zone => {
            zone.openCount = (faultCount[zone.name]) ? Object.keys(faultCount[zone.name]).map(item => { return faultCount[zone.name][item]['open'] }).reduce((a, b) => a + b, 0) : '-';
            zone.closeCount = (faultCount[zone.name]) ? Object.keys(faultCount[zone.name]).map(item => { return faultCount[zone.name][item]['close'] }).reduce((a, b) => a + b, 0) : '-';
          });
        }
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.fetchFaultCount(tabChangeFlag, displayType, null);
      }
    )
  }

  /**
   * fetch faults counts
   */
  fetchFaultCount(tabChangeFlag, displayType, d) {
    this.dataService.passSpinnerFlag(true, true);
    let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
    if(searchObservation){
      if(this.isPermitEnabled){
          this.getFaultCount();

      }else{
        this.getFaultCount();
      }
    }
    else{
        this.getFaultCount();
    }
  }

  /**
   * get faults count for the selected items.
   */
  getFaultCount() {
    if (this.GlobalUsed) {
      this.obsFilters = {
        riskRating: [],
        zone: [],
        category: []
      }
      let obbsFilterData = JSON.parse(sessionStorage.getItem('filterData')) ? JSON.parse(sessionStorage.getItem('filterData')) : {};
        obbsFilterData.rating = [];
        obbsFilterData.zones = [];
        obbsFilterData.category = [];
        sessionStorage.setItem('filterData', JSON.stringify(obbsFilterData));
    }
    let zoneId = [];
    let categoryIds = [];
    let data = JSON.parse(sessionStorage.getItem('obsData'))
    let allZones = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        if (this.obsFilters.zone == 'All Zones') {
          if (key != 'All Zones' && value['id']) {
            allZones.push(key)
            zoneId.push(value['id'])
          }
        } else {
          let index = this.obsFilters?.zone?.find(data => data == key);
          if (index) {
            if (key != 'All Zones' && value['id']) {
              zoneId.push(value['id'])
            }
          }
        }

      }
      if (this.obsFilters.zone == 'All Zones') {
        allZones.forEach(zone => {
          for (const [key, value] of Object.entries(data[zone])) {
            let index = this.obsFilters.category.find(category => category == key)
            let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
            if (!categoryId && index) {
              if (key != 'All Categories' && value['category_id']) {
                categoryIds.push(value['category_id'])
              }
            }
          }
        })
      } else {
        if (this.obsFilters?.zone?.length) {
          this.obsFilters?.zone?.forEach(zone => {
            for (const [key, value] of Object?.entries(data[zone])) {
              let index = this.obsFilters.category.find(category => category == key)
              let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
              if (!categoryId && index) {
                if (key != 'All Categories' && value['category_id']) {
                  categoryIds.push(value['category_id'])
                }
              }
            }
          })
        }
      }
      if (this.obsFilters.zone == 0) {
        for (const [zoneKey, zoneValue] of Object.entries(data)) {
          if (zoneKey != 'All Zones' && zoneValue['id']) {
            for (const [key, value] of Object.entries(data[zoneKey])) {
              let index = this.obsFilters.category.find(category => category == key)
              let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
              if (!categoryId && index) {
                if (key != 'All Categories' && value['category_id']) {
                  categoryIds.push(value['category_id'])
                }
              }
            }
          }
        }
      }

      if (this.GlobalUsed) {
        categoryIds = [];
        zoneId = []
      }

      let time = this.obsFilters.time ? this.obsFilters.time : [];
      this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
        let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
        if(searchObservation){
          this.custom_start_date = searchObservation['date']
        }
        else{
          this.custom_start_date = data['data']['startDate']
        }
        // this.custom_start_date = data['data']['startDate']
        this.custom_end_date = data['data']['endDate']
        this.selectedUnitItems = data['data']['units']
       })
      let manuallySelectedPermits = JSON.parse(sessionStorage.getItem('manuallySelectedPermits'))
        if(manuallySelectedPermits?.length > 0){
         this.obsFilters.permit = manuallySelectedPermits
         }
      this.iogpService.fetchFaultCount(this.selectedUnitItems, zoneId, categoryIds, this.obsFilters.date, time, this.obsFilters.mode, this.is_highlight, this.custom_start_date, this.custom_end_date, this.obsFilters.riskRating, this.obsFilters.status, this.obsFilters.permit, this.obsFilters.permitType, this.obsFilters.nature, this.obsFilters.vendors, this.obsFilters.issuers,this.obsFilters.auditObs).subscribe(
        faultCount => {
          this.openCloseCount = {
            open: 0,
            close: 0,
            snooze: 0,
            archive: 0
          };
          let keys = Object.keys(faultCount);
          this.openCloseCount.open = keys.map(item => { return faultCount[item]['open'] }).reduce((a, b) => a + b, 0);
          this.openCloseCount.close = keys.map(item => { return faultCount[item]['close'] }).reduce((a, b) => a + b, 0);
          this.openCloseCount.snooze = keys.map(item => { return faultCount[item]['snooze'] }).reduce((a, b) => a + b, 0);
          this.openCloseCount.archive = keys.map(item => { return faultCount[item]['archive'] }).reduce((a, b) => a + b, 0);
          this.safetyAndSurveillanceDataService.passOpenCloseCount(this.openCloseCount);
        },
        error => {
        this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          // this.getScreenSize();
          // this.fetchObsData("", 1, this.noOfRows);

          var searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))

          if (sessionStorage.getItem('searchObservation') != undefined && sessionStorage.getItem('searchObservation')) {
            var selectedUnit = JSON.parse(sessionStorage.getItem('allUnits')).filter(unit => unit.name == searchObservation.unit)

            let startWith: any = 0;
            let today = new Date();
            let dd: any = today.getDate();
            let mm: any = today.getMonth() + 1;//January is 0!`

            let yyyy = today.getFullYear();
            if (dd < 10) { dd = '0' + dd }
            if (mm < 10) { mm = '0' + mm }
            let toDay = yyyy + '-' + mm + '-' + dd;
            if(this.selectedUnitItems?.length >= 1){
              this.iogpService.fetchobservationsPageNum([], [], searchObservation.date, toDay, [], [], 1, 10, this.selectedUnitItems, this.is_highlight, [], [], 'dateDesc', 'Images', searchObservation.id,this.obsFilters.permit, this.obsFilters.permitType, this.obsFilters.nature, this.obsFilters.vendors, this.obsFilters.issuers).subscribe(
                (selectedPage: any) => {
                  this.selectedMode = false;
                  this.globalSearchSelectedPage = selectedPage;
                  startWith = ((selectedPage - 1) * this.noOfRows) + 1;
                },
                (err) => {

                },
                () => {

                  this.fetchObsData("", startWith, this.noOfRows)
                })
            }
          } else {
            // this.getNumberOfObs()
            this.fetchObsData("", this.startWith, this.noOfRows)
          }

          this.observationStatusDropdown = false
          this.getTotalObsCount();
        }
      )
    } else {
      this.dataService.passSpinnerFlag(false, true)
    }

  }

  /**
   * api to get the observations by start and offset.
   * @param start start of the pagination
   * @param offset no of records per page.
   */
  fetchObsData(date, start?, offset?) {

    this.dataService.passSpinnerFlag(true, true);
    let zoneId = [];
    let categoryIds = [];
    let data = JSON.parse(sessionStorage.getItem('obsData'))
    let allZones = []
    for (const [key, value] of Object.entries(data)) {
      if (this.obsFilters.zone == 'All Zones') {
        if (key != 'All Zones' && value['id']) {
          allZones.push(key)
          zoneId.push(value['id'])
        }
      } else {
        let index = this.obsFilters?.zone?.find(data => data == key);
        if (index) {
          if (key != 'All Zones' && value['id']) {
            zoneId.push(value['id'])
          }
        }
      }

    }
    if (this.obsFilters.zone == 'All Zones') {
      allZones.forEach(zone => {
        for (const [key, value] of Object.entries(data[zone])) {
          let index = this.obsFilters.category.find(category => category == key)
          let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
          if (!categoryId && index) {
            if (key != 'All Categories' && value['category_id']) {
              categoryIds.push(value['category_id'])
            }
          }
        }
      })
    } else {
      this.obsFilters?.zone?.forEach(zone => {
        for (const [key, value] of Object.entries(data[zone])) {
          let index = this.obsFilters.category.find(category => category == key)
          let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
          if (!categoryId && index) {
            if (key != 'All Categories' && value['category_id']) {
              categoryIds.push(value['category_id'])
            }
          }
        }
      })
    }
    if (this.obsFilters.zone == 0) {
      for (const [zoneKey, zoneValue] of Object.entries(data)) {
        if (zoneKey != 'All Zones' && zoneValue['id']) {
          for (const [key, value] of Object.entries(data[zoneKey])) {
            let index = this.obsFilters.category.find(category => category == key)
            let categoryId = categoryIds.find(categoryId => categoryId == value['category_id']);
            if (!categoryId && index) {
              if (key != 'All Categories' && value['category_id']) {
                categoryIds.push(value['category_id'])
              }
            }
          }
        }
      }
    }

    let time = this.obsFilters.time ? this.obsFilters.time : [];
    this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(units => {
      this.selectedUnitItems = units
    })
    this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
      let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
      if(searchObservation){
        this.custom_start_date = searchObservation['date']
      }
      else{
        this.custom_start_date = data['data']['startDate']
      }
      // this.custom_start_date = data['data']['startDate']
      this.custom_end_date = data['data']['endDate']
      this.selectedUnitItems = data['data']['units']
     })

    // var mode = !(this.obsFilters.mode?.length < 2) ? [] : this.obsFilters.mode

    if(this.selectedUnitItems?.length > 0) {
      window.dispatchEvent(new CustomEvent('enable-units'))
      if (this.GlobalUsed) {
        categoryIds = [];
        zoneId = []
      }
      
      let manuallySelectedPermits = JSON.parse(sessionStorage.getItem('manuallySelectedPermits'))
        if(manuallySelectedPermits?.length > 0){
         this.obsFilters.permit = manuallySelectedPermits
         }

      let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
         if(searchObservation){
          zoneId = [searchObservation?.zone]
         }

      this.iogpService.fetchObsData(zoneId, categoryIds, this.custom_start_date, this.custom_end_date, time, this.obsFilters.mode, start, offset, this.selectedUnitItems.flat(), this.is_highlight, this.obsFilters.riskRating, this.obsFilters.status, this.obsFilters.sortBy, this.obsFilters.displayType, this.obsFilters.permit, this.obsFilters.permitType, this.obsFilters.nature, this.obsFilters.vendors, this.obsFilters.issuers,this.obsFilters.auditObs).subscribe(
        obsData => {
          this.arrayLenght = obsData['pagination'].total;
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
                'remarks': element?.remarks,
                'vendor': element.vendor,
                'observationId': element.observations[0].pk,
                'observation': element.observations[0].text,
                'editObservation': element.observations[0].text,
                'recommendation': element.observations[0].recommendations[0].text,
                'editRecommendation': element.observations[0].recommendations[0].text,
                'ratingDetails': (element.observations[0].ratings[0]) ? { ...element.observations[0].ratings[0], editRating: element.observations[0].ratings[0].rating } : { rating: 0, editRating: 0, updated_by: { username: '' } },
                'createdBy': element.observations[0].updated_by?.username,
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
                  'zone': item.zone,
                  'unit': item.unit,
                  'category': item.job,
                  'date': item.date,
                  'time': item.time,
                  'faults': faults,
                  'annotations': annotations,
                  'name': item.name.split('.')[0],
                  'imageName': item.name.split('.')[0],
                  // 'imageUrl': item.path,
                  // 'rawImageUrl': (item.raw_path) ? item.raw_path : '',
                  'imageUrl':this.decryptUrl(item.path),
                    'rawImageUrl': (item.raw_path) ? this.decryptUrl(item.raw_path) : '',
                  'rawImageName': (item.raw_image_name) ? item.raw_image_name.split('.')[0] : '',
                  'thumbnailImageUrl': (index === 0) ? (item.thumbnail) ? item.thumbnail : item.path : '',
                  'videoUrl': (item.video_path) ? this.decryptUrl(item.video_path): '',
                  'videoName': (item.video_name) ? item.video_name.split('.')[0] : '',
                  // 'rawVideoUrl': (item.raw_video_path) ? item.raw_video_path : '',
                  'rawVideoUrl': (item.raw_video_path) ? this.decryptUrl(item.raw_video_path): '',
                  'vendor_name': (item.vendor_name) ? item.vendor_name : '',
                  'type_of_permit': (item.type_of_permit) ? item.type_of_permit : '',
                  'nature_of_work': (item.nature_of_work) ? item.nature_of_work : '',
                  'camera_id':(item.camera_id) ? item.camera_id : '',
                  'permit_number':(item.permit_number) ? item.permit_number : '',
                  'permit_start_date':(item.permit_start_date) ? item.permit_start_date : '',
                  'permit_start_time':(item.permit_start_time) ? item.permit_start_time : '',
                  'permit_end_date':(item.permit_end_date) ? item.permit_end_date : '',
                  'permit_end_time':(item.permit_end_time) ? item.permit_end_time : '',
                  'permit_work_detail':(item.permit_work_detail) ? item.permit_work_detail : '',
                  'issuer_name': (item.issuer_name) ? item.issuer_name : '',
                  'permit_receiver_name': (item.permit_receiver_name) ? item.permit_receiver_name : '',
                  'mode': (item.mode) ? item.mode : '',
                  'rawVideoName': (item.raw_video_name) ? item.raw_video_name.split('.')[0] : '',
                  'faultId': element.id,
                  'isHighlight': element.observations[0].is_highlight,
                  'riskLevel': item.category,
                  'is_open': (element.is_open) ? 'Open' : element.status,
                  'isOpen': (element.is_open) ? 'Open' : element.status,
                  'snoozeDate': (element.status === 'Snooze') ? this.returnDate(element.snooze_date.split('-').concat(element.snooze_time.split(':'))) : date,
                  'editSnoozeDate': (element.status === 'Snooze') ? this.returnDate(element.snooze_date.split('-').concat(element.snooze_time.split(':'))) : date,
                  'editFlag': false,
                  'editRemarks': element?.remarks,
                  'remarks': element?.remarks,
                  'vendor': element.vendor,
                  'observationId': element.observations[0].pk,
                  'observation': element.observations[0].text,
                  'editObservation': element.observations[0].text,
                  'recommendation': element.observations[0].recommendations[0].text,
                  'editRecommendation': element.observations[0].recommendations[0].text,
                  'x': element.observations[0].x_marker,
                  'y': element.observations[0].y_marker,
                  'ratingDetails': (element.observations[0].ratings[0]) ? { ...element.observations[0].ratings[0], editRating: element.observations[0].ratings[0].rating } : { rating: 0, editRating: 0, updated_by: { username: '' } },
                  'createdBy': element.observations[0].updated_by?.username,
                  'createdAt': moment(element.observations[0].created_at).format('YYYY-MM-DD'),
                  'updatedAt': element.observations[0].updated_at.split('T')[0],
                  'disabled': !element.is_open  
                }));
              }));
          });
          this.obsData = JSON.parse(JSON.stringify(this.obsData));
          this.safetyAndSurveillanceDataService.passObservationsSearchText(this.obsData, this.searchText);
          this.tempObsData = JSON.parse(JSON.stringify(this.obsData));

          // this.getObservations();

          let masterImageRows = this.filterPipe.transform(this.obsData, this.searchText, this.searchParams);
          masterImageRows = this.riskFilterPipe.transform(masterImageRows, this.obsFilters.riskRating);
          masterImageRows = this.statusFilterPipe.transform(masterImageRows, this.obsFilters.status);
          masterImageRows = this.obsStatusFilterPipe.transform(masterImageRows, this.selectedObsStatus);

          let selectedFirstElement = {};
          let dates = this.obsData.map(data => { return data.date })
          dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          this.obsData = JSON.parse(JSON.stringify(this.obsData));

          let date = '';
          if (Object.keys(selectedFirstElement)?.length > 0 || this.obsData?.length >= 1) {
            if (this.imageModalData && Object.keys(this.imageModalData)?.length > 0) {
              let existingElement = this.obsData.filter(el => el.faultId === this.imageModalData.faultId);
              let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'));

              if (searchObservation) {
                this.imageModalData = this.obsData.find(fault => fault.faultId === Number(searchObservation.id));
                this.selectedObsStatus = this.imageModalData.isOpen.includes('Archive') ? 'archive' : this.imageModalData.isOpen.includes('Snooze') ? 'snooze' : 'openClose';
                setTimeout(() => {
                  this.selectedData(this.imageModalData);
                }, 1000);
              }
              else if (existingElement[0]) {
                this.selectedData(existingElement[0]);
              }
              else {
                if (Object.keys(selectedFirstElement)?.length > 0) {
                  this.selectedData(selectedFirstElement);
                } else {
                  this.selectedData(this.obsData[0]);
                }
              }
            }
            else {
              let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'));
              if (searchObservation) {
                this.imageModalData = this.obsData.find(fault => fault.faultId === Number(searchObservation.id));
                this.selectedObsStatus = this.imageModalData?.isOpen.includes('Archive') ? 'archive' : this.imageModalData?.isOpen.includes('Snooze') ? 'snooze' : 'openClose';
                this.scrollToObs();
                setTimeout(() => {
                  this.selectedData(this.imageModalData);
                }, 1000);

              }
              else {
                if (Object.keys(selectedFirstElement)?.length > 0) {
                  this.selectedData(selectedFirstElement);
                  date = selectedFirstElement['date'];
                } else {
                  this.selectedData(this.obsData[0]);
                  date = this.obsData[0]['date'];
                }
              }
            }

          }
          else {
            let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'));
            if (searchObservation) {
              this.imageModalData = this.obsData.find(fault => fault.faultId === Number(searchObservation.id));
              this.selectedObsStatus = this.imageModalData?.isOpen.includes('Archive') ? 'archive' : this.imageModalData?.isOpen.includes('Snooze') ? 'snooze' : 'openClose';
              this.scrollToObs();
              setTimeout(() => {
                this.selectedData(this.imageModalData);
              }, 1000);
            } else {
              this.imageModalData = {};
              this.obsData = [];
            }
          }
          this.noDataMsg = 'No images available in this category.';
          this.dataService.passSpinnerFlag(false, true);
        },
        error => {
        this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          this.commonService.resizeDatatable();
        // this.dataService.passSpinnerFlag(false, true);
          sessionStorage.removeItem('riskRating');
          sessionStorage.removeItem('selectedCategory');

          // sessionStorage.removeItem('searchObservation');
          sessionStorage.removeItem('selectedStatus');

          sessionStorage.removeItem('permit_number');
          sessionStorage.removeItem('type_of_permit');
          sessionStorage.removeItem('nature_of_work');
          sessionStorage.removeItem('issuer_name');
          sessionStorage.removeItem('vendor_name');

        }
      )
    } else {
      this.obsData = [];
      this.openCloseCount = {
        open: 0,
        close: 0,
        snooze: 0,
        archive: 0
      };
        this.dataService.passSpinnerFlag(false, true);
      if (sessionStorage.getItem('removed-from-filter') == 'true') {
        window.dispatchEvent(new CustomEvent('no-units-selected'))
        sessionStorage.removeItem('removed-from-filter')
      } else {
        window.dispatchEvent(new CustomEvent('disable-units'))
      }
    }
  }


  getObsData(date) {
    if (this.selectedMode) {
      this.changeMode();
    }
    this.selectedObsStatus = 'openClose';
    this.imageModalData = {};
    this.selectedCardData = {};
    this.selectedFilterDate = date;
    this.safetyAndSurveillanceDataService.passSelectedDate(date, true);
    this.safetyAndSurveillanceDataService.passToggleSidebar(true);
  }

  /**
   * pause observation video logic.
   */
  pauseVideo() {
    if (this.obsFilters.displayType === 'Videos') {
      let player: any = document.getElementsByTagName('video')[0];
      player.pause();
    }
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

  /**
   * get observations for global search.
   */
  getObservations() {
    // this.dataService.passSpinnerFlag(true, true);
    this.unitService.getObservations().subscribe(
      (observations: any) => {
        let unitNames = [];
        let selectedUnits = JSON.parse(sessionStorage.getItem('selectedUnits'));
        let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
        selectedUnits.forEach(ele => {
          let index = unitDetails.findIndex(data => { return data.id == ele });
          if (index >= 0) {
            unitNames.push(unitDetails[index].unitName)
          }
        })

        var unitsDetails = JSON.parse(sessionStorage.getItem('unitDetails')).filter(item => item.userGroup.includes('close'))

        observations = observations.filter((obs) => {
          return unitsDetails.some((unit) => {
            return obs.unit == unit.unitName
          })
        })
        this.safetyAndSurveillanceCommonService.getActions('','', '', '', '', '', '', '').subscribe({
          next:(actionData:any) =>{
            actionData?.actions?.forEach((val,ind) => {
             if(val?.object_type == 'fault_id' && val?.status == 'Open'){
                 let findIndex:any = observations.findIndex((val1) => {
                   return val1.id == val.object_type_id
                 });
                 if(findIndex >= 0){
                  observations.splice(findIndex,1)
                 }
             }
            })
            if (this.selectedTab == "observations") {
              this.bulkObs = observations.filter(obs => unitNames.indexOf(obs.unit) > -1 && !(['close', 'archive'].some(status => obs.fault_status.toLowerCase().includes(status)))).map(obs =>
                 { return { faultId: obs.id, date: obs.date, riskLevel: obs.category, unit: obs.unit }
              });
            } else {
              this.bulkObs = observations.filter(obs => unitNames.indexOf(obs.unit) > -1 && !(['close', 'archive'].some(status => obs.fault_status.toLowerCase().includes(status))) && (obs.is_highlight == true)).map(obs => { return { faultId: obs.id, date: obs.date, riskLevel: obs.category, unit: obs.unit } });
            }

            let dateList = this.bulkObs.map(date => date.date);
            this.uniqueDates = dateList.filter((v, i, a) => a.indexOf(v) === i);
            this.uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            this.vendorList();
        // this.dataService.passSpinnerFlag(false, true);
          },
          error:() => {
        this.dataService.passSpinnerFlag(false, true);
            this.msg = 'Error occured. Please try again.';
            this.snackbarService.show(this.msg, true, false, false, false);
          },
          complete:() => {

          }
        })

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

  /**
   * get observations for observations dropdown in bulk update.
   */
  getObservationsList() {
    let data = JSON.parse(sessionStorage.getItem('obsData'))
    let zoneid = '';
    let categoryid = '';
    for (const [key, value] of Object.entries(data)) {
      if (key == this.imageModalData.zone) {
        zoneid = value['id']

      }
    }

    for (const [key, value] of Object.entries(data)) {
      for (const [zoneKey, zoneValue] of Object.entries(data[key])) {

        if (zoneKey == this.imageModalData.riskLevel) {

          categoryid = zoneValue['category_id']

        }
      }
    }


    this.safetyAndSurveillanceCommonService.getObservationsList(this.imageModalData.observation, categoryid, zoneid, this.selectedUnit, this.imageModalData.date).subscribe((data: any) => {
      this.simObs = Object.values(data)
      this.simOb = this.simObs[0]
      this.simCat = this.simObs[1]
      this.sim = Object.values(this.simOb)
      this.cat = Object.values(this.simCat)
      this.c = Object.keys(this.simCat)
      this.simZone = this.simObs[2]
      setTimeout(()=>{
        this.mapped = Object.keys(this.simZone).map(key => ({ name: key, count: this.simZone[key] }));
        this.z = this.mapped.sort((a, b) => b.count - a.count)
      },2000)


    })
  }

  /**
   * get available vendors list.
   */
  vendorList() {
    if (sessionStorage.getItem('vendors')) {
      this.vendors = JSON.parse(sessionStorage.getItem('vendors'))
    } else {
      this.safetyAndSurveillanceCommonService.fetchVendorList().subscribe((data: any) => {
        this.vendors = data;
        sessionStorage.setItem('vendors', JSON.stringify(this.vendors))
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
  }

  /**
   * get observations video (if filter type is videos.)
   */
  fetchObsVideos() {
    this.iogpService.fetchObsVideos(this.obsFilters.zone).subscribe(
      obsVideos => {
        let obsData: any = [];
        obsData = obsVideos;
        this.obsData = [];
        obsData.forEach(video => {
          this.obsData.push({ 'video': video.name, 'videoSourceUrl': video.path });
        });
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.commonService.resizeDatatable();
      }
    )
  }

  /**
   * mark an observation as highlight or not.
   */
  updateHighlightObservations() {
    this.dataService.passSpinnerFlag(true, true);
    this.selectedRow = this.selectedCardData;
    this.selectedCardData.isHighlight = !this.selectedCardData.isHighlight;
    this.iogpService.updateHighlightObservations(this.selectedCardData.observationId, this.selectedCardData.isHighlight).subscribe(
      obsVideos => {
        this.msg = (this.selectedCardData.isHighlight) ? 'Observation added to SIF successfully.' : 'Observation removed from SIF successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.safetyAndSurveillanceDataService.passSelectedDate(this.selectedRow.date, true);
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.commonService.resizeDatatable();
      }
    )
  }

  /**
   * opens filter sidebar.
   */
  onRouteClicked() {
    this.safetyAndSurveillanceDataService.passToggleSidebar(this.isRouteClicked);
  }


  sideBarSelectedItem(data: any) {
    this.dataService.passSpinnerFlag(true, true);
    this.selectedSideBarItem = data;
    this.obsData = [];
    this.openCloseCount = {
      open: 0,
      close: 0,
      snooze: 0,
      archive: 0
    };
    this.safetyAndSurveillanceDataService.passOpenCloseCount(this.openCloseCount);
    this.selectedMode = false;
    this.evidenceMode = false;
    this.filterDates = [];
    sessionStorage.removeItem('selectedUnitDate');
    sessionStorage.setItem('selectedUnit', this.selectedSideBarItem);
    let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(unitDetails.find(unit => unit.unitName === this.selectedSideBarItem)));
    this.safetyAndSurveillanceDataService.passSelectedUnit(this.selectedSideBarItem, true);
    this.imageModalData = {};
    document.getElementById("dates")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
    this.safetyAndSurveillanceDataService.passToggleSidebar(true);

  }

  /**
   * load the encrypted image url.
   * @param imageId image-id
   * @param imageUrl image-url.enc
   */
  fetchEncryptedImageData(imageId, imageUrl) {
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
    let time_zone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    let dateTime = moment().tz(time_zone).format("YYYY-MM-DD HH:mm:ss")
    let date = new Date(dateTime);
    return date;
  }

  /**
   * select an annotation to view.
   */
  annotationSelect(data) {
    this.annotationNumber = data;
  }

  /**
   * select all observations in bulk update.
   */
  onSelectAll() {
    this.multipleIssuesData.ids = this.filteredObs.map(obs => obs.faultId)
  }

  /**
   * clear all observations in bulk update.
   */
  onClearAll() {
    this.multipleIssuesData.ids = [];
  }

  /**
   * type change as image or video.
   */
  onSelectedTypeChange(type) {
    this.evidenceMode = false;
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

  /**
   * clear remarks of an observation in status change.
   */
  clearTextArea($event, row) {
    this.obsData[this.obsData.findIndex(item => item['faultId'] === row['faultId'])]['isOpen'] = $event;
    this.selectedCardData.isOpen = this.obsData[this.obsData.findIndex(item => item['faultId'] === row['faultId'])]['isOpen']
    this.obsData[this.obsData.findIndex(item => item['faultId'] === row['faultId'])]['remarks'] = '';

  }

  /**
   * logic to close an observation.
   */
  selectedVendor() {
    if (this.actionStatus && !(this.selectedCardData?.isOpen == 'Snooze' || this.selectedCardData?.isOpen == 'Open')) {
      this.msg = "All action(s) are to be closed to close the observation.";
      this.snackbarService.show(this.msg, false, false, false, true);
      this.selectedCardData.isOpen = this.imageModalData.is_open;
    } else {
      this.selectedCardData.editSnoozeDate = '';
      this.uploadStatusFilesList = [];
      $('#exampleModalToggle').modal('show');
      if (!this.selectedCardData.vendor || this.selectedCardData?.isOpen == 'Open') {
        this.selectedCardData.vendor = ''
      }
    }
  }

  textAreaChange(event, row) {
  }

  /**
   * change image or video mode of evidence.
   */
  changeMode() {
    this.evidenceMode = false;
    if (this.shareShows) {
      this.shareShows = false;
    }
    this.selectedMode = !this.selectedMode;
    this.evidenceMode = false;
    this.confirmMailShow = false
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
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('View annotations', 'Annotate observation');
      this.zoom.pause();
    }
    this.scaleAspectRatio();
    this.trigger = Date.now();
  }

  /**
   * logic to show and hide the confirm mail in share.
   */
  showConfirmMail() {
    this.confirmMailShow = !this.confirmMailShow
  }
  shareShow() {
    if (this.selectedMode) {
      this.changeMode();
    }
    this.shareShows = !this.shareShows
    this.confirmMailShow = false
  }


  /**
   * add email ids to be tagged.
   */
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
        this.safetyAndSurveillanceCommonService.validateEmailID(this.sendObservationData.emailID, this.imageModalData.unit).subscribe(
          validStatus => {
            if (validStatus) {
              this.msg = '';
              this.sendObservationData.emailIDList.push(this.sendObservationData.emailID);
              this.sendObservationData.emailID = '';
            }
            else {
              this.msg = 'Observation cannot be shared since ' + this.sendObservationData.emailID + ' does not have access to ' + this.imageModalData?.unit + ' unit.';
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

  /**
   * share observation to the added emails.
   */
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

  /**
   * delete faults for an observation logic.
   */
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

  /**
   * update risk rating email logic.
   */
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

  /**
   * update status of an observation.
   */
  submitStatus(row) {
    sessionStorage.setItem('type', 'HSSE/observations/close_observation')
    window.dispatchEvent(new CustomEvent('button_click'))

    this.selectedRow = (row === '') ? this.selectedRow : row;
    this.updateFaults();
    this.postEvidence();
  }

  /**
   * update the faults of an observation.
   */
  updateFaults() {
    this.dataService.passSpinnerFlag(true, true);
    let image: any = {};
    let time_zone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    let formattedDate = moment().tz(time_zone).format("DD-MMM-yyyy HH:mm:ss")
    image['name'] = this.selectedRow['imageName'] + '.jpg';
    image['risk_level'] = this.selectedRow['riskLevel'];
    image['observations'] = this.selectedRow['observation'];
    image['vendor'] = this.selectedRow['vendor'];
    image['recommendations'] = this.selectedRow['recommendation'];
    image['is_open'] = this.selectedRow['isOpen'].includes('Open') ? true : false;
    image['id'] = this.selectedRow['faultId'];
    image['remarks'] = (this.selectedRow['isOpen'].includes('Open') || this.selectedRow['isOpen'] === 'Snooze') ? this.selectedRow['remarks'] : this.selectedRow['remarks'] + '\nBy ' + sessionStorage.getItem('userName') + '\n' + formattedDate;
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

  /**
   * matomo event to show that the status change was cancelled.
   */
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
    this.selectedCardData.isOpen = this.imageModalData.isOpen;
  }

  /**
   * matomo event to show that the bulk status change was cancelled.
   */
  onBulkStatusCancel() {
    if (this.multipleIssuesData.status.includes('Close')) {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Incomplete bulk observation closure', 'Bulk close observation');
    }
    else if (this.multipleIssuesData.status.includes('Snooze')) {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Incomplete bulk observation snooze', 'Bulk snooze observation');
    }
    else if (this.multipleIssuesData.status.includes('Archive')) {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Incomplete bulk observation archive', 'Bulk archive observation');
    }
  }

  /**
   * reset bulk update.
   */
  resetMultipleIssuesData() {
    this.selectedMultipleDate = [];
    this.multipleIssuesData = {
      ids: [],
      status: 'Open',
      remarks: '',
      vendor: undefined
    };
    let date: Date
    this.snoozeDate = date;
  }

  /**
   * update multiple faults in bulk update api call.
   */
  updateMultipleFaults() {
    sessionStorage.setItem('type', 'HSSE/observations/bulk_close_observations')
    window.dispatchEvent(new CustomEvent('button_click'))
    this.dataService.passSpinnerFlag(true, true);
    let image = {};
    let time_zone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone
    let formattedDate = moment().tz(time_zone).format("DD-MMM-yyyy HH:mm:ss")
    image['is_open'] = this.multipleIssuesData.status.includes('Open') ? true : false;
    image['ids'] = this.multipleIssuesData.ids.join(',');
    image['remarks'] = (this.multipleIssuesData.status.includes('Open') || this.multipleIssuesData.status === 'Snooze') ? this.multipleIssuesData?.remarks : this.multipleIssuesData?.remarks + '\nBy ' + sessionStorage.getItem('userName') + '\n' + formattedDate;
    image['action'] = this.multipleIssuesData.status;
    image['units'] = this.selectedUnit;
    if (image['action'] === 'Snooze') {
      image['date'] = this.commonService.formatDate(this.snoozeDate);
      image['time'] = this.commonService.formatTimeElement(this.snoozeDate);
    }
    image['vendor'] = this.multipleIssuesData.vendor;
    this.safetyAndSurveillanceCommonService.updateMultipleFaults(image).subscribe(
      updateStatus => {
        $('#confirmationModal' + this.category).modal('hide');
        this.msg = 'Fault(s) updated successfully.';
        this.resetMultipleIssuesData();
        this.snackbarService.show(this.msg, false, false, false, false);
        this.selectedRows = [];
        this.submitObservation = undefined;
        $('#exampleModal').modal('hide');
        this.safetyAndSurveillanceDataService.passObservationPopupFlag(false, false, false, false);
        if (image['action'].includes('Close')) {
          this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful bulk observation closure', 'Bulk close observation');
        }
        else if (image['action'].includes('Snooze')) {
          this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful bulk observation snooze', 'Bulk snooze observation');
        }
        else if (image['action'].includes('Archive')) {
          this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful bulk observation archive', 'Bulk archive observation');
        }
        this.safetyAndSurveillanceDataService.passSelectedDate(this.selectedFilterDate, true);
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  /**
   * on close of the confirmation modal.
   */
  closeConfirmationModal() {
    $('#bulkConfirmationModal').modal('hide');
    this.resetMultipleIssuesData();
    this.submitObservation = undefined;
    $('#exampleModal').modal('hide');
    this.safetyAndSurveillanceDataService.passObservationPopupFlag(false, false, false, false);
  }

  /**
   * on confirm of the confirmation modal.
   */
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

  /**
   * resets send observations email ids.
   */
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

  /**
   * update risk rating
   */
  selectedData(data, fromMouseClick?: boolean) {
    this.observationStatusDropdown = false
    // var myDiv = document.getElementById('image');
    // myDiv.scrollTop = 0;
    // this.scrollToObs();
    // setTimeout(() => {
    //   $('#obsContainer').animate({
    //     scrollTop: $('#image' + this.imageModalData.faultId).position().top
    //   });
    // }, 500);
    // this.divToScroll.nativeElement.scrollTop = 20;

    // this.insightBody.observation_id=data.observationId
    // this.insightBody.unit = data.unit
    // this.insightBody.zone = data.zone
    let dashboardUrl = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/safety_and_surveillance/'
    let centralDashboardUrl = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/'
    this.insightBody = {
      unit: data?.unit,
      zone: data.zone,
      risk: data.ratingDetails.rating,
      category: data.riskLevel,
      observation: data.observation,
      recommendation: data.recommendation,
      date: data.date,
      observation_id: data.observationId,
      get_token: centralDashboardUrl + 'get_auth_token/',
      get_obs: dashboardUrl + 'observations_select/',
      user: btoa(sessionStorage.getItem('user-email')),
      "im-type": null
    }
    if (this.searchText?.length > 0) {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Usage of search observation in observations page', 'Search observation');
    }
    let type = sessionStorage.getItem('ratingUpdate');
    if (type == 'True') {
      this.msg = 'Risk Rating updated successfully.';
      this.snackbarService.show(this.msg, false, false, false, false);
    } else {
      this.confirmMailShow = false;
    }
    sessionStorage.removeItem('ratingUpdate')
    this.sendObservationData.emailIDList = []
    this.sendObservationData.emailID = ''
    this.noImageAvailble = false;
    this.selectedCardData = data;
    this.status = this.selectedCardData?.status
    this.shareShows = false;
    this.ratingChanges = false;
    this.rowClick(data);
    if (fromMouseClick) {
      this.ReInitialize();
    }
  }

  setUserActivityData(postData) {
    let data: any = {};
    data = {
      module: 'safetyAndSurveillance',
      level: 'unit',
      page: 'observations',
      feature: 'imageModal',
      data: postData,
    };
    this.userActivityData.safetyAndSurveillance.unit.observations.imageModal = postData;
    sessionStorage.setItem('userActivity', JSON.stringify(this.userActivityData))
  }

  /**
   * get all available units.
   */
  getAvailableUnits() {
    this.dataService.passSpinnerFlag(true, true)
    this.plantService.getAvailableUnits().subscribe(
      availableUnits => {
        if (availableUnits['IOGP_Category']) {
          let units: any = availableUnits;
          let unitList: any = [];
          this.units = [];
          Object.keys(units.IOGP_Category).forEach((unit) => {
            if (units.IOGP_Category[unit].access_permissions[0].indexOf('view') > -1) {
              let unitDetails = {};
              unitDetails['obsData'] = {};
              unitDetails['unitName'] = unit;
              unitDetails['startDate'] = units.IOGP_Category[unit].start_date;
              unitDetails['endDate'] = units.IOGP_Category[unit].end_date;
              unitDetails['totalObsFlights'] = units.IOGP_Category[unit].flights_count;
              unitDetails['userGroup'] = units.IOGP_Category[unit].access_permissions[0];
              unitDetails['obsData']['openCount'] = Object.keys(units.IOGP_Category[unit].faults_count).map(item => { return units.IOGP_Category[unit].faults_count[item].open }).reduce((a, b) => a + b, 0);
              unitDetails['obsData']['closeCount'] = Object.keys(units.IOGP_Category[unit].faults_count).map(item => { return units.IOGP_Category[unit].faults_count[item].close }).reduce((a, b) => a + b, 0);
              unitDetails['order'] = units.IOGP_Category[unit].order;
              unitDetails['id'] = units.IOGP_Category[unit].id
              unitList.push(unitDetails);

            }
          });
          unitList.sort((a, b) => (a.order < b.order) ? -1 : 1);
          this.units = unitList.map(unit => unit.unitName);
          sessionStorage.setItem('unitDetails', JSON.stringify(unitList));
          sessionStorage.setItem('unitCount', unitList?.length.toString());


          if (!this.selectedSideBarItem || this.selectedSideBarItem == 'null') {
            let selectedUnitDetails: any = unitList[0];
            sessionStorage.setItem('selectedUnit', selectedUnitDetails.unitName);
            sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
          }

        }

      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
        this.dataService.passSpinnerFlag(false, true)
      },
      () => {
        if(this.units?.length == 0) {
          this.obsData = []
          this.openCloseCount = {
            open: 0,
            close: 0,
            snooze: 0,
            archive: 0
          };
          var msg = "No data available."
          this.snackbarService.show(msg, false, false, false, true)
          this.dataService.passSpinnerFlag(false, true)
        } else {
          if (sessionStorage.getItem('selectedUnitDetails') != null) {
            this.selectedUnit = sessionStorage.getItem('selectedUnit');
            this.userGroup = JSON.parse(sessionStorage.getItem('selectedUnitDetails')).userGroup;
            this.getBirdEyeView();
          }
        }
      }
    )
  }

  /**
   * get units based on the selected page.
   */
  getUnitsData(selectedPage) {
    if (sessionStorage.getItem('availableUnits')) {
      var availableUnits: any = JSON.parse(sessionStorage.getItem('availableUnits'))
      this.setAvailableUnits(availableUnits)
    } else {
      this.plantService.getUnitsData(selectedPage).subscribe(
        (availableUnits: any) => {
          this.setAvailableUnits(availableUnits)
        },
        (error) => {
        this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        }
      )
    }

  }

  /**
   * setting available units in the dropdown.
   */
  setAvailableUnits(availableUnits: any) {
    this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(units => {
      this.selectedItems = units
    })
    if (Object.keys(availableUnits).length > 0 || availableUnits.length > 0) {
      if (availableUnits['IOGP_Category']) {
        this.units = [];
        this.unitList = [];
        let units: any = availableUnits;
        this.units = Object.keys(units.IOGP_Category);
        sessionStorage.setItem('availableUnits', JSON.stringify(availableUnits))
        this.units.forEach((unit) => {
          if (units.IOGP_Category[unit].access_permissions[0].indexOf('view') > -1) {
            let unitDetails = {};
            unitDetails['obsData'] = {};
            unitDetails['name'] = unit;
            unitDetails['startDate'] = units.IOGP_Category[unit].start_date;
            unitDetails['endDate'] = units.IOGP_Category[unit].end_date;
            unitDetails['id'] = units.IOGP_Category[unit].id;
            unitDetails['order'] = units.IOGP_Category[unit].order;
            this.unitList.push(unitDetails);
          }
        });
        this.unitList.sort((a, b) => { return b.order - a.order });
        sessionStorage.setItem('allUnits', JSON.stringify(this.unitList))
        this.safetyAndSurveillanceDataService.passAllUnits(this.unitList);
        if (this.selectedItems.length < 1) {
          this.selectedItems = this.unitList.map(key => { return key.id })
          sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))

        } else {
          let selectedItems = [];
          this.selectedItems.forEach(ele => {
            let index = this.unitList.findIndex(key => { return key.id == ele });
            if (index >= 0) {
              selectedItems.push(ele)
            }
          })
          this.selectedItems = selectedItems;
          sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))

        }

    }else if(availableUnits?.length > 0){
      this.units = [];
        this.unitList = [];
        let units: any = availableUnits;
        this.units = availableUnits;
        this.units.forEach((unit) => {
          let unitDetails = {};
          unitDetails['obsData'] = {};
          unitDetails['name'] = unit.name;
          unitDetails['startDate'] = unit.start_date;
          unitDetails['endDate'] = unit.end_date;
          unitDetails['id'] = unit.id;
          unitDetails['order'] = unit.order;
          this.unitList.push(unitDetails);
        });
        this.unitList.sort((a, b) => { return b.order - a.order });
        sessionStorage.setItem('allUnits', JSON.stringify(this.unitList))
        this.safetyAndSurveillanceDataService.passAllUnits(this.unitList);
        if(this.selectedItems?.length<1){
          this.selectedItems=this.unitList.map(key=>{return key.id})
          sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))

        } else {
          let selectedItems = [];
          this.selectedItems.forEach(ele => {
            let index = this.unitList.findIndex(key => { return key.id == ele });
            if (index >= 0) {
              selectedItems.push(ele)
            }
          })
          this.selectedItems = selectedItems;
          sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))

        }
      }
      this.unitList.reverse()
      sessionStorage.setItem('allUnits', JSON.stringify(this.unitList))
    } else {
      this.selectedItems = [];
        this.dataService.passSpinnerFlag(false, true);
    }

    if (JSON.parse(sessionStorage.getItem('selectedUnits')).length > 0 && this.selectedItems.length > 0) {
      var dates = []
      this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(data => {
        dates = data
      })
      this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedItems, dates['startDate'], dates['endDate']);
      this.safetyAndSurveillanceDataService.passSelectedUnits(this.selectedItems);
    } else {
      this.obsData = []
      this.openCloseCount = {
        open: 0,
        close: 0,
        snooze: 0,
        archive: 0
      };
      this.arrayLenght = 0
      var msg = "No data available."
      this.snackbarService.show(msg, false, false, false, true)
      this.dataService.passSpinnerFlag(false, true)
    }

  }


  /**
   * BEV map toggle.
   */
  mapShow(boolean) {
    this.showMap = !this.showMap;
    if (!boolean) {
      this.safetyAndSurveillanceDataService.passObservationPopupFlag(false, false, false, false);
    }
  }


  /**
   * change status of an observation.
   */
  onStatusChange(status) {
    this.obsData.forEach(obs => {
      obs.editSnoozeDate = obs.snoozeDate;
    });

    let obs = [];
    this.selectingStatus.forEach(ele => {
      let array = this.tempObsData.filter(el => el.isOpen.includes(ele));
      if(array?.length){
        array.forEach(obj =>{
          obs.push(obj)
        })
      }
    })
    this.obsData = obs?.length ? [...obs] : [];
    if(obs?.length > 0){
      let existingElement = this.obsData.filter(el => el.faultId === this.imageModalData.faultId);
      if (existingElement?.length > 0){
        this.selectedData(existingElement[0], true);
      }else{
        this.selectedData((obs?.length > 0 ? obs[0] : {}), true);
      }
    }else{
      this.selectedData((obs?.length > 0 ? obs[0] : {}), true);
    }
    this.safetyAndSurveillanceDataService.passObservationsSearchText(this.obsData, this.searchText);

  }
  changeSearchText(event) {
    this.safetyAndSurveillanceDataService.passObservationsSearchText(this.obsData, this.searchText);
  }

  giveTotalCount(e) {

    return (e?.nativeElement?.parentElement?.children.filter(child => child?.classList.includes('observations'))?.length);
  }
  defaultCardSelect(e) {

  }

  selectedImageVideoButtons(data) {
    this.selectedImageVideoButton = data;
  }

  /**
   * on select of zone in observations filters.
   */
  onZoneSelect($event) {
    sessionStorage.setItem('filterData', JSON.stringify({
      'units': this.obsFilters.unit,
      'zones': $event.location,
      'category': this.obsFilters.category,
      'dates': this.obsFilters.date,
      'availableDates': this.obsFilters.availableDates,
      'time': this.obsFilters.time,
      'mode': this.obsFilters.mode,
      'rating': this.obsFilters.riskRating,
      'status': this.obsFilters.status,
      'sort': this.obsFilters.sortBy,
      'type': this.obsFilters.displayType,
      'boolean': true,
    }))
    this.safetyAndSurveillanceDataService.passObservationsFilters(this.obsFilters.unit, $event.location, this.obsFilters.category, this.obsFilters.date, this.obsFilters.availableDates, this.obsFilters.time, this.obsFilters.mode, this.obsFilters.riskRating, this.obsFilters.status, this.obsFilters.sortBy, this.obsFilters.displayType, this.obsFilters.permit, this.obsFilters.permitType, this.obsFilters.nature, this.obsFilters.vendors, this.obsFilters.issuers,this.obsFilters.auditObs, true);
    this.showMap = false;
    this.safetyAndSurveillanceCommonService.sendMatomoEvent('Interacting with unit BEV', 'BEV');
  }

  /**
   * get total open count.
   */
  getObsCount(status) {
    return this.obsData.filter(el => el.is_open.includes(status))?.length;
  }

  /**
   * submit observation data.
   */
  submitObservationsData() {
    this.submitObservation = true;
  }

  getSoonDelayedRow = (row) => {
    if (row.id) {
      return {
        'open': row['status'] == 'Open',
        'close': row['status'] == 'Close',
      }
    }
  }

  dropdownShow() {
    if (!(!(this.userGroup?.indexOf('close') > -1) || this.selectedCardData.disabled)) {
      setTimeout(()=>{
        this.observationStatusDropdown = !this.observationStatusDropdown
      },500)
    }
  }
  unitNameSelect(status, i) {
    this.linkedIssueData[i].status = status;
    this.statusDropdown = -1;
    this.linkedIssueData.sort((id1, id2) => { return id2.id - id1.id })
    this.linkedIssueData = [...this.linkedIssueData]
  }

  /**
   * delete action from an observation.
   */
  removeAction(action_id) {
    this.actionId = action_id
    $('#deleteAction').modal('show');

  }
  deleteAction() {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.deleteAction(this.actionId).subscribe(data => {
      $('#deleteAction').modal('hide');
      this.getActionsData(this.imageModalData.faultId)
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Delete action', 'Action');
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

  /**
   * create a new action.
   */
  addSubObs() {
    sessionStorage.setItem('type', 'HSSE/sif/create_action')
    window.dispatchEvent(new CustomEvent('button_click'))
    if (this.imageModalData.isOpen == 'Archive' || this.imageModalData.isOpen == 'Closed-False Positive' || this.imageModalData.isOpen == 'Closed-No Action' || this.imageModalData.isOpen == 'Closed-Action Taken') {
      if (this.imageModalData.isOpen == 'Archive') {
        this.msg = "Unable to create action for a archived observation.";
      } else {
        this.msg = "Unable to create action for a closed observation.";
      }
      this.snackbarService.show(this.msg, false, false, false, true);
    } else {
      this.safetyAndSurveillanceCommonService.getAllUsersList(this.imageModalData.unit, 'close', true, true).subscribe(data => {
        this.closeAccessUsers = data
        const encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
        const key = CryptoJS.enc.Hex.parse(encryptionKey);
        this.closeAccessUsers.forEach(item => {
          // Decrypt email
          item.email = this.decryptUrl(item.email).replace(/^"(.*)"$/, '$1');

          // Decrypt id
          item.id = this.decryptUrl(item.id).replace(/^"(.*)"$/, '$1');

          // Decrypt name
          item.name = this.decryptUrl(item.name).replace(/^"(.*)"$/, '$1');


          // Decrypt username
          item.username = this.decryptUrl(item.username).replace(/^"(.*)"$/, '$1');
      });
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
      this.newSubTask['summary'] = ''
      this.selectedAssigneeId = []
      this.newSubTask['due_date'] = ''
      this.newSubTask['assignee'] = ''
      this.newSubTask['assignor'] = this.loginUserId
      this.addingSubObs = this.linkedIssueData?.length;
      this.linkedIssueData.push({ actionId: '', dueDate: '', assignee: '', summary: '', status: 'Open' })
      this.linkedIssueData = [...this.linkedIssueData]
    }
  }

  /**
   * submit the creation of a new action.
   */
  submitObs(i, obj) {
    sessionStorage.setItem('type', 'HSSE/observations/create_action')
    window.dispatchEvent(new CustomEvent('button_click'))

    let stDate = new Date(obj.due_date + ' 00:00:00')
    let startDate: any = stDate.getDate();
    if (startDate < 10) {
      startDate = '0' + startDate;
    } else {
      startDate = startDate;
    }
    let startMonth: any = stDate.getMonth() + 1;
    if (startMonth < 10) {
      startMonth = '0' + startMonth;
    } else {
      startMonth = startMonth;
    }
    let startDate1 = stDate.getFullYear() + '-' + startMonth + '-' + startDate
    let due_date = startDate1
    this.newSubTask['due_date'] = moment(this.newSubTask['due_date']).format('YYYY-MM-DD')  as any

    this.linkedIssueData.pop();
    this.dataService.passSpinnerFlag(true, true);
    // this.safetyAndSurveillanceCommonService.creatingAction(this.imageModalData.fault_id, this.imageModalData.faultId,obj.summary, obj.description, this.selectedAssigneeId, obj.due_date, obj.status).subscribe(data => {
    this.safetyAndSurveillanceCommonService.creatingAction('fault_id', this.imageModalData.faultId, obj.summary, '', this.selectedAssigneeId, this.newSubTask['due_date'], obj.status, this.newSubTask['assignor'], []).subscribe(data => {
      this.getActionsData(this.imageModalData.faultId);
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful action creation', 'Action');
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
    this.addingSubObs = -1;
  }

  /**
   * cancel adding a new action.
   */
  cancelObs() {
    this.addingSubObs = -1;
    this.linkedIssueData.pop()
    this.linkedIssueData.sort((id1, id2) => { return id2.id - id1.id })
    this.linkedIssueData = [...this.linkedIssueData]

  }

  /**
   * change action status.
   * @param action_id
   * @param object_type_id
   * @param summary
   * @param description
   * @param assignee_id
   * @param due_date
   * @param status
   * @param assignor
   */
  changingActionStatu(action_id, object_type_id, summary, description, assignee_id, due_date, status, assignor) {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.actionUpdate(action_id, object_type_id, summary, description, assignee_id, due_date, status, assignor, this.selectedUnit).subscribe(data => {
      console.log(this.selectedUnit)
      this.getActionsData(this.imageModalData.faultId)
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Edit action', 'Action');
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

  listOfAllZones(data: any) {
    console.log('Zones',data)
    this.listOfZones = data;
  }

  /**
   *after upload of image for manual observation.
   */
  observationPicSelected() {
    this.dataService.passSpinnerFlag(true, true);
    this.manulaObservationSelectedDetails = {}

    let image: any = document.getElementById('observationImage');
    this.observationImgHeight = 250;
    this.observationImgWidth = 400;
    this.observationImgRatio = 2160 / this.observationImgHeight;
    this.zoom?.reset();
    if (!this.selectedMode) {
      this.zoom?.resume();
    }
    else {
      this.zoom?.pause();
    }
    this.clearObservationCanvas()
    this.trigger = Date.now();
    setTimeout(() => {
      const h2c: any = html2canvas
      h2c($('#rawImagePath')[0]).then(canvas => {

        this.unmarkedImage = canvas.toDataURL('image/jpg');
        let data = this.imageName.split('.')
        let row_pathName = '' + data[0] + '_Raw.' + data[1];

        var file = this.dataURLtoFile(this.unmarkedImage, row_pathName);
        this.imagePath = [file]
        $("#addObservation").modal("hide")
        $("#addObservationAnnotate").modal("show")
        this.dataService.passSpinnerFlag(false, true);
      });
    }, 100);
  }

  /**
   * convert dataurl to file to display.
   * @param dataurl
   * @param filename
   * @returns
   */
  dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr?.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  /**
   * navigate back to annotations
   */
  backToAnnotate() {
    this.manulaObservationSelectedDetails = {};
    this.selectedAnnotation = {};
    this.clearObservationCanvas();
    this.annotation = false;
  }

  /**
   *back button click after manual observation is added or no observation added.
   */
  backButtonClick(){
    if (this.observationImage) {
      $("#addObservation").modal("show")
      this.observationImage = '';
      return;
    } else {
      $('#addObservation').modal('hide');
    }
  }

  /**
   * submit bulk update.
   */
  submitMultiObservation() {
    this.dataService.passSpinnerFlag(true, true);

    this.multiObservations.forEach((data, index) => {
      delete data.annotation;
      delete data.coords;
      delete data.shape;
      delete data.manualPath;
      delete data.lineColor;
      delete data.lineThickness;
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const timeString = `${hours}:${minutes}:${seconds}`;
      
      if(this.isPermitEnabled){
        let permit_details = {
            permit_id : this.selectedPermitDetails.permit_id,
            permit_mode : this.selectedPermitDetails.permit_mode,
            camera_id : this.selectedPermitDetails.camera_id
        } 
        
        data = {...data, ...permit_details,time: timeString }
      }
      this.safetyAndSurveillanceCommonService.postManualObservation(data).subscribe({
        next:(response)=>{
        this.observationImage = '';
        this.markedImageUrl = '';
        this.selectedPermitDetails = {permit_number:'',type_of_permit:'',nature_of_work:'',vendor_name:'',issuer_name:'',permit_mode:'ptz',permit_id:'',camera_id:''};
        this.selectedAnnotation = {};
        this.msg = 'Successfully completed.';
        if ((this.multiObservations?.length - 1) == index) {
          let allDates = [];
          let array = JSON.stringify(this.selectedUnitItems)
          this.unitService.fetchSidebarData(array).subscribe(data => {
            for (const [zoneKey, zoneValue] of Object.entries(data)) {
              if (zoneKey == 'All Zones') {
                for (const [categoriesKey, categoriesValue] of Object.entries(data[zoneKey])) {
                  if (categoriesKey == 'All Categories') {
                    for (const [dateKey, dateValue] of Object.entries(data[zoneKey][categoriesKey])) {
                      if (dateKey == 'date') {
                        for (const [dates, datesValue] of Object.entries(data[zoneKey][categoriesKey][dateKey])) {
                          allDates.push(dates)
                        }
                      }
                    }
                  }
                }
              }
            }
            allDates.forEach((date, i) => {
              let removeAllDate = RegExp('\\b' + 'all' + '\\b').test(date.toLowerCase())
              if (removeAllDate) {
                allDates.splice(i, 1);
              }
            })
            this.filterDates = allDates;
            this.filterDates.sort((a, b) => {
              return new Date(b).getTime() - new Date(a).getTime();
            });
            sessionStorage.setItem("obsData", JSON.stringify(data))
            let selectedObj = this.imageModalData;
            this.selectedFilterDate = this.imageModalData.date
            this.annotation = false;
            let currentDate = new Date().toJSON().slice(0, 10);
            this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedUnitItems, this.custom_start_date, this.custom_end_date);
            // if (this.selectedFilterDate == currentDate) {
            //   this.safetyAndSurveillanceDataService.passSelectedDate(this.selectedFilterDate, true);
            //   this.imageModalData = selectedObj
            // }
            this.multiObservations = [];
            $("#addObservationAnnotate").modal("hide");
          })
        }
        this.snackbarService.show(this.msg, false, false, false, false);
        this.dataService.passSpinnerFlag(false, true);
      },
      error:(error)=>{
        if (error instanceof HttpErrorResponse) {
          if (error.status == 400) {
            this.dataService.passSpinnerFlag(false, true);
            if(!error.error.error){
             this.dataService.passSpinnerFlag(false, true);
             this.msg = 'Error occured. Please try again.';
             this.snackbarService.show(this.msg, true, false, false, false);
            }
            else{
              this.msg = error.error.error;
              this.snackbarService.show(this.msg, true, false, false, false);
            }
          }
          else {
            this.dataService.passSpinnerFlag(false, true);
            this.msg = 'Error occured. Please try again.';
            this.snackbarService.show(this.msg, true, false, false, false);
          }
        }
      },
      complete:()=>{
        this.imageModalData = []
        setTimeout(() => {
          this.ngOnInit()                        
         }, 100);
        }
      })
     })
    this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful manual observation creation', 'Manual observation')
  }

  /**
   * delete observation logic with confirmation modal.
   */
  delteObservation() {
    this.deleteIndex
    this.multiObservations.splice(this.deleteIndex, 1);
    this.deleteIndex = -1;
    $("#confirmDeleteObservation").modal("hide");
    if (this.multiObservations?.length == 0) {
      this.observationImage = '';
      this.markedImageUrl = '';
      this.annotation = false;
      $("#addObservationAnnotate").modal("hide");
      $("#addObservation").modal("show");
    }
  }

  /**
   * clear observation image canvas.
   */
  clearObservationCanvas() {
    let canvas: any = document.getElementById('observationCanvas');
    canvas.getContext('2d').clearRect(0, 0, this.observationImgWidth, this.observationImgHeight);
  }

  /**
   * select image while uploading manual obs logic.
   * @param event
   * @returns
   */
  selectImage(event: any) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return 
    }
    const file = event.target.files[0];
    const fileType = file.type;
    const fileName = file.name;
    if (!fileType.startsWith('image/') || !fileName.toLowerCase().endsWith('.jpg') && !fileName.toLowerCase().endsWith('.jpeg') && !fileName.toLowerCase().endsWith('.png')) {
      // Clear the input field to prevent the selected non-image file from being shown
      event.target.value = '';
      this.snackbarService.show('Please select a valid image file.', false, false, false, true);
      return;
    }


    if (!fileType.startsWith('image/') || !fileName.toLowerCase().endsWith('.jpg') && !fileName.toLowerCase().endsWith('.jpeg') && !fileName.toLowerCase().endsWith('.png')) {
      // Clear the input field to prevent the selected non-image file from being shown
      event.target.value = '';
      this.snackbarService.show('Please select a valid image file.', false, false, false, true);
      return;
    }

    if (file.size / 1024 / 1024 >= 5) {
      // Clear the input field to prevent the selected large image from being shown
      event.target.value = '';
      this.snackbarService.show('Max. size is 5MB.', false, false, false, true);
      return;
    }

    // Image is valid, proceed with displaying it
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.observationImage = reader.result;
    };

    // Clear any existing canvas and set the image name
    this.clearObservationCanvas();
    this.imageName = fileName;
  }
  /**
   * open selected observation's annotation modal.
   */
  openObservationSelectedAnnotation($event) {
    let annotation = this.actionPoints.find(item => item.index === $event.index);
    this.openObservationAnnotationModal(annotation);
  }

  unitsSelectedManualObs($event){
    this.permitNumberDropdown = false;
    this.selectedPermitDetails = {permit_number:'',type_of_permit:'',nature_of_work:'',vendor_name:'',issuer_name:'',permit_mode:'ptz',permit_id:'',camera_id:''};
    this.fetchPermitDetails()
  }


  /**
   * edit manul observation annotation.
   * @param item
   * @param i
   */
  editManualObservation(item, i) {
    this.manulaObservationSelectedDetails = item;
    this.editIndex = i;
    this.annotation = false;
    let manualActionPoints = [];
    this.manualActionPoints = [];
    this.observationImgHeight = 250;
    this.observationImgWidth = 400;
    this.observationImgRatio = 2160 / this.observationImgHeight;
    if (this.multiObservations[i].shape === 'rectangle') {
      let top = (this.multiObservations[i].coords[1] / this.observationImgRatio) - 15;
      let left = (this.multiObservations[i].coords[0] / this.observationImgRatio) - 15;
      manualActionPoints.push({ index: i, top: top, left: left, coords: this.multiObservations[i].coords, shape: this.multiObservations[i].shape, lineColor: this.multiObservations[i].lineColor, lineThickness: this.multiObservations[i].lineThickness });
    }
    else if (this.multiObservations[i].shape === 'circle') {
      let top = ((this.multiObservations[i].coords[1] / this.observationImgRatio) - (this.multiObservations[i].coords[2] / this.observationImgRatio)) - 15
      let left = this.multiObservations[i].coords[0] / this.observationImgRatio - 15;
      manualActionPoints.push({ index: i, top: top, left: left, coords: this.multiObservations[i].coords, shape: this.multiObservations[i].shape, lineColor: this.multiObservations[i].lineColor, lineThickness: this.multiObservations[i].lineThickness });
    }
    this.manualActionPoints = manualActionPoints;
  }

  /**
   * delete a manual observation with confirmation modal.
   * @param index
   */
  deleteObservation(index) {
    this.deleteIndex = index;
    if (this.multiObservations?.length > 1) {
      this.annotation = false;
      this.multiObservations.splice(this.deleteIndex, 1);
      this.manualActionPoints.splice(this.deleteIndex, 1);
      this.deleteIndex = -1;
      setTimeout(() => {
        this.annotation = true;
      }, 500)
    } else {
      $("#confirmDeleteObservation").modal("show");
    }
  }

  /**
   * open observation annotation modal by annotation
   * @param annotation
   */
  openObservationAnnotationModal(annotation) {
    $("[id^='observationContent']").hide();
    var top = (annotation.left > this.observationImgWidth - 360) ? (top + 50) : annotation.top;
    top = (annotation.top < 20) ? (annotation.top + 50) : top;
    top = (annotation.top > this.observationImgHeight - 80) ? (annotation.top - 30) : annotation.top;
    var left = (annotation.left > this.observationImgWidth - 360) ? (this.observationImgWidth - 450) : annotation.left;

    $('#observationContent' + annotation.index).css('left', left + 'px');
    $('#observationContent' + annotation.index).css('top', top + 'px');
    $('#observationContent' + annotation.index).show();
    this.showViewAll();
  }

  /**
   * select manual observation image from file explorer.
   * @param item
   */
  selectManualObservationImage(item) {
    this.selectedManualMarkedImage = item.manualPath
  }

  /**
   * select risk rating from the view.
   * @param $event
   */
  selectRiskRating($event) {

    this.dataService.passSpinnerFlag(true, true);
    this.selectedRiskRating = $event.rating;
    if($event.unfilteredZones){
     this.selectedZone =  $event.unfilteredZones.filter((item)=> item.zone_name !=$event.zone)

    this.selectedZones = [this.selectedZone.zone_id]
  }
    let dataurl;
    setTimeout(() => {
      const h2c: any = html2canvas
      h2c($('#observationMarked')[0]).then(canvas => {

        this.markedImageUrl = canvas.toDataURL('image/jpg');
        let data = this.imageName.split('.')
        let row_pathName = Math.floor((Math.random() * 99) * 7) + '' + data[0] + '.' + data[1];

        var file = this.dataURLtoFile(this.markedImageUrl, row_pathName);
        this.base64Image = [file]
        this.getImageUrl($event);
      });
    }, 100);
  }

  /**
   * get image url of manual observation image upload from image path.
   * @param $event
   */
  getImageUrl($event) {
    this.safetyAndSurveillanceCommonService.manualObservationImageUpload($event.unit, this.imagePath).subscribe((responce) => {
      this.manualObservationRawImagePath = responce[0];
      let imagePathName = responce[0].split('/');
      this.manualObservationRawImageName = imagePathName[imagePathName?.length - 1];
      this.getRawImageUrl($event);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error;
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }


  /**
   * get image url of manual observation image upload from base64path.
   * @param $event
   */
  getRawImageUrl($event) {
    this.safetyAndSurveillanceCommonService.manualObservationImageUpload($event.unit, this.base64Image).subscribe((responce) => {
      this.manualObservationImagePath = responce[0];
      let imagePathName = responce[0].split('/');
      this.manualObservationImageName = imagePathName[imagePathName?.length - 1];
      this.postManualObservation($event)
        this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error;
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  /**
   * post manual obs upload after annotation are added.
   * @param $event
   */
  async postManualObservation($event) {
    this.selectedAnnotation = $event.annotation
    this.annotation = true;
    let current_datetime = new Date()
    let year: any = current_datetime.getFullYear();
    if (year < 10) {
      year = '0' + year
    } else {
      year = year
    }
    let month: any = current_datetime.getMonth() + 1;
    if (month < 10) {
      month = '0' + month
    } else {
      month = month
    }
    let date: any = current_datetime.getDate();
    if (date < 10) {
      date = '0' + date
    } else {
      date = date
    }
    let hr: any = current_datetime.getHours();
    if (hr < 10) {
      hr = '0' + hr
    } else {
      hr = hr
    }
    let min: any = current_datetime.getMinutes();
    if (min < 10) {
      min = '0' + min
    } else {
      min = min
    }
    let sec: any = current_datetime.getSeconds();
    if (sec < 10) {
      sec = '0' + sec
    } else {
      sec = sec
    }
    let current_date = date + "/" + month + "/" + year
    let current_time = hr + ":" + min + ":" + sec;
    let time_zone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone

    let obj = {
      unit: $event.unit,
      zone: $event.zone,
      image_path: this.manualObservationImagePath,
      image_name: this.manualObservationImageName,
      date: moment().tz(time_zone).format("YYYY-MM-DD"),
      time: moment().tz(time_zone).format("HH:mm:ss"),
      observation: $event.description,
      recommendation: 'NA',
      job: $event.category,
      rating: $event.rating.rating,
      cloud: 'aws',
      raw_path: this.manualObservationRawImagePath,
      raw_image_name: this.manualObservationRawImageName,
      thumbnail: this.manualObservationImagePath,
      mode: 'camera',
      marked_video_path: null,
      marked_video_name: null,
      unmarked_video_path: null,
      unmarked_video_name: null,
      manual_upload: 'True',
      annotation: $event.annotation,
      coords: $event.coordinates,
      shape: $event.shape,
      manualPath: this.markedImageUrl,
      is_verified: "true",
      lineColor: $event.lineColor,
      lineThickness: $event.lineThickness,
    };
    this.manualActionPoints = [];
    if (this.editIndex >= 0) {
      this.multiObservations.splice(this.editIndex, 1, obj);
      this.editIndex = -1;
    } else {
      this.multiObservations.push(obj);
      this.editIndex = -1;
    }
    this.selectedManualMarkedImage = this.multiObservations[0].manualPath
    this.manualScaleAspectRatio();
  }

  /**
   * adding manual action points for each annotation.
   */
  manualScaleAspectRatio() {
    let manualActionPoints = [];
    this.manualActionPoints = [];
    this.multiObservations.forEach((item, index) => {
      if (item.shape === 'rectangle') {
        let top = (item.coords[1] / this.observationImgRatio) - 15;
        let left = (item.coords[0] / this.observationImgRatio) - 15;
        manualActionPoints.push({ index: index, top: top, left: left, coords: item.coords, shape: item.shape, lineColor: item.lineColor, lineThickness: item.lineThickness });
      }
      else if (item.shape === 'circle') {
        let top = ((item.coords[1] / this.observationImgRatio) - (item.coords[2] / this.observationImgRatio)) - 15
        let left = item.coords[0] / this.observationImgRatio - 15;
        manualActionPoints.push({ index: index, top: top, left: left, coords: item.coords, shape: item.shape, lineColor: item.lineColor, lineThickness: item.lineThickness });
      }
    });
    this.manualActionPoints = manualActionPoints;
    this.sendObservationData.showAnimation = true;
  }

  /**
   * Manual observation upload cancelled in between.
   */
  backToAddObservation() {
    if (this.multiObservations?.length >= 1) {
      this.annotation = true;
      this.editIndex = -1;
      this.manualScaleAspectRatio();
    } else {
      $("#addObservationAnnotate").modal("hide")
      $("#addObservation").modal("show")
      this.observationImage = '';
    }
    this.safetyAndSurveillanceCommonService.sendMatomoEvent('Incomplete manual observation creation', 'Manual observation');
  }

  /**
   * get actions data for a fault.
   * @param fault_id
   */
  getActionsData(fault_id) {
    this.safetyAndSurveillanceCommonService.getActions('fault_id', fault_id, '', '', '', '', '', '').subscribe(data => {
      this.linkedIssueData = data
      this.linkedIssueData.sort((id1, id2) => { return id2.id - id1.id })
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

  /**
   * get audit data for a fault.
   * @param fault_id
   */
  getAuditData(fault_id) {
    this.safetyAndSurveillanceCommonService.getAudits(fault_id).subscribe(data => {
      this.auditData = data
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

  /**
   * get assignee list for a unit.
   * @param unit
   */
  getAssigneeList(unit) {
    if (unit == null) {
      unit = sessionStorage.getItem('navigatedUnit')
    }
    this.safetyAndSurveillanceCommonService.getAssigneeList(unit).subscribe(data => {
      this.listOfUsers = data
      this.newSubTask.assignee = data[0];
      this.commentTagging = [];
      let userMail = sessionStorage.getItem('user-email');
      this.userMail = sessionStorage.getItem('user-email');
      this.listOfUsers.forEach(element => {
        if (element.email == userMail) {
          this.loginUserId = element.id
        }
      });
      this.listOfUsers.forEach(ele => {
        this.commentTagging.push({ "key": ele.name, "value": ele.name, "email": ele.email, "id": ele.id, "username": ele.username, "mobile_number": ele.mobile_number, "mobile_token": ele.mobile_token },)
      })
        // this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    )
  }

  /**
   * change assignee on an action.
   * @param assignee
   */
  changesAssignee(assignee) {
    this.selectedAssigneeId = this.newSubTask.assignee;
  }

  /**
   * navigate to action from observations page.
   * @param actionId
   */
  navigateToActions(actionId) {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.sendMatomoEvent('Action navigation from observations page', 'Action');
    sessionStorage.setItem('ActionId', JSON.stringify(actionId));
    this.router.navigateByUrl('/safety-and-surveillance/actions');
  }

  /**
   * disable input.
   */
  inputDisabled() {
    var dtToday = new Date();

    var month: any = dtToday.getMonth() + 1;
    var day: any = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    var minDate = year + '-' + month + '-' + day;
    let time_zone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    let dateTime = moment().tz(time_zone).format("YYYY-MM-DD")
    $('#txtDate').attr('min', dateTime);
  }


  /**
   * remove email id from selected list.
   * @param data
   */
  removeItem(data: any) {
    let index = this.sendObservationData.emailIDList.findIndex((item: any) => item == data);
    this.sendObservationData.emailIDList.splice(index, 1);
  }

  returnFileName(url) {
    let text = url.split('/');
    return text[text?.length - 1];
  }

  findImageOrPdf(url) {
    let text = url.split('.');
    if(text[text?.length - 1] == 'pdf'){
      return false
    } else {
      return true
    }
  }

  /**
   * get filters sidebar data.
   */
  getUnitData() {
    if (this.selectedUnitItems != "") {
      let array = JSON.stringify(this.selectedUnitItems)
      this.unitService.fetchSidebarData(array).subscribe(data => {
        sessionStorage.setItem("obsData", JSON.stringify(data))
      })
    }
  }

  /**
   * upload selected files/images.
   * @param event
   */
  selectUploadFiles(event: any) {
    if (!event.target.files[0] || event.target.files[0]?.length == 0) {
      return;
    }
    event.target.files.forEach(ele => {
      let actionImage: any
      this.uploadStatusFiles = ''
      if (ele.size / 1024 / 1024 < 5) {
        let mineType = ele.type;
        let reader = new FileReader();
        reader.readAsDataURL(ele);
        reader.onload = (_event) => {
          actionImage = reader.result;
          this.uploadStatusFiles = reader.result;
          let actionImageName = ele.name

          let data = actionImageName.split('.')
          let row_pathName = Math.floor((Math.random() * 99) * 7) + '' + data[0] + '.' + data[1];

          var file = this.dataURLtoFile(this.uploadStatusFiles, row_pathName);
          let base64Image = [file]
          this.uploadStatusFilesList.push({ actionImage: this.uploadStatusFiles, actionImageName, evidence: false });
        }

      } else {
        alert("Observation images (Max 5 MB Each images)")
      }
    })
  }

  /**
   * delete selected/uploaded images.
   * @param i
   */
  deleteSlectedUploadFiles(i) {
    this.uploadStatusFilesList.splice(i, 1)
  }

  checkImageOrPdf(obj) {
    let text = obj.actionImageName.split('.');
    if(text[text?.length - 1] != 'pdf'){
      return true
    } else {
      return false
    }
  }

  /**
   * upload selected evidences.
   * @param i
   */
  onEvidenceSelected(i) {
    this.uploadStatusFilesList.forEach((ele, index) => {
      this.uploadStatusFilesList[index].evidence = false;
    })
    this.uploadStatusFilesList[i].evidence = true;
  }

  /**
   * post selected/uploaded evidences.
   */
  postEvidence() {
    let file_list = [];
    this.uploadStatusFilesList.forEach(ele => {
      file_list.push({ file: ele.actionImage, is_evidence: ele.evidence })
    })
    let obj = { fault_id: this.imageModalData.faultId, file_list }
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.postEvidence(obj).subscribe(data => {
      this.getEvidence();
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

  /**
   * get evidences for a selected fault.
   */
  getEvidence() {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.getEvidence(this.imageModalData.faultId).subscribe(data => {
      this.supportingDocuments = data;
      this.evidenceDocuments = false;
      this.evidenceMode = false;
      this.supportingDocuments.find(ele => {
        if (ele.is_evidence == true) {
          this.evidenceDocuments = true
          this.evidenceImageModalData = ele;
        }
      })
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {

        if(this.supportingDocuments?.length > 0) {
          this.noSupportingDocsFound = false;
        } else {
          this.noSupportingDocsFound = true;
        }
      }
    )
  }

  openPDF(fileUrl) {
    let name = fileUrl.split('/');
    name = name[name?.length - 1].split('?')[0];
    name = name.replace('.pdf', '');

    this.modalPdfViewerService.show(name, fileUrl);
  }

  /**
   * toggle evidence mode.
   */
  changeEvidenceMode() {
    this.evidenceMode = !this.evidenceMode
  }

  /**
   * download image
   * @param imageUrl
   */
  downloadImg(imageUrl) {
    if (imageUrl.includes('data:image/jpeg;base64')) {
      let a = document.createElement('a');
      a.href = imageUrl;
      a.download = 'image_' + Math.floor((Math.random() * 99) * 7) + '.jpg';
      document.body.appendChild(a);
      a.click();
    }
    else {
      this.commonService.fetchImageData(imageUrl).subscribe(
        imageData => {
          let a: any = document.createElement('a');
          a.href = URL.createObjectURL(imageData);
          let imageName = imageUrl.split('/')
          a.download = imageName[imageName?.length - 1];
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

  /**
   * get evidence image id.
   * @param imageId
   */
  getEvidenceId(imageId) {
    this.evidenceImageId = "";
    this.evidenceImageId = imageId;
  }

  /**
   * delete evidence image.
   */
  deleteEvidenceImage() {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.deleteEvidenceImage(this.evidenceImageId).subscribe(data => {
      this.getEvidence();
        this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        $('#deleteEvidencePopup').modal('hide')
        this.dataService.passSpinnerFlag(false, true);
      }
    )
  }

  selectImageToDisplay(obj, array) {
    let myArray = obj?.file.split("/");
    myArray.reverse()
    this.arrayOfImages = array
    this.selectedImageName = myArray?.[0]
    $('#inspectionImageViewer').modal('show');
    this.selectedImage = obj;
    if (obj.file?.includes('.pdf')) {
      let name = obj?.file.split('/');
      name = name[name?.length - 1].split('?')[0];
      name = name.replace('.pdf', '');

      this.supportDocPdfViewerService.show(name, obj?.file);
    } else {
      this.supportDocPdfViewerService.show('', '');
    }
  }

  onImageSelect(obj) {
    this.selectedImage = obj;

    let myArray = obj?.file.split("/");
    myArray.reverse()
    this.selectedImageName = myArray?.[0]
    if (obj.file?.includes('.pdf')) {
      let name = obj?.file.split('/');
      name = name[name?.length - 1].split('?')[0];
      name = name.replace('.pdf', '');

      this.supportDocPdfViewerService.show(name, obj?.file);
    } else {
      this.supportDocPdfViewerService.show('', '');
    }
  }

  initiateDrawing() {
    setTimeout(() => {
      document.getElementById('popupCanvas').style.zIndex = '9';
    }, 200);
  }

  closeUnitFilter() {
    window.dispatchEvent(new CustomEvent('unitFilter'))
  }

  closeFilterSection() {
    this.safetyAndSurveillanceDataService.passToggleSidebar(true)
    this.observationStatusDropdown = false
  }

  getCauseTaskTextHeight() {
    let height = document.getElementById('actionSummary')?.scrollHeight
    if (height > 27) {
      return height < 95 ? height : 95;
    } else {
      return 27
    }
  }
  getAssigneeTooltip(assigneeList): string {
    let text = [];
    assigneeList.forEach((ele, i) => {
      if (i > 1) {
        this.allListOfUsers.forEach(element => {
          if (ele == element.id) {
            text.push(element.name);
          }
        });
      }
    })
    return text.join(', ');

  }
  getMostCriticalTableHeight() {
    var insight_header = document.getElementById("right-insight-header");
    return insight_header.offsetHeight;
  }
  // showAndHide(i){
  //   this.insightsData[i].view = !this.insightsData[i].view
  // }

  showInsights = false
  toggleInsights(booleanValue) {
    this.showInsights = booleanValue
  }

  ngSelectDropdownPosition=(s)=>{
    const elem = document.getElementById("selectUser");
    if(elem?.getBoundingClientRect()){
      const rect = elem.getBoundingClientRect();
      if(rect.top && rect.top > 0){

        let top = rect.top - 205
        let topPosition = top + 'px'

        let bottom = rect.top
        let bottomPosition = bottom + 'px'
        let dropdownPopup = document.getElementsByTagName('ng-dropdown-panel');
        if(dropdownPopup?.length > 0){
          this.renderer?.setStyle(document.getElementsByTagName('ng-dropdown-panel')[0], 'max-height', '200px')
          this.renderer?.setStyle(document.getElementsByTagName('ng-dropdown-panel')[0], 'height', '200px')
          this.renderer?.setStyle(document.getElementsByTagName('ng-dropdown-panel')[0], 'top', topPosition)
          this.renderer?.setStyle(document.getElementsByTagName('ng-dropdown-panel')[0], 'bottom', bottomPosition)
        }
      }
    }

  }
  fetchPlantDetails() {
    this.dataService.passSpinnerFlag(true, true);
    this.plantService.fetchPlantDetails().subscribe(
      (plantData: any) => {
        let plantDetials: any = plantData;
        this.observationStatement = 'Note: Closed counts shown do not include'
        this.configureStatusCount = plantData?.fault_status_to_exclude_in_sa;
        this.configureStatusCount?.forEach((ele,i)=>{
          if((i + 1) <=  (this.configureStatusCount?.length - 2)){
            this.observationStatement = this.observationStatement + ' ' + ele + ',';
          }else if((i + 1) ==  (this.configureStatusCount?.length - 1)){
            this.observationStatement = this.observationStatement + ' ' + ele + ' or'
          }else{
            this.observationStatement = this.observationStatement + ' ' + ele + ' observations.'
          }
        })
        if (this.configureStatusCount?.length < 0)
        {$('[data-toggle="tooltip"]').attr('data-toggle', 'tooltip').attr('title', 'Tooltip Content'); } else {$('[data-toggle="tooltip"]').removeAttr('data-toggle').removeAttr('title'); }
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    )}

    // code piece to call before refresh of page 
  @HostListener('window:beforeunload', ['$event'])   beforeUnloadHandler(event: Event) { 
    let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'));
    let globalSearchNotification = JSON.parse(sessionStorage.getItem('global-search-notification'));
    if(searchObservation || globalSearchNotification){
      sessionStorage.removeItem('manuallySelectedPermits')
    }    
      sessionStorage.removeItem('navigatedObservation')
      // sessionStorage.removeItem('searchObservation');
      // sessionStorage.removeItem('obsNavDate');
    }   

  /**
   * show edit symbol on the image when draw the annotation.
  */
  showEditSymbol(event){
    this.editSymbol = event
    this.zoom.reset();
    if (!this.selectedMode) {
      this.zoom.resume();
    }else {
      this.zoom.pause();
    }
  }


  decryptUrl(url) {
    var encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
    var encryptedFilepath = url;
    var key = CryptoJS.enc.Hex.parse(encryptionKey);
    const decrypted = CryptoJS.AES.decrypt(encryptedFilepath, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
    });
    var decryptedFilepath = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedFilepath.replace(/^"|"$/g, '');
    }
  ngOnDestroy() {
    sessionStorage.removeItem('startAndEndDate')
    sessionStorage.removeItem('selectAllPermits')
    sessionStorage.removeItem('manuallySelectedPermitsTemp')
    sessionStorage.removeItem('manuallySelectedPermits')
    sessionStorage.removeItem('selectedActivePage')
    sessionStorage.removeItem('global-search-notification')
    sessionStorage.removeItem('searchObservation');
    sessionStorage.removeItem('obsNavDate');
    setTimeout(() => {
      sessionStorage.removeItem('selectedZone');
      sessionStorage.removeItem('selectedCategory');
      sessionStorage.removeItem('riskRating');
      sessionStorage.removeItem('selectedRiskRatingDate');
      sessionStorage.removeItem('selectedStatus');
      sessionStorage.removeItem('searchObservation');
      sessionStorage.removeItem('permit_number');
      sessionStorage.removeItem('type_of_permit');
      sessionStorage.removeItem('nature_of_work');
      sessionStorage.removeItem('issuer_name');
      sessionStorage.removeItem('vendor_name');
      sessionStorage.removeItem('navigatedObservation')
    }, 3000)
    this.safetyAndSurveillanceDataService.passObservationsFilters('', '', '', '', '', '', '', '', '', '', '','','','','','',false, false);
    this.safetyAndSurveillanceDataService.passObsData('', '', '', '', false);
    this.safetyAndSurveillanceDataService.passSelectedDate('', false);
    this.safetyAndSurveillanceDataService.passBevData('', false);
    this.safetyAndSurveillanceDataService.passToggleSidebar(true);
    if (this.GlobalUsed) {
      this.GlobalUsed = false
      sessionStorage.setItem('startAndEndDate', JSON.stringify([this.preserved_startDate, this.preserved_endDate]))
      this.safetyAndSurveillanceDataService.passSelectedDates(this.preserved_startDate, this.preserved_endDate);
    }
    this.subscription.unsubscribe();
  }
}
