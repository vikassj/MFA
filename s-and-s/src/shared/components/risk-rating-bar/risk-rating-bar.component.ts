import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexYAxis,
  ApexTooltip,
  ApexFill,
  ApexLegend,
  ApexGrid,
  NgApexchartsModule
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
  grid: ApexGrid;
};

@Component({
  selector: 'app-risk-rating-bar',
  templateUrl: './risk-rating-bar.component.html',
  styleUrls: ['./risk-rating-bar.component.css']
})
export class RiskRatingBarComponent {

  @Input() open:any;
  @Input() close:any;
  @Input() observationsByUnitAndRiskRating:any;
  constructor() { }

  option = {
    title: {
      show: true
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      },
      formatter: function (params) {
        return `<div class="text-center" style="color: #2196F3; font-weight: 500">${params.seriesName} </div>
          <div class="text-center">${params.data}</div>
        `;
      },
    },
    legend: {
      show: false,
      padding:0,
      itemHeight:0
    },
    grid: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    },
    xAxis: {
      type: 'value',
      max: 'dataMax',
      showGrid: false,
      splitLine: false,
      showAxis: false,
      show: false,
      tooltip: false
    },
    yAxis: {
      type: 'category',
      color: 'white',
      showGrid: false,
      splitLine: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      tooltip: false,
      show :false

    },
    series: [
      {
        name: 'Very Low',
        type: 'bar',
        stack: 'total',
        color: "#FFBC00",
        label: {
          show: true
        },
       barWidth: 25,
        data: []
      },
      {
        name: 'Low',
        type: 'bar',
        color: "#DC9222",
        stack: 'total',
        label: {
          show: true
        },
        data: []
      },
      {
        name: 'Medium',
        type: 'bar',
        color: "#FF5E28",
        stack: 'total',
        label: {
          show: true
        },
        data: []
      },
      {
        name: 'High',
        type: 'bar',
        color: "#D90504",
        stack: 'total',
        label: {
          show: true
        },
        data: []
      },
      {
        name: 'Very High',
        type: 'bar',
        color: "#910707",
        stack: 'total',
        label: {
          show: true
        },
        data: []
      }
    ]
  };

  ngOnInit(): void {
  }

  ngOnChanges(): void{
    let series = this.option.series || [] as any;
    let riskRatingLevels = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'))['module_configurations']['risk_rating_levels']
    if(this.observationsByUnitAndRiskRating[1] > 0){
      let riskObject = riskRatingLevels.filter(item => item.rating == 1);
      series[0].name = riskObject[0].ratingName
      series[0].color = riskObject[0].colorCode
      series[0].data = [this.observationsByUnitAndRiskRating[1]];
    }else{
      let riskObject = riskRatingLevels.filter(item => item.rating == 1);
      series[0].name = riskObject[0].ratingName
      series[0].color = riskObject[0].colorCode
      series[0].data = [];
    }
    if(this.observationsByUnitAndRiskRating[2] > 0){
      let riskObject = riskRatingLevels.filter(item => item.rating == 2);
      series[1].name = riskObject[0].ratingName
      series[1].color = riskObject[0].colorCode
      series[1].data = [this.observationsByUnitAndRiskRating[2]];
    }else{
      let riskObject = riskRatingLevels.filter(item => item.rating == 2);
      series[1].name = riskObject[0].ratingName
      series[1].color = riskObject[0].colorCode
      series[1].data = [];
    }
    if(this.observationsByUnitAndRiskRating[3] > 0){
      let riskObject = riskRatingLevels.filter(item => item.rating == 3);
      series[2].name = riskObject[0].ratingName
      series[2].color = riskObject[0].colorCode
      series[2].data = [this.observationsByUnitAndRiskRating[3]];
    }else{
      let riskObject = riskRatingLevels.filter(item => item.rating == 3);
      series[2].name = riskObject[0].ratingName
      series[2].color = riskObject[0].colorCode
      series[2].data = [];
    }
    if(this.observationsByUnitAndRiskRating[4] > 0){
      let riskObject = riskRatingLevels.filter(item => item.rating == 4);
      series[3].name = riskObject[0].ratingName
      series[3].color = riskObject[0].colorCode
      series[3].data = [this.observationsByUnitAndRiskRating[4]];
    }else{
      let riskObject = riskRatingLevels.filter(item => item.rating == 4);
      series[3].name = riskObject[0].ratingName
      series[3].color = riskObject[0].colorCode
      series[3].data = [];
    }
    if(this.observationsByUnitAndRiskRating[5] > 0){
      let riskObject = riskRatingLevels.filter(item => item.rating == 5);
      series[4].name = riskObject[0].ratingName
      series[4].color = riskObject[0].colorCode
      series[4].data = [this.observationsByUnitAndRiskRating[5]];
    }else{
      let riskObject = riskRatingLevels.filter(item => item.rating == 5);
      series[4].name = riskObject[0].ratingName
      series[4].color = riskObject[0].colorCode
      series[4].data = [];
    }


    this.option = Object.assign({}, this.option);

    //check if the percentage of the distribution is less than 20%, if yes then hide the label else dont.
    for(let i in this.option.series) {
      if( (this.option.series[i].data[0]/(this.open + this.close))*100 < 20) {
        this.option.series[i].label.show = false;
      } else {
        this.option.series[i].label.show = true;
      }
    }

  }

}
