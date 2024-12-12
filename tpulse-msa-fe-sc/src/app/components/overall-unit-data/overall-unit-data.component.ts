import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { OverviewService } from 'src/app/shared/services/overview.service';
import { DataService } from 'src/shared/services/data.service';
import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';

@Component({
  selector: 'app-overall-unit-data',
  templateUrl: './overall-unit-data.component.html',
  styleUrls: ['./overall-unit-data.component.scss']
})
export class OverallUnitDataComponent implements OnInit,OnChanges {
  overAllUnitData:any;
  @Input() unit_id:any;
  @Output() dataChange = new EventEmitter();
  @Output() unitEquipmentCount = new EventEmitter();
  unitData = [1, 2, 3, 5, 6, 7, 8, 9]
  msg: string;
  next_milestone:any;
  last_milestone:any;
  constructor(private modalPdfViewerService:ModalPdfViewerService,private dataService:DataService,private overviewService: OverviewService,private snackbarService:SnackbarService) { }

  ngOnInit(): void {
  }
  getOverAllUnitData(data){
    // this.dataService.passSpinnerFlag(true, true);
    this.overviewService.getOverAllUnitData(data).subscribe({
      next:(UnitData:any)=>{
       this.overAllUnitData = UnitData[0]
       this.getLastAndNextMilestone(data)
      },
      error:()=>{
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete:()=>{
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getLastAndNextMilestone(data){
    this.overviewService.getLastAndNextMilestone(data).subscribe({
      next:(milestone:any)=> {
       this.next_milestone = milestone?.next_milestone;
       this.last_milestone = milestone?.last_milestone
       this.getActiveEquipmentCount()
      },
      error:()=>{
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete:()=>{
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getActiveEquipmentCount(){
    this.overviewService.getActiveEquipmentCount(this.unit_id?.unit).subscribe({
      next:(data)=>{
        this.unitEquipmentCount.emit(data)
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
  ngOnChanges(){
    this.getOverAllUnitData(this.unit_id?.unit)
  }
  toggleShow(){
    this.dataChange.emit(false);
  }
  openPDF(fileUrl:any) {
    console.log('fileUrl',fileUrl)
    let name = fileUrl.split('/');
    name = name[name.length - 1].split('?')[0];
    name = name.replace('.pdf', '');
    this.modalPdfViewerService.show(name, fileUrl);
  }
}
