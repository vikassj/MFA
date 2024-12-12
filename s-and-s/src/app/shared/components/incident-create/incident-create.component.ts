import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import "moment-timezone";

declare var $: any;

import { IncidentFormModel } from '../../models/incidentForm.model';

import { SafetyAndSurveillanceCommonService } from '../../service/common.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { DataService } from 'src/shared/services/data.service';
import { CommonService } from 'src/shared/services/common.service';
import { SafetyAndSurveillanceDataService } from '../../service/data.service';


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
  selector: 'app-incident-create',
  templateUrl: './incident-create.component.html',
  styleUrls: ['./incident-create.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT }
  ],


})
export class IncidentCreateComponent implements OnInit {

  @Input() units: any[];
  @Input() zonesList: any[];
  @Output() backToIncidentPage = new EventEmitter();
  @Input() loginUserId: any ;
  minDate = new Date();
  actionDue_date: any;
  confirmSubmitCreateIncident = false;
  clientName: string;
  plantName:string
  newFormattedData: IncidentFormModel
  unitDropdown: boolean;
  zoneDropdown: boolean;
  selectedUnitName: any;
  selectedZoneName: any;
  msg: string;
  newIncidentForm: any = [];
  newIncidentFormObj = {};
  obsFilters: Object;
  newEvidenceDataValidationObj: any;
  todaysDate:any;
  currentTime
  allCategory : any [] = [];
  selectedCategory : any;
  selectedCategories : any;
  selectedPlantDetails:any;
  timeZone:any;
  lostTimeInjury: boolean = false; 

  constructor(private SafetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,
    private snackbarService: SnackbarService,
    public commonService: CommonService,
    private dataService: DataService,
    private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService) {
      let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
      let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
      this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
     }

  ngOnInit(): void {
    this.timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    // let time = moment().format("HH:mm:ss")
    let todaysDate = moment().tz(this.timeZone).format("YYYY-MM-DD HH:mm:ss")
    this.todaysDate = new Date()
    // this.todaysDate = new Date()
    this.currentTime = moment().tz(this.timeZone)
    this.newFormattedData = new IncidentFormModel({});
    this.clientName = sessionStorage.getItem("company-name");
    this.plantName = sessionStorage.getItem("plantName");
    this.selectedUnit(this.units[0]);
    this.getIncidentMetadata();
    this.allCategory = [];
    let categories = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'));
    categories['module_configurations']['iogp_categories']?.forEach(ele =>{
      if(ele?.show_hide){
        this.allCategory.push({name:ele?.name,acronym:ele?.acronym})
      }
    })
  }

