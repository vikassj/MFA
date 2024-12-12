import { Component, HostListener, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-analytics-mode-bar',
  templateUrl: './analytics-mode-bar.component.html',
  styleUrls: ['./analytics-mode-bar.component.scss']
})
export class AnalyticsModeBarComponent implements OnInit {
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
      text: 'Mode',
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
      }
    },
    legend: {
      itemWidth: 10,
      itemHeight: 10,
      width: '50%',
       right: "25px",
      top: "2px",
      textStyle: {
        fontSize: 10,
        fontWeight: 800
      }
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
      axisLabel: {
        fontSize: 10.5
      }
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        fontSize: 10.5
      }
    },
    grid: {
      bottom: 25,
      left:30,
      right: 25,
      top: 40,
    },
    series: [

      {
        color: '#009999',
        name: 'Manual',
        type: 'bar',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
      {
        color: '#006699',
        name: 'Automated',
        type: 'bar',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
    ],
    dataZoom: []
  };
  noData: boolean;
  screensize: number;


  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    let isObservationTrendData = changes['observationTrendData'] &&
      changes['observationTrendData'].currentValue != changes['observationTrendData'].previousValue;
      if(isObservationTrendData){
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
        xAxisDta.push(key);
      }
    xAxis.data = ['manual', 'automated'];

    let series = this.option.series || [] as any;
    let veryHighData: any = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        let count = 0;
        if(this.observationTrendData[key] == 'manual'){
          count += this.observationTrendData[key]
        }
        veryHighData.push({
          value: count,
          itemStyle: {}
        })
      }
      series[0].data = veryHighData;

    let highData = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        let countHigh = 0;
        if(this.observationTrendData[key] == 'automated'){
          countHigh += this.observationTrendData[key]
        }
        highData.push({
          value: countHigh,
          itemStyle: {}
        })
      }
      series[1].data = highData;
      let grids = this.option.grid || [] as any;
    let array = [];
    let array1 = series[0].data
    array.push(Math.max(...array1.map(v1 => v1.value)))
    let array2 = series[2].data
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
    if(this.screensize != screenSize){
      this.screensize = screenSize
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


}
