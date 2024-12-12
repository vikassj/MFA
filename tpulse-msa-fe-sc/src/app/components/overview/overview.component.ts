import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';
import { OverviewService } from 'src/app/shared/services/overview.service';
import { DataService } from 'src/shared/services/data.service';
import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  unitData: any[] = [];
  show_hide: boolean = false;
  msg: string;
  overAllUnitData: any[] = []
  unit_id: any;
  equipmentCount: any;
  constructor(private router: Router, private modalPdfViewerService: ModalPdfViewerService, private overviewService: OverviewService, private dataService: DataService, private activityMonitorService: ActivityMonitorService, private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    // this.unitData = [1, 2, 3, 5, 6, 7, 8, 9]
    this.getDashboard()
  }
  toggleShow(data: any) {
    this.dataService.passSpinnerFlag(true, true);
    sessionStorage.removeItem('selectedTab')
    // this.show_hide = !this.show_hide
    this.unit_id = data
    sessionStorage.setItem('unit-navigation-id', JSON.stringify(data.unit))
    this.router.navigateByUrl('/schedule-control/unit')
    // this.getOverAllUnitData(data)
  }
  onDataChange(data: boolean) {
    this.show_hide = data;
    this.getUnitsList()
  }
  getDashboard() {
    this.activityMonitorService.getDashboard().subscribe({
      next: (unit_data: any[]) => {
        sessionStorage.setItem('sc_units', JSON.stringify(unit_data))
        this.getUnitsList()
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getUnitsList() {
    this.dataService.passSpinnerFlag(true, true);
    this.overviewService.getUnitsList().subscribe({
      next: (unit_data: any[]) => {
        this.unitData = unit_data
        sessionStorage.setItem('units', JSON.stringify(this.unitData))
        this.getActiveEquipmentCount()
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getActiveEquipmentCount() {
    this.overviewService.getActiveEquipmentCount('').subscribe({
      next: (data) => {
        this.equipmentCount = data
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }

    })
  }
  openPDF(fileUrl: any) {
    let name = fileUrl.split('/');
    name = name[name.length - 1].split('?')[0];
    name = name.replace('.pdf', '');
    this.modalPdfViewerService.show(name, fileUrl);
  }
  unitRelatedEquipmentCount(data) {
    this.equipmentCount = data
  }

  getDailyReports(unitName) {
    this.dataService.passSpinnerFlag(true, true);
    this.overviewService.getDailyExceptionReport(unitName).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.openPDF(data[0])
        }
        else {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Daily Progress report is not available of this unit.';
          this.snackbarService.show(this.msg, false, false, false, true);
        }
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }

    })
  }
}
