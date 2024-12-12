import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-analytics-line-chart',
  templateUrl: './analytics-line-chart.component.html',
  styleUrls: ['./analytics-line-chart.component.css']
})
export class AnalyticsLineChartComponent implements OnInit {
  @Input() observationByMonthDay:any
  option = {
    title: {
      text: 'Count of Observations by Month, Day and Status',
      textStyle: {
        color: '#006699',
        fontSize: '12px',
        fontFamily: "Montserrat",
        fontWeight: 800
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    toolbox: {
      padding:[0,5,5,5],
      itemSize: 13,
      iconStyle: {
          borderColor: "black",
          borderWidth: 1.1
        },
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: '6%',
      right: '5%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        name: 'Day',
        nameLocation: 'middle',
        nameTextStyle: {
          color: "#1E3044",
          fontStyle: "normal",
          fontFamily: "Montserrat",
          fontWeight: "normal",
          fontSize: 12,
        },
        axisLabel: {
          color: "#1E3044",
          fontStyle: "normal",
          fontFamily: "Montserrat",
          fontWeight: "normal",
          fontSize: 12,
        },
        nameGap: 25,
        data: [],

        splitLine: {
          show: false
       },
      }

    ],
    yAxis: [
      {
        type: 'value',
        name: 'Count of Observations',
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle: {
          color: "#1E3044",
          fontStyle: "normal",
          fontFamily: "Montserrat",
          fontWeight: "normal",
          fontSize: 12,
        },
        axisLabel: {
          formatter: '{value}',
          color: "#1E3044",
          fontStyle: "normal",
          fontFamily: "Montserrat",
          fontWeight: "normal",
          fontSize: 12,
        },
        splitLine: {
          show: false
       },
      }
    ],
    series: [
      {
        name: 'Open',
        type: 'line',
        color: '#F6515040',
        lineStyle: { color: '#F6515040' },
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: []
      },
      {
        name: 'Closed-Action Taken',
        color: '#33A43740',
        type: 'line',
        areaStyle: {},
        lineStyle: { color: '#33A43740' },
        emphasis: {
          focus: 'series'
        },
        data: []
      }
    ]
  };

  constructor() { }

  ngOnInit(): void {

  }

  ngOnChanges() {
    this.chartOptiondata();
  }

  /**
   * formating the data populating on charts.
   */
 chartOptiondata() {
      let xAxis = this.option.xAxis || [] as any;
      let xAxisData = [];
        for (const [key, value] of Object.entries(this.observationByMonthDay)) {
          xAxisData.push(key);
        }
        xAxis[0].data = xAxisData;

      let series = this.option.series || [] as any;
      let openData = [];
        for (const [key, value] of Object.entries(this.observationByMonthDay)) {
          if(!(key == 'total_observations' || key == 'open_observations')){
            openData.push(this.observationByMonthDay[key]['Open']);
          }
        }
        series[0].data = openData;

      let closedActionTakenData = [];
        for (const [key, value] of Object.entries(this.observationByMonthDay)) {
          if(!(key == 'total_observations' || key == 'open_observations')){
            closedActionTakenData.push(this.observationByMonthDay[key]['Closed-Action Taken']);
          }
        }
        series[1].data = closedActionTakenData;


      this.option = Object.assign({}, this.option);
  }
}
