import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { SafetyAndSurveillanceCommonService } from 'src/app/shared/service/common.service';
import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';
import { DataService } from 'src/shared/services/data.service';
import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css']
})
export class AuditComponent implements OnInit {
  auditData: any;
  selected:any = []
  ColumnMode = ColumnMode;
  selectionType = SelectionType;
  totalLength: number = 0;
  noOfRows: number = 10;
  activePage: any = 1;
  filterData: any;
  msg: string;
  audits_due_today: number = 0;
  audits_overdue: number = 0;
  completed_audits: number = 0;
  compliance_percentage: number = 0;
  incomplete_audits: number = 0;
  missed_audits: number = 0;
  observation_count: number = 0;
  surprise_audits: number = 0;
  upcoming_audits: number = 0;
  selectedKey: any = 'audits_due_today';
  startAudit: boolean = true;
  userGroup: any = [];
  plannerAccess: boolean = false;
  safetyPlannerAcess: boolean = false;

  constructor(private router: Router,  private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, private snackbarService: SnackbarService, private dataService: DataService, public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,private modalPdfViewerService: ModalPdfViewerService,) { 

  }

  ngOnInit(): void {
    this.userGroup = JSON.parse(sessionStorage.getItem('userGroup'));
    this.plannerAccess = this.userGroup.some(str =>str.toLowerCase() === 'planner'.toLowerCase())
    this.safetyPlannerAcess = this.userGroup.some(
      (str) => str.toLowerCase() === 'planner'.toLowerCase() || str.toLowerCase() === 'safety_officer'.toLowerCase()
    );
  }
 

  selectedFilters(event) {
    console.log(event,"event");
    
    this.filterData = event
    this.getAuditCount();
    this.getAuditActivities();
  }

  getAuditCount(){
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.activitySummary(this.filterData).subscribe(
      data => {
        this.audits_due_today = data['audits_due_today'];
        this.audits_overdue = data['audits_overdue'];
        this.completed_audits = data['completed_audits'];
        this.compliance_percentage = data['compliance_percentage'];
        this.incomplete_audits = data['incomplete_audits'];
        this.missed_audits = data['missed_audits'];
        this.observation_count = data['observation_count'];
        this.surprise_audits = data['surprise_audits'];
        this.upcoming_audits = data['upcoming_audits'];
        this.dataService.passSpinnerFlag(false, true)
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

  getAuditActivities(){
    this.dataService.passSpinnerFlag(true, true);
    let start = ((this.activePage - 1) * this.noOfRows) + 1
    this.safetyAndSurveillanceCommonService.activities(this.filterData, this.selectedKey,start,this.noOfRows).subscribe(
      data => {
        const activities = data["activities"]
        this.totalLength = data["pagination"]["total"]
        const updatedObj: any = {};
        Object.keys(activities).forEach(key => {
          const pdfUrl = activities[key]["checklist_pdf"] ? this.decryptUrl(activities[key]["checklist_pdf"]) : null;
          updatedObj[key] = { ...activities[key], fileUrl: pdfUrl }; 
        });
        this.auditData = Object.values(updatedObj);
        this.dataService.passSpinnerFlag(false, true)
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

  toggleActivities(value) {
    if(value === 'completed_audits'){
      this.startAudit = false;
    }else{
      this.startAudit = true;
    }
    this.selectedKey = value;
    sessionStorage.removeItem('selectedActivePage')
    this.activePage = 1;
    this.getAuditActivities();
  }

  routeAudit(route,store){
    sessionStorage.setItem(store.key,store.value)
    this.router.navigateByUrl(route)
  }

  openPdf(row){
    let name = row.fileUrl.split('/');
    name = name[name.length - 1].split('?')[0];
    name = name.replace('.pdf', '');
    this.modalPdfViewerService.show(name, row.fileUrl);
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


  onSelect(data: any) {
  }

  displayActivePage(activePageNumber: number) {
    let num: any = sessionStorage.getItem('selectedPageNum');
    if (num > 0) {
      this.activePage = Number(num)
    } else {
      this.activePage = activePageNumber
    }
      this.getAuditActivities();
  }

}
