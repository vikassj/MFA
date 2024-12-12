import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-analytics-risk-rating-chart',
  templateUrl: './analytics-risk-rating-chart.component.html',
  styleUrls: ['./analytics-risk-rating-chart.component.css']
})
export class AnalyticsRiskRatingChartComponent implements OnInit {
  @Input() observationsByUnitAndRiskRating:any;
  option = {
    title: {
      text: 'Count of Observations by Unit and Risk Rating',
      textStyle: {
        color: '#006699',
        fontSize: '12px',
        fontFamily: "Montserrat",
        fontWeight: 800
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
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      }
    },
    legend: {
      itemGap: 6,
      itemWidth: 12,
      itemHeight: 12,
      left: '0%',
      top: '20',
      width: '40%',
      textStyle: {
        color: "#1E3044",
        fontFamily: "Montserrat",
        fontWeight: "normal",
        fontSize: '10',
      },
      selectedMode: 'inverse'
    },
    grid: {
      left: '1%',
      right: '0%',
      bottom: '0%',
      top:'20%',
      show: false,
      containLabel: true
    },
    xAxis: {
      show: false,
      type: "value",
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
      }
    },
    yAxis: {
      type: '',
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
      data: [],
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        color: '#910707',
        name: 'Very High',
        type: 'bar',
        barMaxWidth: 20,
        barCategoryGap: "0%",
        stack: 'total',
        label: {
          show: false
        },
        emphasis: {
          focus: 'series'
        },
        data: []
      },
      {
        color: '#D90504',
        name: 'High',
        type: 'bar',

        stack: 'total',
        barMaxWidth: 20,
        barCategoryGap: "0%",
        label: {
          show: false
        },
        emphasis: {
          focus: 'series'
        },
        data: []
      },
      {
        color: '#FF5E28',
        name: 'Medium',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 20,
        barCategoryGap: "0%",
        label: {
          show: false
        },
        emphasis: {
          focus: 'series'
        },
        data: []
      },
      {
        color: '#DC9222',
        name: 'Low',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 20,
        barCategoryGap: "0%",
        label: {
          show: false
        },
        emphasis: {
          focus: 'series'
        },
        data: []
      },
      {
        color: '#FFBC00',
        name: 'Very Low',
        fontSize: '11px',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 20,
        barCategoryGap: "0%",
        label: {
          show: false
        },
        emphasis: {
          focus: 'series'
        },
        data: []
      },
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
      let yAxis = this.option.yAxis || [] as any;
      let yAxisDta = [];
        for (const [key, value] of Object.entries(this.observationsByUnitAndRiskRating)) {
          if(!(key == 'total_observations' || key == 'open_observations')){
            yAxisDta.push(key);
          }
        }
        yAxis.data = yAxisDta;

      let series = this.option.series || [] as any;
      let veryHighData = [];
        for (const [key, value] of Object.entries(this.observationsByUnitAndRiskRating)) {
          if(!(key == 'total_observations' || key == 'open_observations')){
            veryHighData.push(this.observationsByUnitAndRiskRating[key]['5']);
          }
        }
        series[0].data = veryHighData;

      let highData = [];
        for (const [key, value] of Object.entries(this.observationsByUnitAndRiskRating)) {
          if(!(key == 'total_observations' || key == 'open_observations')){
            highData.push(this.observationsByUnitAndRiskRating[key]['4']);
          }
        }
        series[1].data = highData;

      let mediumData = [];
        for (const [key, value] of Object.entries(this.observationsByUnitAndRiskRating)) {
          if(!(key == 'total_observations' || key == 'open_observations')){
            mediumData.push(this.observationsByUnitAndRiskRating[key]['3']);
          }
        }
        series[2].data = mediumData;

      let lowData = [];
        for (const [key, value] of Object.entries(this.observationsByUnitAndRiskRating)) {
          if(!(key == 'total_observations' || key == 'open_observations')){
            lowData.push(this.observationsByUnitAndRiskRating[key]['2']);
          }
        }
        series[3].data = lowData;

      let veryLowData = [];
        for (const [key, value] of Object.entries(this.observationsByUnitAndRiskRating)) {
          if(!(key == 'total_observations' || key == 'open_observations')){
            veryLowData.push(this.observationsByUnitAndRiskRating[key]['1']);
          }
        }
        series[4].data = veryLowData;
        let grids = this.option.grid || [] as any;
    let array = [];
    let array1 = series[0].data;
    array.push(Math.max(...array1.map(v1 => v1.value)))
    let array2 = series[1].data;
    array.push(Math.max(...array2.map(v1 => v1.value)))
    let array3 = series[2].data;
    array.push(Math.max(...array3.map(v1 => v1.value)))
    let array4 = series[3].data;
    array.push(Math.max(...array4.map(v1 => v1.value)))
    let array5 = series[4].data;
    array.push(Math.max(...array5.map(v1 => v1.value)))
    grids.left = (25 + (5 * JSON.stringify(Math.max(...array.map(v1 => v1))).length)) + 'px'
      this.option = Object.assign({}, this.option);
  }
}
