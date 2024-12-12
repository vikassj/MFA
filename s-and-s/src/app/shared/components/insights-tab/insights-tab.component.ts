import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { assetUrl } from 'src/single-spa/asset-url';

import { SafetyAndSurveillanceCommonService } from '../../service/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';

@Component({
  selector: 'app-insights-tab',
  templateUrl: './insights-tab.component.html',
  styleUrls: ['./insights-tab.component.css']
})
export class InsightsTabComponent implements OnInit {

  @Input() insightBody: any
  @Output() toggleInsightsEvent = new EventEmitter<boolean>();
  insightsData: any = []
  insightsAvailable = true
  pinnedInsights: any = []
  unPinnedInsights: any = []
  pinIcon: any
  unPinIcon: any
  msg: string;
  dummydata = [
    {
      "title": "Most Frequent CSC Observations in zone between 2023-07-21 and 2023-04-22",
      "description": "The most frequent observations recorded for CSC  is None in this time."
    },
    {
      "title": "Number of CSC Observations in zone between 2023-07-21 and 2023-04-22",
      "description": "A total of 0 CSC violations were recorded under zone None between 2023-04-22 to 2023-07-21."
    },
    {
      "title": "Observation Count by Category in zone between 2023-07-21 and 2023-04-22",
      "description": "Here is the list of the safety violations per category for None between 2023-04-22 and 2023-07-21: None"
    },
    {
      "title": "Highest Risk Locations in zone between 2023-07-21 and 2023-04-22",
      "description": "The following zones recorded the highest risk violation with a risk rating of nan between the time frame of 2023-07-21 to 2023-04-22 :None"
    },
    {
      "title": "Highest Risk CSC Observations in zone between 2023-07-21 and 2023-04-22",
      "description": "The highest risk CSC violation in zone None for the category None has risk rate 0. This observation indicates instances where individuals were engaged in unsafe practices related to CSC in the specified zone."
    },
    {
      "title": "Average Closure Time for CSC Observations in zone",
      "description": "For cases where corrective action was taken in location zone before closing a CSC violation, the average time taken was 0. In cases where no action was taken before closing a violation, the average time it took was 0."
    },
    {
      "title": "Number of Open CSC Observations in zone",
      "description": "0 CSC category observations are open under zone None."
    },
    {
      "title": "Number of Risk Level 3 Observations in zone between 2023-07-21 and 2023-04-22",
      "description": "Between the time frame of 2023-04-22 to 2023-07-21, a total of 0 safety violation with a risk level of 3 occurred in zone None. These observations highlight situations with a level of risk in that specific zone during the specified time period."
    },
    {
      "title": "Number of Open Risk Level 3 Observations in zone",
      "description": "There are currently 0 open observations with a risk level of 3 in zone None. These open observations signify ongoing concerns or violations within the specified zone that require attention and resolution. "
    }
  ];
  insightsLoading: boolean;
  constructor(private snackbarService: SnackbarService, private dataService: DataService, private SafetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) { }

  ngOnInit(): void {
    this.pinIcon = assetUrl("/icons/pin-icon.svg")
    this.unPinIcon = assetUrl("/icons/unpin-icon.svg")
    // this.getInsightsData()

  }

  ngOnChanges(changes: SimpleChanges): void {

    let isInsightsBodyChanged = changes['insightBody'] &&
      changes['insightBody'].currentValue != changes['insightBody'].previousValue;

    if (isInsightsBodyChanged) {
      this.getInsightsData()
    }
  }

  toggleInsights() {
    // Emit the value to the parent component
    this.toggleInsightsEvent.emit(false);
  }
  getInsightsData() {
    // this.dataService.passSpinnerFlag(true, true);
    this.insightsLoading = true
    this.insightsData = []
    this.insightsAvailable = true
    this.SafetyAndSurveillanceCommonService.getObsInsights(this.insightBody).subscribe((response: any) => {
      this.insightsData = response
      this.insightsData = response?.map(item => ({ ...item, view: true, pin: false }));
      this.getPinnedInsights()
      this.insightsLoading = false
    },
      error => {
        this.insightsLoading = false
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        // do
      })

  }


  getPinnedInsights() {
    // debugger
    this.SafetyAndSurveillanceCommonService.getPinnedInsights("observation_id", this.insightBody.observation_id).subscribe((response: any) => {
      this.pinnedInsights = response.map(item => ({ ...item.response, view: false, pin: true, pinnedInsightId: item.id }));
      this.unPinnedInsights = this.insightsData?.filter(item => !this.pinnedInsights.some(pinnedItem => pinnedItem.title === item.title));
      this.unPinnedInsights = this.unPinnedInsights?.map(item => ({ ...item, pin: false }));
      this.insightsData = [...this.pinnedInsights, ...this.unPinnedInsights]
      this.dataService.passSpinnerFlag(false, true);
    },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.insightsAvailable = true;
        this.msg = 'Error occured. Please try   again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        // do
      }
    )
  }
  getMostCriticalTableHeight() {
    var insight_header = document.getElementById("right-insight-header");
    return insight_header.offsetHeight;
  }
  /**
   * show and hide the insight.
  */
  showAndHide(i){

    this.insightsData[i].view = !this.insightsData[i].view
  }


}
