import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { ReportsService } from 'src/app/services/reports.service';
import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
declare var $: any;


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent | undefined;
  @ViewChild('viewFile', { static: true }) viewFile: TemplateRef<any> | undefined;
  public recordColumns: any[] = []
  ColumnMode = ColumnMode;
  recordRows: any = [];
  selectedItems = ["Monthly", "Yearly", "Custom"];
  selectedItemDate = this.selectedItems[0];
  months: any[] = [
    { 'key': 1, 'value': 'Jan' },
    { 'key': 2, 'value': 'Feb' },
    { 'key': 3, 'value': 'Mar' },
    { 'key': 4, 'value': 'Apr' },
    { 'key': 5, 'value': 'May' },
    { 'key': 6, 'value': 'Jun' },
    { 'key': 7, 'value': 'Jul' },
    { 'key': 8, 'value': 'Aug' },
    { 'key': 9, 'value': 'Sep' },
    { 'key': 10, 'value': 'Oct' },
    { 'key': 11, 'value': 'Nov' },
    { 'key': 12, 'value': 'Dec' },
  ]
  selectedYear: any = new Date().getFullYear();
  year: number = new Date().getFullYear();
  month: number = 1 + new Date().getMonth();
  selectMonth: number = 1 + new Date().getMonth();
  monthWiseNone: boolean = true;
  rowsLimit: any;
  unitsList: any[] = [];
  reportTypeList = [];
  selectedReport = {};
  selectedUnit: any = '';
  selectedUnitId: any = '';
  filtered: any[];
  isRouteClicked: boolean = false;
  tempRecordRows: any;
  fromDateFliter: any;
  toDateFliter: any;
  selectedReportVlaue: any;
  startDate: string;
  endDate: string;
  screenHeight: number;
  constructor(private modalPdfViewerService: ModalPdfViewerService, private reportsService: ReportsService) { }

  ngOnInit(): void {
    this.reportTypeList = [
      { name: 'Daily Progress Report', value: 'daily_progress_report' },
      { name: 'Inspection Report', value: 'inspection_report' },
      { name: 'Boxup Report', value: 'boxup_report' },
      { name: 'Other Report', value: 'other_report' }
    ]
    this.selectedReport = this.reportTypeList[0].name;
    this.selectedReportVlaue = this.reportTypeList[0].value;
    console.log(this.selectedReport)
    this.getUnitsList();
    var w = window.innerWidth;
    var h = window.innerHeight;
    this.getScreenSize();
    this.recordColumns = [
      { prop: 'name', name: 'Report Name', sortable: true, width: 250, size: 10 },
      { prop: 'date', name: 'Date', sortable: true, width: 250, size: 1 },
      { prop: 'time', name: 'Time', sortable: true, width: 200, size: 1 },
      { prop: 'file', name: 'file', sortable: true, width: 200, size: 1 },
    ]
    /* this.recordRows = [
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" },
      { report_name: "Report Name", date: "05.06.2023", time: "01:23", url: "https://tpulse-msa-fe-qa-data.detectpl.com/DHDS/Reports/report1.pdf" }
    ]; */
  }
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    let screenSize = window.innerHeight;
    if (this.screenHeight != screenSize) {
      this.screenHeight = screenSize;
      let ss = (this.screenHeight - 215);
      this.rowsLimit = Math.floor(ss / 60);
    }


  }
  getCurrentYear() {
    const date = new Date();
    return date.getFullYear();
  }
  getYears(howLong: any) {
    const years = [];
    const currentYear = this.getCurrentYear();
    for (let year = currentYear - howLong + 1; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }
  openPDF(fileUrl: any) {
    console.log('fileUrl', fileUrl)
    let name = fileUrl.split('/');
    name = name[name.length - 1].split('?')[0];
    name = name.replace('.pdf', '');
    this.modalPdfViewerService.show(name, fileUrl);
  }

  getUnitsList() {
    this.unitsList = [];
    this.reportsService.getUnitsList().subscribe((data: any) => {
      // let reportSelectedUnit = sessionStorage.getItem('reportSelectedUnit');
      // if (reportSelectedUnit) {
      //   this.selectedUnit = data.find(d => d.id === Number(reportSelectedUnit)).name;
      //   this.selectedUnitId = Number(reportSelectedUnit);
      //   sessionStorage.removeItem('reportSelectedUnit');
      // }
      // else {
      //   this.selectedUnit = data[0].name;
      //   this.selectedUnitId = data[0].id;
      // }
      this.unitsList = data;
      this.selectedUnit = this.unitsList.filter(item => item.id == parseInt(sessionStorage.getItem('storedUnitId')))[0]?.name || this.unitsList[0]?.name;
      this.selectedUnitId = this.unitsList.filter(item => item.id == parseInt(sessionStorage.getItem('storedUnitId')))[0]?.id || this.unitsList[0]?.id;
      sessionStorage.setItem('storedUnitId', this.selectedUnitId);
      window.dispatchEvent(new CustomEvent('unitchanged'))
      this.getReports(this.selectedUnitId, this.selectedReportVlaue)
    })
  }
  changeUnit(unit: any) {
    this.filtered = [];
    this.filtered = this.unitsList.filter((t) => t.name == this.selectedUnit);
    this.selectedUnitId = this.filtered[0].id
    sessionStorage.setItem('storedUnitId', this.selectedUnitId);
    window.dispatchEvent(new CustomEvent('unitchanged'))
    this.getReports(this.selectedUnitId, this.selectedReportVlaue)
  }

  changeReportType(report) {
    let array = this.reportTypeList.filter((t) => t.name == this.selectedReport);
    this.selectedReportVlaue = array[0].value
    this.getReports(this.selectedUnitId, this.selectedReportVlaue)
  }
  getReports(unitId, report_type) {
    let month: any = this.selectMonth;
    let day: any = 1;
    let year = this.selectedYear;
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    var d = new Date(this.selectedYear, month, 0).getDate();
    let startDate = ''
    let endDate = ''
    if (this.selectedItemDate == 'Monthly') {
      startDate = year + '-' + month + '-' + day;
      endDate = year + '-' + month + '-' + d;
    } else if (this.selectedItemDate == 'Yearly') {
      startDate = year + '-' + '01' + '-' + '01';
      endDate = year + '-' + '12' + '-' + '31';
    } else {
      startDate = this.fromDateFliter;
      endDate = this.toDateFliter;
    }

    this.startDate = startDate;
    this.endDate = endDate;
    this.recordRows = [];
    if (this.startDate !== undefined && this.endDate !== undefined) {
      this.reportsService.getReports(unitId, report_type, this.startDate, this.endDate).subscribe((data) => {
        this.recordRows = data;
        this.recordRows.sort((date1, date2) => { return new Date(date2.date).getTime() - new Date(date1.date).getTime() })
        this.tempRecordRows = data;
        // this.getReportsList();

      })
    }

  }

  changeRangeType() {
    this.getReports(this.selectedUnitId, this.selectedReportVlaue)

  }
  onRouteClicked() {
    this.isRouteClicked = !this.isRouteClicked;
  }
  getReportsList() {
    if (this.fromDateFliter && this.toDateFliter) {
      this.recordRows = this.tempRecordRows.filter((item: any) => {
        return new Date(item.date).getTime() >= new Date(this.fromDateFliter).getTime() &&
          new Date(item.date).getTime() <= new Date(this.toDateFliter).getTime();
      });
      this.isRouteClicked = false;
    }
  }
  filterReset() {
    this.recordRows = this.tempRecordRows
    this.isRouteClicked = false;
  }
  startInputDisabled() {
    // let dtToday = new Date();
    let month: any = this.selectMonth;
    let day: any = 1;
    let year = this.selectedYear;
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    var d = new Date(this.selectedYear, month, 0).getDate();
    console.log(d.toString()); // last day in January
    let minDate = ''
    let maxDate = ''
    minDate = year + '-' + month + '-' + day;
    maxDate = year + '-' + month + '-' + d;
    // if(this.selectedItemDate == 'Monthly'){
    // }else{
    //   minDate= year + '-' + '01' + '-' + '01';
    //   maxDate= year + '-' + '12' + '-' + '31';
    // }

    $('#startDate').attr('min', minDate);
    // $('#startDate').attr('max', maxDate);
  }
  endInputDisabled() {
    // let dtToday = new Date();
    let month: any = this.selectMonth;
    let day: any = 1;
    let year = this.selectedYear;
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    var d = new Date(this.selectedYear, month, 0).getDate();
    console.log(d.toString()); // last day in January
    let minDate = ''
    let maxDate = ''
    if (this.selectedItemDate == 'Monthly') {
      minDate = year + '-' + month + '-' + day;
      maxDate = year + '-' + month + '-' + d;
    } else {
      minDate = year + '-' + '01' + '-' + '01';
      maxDate = year + '-' + '12' + '-' + '31';
    }

    $('#endDate').attr('min', minDate);
    $('#endDate').attr('max', maxDate);
  }
}
