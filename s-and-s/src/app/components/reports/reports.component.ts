import { Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from '@swimlane/ngx-datatable';
import { IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
declare var $: any;
import * as moment from 'moment';
import 'moment-timezone';

import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

import { v4 as uuidv4 } from 'uuid';
import { PlantService } from '../../shared/service/plant.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SafetyAndSurveillanceDataService } from '../../shared/service/data.service';
import { SafetyAndSurveillanceCommonService } from '../../shared/service/common.service';
import { UnitService } from 'src/shared/components/unit-ss-dashboard/services/unit.service';
import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
import { CommonService } from 'src/shared/services/common.service';
import 'moment-timezone';
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
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [DateFormatPipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }, // Set locale to US English
    {
      provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
      useValue: { useUtc: true }, // Use UTC to handle timezones
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'LL',
        },
        display: {
          dateInput: 'DD/MMM/YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-US',
    },]
})
export class ReportsComponent implements OnInit {
  private today = new Date();
  overAllCalenderOptions: IAngularMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
    dateRange: false,
    // disable all dates by default
    disableSince: { year: this.today.getFullYear(), month: this.today.getMonth() + 1, day: this.today.getDate() + 1 },
    enableDates: [],
  };
  overAllCalender_end_date_Options: IAngularMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
    dateRange: false,
    // disable all dates by default
    disableUntil: { year: 1900, month: 9, day: 1 },
    disableSince: { year: this.today.getFullYear(), month: this.today.getMonth() + 1, day: this.today.getDate() + 1 },
    enableDates: [],
  };
  generateReportForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  unitSelectionValues: any = [{ value: "Entire Plant" }, { value: "All Units" }]
  overallPlantReport: boolean = false;
  selectedSideBarItem = 'DHDS';
  isRouteClicked: boolean;
  driverRows = [];
  selected = [];
  maxDate = new Date();
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  confirmationModal : boolean = false
  buttonStartDate : boolean = false
  buttonEndDate : boolean = false

  selectedItems = ['Month wise', 'Year wise'];

  selectedItemDate = this.selectedItems[0];

  startDateOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'yyyy-mm-dd',
    disableSince: { year: this.today.getFullYear(), month: this.today.getMonth() + 1, day: this.today.getDate() + 1 }
  };
  startDateModel: IMyDateModel = null;

  endDateOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'yyyy-mm-dd',
    disableSince: { year: this.today.getFullYear(), month: this.today.getMonth() + 1, day: this.today.getDate() + 1 }
  };
  endDateModel: IMyDateModel = null;

  units: any[] = [];
  msg: string = '';
  months: any[] = [
    { key: 1, value: 'Jan' },
    { key: 2, value: 'Feb' },
    { key: 3, value: 'Mar' },
    { key: 4, value: 'Apr' },
    { key: 5, value: 'May' },
    { key: 6, value: 'Jun' },
    { key: 7, value: 'Jul' },
    { key: 8, value: 'Aug' },
    { key: 9, value: 'Sep' },
    { key: 10, value: 'Oct' },
    { key: 11, value: 'Nov' },
    { key: 12, value: 'Dec' },
  ];
  selectedYear: any = new Date().getFullYear();
  year: number = new Date().getFullYear();
  month: number = 1 + new Date().getMonth();
  selectMonth: number = 1 + new Date().getMonth();
  monthWiseNone: boolean = true;
  generateUserList: any = [];
  reportButton: boolean = false;
  yearsData: any;
  permission: any;
  isGenerateButton: boolean = false;
  selectedStartDate: string = '';
  selectedEndDate: string = '';
  selectedUserList: any[] = [];
  timeZone: any;
  startDate: any;
  endDate: any;
  selectedStart: any;
  selectedEnd: any;
  selectedPlant : any;
  selectedPeople: any[] = [];
  disabledApplyBtn = true;
  formattedPeoples: {};
  reportSelectedUnits:any[] = [];
  reportSelectedZones:any[] = [];
  countOfUnitZone = {unit:0,zone:0};
  reportStartTime: any = '00:00:00';
  reportEndTime: any = '23:59:59';
  reportCategories:any[] =[
    {id:1,key:'all',name:'All'},
    {id:2,key:'created_by_me',name:'Created by me'},
  ]
  selectedReportCategory:any;
  showCustomize: boolean = false;
  allZonesData: any[] = [];
  unitsAndZones: any[] = [];
  selectedUnitsAndZones: any[] = []
  obsCategories: any[] = []
  selectedObsCategory: any[] = []
  permit_list: any[] = []
  selectedPermit: any[] = []
  riskRatings: any[] = []
  selectedRiskRating: any[] = []
  status:any[] = []
  selectedStatus: any[] = []
  obsModes:any[] = [
    { value: 'drone', label: 'Drone' },
    { value: 'camera', label: 'Camera' },
  ]
  selectedObsMode: any[] = []
  permitTypeList:any [] = []
  selectedPermitType:any [] = []
  work:any[] = []
  selectedWork: any[] = []
  vendorList:any[] = []
  selectedVendor: any[] = []
  issuerList:any[] = []
  selectedIssuer: any[] = []
  selectedUsers: any[] = []
  // countOfUnitZone = {}
  reportName:string;
  isPermitEnabled : boolean = false;
  riskRatingLevels = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'))['module_configurations']['risk_rating_levels']
  riskRatingValues: any = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'))['module_configurations']['risk_rating_levels']
  filterPermitData: any[] = []
  selectedPlantDetails:any;
  isCreatedByMe: string = 'False';
  zonesId: any[] = []
  unitsId: any[] = []
  customEndDate: string = ''; 
  customStartDate: string = '';
  startMaxDate= new Date();
  constructor(
    private fb: FormBuilder,
    private modalPdfViewerService: ModalPdfViewerService,
    private unitService: UnitService,
    private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService,
    private plantService: PlantService,
    private snackbarService: SnackbarService,
    private dataService: DataService,
    private commonService: CommonService,
    private dateFormat: DateFormatPipe,
    public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService
  ) {
    // this.driverFetch((data: never[]) => {
    //   this.driverRows = data;
    // });
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
    this.generateReportForm = this.fb.group({
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      share_with_users: [[]]
    });

    window.addEventListener('in-page-obs-nav', (evt: CustomEvent) => {
      this.safetyAndSurveillanceDataService.passGlobalSearch(evt.detail)   
    })
    
  }


  ngOnInit(): void {
    this.unitSelectionValues = [{ value: "Entire Plant",key:"Entire Plant" }, { value: 'All '+this.selectedPlantDetails?.[0]?.unit_nomenclature+'s' ,key:"All Units"}]
    this.selectedReportCategory = this.reportCategories[0]
    this.timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    moment.tz.setDefault(this.timeZone);
    let selectMonth = moment()?.tz(this.timeZone)?.format("YYYY-MM-DD HH:mm:ss")
    this.selectMonth = 1 + new Date(selectMonth).getMonth();
    this.month = 1 + new Date(selectMonth).getMonth();
    this.today = new Date()
    this.maxDate = new Date()
    this.startMaxDate = new Date()
    let selectedPlant = JSON.parse(sessionStorage.getItem('plantDetails'))
    this.selectedPlant = selectedPlant['id']
    console.log( this.selectedPlant)
    this.getUserAndCompanyIds()
    this.commonService
      .readModuleConfigurationsData('safety-and-surveillance')
      .subscribe((moduleData: any) => {
        this.overallPlantReport =
          moduleData.page_configurations.reports_page.page_features.overall_plant_report;
        this.selectedSideBarItem = this.overallPlantReport
          ? this.selectedSideBarItem
          : 'All Units';
        // this.safetyAndSurveillanceDataService.passSelectedUnit(this.selectedSideBarItem, true);
        this.riskRatings = moduleData['module_configurations']['risk_rating_levels'].map(item => item.rating);
        this.getAvailableUnits();
      });
    this.yearsData = this.getYears(5);
    this.dataService.passSpinnerFlag(true, true);
    this.checkForGenerateReport();
    this.permission = JSON.parse(sessionStorage.getItem('plantModules'))
    // for (let i = 0; i < this.permission?.length; i++) {

    //   if (this.permission[i].key.includes('safety_and_surveillance')) {

    //     if (this.permission[i].plant_access_type.includes('safety_assistant_enable_generate_report')) {

    //       this.isGenerateButton = true

    //     }
    //     else {
    //       this.isGenerateButton = false
    //     }
    //   }

    // }
    let selectedPlantId = JSON.parse(sessionStorage.getItem("selectedPlant"));
    // To add the isPermitEnabled Access from the permitPlantMap
    if(selectedPlantId){
      let plantPermit = JSON.parse(sessionStorage.getItem("permitPlantMap"));
      let selectedPlant = plantPermit.filter(key  => { return key.plant_id == selectedPlantId });
      this.isPermitEnabled = selectedPlant[0].isPermitEnabled;
     
    }
    this.getUnitsandZones();
    this.getStatus();
    if(this.isPermitEnabled){
      this.obsModes= [
       { value: 'is_mobile', label: 'IS Mobile' },
       { value: 'ptz', label: 'PTZ' },
       { value: 'cctv', label: 'CCTV' }
       ];
   }else{
     this.obsModes= [
       { value: 'drone', label: 'Drone' },
       { value: 'camera', label: 'Camera' },
       ];
   }
  }

  getUserAndCompanyIds(){
    this.dataService.passSpinnerFlag(true, true);

    this.unitService.getUserAccessDetails().subscribe(data=>{
      const plantSelected = data.plant_access.find(plant => plant.id === this.selectedPlant);
      const plantAccessType = plantSelected['application'].find(app => app.key === "safety_and_surveillance")['plant_access_type'];
      if(plantAccessType.includes('safety_assistant_enable_generate_report')){
        this.isGenerateButton = true
        console.log('true')
      }
      else{
        this.isGenerateButton = false
        console.log('false')
      }

    },
    error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    },
    () => {
      this.dataService.passSpinnerFlag(false, true);
    })
  }
  /**
   * generating the new reports.
   */
  generateReport() {
      let api_url = sessionStorage.getItem('apiUrl')
      let url_split = api_url.split('//')
      let port_url = url_split[1].slice(0, -1);
      let stDate = new Date(this.selectedStartDate)

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
    // startDate1 = moment(new Date(this.generateReportForm.get('start_date').value)).tz(this.timeZone).format("YYYY-MM-DD")

      let enDate = new Date(this.selectedEndDate)
    let endDate: any = enDate.getDate();
    if (endDate < 10) {
      endDate = '0' + endDate;
    } else {
      endDate = endDate;
    }
    let endMonth: any = enDate.getMonth() + 1;
    if (endMonth < 10) {
      endMonth = '0' + endMonth;
    } else {
      endMonth = endMonth;
    }
    let endDate1 = enDate.getFullYear() + '-' + endMonth + '-' + endDate

    if(this.reportStartTime.length ==5){
      this.reportStartTime = this.reportStartTime+':00'
    }
    if(this.reportEndTime.length == 5){
      this.reportEndTime = this.reportEndTime+':00'
    }
    // endDate1= moment(new Date(this.generateReportForm.get('end_date').value)).tz(this.timeZone).format("YYYY-MM-DD")
    let allCategories = []

    let zoneNames: string[] = [];
    let allZonesNames = [];
    for (const sublist of this.allZonesData) {
        for (const obj of sublist) {
            if(!allZonesNames.includes(obj.title)){
              allZonesNames.push(obj.title)
            }
            if (this.reportSelectedZones.includes(obj.zoneId)) {
              zoneNames.push(obj.title);
            }
        }
    }

    let allUnitNames = []
    this.unitsAndZones.forEach(unit => {
      if(!allUnitNames.includes(unit.title)){
        allUnitNames.push(unit.title)
      }
    })

    if(!this.reportStartTime){
      this.reportStartTime = '00:00:00'
    }
    if(!this.reportEndTime){
      this.reportEndTime ='23:59:59'
    }
    
    if(!this.reportName){
      this.reportName = null
    }

    this.obsCategories.forEach(category => {
      allCategories.push(category.name)
    })
      let body = {
        start_date: startDate1,
        end_date: endDate1,
        portal: port_url,
        share_with_users: this.selectedUserList,
        report_name:this.reportName,
        unit_list:this.reportSelectedUnits.length ? this.reportSelectedUnits : allUnitNames,
        zone_list:zoneNames.length ? zoneNames : allZonesNames,
        categories:this.selectedObsCategory.length ? this.selectedObsCategory : allCategories,
        start_time:this.reportStartTime,
        end_time:this.reportEndTime,
        risk_rating:this.selectedRiskRating.length ? this.selectedRiskRating : this.riskRatings,
        obs_status:this.selectedStatus.length ? this.selectedStatus : this.status,
        mode:this.selectedObsMode.length ? this.selectedObsMode : this.obsModes.map(obsMode => obsMode.value),
        permit_number:this.selectedPermit.length ? this.selectedPermit : this.permit_list,
        permit_type:this.selectedPermitType.length ? this.selectedPermitType : this.permitTypeList,
        nature_of_work:this.selectedWork.length ? this.selectedWork : this.work,
        issuer_name:this.selectedIssuer.length ? this.selectedIssuer : this.issuerList,
        vendor_name:this.selectedVendor.length ? this.selectedVendor : this.vendorList
      };
      this.reportButton = true
      this.unitService.generateReport(body).subscribe((res: any) => {
        this.reportButton = false
        this.snackbarService.show('Report will be generated in few minutes', false, false, false, false);
        $('#generateReport').modal('hide');
        if (this.overallPlantReport) {
          this.formPlantData();
        } else {
          this.fetchReportsData();
        }

        this.reportFormReset();


      }, (err: any) => {
        this.reportButton = false
        if (err.error.message) {
          this.snackbarService.show(err.error.message, false, false, false, false);
        }
      });
   
  }
  selectList(event) {
  }
