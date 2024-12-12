import { Component, HostListener, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-analytics-status-bar',
  templateUrl: './analytics-status-bar.component.html',
  styleUrls: ['./analytics-status-bar.component.scss']
})
export class AnalyticsStatusBarComponent implements OnInit {
  @Input() observationTrendData: any;
  @Input() selectedObsStatus: any;
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
      text: 'Status',
      textStyle: {
        color: '#006699',
        fontSize: '14px',
        fontFamily: "Montserrat",
        fontWeight: 800
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
      },
      top: '3px',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    xAxis: {
      type: 'category',
      data: []
    },
    grid: {
      bottom: 25,
      left:30,
      right: 25,
      top: 40,
    },
    series: [

      {
        color: '#D90504',
        name: 'Open',
        type: 'bar',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
      {
        color: '#0EC91A',
        name: 'Closed',
        type: 'bar',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
    ],
    dataZoom: []
  };
  noData: boolean;


  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    let isObservationTrendData = changes['observationTrendData'] &&
      changes['observationTrendData'].currentValue != changes['observationTrendData'].previousValue;
    let isSelectedObsStatus = changes['selectedObsStatus'] &&
      changes['selectedObsStatus'].currentValue != changes['selectedObsStatus'].previousValue;
      if(isObservationTrendData || isSelectedObsStatus){
        if(Object.keys(this.observationTrendData).length > 0 ){
          this.noData = true
        }else{
          this.noData = false
        }
        this.chartOptiondata();
        this.getScreenSize();
      }
  }

  /**
   * formating the data populating on charts.
   */
  chartOptiondata() {
    let xAxis = this.option.xAxis || [] as any;
    let xAxisDta = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let stDate = new Date(key + ' 00:00:00')
    let startDate =stDate.getDate() + '-' + months[stDate.getMonth()] + '-' + stDate.getFullYear();
        xAxisDta.push(startDate);
      }
    xAxis.data = xAxisDta;

    let series = this.option.series || [] as any;
    let veryHighData: any = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        let count = 0;
        if(this.observationTrendData[key] && this.observationTrendData[key]['Open']){
          count += this.observationTrendData[key]['Open']
        }
        veryHighData.push({
          value: count,
          itemStyle: {}
        })
      }
    if(this.selectedObsStatus == 'Open' || this.selectedObsStatus == 'All'){
      series[0].data = veryHighData;
    }else{
      series[0].data = [];
    }

    let highData = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        let countHigh = 0;
        let close_False = 0;
        if(this.observationTrendData[key]['Closed-False Positive'] >= 0){
          close_False = this.observationTrendData[key]['Closed-False Positive']
        }
        let close_Action = 0;
        if(this.observationTrendData[key]['Closed-No Action'] >= 0){
          close_Action = this.observationTrendData[key]['Closed-No Action']
        }
        let close_Taken = 0;
        if(this.observationTrendData[key]['Closed-Action Taken'] >= 0){
          close_Taken = this.observationTrendData[key]['Closed-Action Taken']
        }
        countHigh += close_False + close_Action + close_Taken
        highData.push({
          value: countHigh,
          itemStyle: {}
        })
      }
    if(this.selectedObsStatus == 'Closed' || this.selectedObsStatus == 'All'){
      series[1].data = highData;
    }else{
      series[1].data = [];
    }
    let grids = this.option.grid || [] as any;
    let array = [];
    let array1 = series[0].data
    array.push(Math.max(...array1.map(v1 => v1.value)))
    let array2 = series[1].data
    array.push(Math.max(...array2.map(v1 => v1.value)))
    grids.left = (25 + (5 * JSON.stringify(Math.max(...array.map(v1 => v1))).length)) + 'px'
    if(this.option.xAxis.data.length > 25){
      let startIndex = 100 - (25 / this.option.xAxis.data.length) * 100
      this.option.dataZoom = [
        {
          type: 'inside',
          show: true,
          zoomOnMouseWheel: false,
          moveOnMouseWheel: true,
          xAxisIndex: [0],
          start: startIndex,
          end: 100
        },
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: startIndex,
          end: 100,
          height: 15,
          fillerColor: "rgb(0, 0, 153, 0.4)",
          borderColor: "rgb(0, 0, 0, 0.2)",
        }
      ]
    }else{
      this.option.dataZoom = []
    }
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
    let xAxis = this.option.xAxis || [] as any;
    let yAxis = this.option.yAxis || [] as any;
    if(screenSize < 1300){
    xAxis.axisLabel.fontSize = 10.5
    yAxis.axisLabel.fontSize = 10.5
  }else{
      xAxis.axisLabel.fontSize = 12
      yAxis.axisLabel.fontSize = 12
    }
    this.option = Object.assign({}, this.option);
    }

}