  /**
   * get the current date.
   */
  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return moment().tz(this.timeZone).format("YYYY-MM-DD");
    // return `${year}-${month}-${day}`;
  }
  /**
   * get the current time.
   */
  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return moment().tz(this.timeZone).format("HH:mm");;
    // return `${hours}:${minutes}`;
  }

  /**
   * get the incident metadata.
   */
  getIncidentMetadata(){
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.getIncidentMetadata('').subscribe(form =>{
      this.newIncidentForm = form;
      this.newIncidentForm.sort((a, b) => {
        if (a.key === "others" && b.key !== "others") {
          return 1;
        } else if (a.key !== "others" && b.key === "others") {
          return -1;
        } else {
          return 0;
        }
      });
      let sector = [];
      let incident_factor = [];
      let damage = [];
      let injury = [];
      let body_part = [];
      this.newIncidentForm.forEach(element => {
        if(element.type == 'sector'){
          let obj = element;
          obj.checked = false;
          sector.push(obj)
        }else if(element.type == 'incident_factor'){
          let obj = element;
          obj.checked = false;
          incident_factor.push(obj)
        }else if(element.type == 'damage'){
          let obj = element;
          obj.checked = false;
          damage.push(obj)
        }else if(element.type == 'injury'){
          let obj = element;
          obj.checked = false;
          injury.push(obj)
        }else if(element.type == 'body_part'){
          let obj = element;
          obj.checked = false;
          body_part.push(obj)
        }
      });
      this.newIncidentFormObj['sector'] = sector
      this.newIncidentFormObj['incident_factor'] = incident_factor
      this.newIncidentFormObj['damage'] = damage
      this.newIncidentFormObj['injury'] = injury
      this.newIncidentFormObj['body_part'] = body_part
      this.setDefaultData();
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
  setDefaultData(){
    this.newEvidenceDataValidationObj = {};
    let array = ['sector', 'incident_factor', 'damage'];
    array.forEach(type =>{
      let obj = {}
      this.newIncidentFormObj[type].forEach(ele =>{
        obj[ele.key] = ele.checked
      })
      this.newEvidenceDataValidationObj[type] = 0
      this.newFormattedData[type] = obj;
    })
    this.newFormattedData.serious_injury = {
      "employee": 0,
      "contractor": 0,
      "others": 0
  };
    this.newFormattedData.fatality = {
      "employee": 0,
      "contractor": 0,
      "others": 0
  };
    this.newFormattedData.plant = this.clientName;
    this.newFormattedData.unit = this.selectedUnitName;
    this.newFormattedData.zone = this.selectedZoneName;
  }


  /**
   * select data from check list.
   */
  selectCheckList(type, obj, i){
    this.newEvidenceDataValidationObj[type] = 0
    this.newIncidentFormObj[type][i].checked = !this.newIncidentFormObj[type][i].checked
    this.newFormattedData[type] = {}
    this.newIncidentFormObj[type].forEach(ele =>{
      this.newFormattedData[type][ele.key] = ele.checked
      if(ele.checked){
        this.newEvidenceDataValidationObj[type] += 1
      }
    })
  }

  /**
   * selected units from units dropdown.
   */
  selectedUnit(unit){
    this.selectedUnitName = unit;
    this.newFormattedData.unit = unit
    this.unitDropdown = false;
    this.fetchObservationData(this.selectedUnitName)
  }

  changeCategories() {
    // this.selectedCategories = this.selectedCategory.map((item) => item.name)
  }

  /**
   * get the observation data.
   */
  fetchObservationData(unit) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.fetchObservationData(unit).subscribe((response) => {
      let obsData = response
      this.zonesList = [];
      this.zonesList = Object.keys(obsData);
      for (var i = 0; i < this.zonesList.length; i++) {
        if (this.zonesList[i].indexOf('All') > -1) {
          this.zonesList.splice(i, 1)
        }
      }
      this.selectedZone(this.zonesList[0])
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
   * show and hide the unit dropdown.
   */
  unitDropdownShow(){
    if(!this.confirmSubmitCreateIncident){
      this.unitDropdown = !this.unitDropdown
    }
  }
  /**
   * select the zones from zones dropdown.
   */
  selectedZone(zone){
    this.selectedZoneName = zone;
    this.newFormattedData.zone = zone
    this.zoneDropdown = false;
  }
  /**
   * show and hide the zone dropdown.
   */
  zoneDropdownShow(){
    if(!this.confirmSubmitCreateIncident){
      this.zoneDropdown = !this.zoneDropdown
    }
  }
  /**
   * select date.
   */
  DateChange(event){
    let stDate = new Date(this.newFormattedData.incident_date)
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
    this.newFormattedData.incident_date = moment(this.newFormattedData.incident_date).format('YYYY-MM-DD')
    if(this.newFormattedData.incident_date == this.getCurrentDate()){
      this.newFormattedData.incident_time = this.getCurrentTime()
    }

  }

  /**
   * select time.
   */
  timeChange(event){
    this.newFormattedData.incident_time = event.target.value
    const currentTime = this.getCurrentTime()
    if(event.target.value>currentTime && this.newFormattedData.incident_date==this.getCurrentDate() ){
      this.newFormattedData.incident_time = currentTime
      event.target.value = currentTime

      this.snackbarService.show("The incident time cannot be set in the future", false, false, false,true);

    }
  }

  /**
   * validation for all fields.
   */
  validateField(fieldName: string) {

    if(typeof(this.newFormattedData[fieldName]) == 'string'){
      return (this.newFormattedData[fieldName].trim().length <= 0) && this.submitButtonClick ? true : false;
    }
    else if(Array.isArray(this.newFormattedData[fieldName])){
      return this.newFormattedData[fieldName].length <= 0 && this.submitButtonClick ? true : false;
    }
    else if(typeof(this.newFormattedData[fieldName]) == 'number'){
      return this.newFormattedData[fieldName] <=0 && this.submitButtonClick ? true : false;
    }
    else{
      return this.newEvidenceDataValidationObj[fieldName] <= 0 && this.submitButtonClick ? true : false;
    }
  }

  /**
   * validating the form.
   */
  validationForm(){
    let validate = false


    for (const [key, value] of Object.entries(this.newFormattedData)){
      if(typeof(this.newFormattedData[key]) == 'string' || Array.isArray(this.newFormattedData[key])){
        if((this.newFormattedData.description.trim().length <= 0)  ||
          (this.newFormattedData.immediate_response.trim().length <= 0)  ||
          (this.newFormattedData.incident_factor['fire_explosion']) ||
          (this.newFormattedData.sector['others'] && (this.newFormattedData.sector_description?.length <= 0 || !this.commonService.alphaNumericWithoutSpaceValidator(this.newFormattedData.sector_description))) ||
          (this.newFormattedData.incident_factor['others'] && (this.newFormattedData.incident_factor_description?.length <= 0 || !this.commonService.alphaNumericWithoutSpaceValidator(this.newFormattedData.incident_factor_description))) ||
          (this.newFormattedData.damage['others'] && (this.newFormattedData.damage_description?.length <= 0 || !this.commonService.alphaNumericWithoutSpaceValidator(this.newFormattedData.damage_description))) ||
          (this.newFormattedData.summary.trim().length <= 0)   ||
          this.newFormattedData.incident_time.length <= 0 ||
          this.newFormattedData.incident_date.length <= 0 ||
          this.newFormattedData.zone.length <= 0 ||
          this.newFormattedData.unit.length <= 0 ||
          this.newFormattedData.plant.length <= 0
          ){
          validate = true
        }
      }else{
        let serious_injury = 0;
        let fatality  = 0;
        for (const [key, value] of Object.entries(this.newFormattedData.fatality)){
          fatality += this.newFormattedData.fatality[key]
        }
        for (const [key, value] of Object.entries(this.newFormattedData.serious_injury)){
          serious_injury += this.newFormattedData.serious_injury[key]
        }
        if(this.newEvidenceDataValidationObj.sector <= 0 || this.newEvidenceDataValidationObj.damage <= 0 || this.newEvidenceDataValidationObj.incident_factor <= 0){
          validate = true;
        }
      }
    }
    return validate;
  }

  submitButtonClick

  /**
   * get confirmation for submitted data.
   */
  submitNewIncidentData(){
    if(this.validationForm()){
      this.submitButtonClick = true
      $("#validateField").modal("show");
    }else{
      this.confirmSubmitCreateIncident = true
    }
  }

  // to get lost time enable based on serious_injury fields 
  lostTimeDisabled(){
    if(this.newFormattedData.serious_injury['employee'] > 0 || this.newFormattedData.serious_injury['contractor'] > 0 || this.newFormattedData.serious_injury['others'] > 0){
      return false
    }else{
      return true
    }
  }

  /**
   * create new incident.
   */
  confirmToSubmit(){
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.fetchObservationData(this.newFormattedData.unit).subscribe((responce) => {
      this.obsFilters = responce;
      for (const [zoneKey, zoneValue] of Object.entries(this.obsFilters)){
        if(zoneKey == this.newFormattedData.zone){
          delete this.newFormattedData.id
          delete this.newFormattedData.unit_name
          delete this.newFormattedData.zone_name
          this.newFormattedData.zone = this.obsFilters[zoneKey].id
          this.newFormattedData.reporter = this.loginUserId 
          this.newFormattedData.lost_time_injury = this.lostTimeInjury
          this.SafetyAndSurveillanceCommonService.postNewIncident(this.newFormattedData).subscribe((responce) => {
            $("#confirmSubmit").modal("show");

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

      }
    })
  }
  submittedInitialReport(){
    $("#confirmSubmit").modal("hide");
    this.backToIncidentPage.emit(true)

  }

  backToIncident(){
    this.backToIncidentPage.emit(false)
  }

  /**
   * disable the input fields.
   */
  inputDisabled(){
    var dtToday = new Date();

    var month:any = dtToday.getMonth() + 1;
    var day:any = dtToday.getDate();
    var year = dtToday.getFullYear();
    if(month < 10)
        month = '0' + month.toString();
    if(day < 10)
        day = '0' + day.toString();

    var minDate= year + '-' + month + '-' + day;

    $('#txtDate').attr('min', minDate);
  }

  /**
   * set height to textarea.
   */
  getTextareaHeight(elementClass) {

    const textarea = document.querySelector(`.${elementClass}`) as HTMLTextAreaElement;
    let height =textarea.scrollHeight + 'px';
    return height
  }
  ngOnDestroy(){
    this.safetyAndSurveillanceDataService.passObsData('', '', '', '', false);

  }
}
