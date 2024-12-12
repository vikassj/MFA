import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import * as CryptoJS from 'crypto-js';
declare var $: any;

import { SafetyAndSurveillanceCommonService } from 'src/app/shared/service/common.service';
import { PlantService } from 'src/app/shared/service/plant.service';
import { CommonService } from 'src/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';


import { IncidentFormModel } from 'src/app/shared/models/incidentForm.model';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css']
})
export class IncidentComponent implements OnInit {

  ColumnMode:ColumnMode;
  incidentData: any = [];
  dueDates = [];
  selectedDates = [];
  reporters = [];
  selectedReporter = [];
  investigators = [];
  selectedInvestigators = [];
  status = [];
  selectedStatus = [];
  filterPopup = false;
  createIncident = false;
  units: any[];
  msg: string;
  selectedUnitName: any;
  zonesList: any[];
  unitDropdown: boolean;
  zoneDropdown: boolean;
  selectedZoneName: any;
  clientName: string;
  confirmSubmitCreateIncident = false;
  selectedIncidentView = false;
  allUserList: any[];
  newIncidentForm: any = [];
  newIncidentFormObj = {};

  newFormattedData: IncidentFormModel;
  selectedIncidentObj: any;
  obsFilters: any;
  commentTagging: any;
  tempIncidentData: any;
  loginUserId: any;
  buttonDis: boolean = false
  selectedPlantDetails:any;
  disableApply:boolean = true;

  constructor(private plantService: PlantService,
    private snackbarService: SnackbarService,
    private dataService: DataService,
    public commonService: CommonService,
    private SafetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,) {
      let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
      let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
      this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
     }

  ngOnInit(): void {
    this.newFormattedData = new IncidentFormModel({});
    this.clientName = sessionStorage.getItem("company-name");
    this.getCompanyName();
    this.getAvailableUnits();
  }

  /**
   * get company name
   */
  getCompanyName(): any {
    this.commonService.getCompanyDetails().subscribe((data: any) => {
      this.clientName = data.name
      sessionStorage.setItem("company-name", data.name)
      return data.name;
    })
  }

