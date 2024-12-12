import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-analytics-bar-chart',
  templateUrl: './analytics-bar-chart.component.html',
  styleUrls: ['./analytics-bar-chart.component.css']
})
export class AnalyticsBarChartComponent implements OnInit {
  @Input() observationByTimeAndRiskRating: any;
  @Output() backToAddObservationData = new EventEmitter();
  highestTime: string = '';
  selectedIndex = -1;
  emphasisStyle = {
    itemStyle: {
      shadowBlur: 10,
      shadowColor: 'rgba(0,0,0,0.3)'
    }

  };
  option = {
    title: {
      text: 'Risk Trend',
      textStyle: {
        color: '#006699',
        fontSize: '12px',
        fontFamily: "Montserrat",
        fontWeight: 600
      },
      show: false,
    },
    toolbox: {
      padding: [0, 5, 5, 5],
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
      confine: true,
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      }
    },
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: 5,
        minInterval: 1,
        axisLabel: {
          fontSize: 10.5
        }
      },
      {
        type: 'value',
        show: false,
        axisLabel: {
          fontSize: 10.5
        }
      }
    ],
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        fontSize: 10.5
      }
    },
    grid: {
      bottom: 28,
      left:30,
      right: 25,
      top: 25,
    },
    series: [

      {
        color: '#910707',
        name: 'Very High',
        type: 'bar',
        yAxisIndex: 1,
        stack: 'one',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
      {
        color: '#D90504',
        name: 'High',
        type: 'bar',
        yAxisIndex: 1,
        stack: 'one',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
      {
        color: '#FF5E28',
        name: 'Medium',
        type: 'bar',
        yAxisIndex: 1,
        stack: 'one',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
      {
        color: '#DC9222',
        name: 'Low',
        yAxisIndex: 1,
        type: 'bar',
        stack: 'one',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
      {
        color: '#FFBC00',
        name: 'Very Low',
        type: 'bar',
        yAxisIndex: 1,
        stack: 'one',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
      {
        name: 'Overall',
        type: 'line',
        symbol: 'none',
        yAxisIndex: 0,
        color:'#F65150',
        lineStyle: {
          width: 1
         },
        data: []
      }
    ]
  };
  noData: boolean;
  screensize: number;

  riskRatingLevels: any = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'))['module_configurations']['risk_rating_levels'];

  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    let isObservationTrendData = changes['observationByTimeAndRiskRating'] &&
      changes['observationByTimeAndRiskRating'].currentValue != changes['observationByTimeAndRiskRating'].previousValue;
      if(isObservationTrendData){
        if(Object.keys(this.observationByTimeAndRiskRating).length > 0 ){
          this.noData = true
        }else{
          this.noData = false
        }
        this.chartOptiondata();
        this.getScreenSize()
      }
  }

  /**
   * formating the data populating on charts.
   */
  chartOptiondata() {
    let xAxis = this.option.xAxis || [] as any;
    let xAxisDta = [];
      for (const [key, value] of Object.entries(this.observationByTimeAndRiskRating)) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let str = key
        if(str.length > 13){
          let stDate = moment(str.split("'")[1]).format('DD-MMM-YYYY')
              // let startDate =stDate.getDate() + '-' + months[stDate.getMonth()]  + '-' + stDate.getFullYear();
          let enDate = moment(str.split("'")[3]).format('DD-MMM-YYYY')
              // let endDate =enDate.getDate() + '-' + months[enDate.getMonth()] + '-' + enDate.getFullYear();
              let date = stDate + ' - ' + enDate
              xAxisDta.push(date);
            }else{
              let stDate = moment(str).format('DD-MMM-YYYY')
              // let startDate =stDate.getDate() + '-' + months[stDate.getMonth()] + '-' + stDate.getFullYear();
              xAxisDta.push(stDate);
        }
      }
    xAxis.data = xAxisDta;

    let series = this.option.series || [] as any;
    let veryHighData: any = [];
      for (const [key, value] of Object.entries(this.observationByTimeAndRiskRating)) {
        let count = 0;
        if(this.observationByTimeAndRiskRating[key] && this.observationByTimeAndRiskRating[key]['5']){
          count += this.observationByTimeAndRiskRating[key]['5']
        }
        veryHighData.push({
          value: count,
          itemStyle: {}
        })
      }

    series[0].name = this.riskRatingLevels[4].ratingName
    series[0].color = this.riskRatingLevels[4].colorCode
    series[0].data = veryHighData;

    let highData = [];
      for (const [key, value] of Object.entries(this.observationByTimeAndRiskRating)) {
        let countHigh = 0;
        if(this.observationByTimeAndRiskRating[key] && this.observationByTimeAndRiskRating[key]['4']){
          countHigh += this.observationByTimeAndRiskRating[key]['4']
        }
        highData.push({
          value: countHigh,
          itemStyle: {}
        })
      }

    series[1].name = this.riskRatingLevels[3].ratingName
    series[1].color = this.riskRatingLevels[3].colorCode
    series[1].data = highData;


    let index = veryHighData.indexOf(Math.max(...veryHighData));
    this.highestTime = index < 0 ? '' : xAxisDta[index].toString();


    let madiumData = [];
      for (const [key, value] of Object.entries(this.observationByTimeAndRiskRating)) {
        let countM = 0;
        if(this.observationByTimeAndRiskRating[key] && this.observationByTimeAndRiskRating[key]['3']){
          countM += this.observationByTimeAndRiskRating[key]['3']
        }
        madiumData.push({
          value: countM,
          itemStyle: {}
        })
      }
    series[2].name = this.riskRatingLevels[2].ratingName
    series[2].color = this.riskRatingLevels[2].colorCode
    series[2].data = madiumData;

    let lowData = [];
      for (const [key, value] of Object.entries(this.observationByTimeAndRiskRating)) {
        let countL = 0;
        if(this.observationByTimeAndRiskRating[key] && this.observationByTimeAndRiskRating[key]['2']){
          countL += this.observationByTimeAndRiskRating[key]['2']
        }
        lowData.push({
          value: countL,
          itemStyle: {}
        })
      }
    series[3].name = this.riskRatingLevels[1].ratingName
    series[3].color = this.riskRatingLevels[1].colorCode
    series[3].data = lowData;

    let veryLowData = [];
      for (const [key, value] of Object.entries(this.observationByTimeAndRiskRating)) {
        let countVl = 0;
        if(this.observationByTimeAndRiskRating[key] && this.observationByTimeAndRiskRating[key]['1']){
          countVl += this.observationByTimeAndRiskRating[key]['1']
        }
        veryLowData.push({
          value: countVl,
          itemStyle: {}
        })
      }
    series[4].name = this.riskRatingLevels[0].ratingName
    series[4].color = this.riskRatingLevels[0].colorCode
    series[4].data = veryLowData;


    let allData = [];
      for (const [key, value] of Object.entries(this.observationByTimeAndRiskRating)) {
        let totalCount = 0;
        let count1 = 0;
        if(this.observationByTimeAndRiskRating[key] && (this.observationByTimeAndRiskRating[key]['1'])){
          count1 = this.observationByTimeAndRiskRating[key]['1']
        }
        let count2 = 0;
        if(this.observationByTimeAndRiskRating[key] && (this.observationByTimeAndRiskRating[key]['2'])){
          count2 = this.observationByTimeAndRiskRating[key]['2']
        }
        let count3 = 0;
        if(this.observationByTimeAndRiskRating[key] && (this.observationByTimeAndRiskRating[key]['3'])){
          count3 = this.observationByTimeAndRiskRating[key]['3']
        }
        let count4 = 0;
        if(this.observationByTimeAndRiskRating[key] && (this.observationByTimeAndRiskRating[key]['4'])){
          count4 = this.observationByTimeAndRiskRating[key]['4']
        }
        let count5 = 0;
        if(this.observationByTimeAndRiskRating[key] && (this.observationByTimeAndRiskRating[key]['5'])){
          count5 = this.observationByTimeAndRiskRating[key]['5']
        }
        totalCount += count1 + count2 + count3 + count4 + count5
        let overCount = (5 * (this.observationByTimeAndRiskRating[key][5] ? this.observationByTimeAndRiskRating[key][5] : 0)) + (4 * (this.observationByTimeAndRiskRating[key][4] ? this.observationByTimeAndRiskRating[key][4] : 0)) + (3 * (this.observationByTimeAndRiskRating[key][3] ? this.observationByTimeAndRiskRating[key][3] : 0)) + (2 * (this.observationByTimeAndRiskRating[key][2] ? this.observationByTimeAndRiskRating[key][2] : 0)) + (1 * (this.observationByTimeAndRiskRating[key][1] ? this.observationByTimeAndRiskRating[key][1] : 0));
        let round_figure = Math.round((overCount / totalCount)*10)/10
        allData.push({
          value: Math.round(round_figure) ? Math.round(round_figure) : 0,
          itemStyle: {}
        })
      }
    series[5].data = allData;

    let allArrayData = allData
    let grids = this.option.grid || [] as any;
    grids.left = (25 + (5 * JSON.stringify(Math.max(...allArrayData.map(o => o.value))).length)) + 'px'

    let allDataCount = 0;
    this.option.series.forEach(data =>{
      data.data.forEach(ele =>{
        allDataCount += ele.value
      })
    })
    if(allDataCount == 0 ){
      this.noData = false
    }else{
      this.noData = true
    }
    this.option = Object.assign({}, this.option);
  }

  /**
   * get screen size on window resize event.
   */
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    let screenSize = window.innerWidth;
    if(this.screensize != screenSize){
      this.screensize = screenSize
    let xAxis = this.option.xAxis || [] as any;
    let yAxis = this.option.yAxis || [] as any;
    let grid = this.option.grid || [] as any;
    if(screenSize < 1300){
    xAxis.axisLabel.fontSize = 10.5
    yAxis[0].axisLabel.fontSize = 8
    yAxis[1].axisLabel.fontSize = 8
    grid.top = 25
  }else{
    xAxis.axisLabel.fontSize = 12
    yAxis[0].axisLabel.fontSize = 12
    yAxis[1].axisLabel.fontSize = 12
    grid.top = 35
    }
    this.option = Object.assign({}, this.option);
  }
    }


}
