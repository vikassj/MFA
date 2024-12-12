import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-riskwise-horizontal-chart',
  templateUrl: './riskwise-horizontal-chart.component.html',
  styleUrls: ['./riskwise-horizontal-chart.component.css']
})
export class RiskwiseHorizontalChartComponent implements OnInit {

  @Input() riskWiseData:any;
  total: number;
  very_low:string='';
  low:string='';
  medium: string;
  high: string;
  very_high: string;


  constructor() { }

  option = {
    tooltip: {
      trigger: 'item',
      confine: true,
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      },
      formatter: function (params) {
        return `<div class="text-center" style="color: #000000; font-weight: 600; font-size: 11px; font-family: Montserrat;">${params.seriesName}</div>`;
      },
    },
    title: {
      show: true
    },
    legend: {
      show: false,
      padding:0,
      itemHeight:0
    },
    grid: {
      height: 50,
      top: '0%',
      left: -15,
      right: '0%',
      bottom: '-10%',
      containLabel: true
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
        barWidth:45,
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0],
        },
        label: {
          show: true,
          fontSize: 12,
          fontFamily: 'Montserrat',
          fontWeight: 600,
          color: '#FFFFFF',
          formatter: function(d) {
            return 'Very Low'
             }
        },
        data: [],
      },
      {
        name: 'Low',
        type: 'bar',
        color: "#DC9222",
        stack: 'total',
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0],
        },
        label: {
          show: true,
          fontSize: 12,
          fontFamily: 'Montserrat',
          fontWeight: 600,
          color: '#FFFFFF',
          formatter: function(d) {
            return 'Low'
             }
        },
        data: [],
      },
      {
        name: 'Medium',
        type: 'bar',
         color: "#FF5E28",
        stack: 'total',
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0],
        },
        label: {
          show: true,
          fontSize: 12,
          fontFamily: 'Montserrat',
          fontWeight: 600,
          color: '#FFFFFF',
           formatter: function(d) {
            return 'Medium'
             }
        },
        data: [],
      },
      {
        name: 'High',
        type: 'bar',
        color: "#D90504",
        stack: 'total',
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0],
        },
        label: {
          show: true,
          fontSize: 12,
          fontFamily: 'Montserrat',
          fontWeight: 600,
          color: '#FFFFFF',
          formatter: function(d) {
            return 'High'
             }
        },
        data: [],
      },
      {
        name: 'Very High',
        type: 'bar',
        color: "#910707",
        stack: 'total',
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0],
        },
        data: [],
        label: {
              show: true,
              fontSize: 12,
              fontFamily: 'Montserrat',
              fontWeight: 600,
              color: '#FFFFFF',
            formatter: function(d) {
              return 'Very High'
             }
          }
      }
    ]
  };

  ngOnInit(): void {
  }

  ngOnChanges(): void{

    const borderradiusAtStart = [5, 0, 0, 5]
    const borderradiusAtEnd = [0, 5, 5, 0]

    let series = this.option.series || [] as any;
    let riskRatingLevels = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'))['module_configurations']['risk_rating_levels']

    series[0].name = riskRatingLevels[0].ratingName
    series[0].color = riskRatingLevels[0].colorCode
    series[0].data = [this.riskWiseData[1]];

    series[1].name = riskRatingLevels[1].ratingName
    series[1].color = riskRatingLevels[1].colorCode
    series[1].data = [this.riskWiseData[2]];
        
    series[2].name = riskRatingLevels[2].ratingName
    series[2].color = riskRatingLevels[2].colorCode
    series[2].data = [this.riskWiseData[3]];

    series[3].name = riskRatingLevels[3].ratingName
    series[3].color = riskRatingLevels[3].colorCode
    series[3].data = [this.riskWiseData[4]];

    series[4].name = riskRatingLevels[4].ratingName
    series[4].color = riskRatingLevels[4].colorCode
    series[4].data = [this.riskWiseData[5]];


        this.total =this.riskWiseData[1]+this.riskWiseData[2]+this.riskWiseData[3]+this.riskWiseData[4]+this.riskWiseData[5]
        this.very_low= series[0].data/this.total*100+ '%'
        this.low= series[1].data/this.total*100+ '%'
        this.medium= series[2].data/this.total*100+ '%'
        this.high= series[3].data/this.total*100+ '%'
        this.very_high= series[4].data/this.total*100+ '%'

        let data = [];
        let startIndex;
        let endIndex;

        for(let i in this.option.series) {
          data.push(this.option.series[i].data[0])
          if(this.option.series[i].data[0]/this.total*100 < 20) {
            this.option.series[i].label.show = false;
          } else {
            this.option.series[i].label.show = true;
          }
        }

        for(let i in data) {
          if(data[i]>0){
            startIndex=i;
            break
          }
        }
        for (var i = data.length - 1; i >= 0; i--) {
          if(data[i]>0){
            endIndex=i;
            break
          }
        }
        
        if(startIndex && endIndex){
          this.option.series[startIndex].itemStyle.barBorderRadius=borderradiusAtStart;
          this.option.series[endIndex].itemStyle.barBorderRadius=borderradiusAtEnd;
        }
    this.option = Object.assign({}, this.option);
    
  }

}