  /**
   * get all the available units.
   */
  getAvailableUnits() {
    this.plantService.getAvailableUnits().subscribe(
      availableUnits => {
        if (availableUnits['IOGP_Category']) {
          let units: any = availableUnits;
          let unitList: any = [];
          this.units = [];
          Object.keys(units.IOGP_Category).forEach((unit) => {
            if (units.IOGP_Category[unit].access_permissions[0].indexOf('view') > -1) {
              let unitDetails = {};
              unitDetails['unitName'] = unit;
              unitDetails['order'] = units.IOGP_Category[unit].order;
              unitList.push(unitDetails);
            }
          });
          unitList.sort((a, b) => (a.order < b.order) ? -1 : 1);
          this.units = unitList.map(unit => unit.unitName);
          this.selectedUnit(this.units[0]);
          if(this.units.length){
          this.getAllAssigneeList();
          }
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
  decryptData(encryptedData: string, key: any){
    // Decrypt the value
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
  
    // Convert the decrypted data to a UTF-8 string and return it
    return decrypted.toString(CryptoJS.enc.Utf8)
   }

  /**
   * get all the assignees list.
   */
  getAllAssigneeList(){
    this.dataService.passSpinnerFlag(true, true);
    this.allUserList = [];
    this.commentTagging = [];
    this.SafetyAndSurveillanceCommonService.getAllUsersList('', '', false, false).subscribe(data =>{
      let assignee:any = data
      const encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
      const key = CryptoJS.enc.Hex.parse(encryptionKey);
      assignee.forEach(item => {
      // Decrypt email
      item.email = this.decryptData(item.email, key).replace(/^"(.*)"$/, '$1');

      // Decrypt id
      item.id = this.decryptData(item.id, key);

      // Decrypt name
      item.name = this.decryptData(item.name, key).replace(/^"(.*)"$/, '$1');
      

      // Decrypt username
      item.username = this.decryptData(item.username, key).replace(/^"(.*)"$/, '$1');
    });
        let userMail = sessionStorage.getItem('user-email');
        assignee.forEach(element => {
          if(element.email == userMail){
            this.loginUserId = element.id
          }
          let userObj = this.allUserList.find(user=>user.id == element.id);
          if(!userObj){
            this.allUserList.push(element)
            this.commentTagging.push({ "key": element.name, "value": element.name, "email": element.email, "id": element.id, "username": element.username, "mobile_number": element.mobile_number, "mobile_token": element.mobile_token },)
          }
          });
          this.getIncidentMetadata();
          this.commentTagging = [...this.commentTagging]
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
    }

  /**
   * get all the incidents.
   */
  getIncidents(){

      this.dataService.passSpinnerFlag(true, true);
      this.SafetyAndSurveillanceCommonService.getIncident('').subscribe(data =>{
        this.dataService.passSpinnerFlag(true, true);
        this.incidentData = data;
        let nav = sessionStorage.getItem('searchIncident')
        if(nav){
          let idIndex = this.incidentData.findIndex(id =>{ return id.incident_id == nav});
          if(idIndex >= 0){
            sessionStorage.removeItem('searchIncident')
            this.selecteRow(this.incidentData[idIndex])
          }
        }

        this.tempIncidentData = data;
        this.dueDates = [];
        this.reporters = [];
        this.investigators = [];
        this.status = [];
        this.incidentData.forEach(ele =>{
          let index = this.dueDates.findIndex(date =>{ return date == ele.investigation_due_date});
        if(index == -1 && ele.investigation_due_date){
          this.dueDates.push(ele.investigation_due_date)
        }

        let reporterIndex = this.reporters.findIndex(reporter =>{ return reporter.id == ele.reporter});
        if(reporterIndex == -1 && ele.reporter){
          let index = this.allUserList.findIndex(obj =>{return obj.id == ele.reporter})
          if(index >= 0){
            this.reporters.push(this.allUserList[index])
          }
        }
        ele.investigators.forEach(investigator =>{
          let investigatorsIndex = this.investigators.findIndex(investigators =>{ return investigators.id == investigator});
          if(investigatorsIndex == -1 && investigator){
            let index = this.allUserList.findIndex(obj =>{return obj.id == investigator})
            if(index >= 0){
                this.investigators.push(this.allUserList[index])
              }
            }
          })
          let statusIndex = this.status.findIndex(status =>{ return status == ele.status});
          if(statusIndex == -1 && ele.status){
            this.status.push(ele.status)
          }
        });
        this.dataService.passSpinnerFlag(false, true);
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
   * get total count of the incidents.
   */
  getTotalcount(obj){
    let count = 0;
    for (const [key, value] of Object.entries(obj)) {
      count += obj[key]
    }
    return count;
  }

  /**
   * get available factors list to populate the new incident form.
   */
  getFactoList(obj){
    let count = 0;
    let text = ''
    for (const [key, value] of Object.entries(obj)) {
      if(obj[key] == true){
        count += 1
        let index = this.newIncidentFormObj['incident_factor'].findIndex(ele =>{ return ele.key == key})
        if(index >= 0){
          text = text + '<div class="d-flex mb-1"> <div class="pe-1">' + count + '.</div><div> ' + this.newIncidentFormObj['incident_factor'][index].name + ',' +'</div></div>';
        }
      }
    }
    return text;
  }

  /**
   * on select of a datatable row.
   */
  selecteRow(row){
    this.selectedIncidentView = true
    this.selectedIncidentObj = row;
  }

  /**
   * create new incident logic.
   */
  createNewIncident(){
    this.createIncident = true;
    this.confirmSubmitCreateIncident = false;
  }

  /**
   * get selected incidents metadata.
   */
  getIncidentMetadata(){
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.getIncidentMetadata('').subscribe(form =>{
      this.newIncidentForm = form;
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
      this.getIncidents();
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
   * reset to default data.
   */
  setDefaultData(){
    let array = ['sector', 'incident_factor', 'damage'];
    array.forEach(type =>{
      let obj = {}
      this.newIncidentFormObj[type].forEach(ele =>{
        obj[ele.key] = ele.checked
      })
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
   * setting injuries and fatalities count.
   */
  setInjuriesFatalitiescoutn(type, name){
    this.newFormattedData[type][name] += 1
  }

  /**
   * get date for an incident type.
   */
  getDate($event, type){
    this.newFormattedData[type] = $event.target.value;
  }

  /**
   * pre-population logic for new incident form.
   */
  selectCheckList(type, obj, i){
    this.newIncidentFormObj[type][i].checked = !this.newIncidentFormObj[type][i].checked
    this.newFormattedData[type] = {}
    this.newIncidentFormObj[type].forEach(ele =>{
      this.newFormattedData[type][ele.key] = ele.checked
    })

  }

  /**
   * submit new incident form logic.
   */
  submitNewIncidentData(){
    this.confirmSubmitCreateIncident = true
  }

  /**
   * unit selection from the dropdown.
   * @param unit selected unit.
   */
  selectedUnit(unit){
    this.selectedUnitName = unit;
    this.unitDropdown = false;
    this.fetchObservationData(this.selectedUnitName)
  }

  /**
   * get observations data for a unit.
   * @param unit selected unit
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
   * unit dropdown show logic.
   */
  unitDropdownShow(){
    this.unitDropdown = !this.unitDropdown
  }

  /**
   * zone selection from the zones dropdown.
   * @param zone selected zone
   */
  selectedZone(zone){
    this.selectedZoneName = zone;
    this.zoneDropdown = false;
  }

  /**
   * zones dropdown show logic.
   */
  zoneDropdownShow(){
    this.zoneDropdown = !this.zoneDropdown
  }

  /**
   * closing the incident view and going back to the default view of all incidents.
   */
  backToOverViewTable(){
    this.selectedIncidentView = false;
    this.getIncidents()
  }

  /**
   *apply filtering logic for the incidents.
   */
  applyFilters(){

    let filterByDates = [];
    let filterByReporter = [];
    let filterByInvestigator = [];
    let filterByStatus = [];
    if(this.selectedDates.length > 0){
        this.tempIncidentData.forEach(element => {
          let index = this.selectedDates.findIndex(date => {return date == element.investigation_due_date});
          if(index >= 0){
            filterByDates.push(element)
          }
        })
      }else{
        filterByDates = this.tempIncidentData
      }
    if(this.selectedReporter.length > 0){
      filterByDates.forEach(element => {
          let index = this.selectedReporter.findIndex(user => {return user.id == element.reporter});
          if(index >= 0){
            filterByReporter.push(element)
          }
        })
      }else{
        filterByReporter = filterByDates
      }
    if(this.selectedInvestigators.length > 0){
      filterByReporter.forEach(element => {
          let index = this.selectedInvestigators.findIndex(user => {return user.id == element.investigators[0]});
          if(index >= 0){
            filterByInvestigator.push(element)
          }

        })
      }
      else{
        filterByInvestigator = filterByReporter
      }
    if(this.selectedStatus.length > 0){
      filterByInvestigator.forEach(element => {
          let index = this.selectedStatus.findIndex(status => {return status == element.status});
          if(index >= 0){
            filterByStatus.push(element)
          }
          this.buttonDis = true;
        })
      }else{
        filterByStatus = filterByInvestigator
      }
      this.incidentData = [...filterByStatus]

      this.disableApply = true
  }

  /**
   * filter reset logic.
   */
  onFilterReset(){
    this.incidentData = this.tempIncidentData
    this.selectedDates = [];
    this.selectedReporter = [];
    this.selectedInvestigators = [];
    this.selectedStatus = [];
    this.disableApply = true
  }

  /**
   * select all dates logic.
   */
  selectedAllDates(){
    this.disableApply = false
    this.selectedDates = this.dueDates;
    this.buttonDis = true;
  }

  /**
   * de-select all dates logic.
   */
  unSelectAllDates(){
    this.disableApply = false
    this.selectedDates = [];
  }

  /**
   * select all reporters logic.
   */
  selectedAllReporters(){
    this.disableApply = false
    this.selectedReporter = this.reporters;
    this.buttonDis = true;
  }


  /**
   * de-select all reporters logic.
   */
  unSelectAllReporters(){
    this.disableApply = false
    this.selectedReporter = [];
  }


  /**
   * select all investigators logic.
   */
  selectedAllInvestigators(){
    this.disableApply = false
    this.selectedInvestigators = this.investigators;
    this.buttonDis = true;
  }


  /**
   * de-select all investigators logic.
   */
  unSelectAllInvestigators(){
    this.disableApply = false
    this.selectedInvestigators = [];
  }


  /**
   * select all statuses logic.
   */
  selectedAllStatus(){
    this.disableApply = false
    this.selectedStatus = this.status;
    this.buttonDis = true;
  }


  /**
   * de-select all statuses logic.
   */
  unSelectAllStatus(){
    this.disableApply = false
    this.selectedStatus = [];
  }

  /**
   * close create incident pop-up.
   */
  closeCreateIncident(event){
    this.createIncident = false
    if(event){
      this.getIncidents();
    }
  }


  /**
   * on change of the filter fields.
   */
  onFilterChange(){
    this.disableApply = false
  }

}
