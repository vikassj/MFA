import { Component, OnInit, Input } from '@angular/core';
import { IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker';

@Component({
  selector: 'app-live-data',
  templateUrl: './live-data.component.html',
  styleUrls: ['./live-data.component.scss']
})
export class LiveDataComponent implements OnInit {

  @Input() locationData: any = '';
  @Input() firstZone: any = '';
  startDateCalenderOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'dd-mm-yyyy',
  };
  startDateCalenderModel: IMyDateModel = null;
  endDateCalenderOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'dd-mm-yyyy'
  };
  endDateCalenderModel: IMyDateModel = null;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
  }

}