generateReportBack(){
  $('#generateReport').modal('hide');
}
  /**
   * select unit from units list.
   */
  unitSelectionChange(event?) {

    // let selectedValue = event ? event.value : this.selectedSideBarItem;
    let selectedValue = this.selectedSideBarItem
    
    if (selectedValue == 'Entire Plant') {
      this.formPlantData();
      this.safetyAndSurveillanceCommonService.sendMatomoEvent(
        'Selecting entire plant to view reports',
        'Reports features'
      )
    }
    else if (selectedValue == 'All Units') {
      this.sideBarSelectedItem(selectedValue);
    }
    else {
      this.sideBarSelectedItem(selectedValue);
      this.safetyAndSurveillanceCommonService.sendMatomoEvent(
        'Selecting a unit to view reports',
        'Reports features'
      )
    }
  }

  getUserListGenerateReport() {
    this.confirmationModal = true
    this.overAllCalenderOptions = {
      dateFormat: 'yyyy-mm-dd',
      dateRange: false,
      // disable all dates by default
      disableSince: { year: this.today.getFullYear(), month: this.today.getMonth() + 1, day: this.today.getDate() + 1 },
      enableDates: [],
    };
    this.overAllCalender_end_date_Options = {
      dateFormat: 'yyyy-mm-dd',
      dateRange: false,
      // disable all dates by default
      disableUntil: { year: 1900, month: 9, day: 1 },
      disableSince: { year: this.today.getFullYear(), month: this.today.getMonth() + 1, day: this.today.getDate() + 1 },
      enableDates: [],
    };
    this.unitService.getUserReportGenerate().subscribe((res: any) => {
      this.generateUserList = res.data
    });
  }

  /**
   * select all users from users list.
   */
  selectedAll() {
    let userList = this.generateUserList.map((res: any) => res.email)
    this.selectedUserList = userList;

  }
  /**
   * unselect all users.
   */
  unSelectAll() {
    this.selectedUserList =[]
  }
  /**
   * unit mapping to populate the units dropdown.
   */
  getAvailableUnits() {
    this.plantService.getAvailableUnits().subscribe(
      (availableUnits) => {
        let units: any = availableUnits;
        let unitsID :any=[]
        if (availableUnits['IOGP_Category']) {
          let availableUnits: any = Object.keys(units.IOGP_Category);
          availableUnits.forEach((unit) => {
            let unitDetails = {};
            unitDetails['unitName'] = unit;
            unitDetails['order'] = units.IOGP_Category[unit].order;
            this.units.push(unitDetails);
            unitsID.push(units.IOGP_Category[unit].id)
          });
          this.units.sort((a, b) => (a.order < b.order ? -1 : 1));
          this.units = this.units.map((unit) => unit.unitName);

          for (let i = 0; i < this.units.length; i++) {
            this.unitSelectionValues.push({ value: this.units[i],key: this.units[i]})
          }
          this.unitSelectionValues = [...this.unitSelectionValues]

        }
        if (this.overallPlantReport) {
          this.formPlantData();
        } else {
          this.fetchReportsData();
        }
      },
      (error) => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => { }
    );
  }

  /**
   * get the reports.
   */
  fetchReportsData() {
    // this.dataService.passSpinnerFlag(true, true);
    this.unitService.fetchReportsData(this.month, this.year,this.isCreatedByMe).subscribe(
      (data: any[]) => {
        if (data) {
          this.driverRows = [];
          data.forEach((element) => {
            const ob = {
              'Report Name': element['name'],
              Date: element['date'],
              Time: element['time'],
              fileUrl: this.decryptUrl(element['file']),
            };
            ob.Date=this.dateFormat.transform(ob.Date)
            this.driverRows.push(ob);
          });

          this.refreshTable();
        }
      },
      (error) => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      ()=>{
        this.dataService.passSpinnerFlag(false, true);
      }
    );
  }
  fetchReportsData1() {
    this.year = new Date().getFullYear();
    this.month = 1 + new Date().getMonth();
    if (this.selectedItemDate == 'Month wise') {
      this.year = this.selectedYear;
      this.month = this.selectMonth;
    }
    if (this.selectedItemDate == 'Year wise') {
      this.month = undefined;
      this.year = this.selectedYear;
    }

    if (this.selectedSideBarItem == 'Entire Plant') {
      this.formPlantData();

    }
    else if (this.selectedSideBarItem == 'All Units') {
      this.sideBarSelectedItem(this.selectedSideBarItem);

    }
    else {
      this.sideBarSelectedItem(this.selectedSideBarItem);
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
  /**
   * open pdf file.
   */


    // this.unitService.fetchReportsData(this.month, this.year).subscribe(
    //   (data: any[]) => {
    //      let refresh = (data.length != this.driverRows.length)?true:false;
    //     if (data && refresh) {
    //       this.driverRows = [];
    //       data.forEach((element) => {
    //         const ob = {
    //           'Report Name': element['name'],
    //           Date: element['date'],
    //           Time: element['time'],
    //           fileUrl: element['file'],
    //         };
    //         this.driverRows.push(ob);
    //         this.refreshTable();
    //       });


    //       // this.dataService.passSpinnerFlag(false, true);
    //     }
    //   },
    //   (error) => {
    //     // this.dataService.passSpinnerFlag(false, true);
    //     this.msg = 'Error occured. Please try again.';
    //     this.snackbarService.show(this.msg, true, false, false, false);
    //   }
    // );
  // }

  multiSelectList(event) {
    let unique = event.map(i => i.id).filter(this.onlyUnique);
    this.formattedPeoples = {};
    unique.forEach(item => {
      this.formattedPeoples[item] = event.filter(i => i.id === item).map(e => e.zoneId);
    });
    delete this.formattedPeoples['undefined'];
    let unit = 0;
    let zone = 0;
    this.reportSelectedUnits = []
    this.reportSelectedZones = []
    for (const [key, value] of Object.entries(this.formattedPeoples)) {
      unit += 1
      zone += this.formattedPeoples[key].length
      this.reportSelectedUnits.push(key);
      this.reportSelectedZones = this.reportSelectedZones.concat(value)
    }
    this.countOfUnitZone['unit'] = unit
    this.countOfUnitZone['zone'] = zone
    this.changePermit(this.reportSelectedZones)
  }
  
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  openPDF(fileUrl) {

    let name = fileUrl.split('/');
    name = name[name.length - 1].split('?')[0];
    name = name.replace('.pdf', '');


    this.modalPdfViewerService.show(name, fileUrl);

  }

  /**
   * select the date.
   */
  onDateChanged(datatype, data) {
    if (datatype == 'startDate') {
      this.startDateModel = data.formatted;
    } else if (datatype == 'endDate') {
      this.endDateModel = data.formatted;
    }

    this.safetyAndSurveillanceDataService.passShuddownDates(
      this.selectedSideBarItem,
      this.startDateModel,
      this.endDateModel,
      true
    );
  }
  /**
   * check the submitted reports.
   */
  checkForGenerateReport() {
    setInterval(() => {
      this.unitSelectionChange()
    }, 60000);
  }

  /**
   * get the reports from plant level.
   */
  formPlantData() {
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'));
    this.selectedSideBarItem = 'Entire Plant';
    this.plantService
      .fetchReportsData(this.month, this.year,this.isCreatedByMe)
      .subscribe(
        (data: any) => {
          if (data) {
            this.driverRows = [];
            data.forEach((element) => {
              const ob = {
                'Report Name': element['name'],
                Date: element['date'],
                Time: element['time'],
                fileUrl: this.decryptUrl(element['file']),
              };
              ob.Date=this.dateFormat.transform(ob.Date)
              this.driverRows.push(ob);
            });

            this.refreshTable();
          }
        },
        (error) => {
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        ()=>{
          this.dataService.passSpinnerFlag(false, true);
        }
      );
  }

  /**
   * select the end date.
   */
  endDateChange(event) {
    this.buttonEndDate = true
    let stDate = new Date(this.selectedEndDate)
    this.startMaxDate = stDate
    let startDate: any = stDate.getDate();
    if (startDate < 10) {
      startDate = '0' + startDate;
    } else {
      startDate = startDate;
    }
    let startMonth: any = this.startDate.getMonth() + 1;
    if (startMonth < 10) {
      startMonth = '0' + startMonth;
    } else {
      startMonth = startMonth;
    }
    this.customEndDate = stDate.getFullYear() + '-' + startMonth + '-' + startDate
    let selectedEndDate = moment(this.generateReportForm.get('end_date').value)
    this.generateReportForm.get("end_date").setValue(selectedEndDate);
    // if (event?.singleDate?.date) {
    //   this.overAllCalenderOptions = {
    //     dateFormat: 'yyyy-mm-dd',
    //     dateRange: false,
    //     disableSince: { year: event?.singleDate?.date.year, month: event?.singleDate?.date.month, day: event?.singleDate?.date.day + 1 },
    //     enableDates: [],
    //   }

    // }
    if(this.selectedStartDate != '' && this.selectedEndDate != ''){
      this.getPermitDetails(this.zonesId)
    }
  }

  /**
   * select the start date.
   */
  startDateChange(event) {
    this.buttonStartDate = true
    // let startDate: any = stDate.getDate();
    this.startDate = new Date(event.value._d)
    let startDate: any = this.startDate.getDate()
    let stDate = new Date(this.selectedStartDate)
    if (startDate < 10) {
      startDate = '0' + startDate;
    } else {
      startDate = startDate;
    }
    let startMonth: any = this.startDate.getMonth() + 1;
    if (startMonth < 10) {
      startMonth = '0' + startMonth;
    } else {
      startMonth = startMonth;
    }
    this.customStartDate = stDate.getFullYear() + '-' + startMonth + '-' + startDate
    // this.selectedStartDate = moment(this.generateReportForm.get('start_date').value) as any

    this.generateReportForm.get("start_date").setValue(this.selectedStartDate);
    // var d = new Date(toDateFliter); // current date
    // d.setDate(1); // going to 1st of the month
    // d.setHours(-1);
    // let date:any = {year: event?.singleDate?.date.year, month: event?.singleDate?.date.month, day: event?.singleDate?.date.day}
    // if (event?.singleDate?.date) {
    //   this.overAllCalender_end_date_Options = {
    //     dateFormat: 'yyyy-mm-dd',
    //     dateRange: false,
    //     disableUntil: { year: date.year, month: date.day > 1 ? date.month : date.month - 1, day: date.day > 1 ? (date.day - 1) : d.getDate() },
    //     disableSince: { year: this.today.getFullYear(), month: this.today.getMonth() + 1, day: this.today.getDate() + 1 },
    //     enableDates: [],
    //     showSelectorArrow: false
    //   }
    //   let date1 = this.overAllCalender_end_date_Options.disableUntil.year + '-' + this.overAllCalender_end_date_Options.disableUntil.month + '-' + this.overAllCalender_end_date_Options.disableUntil.day
    // }
    if(this.selectedStartDate != '' && this.selectedEndDate != ''){
      this.getPermitDetails(this.zonesId)
    }
  }

  onSelect(selected: any) {
    this.selected.splice(0, this.selected.length);
  }
  onActivate(event: any) {
  }

  onRouteClicked() {
    this.isRouteClicked = !this.isRouteClicked;
  }

  sideBarSelectedItem(data: any) {
    this.selectedItems = ['Month wise', 'Year wise'];
    this.getCurrentYear();
    this.getYears(this.selectedYear);
    this.selectedSideBarItem = data ? data : '';
    sessionStorage.removeItem('selectedUnitDate');
    sessionStorage.setItem('selectedUnit', this.selectedSideBarItem);

    if (sessionStorage.getItem('unitDetails')) {
      let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
      sessionStorage.setItem(
        'selectedUnitDetails',
        JSON.stringify(
          unitDetails.find((unit) => unit.unitName === this.selectedSideBarItem)
        )
      );
    };

    this.safetyAndSurveillanceDataService.passSelectedUnit(
      this.selectedSideBarItem,
      true
    );
    this.fetchReportsData();
  }

  getCurrentYear() {
    const date = new Date();
    return date.getFullYear();
  }

  getYears(howLong) {
    const years = [];
    const currentYear = this.getCurrentYear();
    for (let year = currentYear - howLong + 1; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }

  refreshTable() {
    this.driverRows = [...this.driverRows];
    setTimeout(() => {
      this.table.bodyComponent.offsetX = 0;
      this.table.bodyComponent.offsetY = 0;
      this.table.headerComponent.offsetX = 0;
      this.table.offset = 0;
      this.table.recalculateColumns();
      this.driverRows = [...this.driverRows];
    }, 100);
    setTimeout(function () {
      $('datatable-body').scrollTop(1);
    }, 1);
    setTimeout(function () {
      $('datatable-body').scrollTop(0);
    }, 1);
  }
  triggeringTime(data:any){

  }
  getSelectedCategory(data:any){
   this.dataService.passSpinnerFlag(true, true)
   this.selectedReportCategory = data
    if(this.selectedReportCategory.key === 'created_by_me'){
      this.isCreatedByMe = 'True';
    }else{
      this.isCreatedByMe = 'False';
    }

    if (this.selectedSideBarItem == 'Entire Plant') {
        this.formPlantData();
    } else {
        this.fetchReportsData();
    }
  }

  toggleCustomize(){
    this.showCustomize = !this.showCustomize;
  }

  getUnitsandZones(){
    this.safetyAndSurveillanceCommonService.getUnitZoneDropdown().subscribe((response: any) => {
      let unitsZones = []
      this.unitsId = []
      this.zonesId = []
      this.allZonesData = []
      if(response[0] == '') {
        this.dataService.passSpinnerFlag(false, true)
        var msg = "You are not mapped to any unit. Please contact the administrator."
        this.snackbarService.show(msg, false, false, false, true)
      } else {
        let index = 0;
        for (const [key, value] of Object.entries(response)) {
          let zones = [];
          index += 1
          response[key].forEach((data, i) => {
            zones.push({ title: data.name, id: key, zoneId: data.id, uuid: uuidv4() })
            this.zonesId.push(data.id);
          })
          unitsZones.push({
            'title': key, uuid: uuidv4(),
            'zones': zones,
            index
          })
          this.unitsId.push(value[0].unit_id);
          this.allZonesData.push(zones);
        }
        unitsZones.sort((i1, i2) => { return i2.index - i1.index })
        this.unitsAndZones = unitsZones;
        this.unitsAndZones.reverse();
        this.getCategory(this.unitsId);
        this.getPermitDetails(this.zonesId)
      }
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {

      })
  }

  onSearch(item) {
  }

  testSearch(term: string, item) {
    let unit = item.id
    let zone = item.title
    unit = unit.toLowerCase();
    zone = zone.toLowerCase();
    term = term.toLocaleLowerCase();
    
    return unit.includes(term) || zone.includes(term);
  }

  getCategory(units){
    let unitsId = '['+ units + ']'
    this.unitService.fetchSidebarData(unitsId).subscribe(
      (response) => {
       let zonesData = []
       let categoriesData = []
          for (const zones in response) {
            if (zones !== "All Zones") {
                zonesData.push(response[zones]);
            }
          }
          Object.entries(zonesData).forEach(([key, value]) => {
            for (const category in value) {
              if (category !== "All Categories" && category !== "unit_name" && category !== "id") {
                  categoriesData.push(value[category])
              }
            }
          });
          const uniqueCategories: { category_id: number; name: string }[] = [];
          const categoryIds = new Set<number>();

          categoriesData.forEach(category => {
            if (!categoryIds.has(category.category_id)) {
                uniqueCategories.push({ category_id: category.category_id, name: category.name });
                categoryIds.add(category.category_id);
            }
          });
          
          this.obsCategories = uniqueCategories;
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => { }
    );
  }

  changePermit(zones){
    if(zones.length == 0){
      zones =this.zonesId
    }
    let permit_list =[]
    for (const key in this.filterPermitData) {
      if(zones.includes(this.filterPermitData[key].zone_id)){
        let permit_number = this.filterPermitData[key].permit_number
        if(!permit_list.includes(permit_number)){
          permit_list.push(this.filterPermitData[key].permit_number) 
        }     
      }
    }
    this.permit_list = permit_list;
    let selectedPermit = this.permit_list.filter((data,index) => {return this.selectedPermit.includes(data)})
    this.selectedPermit = []
    this.selectedPermit = selectedPermit
      // adding functioanlity to select all the filters   
    this.addPermitData(permit_list,false);
  }

  getPermitDetails(zones){
    let startDate 
    let endDate
    
    if(this.selectedStartDate != '' && this.selectedEndDate != ''){
      startDate = this.customStartDate
      endDate = this.customEndDate
    }else{
      startDate = null
      endDate = null
    }
    
    this.safetyAndSurveillanceCommonService.fetchAllPermitDetails(startDate,endDate,zones,false).subscribe(
      (filters:any) => {  
        this.filterPermitData = filters;
        // storing the permit numbers 
        let permit_list =[]
        for (const key in filters) {
          let permit_number = filters[key].permit_number
          if(!permit_list.includes(permit_number)){
            permit_list.push(filters[key].permit_number) 
          }     
        }
       this.permit_list = permit_list;
        // adding functioanlity to select all the filters   
        this.addPermitData(permit_list,false);
      },
      (error) => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
       
       }
    );
  }

  addPermitData(permit_list , reset, dropDownType?){
    // function to add the remaining permit filters based on the permit_id selected
    if(dropDownType == 'permitNumber' && this.selectedUnitsAndZones.length < 1 ){
      this.filterFunction(dropDownType)
    }
    if(permit_list.length == 0){
      permit_list = this.permit_list
    }
    this.permitTypeList=[];
    this.work=[];
    this.vendorList=[];
    this.issuerList=[]; 
    if(reset){
      this.selectedPermitType = []
      this.selectedWork = []
      this.selectedVendor = []
      this.selectedIssuer = []
    }
    permit_list.forEach(value=>{
      for (const key in this.filterPermitData) {
        // to check if the permit_id is selected 
        if(value==this.filterPermitData[key].permit_number){
          // to check if element has already the value present and also null check for all the filters
          let strTypeOfPermit = this.filterPermitData[key].type_of_permit
          if(!this.permitTypeList.includes(strTypeOfPermit) && strTypeOfPermit != 'NA' && strTypeOfPermit != null){
            this.permitTypeList.push(this.filterPermitData[key].type_of_permit);
          }
          let strNatureOfWork = this.filterPermitData[key].nature_of_work
          if(!this.work.includes(strNatureOfWork) && strNatureOfWork != 'NA' && strNatureOfWork != null){
            this.work.push(this.filterPermitData[key].nature_of_work);
          }
          let strVendorName = this.filterPermitData[key].vendor_name
          if(!this.vendorList.includes(strVendorName) && strVendorName != 'NA' && strVendorName != null){
            this.vendorList.push(this.filterPermitData[key].vendor_name);
          }
          let strIssuerName = this.filterPermitData[key].issuer_name
          if(!this.issuerList.includes(strIssuerName) && strIssuerName != 'NA' && strIssuerName != null){
            this.issuerList.push(this.filterPermitData[key].issuer_name);
          }
          
        }
      }
    })
    let selectedPermitType = this.permitTypeList.filter((data,index) => {return this.selectedPermitType.includes(data)})
    this.selectedPermitType = []
    this.selectedPermitType = selectedPermitType
    let selectedWork = this.work.filter((data,index) => {return this.selectedWork.includes(data)})
    this.selectedWork = []
    this.selectedWork = selectedWork
    let selectedVendor = this.vendorList.filter((data,index) => {return this.selectedVendor.includes(data)})
    this.selectedVendor = []
    this.selectedVendor = selectedVendor
    let selectedIssuer = this.issuerList.filter((data,index) => {return this.selectedIssuer.includes(data)})
    this.selectedIssuer = []
    this.selectedIssuer = selectedIssuer
  }

  toggleCheckAll(values: any){
    if(values.currentTarget.checked){
      this.selectedUnitsAndZones = [];
      this.formattedPeoples = {}
      this.unitsAndZones.forEach(unit => {
        let zonesId = []
        unit.zones.forEach(item => {
          this.selectedUnitsAndZones.push(item.uuid)
          zonesId.push(item.zoneId)
        })
        this.formattedPeoples[unit.title] = zonesId;
      });
    } else {
      this.selectedUnitsAndZones = [];
      this.formattedPeoples = {}
    }

    let unit = 0;
    let zone = 0;
    this.reportSelectedUnits = []
    this.reportSelectedZones = []
    for (const [key, value] of Object.entries(this.formattedPeoples)) {
      unit += 1
      zone += this.formattedPeoples[key].length
      this.reportSelectedUnits.push(key);
      this.reportSelectedZones = this.reportSelectedZones.concat(value)
    }
    this.countOfUnitZone['unit'] = unit
    this.countOfUnitZone['zone'] = zone
    this.changePermit(this.reportSelectedZones)
  }

  reportToggleCheckAll(event:any , dropdownName:string){
    const isChecked = event.currentTarget.checked;
    
    switch (dropdownName) {
      case 'category':
        if (isChecked) {
          this.selectedObsCategory = []
          this.obsCategories.forEach(category => {
            this.selectedObsCategory.push(category.name)
          })
        } else {
          this.selectedObsCategory = []
        }
        break;
      case 'permit':
        if (isChecked) {
          this.selectedPermit = this.permit_list;
          this.addPermitData(this.permit_list , false)
        } else {
          this.selectedPermit = []
        }
        break;
      case 'rating':
        if (isChecked) {
          this.selectedRiskRating = this.riskRatings
        } else {
          this.selectedRiskRating = []
        }
        break;
      case 'status':
        if (isChecked) {
          this.selectedStatus = this.status
        } else {
          this.selectedStatus = []
        }
        break;
      case 'mode':
        if (isChecked) {
          this.selectedObsMode = []
          this.obsModes.forEach(category => {
            this.selectedObsMode.push(category.value)
          })
        } else {
          this.selectedObsMode = []
        }
        break;
      case 'permitType':
        if (isChecked) {
          this.selectedPermitType = this.permitTypeList
            } else {
          this.selectedPermitType = []
        }
        break;
      case 'nature':
        if (isChecked) {
          this.selectedWork = this.work
        } else {
          this.selectedWork = []
        }
        break;
      case 'vendor':
        if (isChecked) {
          this.selectedVendor = this.vendorList
        } else {
          this.selectedVendor = []
        }
        break;
      case 'issuer':
        if (isChecked) {
          this.selectedIssuer = this.issuerList
        } else {
          this.selectedIssuer = []
        }
        break;
      default:
    }
  }
  getRiskRatingName(item: number): string {
    switch (item) {
      case 1:
        return this.riskRatingValues.filter(rating => rating.rating == 1)[0].ratingName;
      case 2:
        return this.riskRatingValues.filter(rating => rating.rating == 2)[0].ratingName;
      case 3:
        return this.riskRatingValues.filter(rating => rating.rating == 3)[0].ratingName;
      case 4:
        return this.riskRatingValues.filter(rating => rating.rating == 4)[0].ratingName;
      case 5:
        return this.riskRatingValues.filter(rating => rating.rating == 5)[0].ratingName;
      default:
        return '';
    }
  }

  returnBackGroundColor(rating){
    let index = this.riskRatingLevels.findIndex(ele =>{ return ele.rating == rating});
    return this.riskRatingLevels[index].colorCode;
  }

  getStatus(){
      this.safetyAndSurveillanceCommonService.fetchFaultsChoice().subscribe(
        (faultsChoice) => {
         let faults: any = faultsChoice;
         this.status = faults.map((fault) => fault.choice_name)
        },
        (error) => {
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => { }
      );
  }

  reportFormReset(){
    this.showCustomize = false
    this.selectedStartDate = ''
    this.selectedEndDate = ''
    this.selectedUserList = []
    this.reportName = ''
    this.selectedUnitsAndZones = []
    this.selectedObsCategory = []
    this.selectedPermit = []
    this.selectedRiskRating = []
    this.selectedStatus = []
    this.reportStartTime = '00:00:00'
    this.reportEndTime = '23:59:59'
    this.selectedObsMode = []
    this.selectedPermitType = []
    this.selectedWork = []
    this.selectedVendor = []
    this.selectedIssuer = []
  }

  reportButtonEnable(){
      if(this.selectedStartDate && this.selectedEndDate){
        // if(this.reportSelectedZones.length || this.selectedObsCategory.length || this.selectedPermit.length  || this.selectedRiskRating.length || this.selectedStatus.length || this.reportStartTime !== '00:00:00' || this.reportEndTime !== '23:59:59' || this.selectedObsMode.length || this.selectedPermitType.length || this.selectedWork.length || this.selectedVendor.length || this.selectedIssuer.length){
        //     if(this.reportName){
        //       return false
        //     }else{
        //       return true
        //     }
        // }else{
        //     return false
        // }
        return false
      }else{
        return true 
      }
  }
  onFilterChange(dropDownType){
    this.filterFunction(dropDownType)
  }

  filterFunction(dropDownType){
    if(this.selectedUnitsAndZones.length < 1){
     let permit_list = this.filterPermitData.filter((data)=> {
      if(dropDownType == 'typeOfPermit'){
        return this.selectedPermitType.includes(data?.type_of_permit) 
      }
      else if(dropDownType == 'natureOfWork'){
        return this.selectedWork.includes(data?.nature_of_work) 
      }
      else if(dropDownType == 'vendorName'){
        return this.selectedVendor.includes(data?.vendor_name) 
      }
      else if(dropDownType == 'issuerName'){
        return this.selectedIssuer.includes(data?.issuer_name) 
      }
      else if(dropDownType == 'permitNumber'){
        return this.selectedPermit.includes(data?.permit_number)
      }
     })
     let allZones:any[] = [];
     this.unitsAndZones.map((data) =>{
     allZones =[...allZones,...data.zones] 
     })
     let relatedZones:any[] = []
     permit_list.filter((data) => {
     allZones.find((zoneData) => { 
      if(zoneData?.zoneId == data?.zone_id){
        relatedZones.push(data)
      }
     })
     })
     this.formattedPeoples = {}
     relatedZones?.map((data,index) => {
     let objKeys = Object.keys(this.formattedPeoples)
     if(objKeys.includes(data?.unit_name)){
      if(!this.formattedPeoples[data?.unit_name].includes(data?.zone_id)){
        this.formattedPeoples[data?.unit_name].push(data?.zone_id)
      }
     }
     else{
      this.formattedPeoples[data?.unit_name] = [data?.zone_id]
     }
     })
     this.selectedUnitsAndZones = []
     this.unitsAndZones.map(unit => {
      unit.zones.map(item => {
        if(relatedZones.find((zoneData)=> zoneData.zone_id == item.zoneId)){
          if(!this.selectedUnitsAndZones.includes(item.uuid)){
            this.selectedUnitsAndZones.push(item.uuid)
          }
        }
      })
     })
     let unit = 0;
     let zone = 0;
     this.reportSelectedUnits = []
     this.reportSelectedZones = []
     for (const [key, value] of Object.entries(this.formattedPeoples)) {
      unit += 1
      zone += this.formattedPeoples[key].length
      this.reportSelectedUnits.push(key);
      this.reportSelectedZones = this.reportSelectedZones.concat(value)
     }
     this.countOfUnitZone['unit'] = unit
     this.countOfUnitZone['zone'] = zone
     this.changePermit(this.reportSelectedZones)
    }
    if(this.selectedUnitsAndZones.length > 0 && dropDownType !== 'permitNumber'){
      let permit_list = this.filterPermitData.filter((data)=> {
      if(dropDownType == 'typeOfPermit'){
        return this.selectedPermitType.includes(data?.type_of_permit) 
      }
      else if(dropDownType == 'natureOfWork'){
        return this.selectedWork.includes(data?.nature_of_work) 
      }
      else if(dropDownType == 'vendorName'){
        return this.selectedVendor.includes(data?.vendor_name) 
      }
      else if(dropDownType == 'issuerName'){
        return this.selectedIssuer.includes(data?.issuer_name) 
      }
     })
     if(permit_list.length > 0){
     this.permit_list = permit_list.map((permit)=>{return permit?.permit_number})
     this.addPermitData(this.permit_list,false);
     }
     else{
      this.changePermit(this.reportSelectedZones)
     }
    }
  }
  Space(event: any) {
    if (event.target.selectionStart === 0 && event.code === 'Space') {
      event.preventDefault()
    }
  }
  ngOnDestroy() {
    if (this.selectedSideBarItem == 'All Units') {
      let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
      sessionStorage.setItem(
        'selectedUnitDetails',
        JSON.stringify(
          unitDetails.find((unit) => unit.unitName === this.units[0])
        )
      );
      this.safetyAndSurveillanceDataService.passSelectedUnit(
        this.units[0],
        true
      );
      sessionStorage.setItem('selectedUnit', this.units[0]);
    }
    this.modalPdfViewerService.show('', '');
  }
}
