import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { number } from 'echarts';

@Component({
  selector: 'app-critical-observation-bar',
  templateUrl: './critical-observation-bar.component.html',
  styleUrls: ['./critical-observation-bar.component.css']
})
export class CriticalObservationBarComponent implements OnInit {
  @Input() criticalObsData: object;
  @Output() criticalObs = new EventEmitter();
  @Output() sumOfCritical = new EventEmitter();
  noData: boolean;
  option = {
    tooltip: {
      trigger: 'axis',
      confine: true,
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
      top: '0',
      textStyle: {
        fontWeight: 800,
        fontSize: '10',
      },
      selectedMode: 'inverse'
    },
    grid: {
      bottom: '40px',
      left:'7%',
      right: '5%',
      top: '30px',
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: {
        show: false
      },
      axisLabel: {
        fontSize: 10.5
      }
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        rotate: 44,
        fontSize: 10.5
      },
    },
    series: [
      {
        name: 'Critical',
        type: 'bar',
        stack: 'total',
        color: '#D90504',
        emphasis: {
          focus: 'series'
        },
        data: [],
        barWidth: 15
      },
      {
        name: 'Non-Critical',
        type: 'bar',
        stack: 'total',
        color: '#FFD358',
        emphasis: {
          focus: 'series'
        },
        data: [],
        barWidth: 15
      },

    ]
  };
  screensize: number;
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.chartOptiondata();
    this.getScreenSize();
  }

  /**
   * formating the data populating on charts.
   */
  chartOptiondata() {
    let xAxis = this.option.xAxis || [] as any;
    let xAxisDta = [];
      for (const [key, value] of Object.entries(this.criticalObsData)) {
        Number(key.split(':')[0]) <= 12 ?  Number(key.split(':')[0]) == 12 ? xAxisDta.push(key.split(':')[0] + ' PM') : xAxisDta.push(key.split(':')[0] + ' AM') : xAxisDta.push((Number(key.split(':')[0]) - 12) + ' PM');
      }
    xAxis.data = xAxisDta;

    let series = this.option.series || [] as any;
    let veryHighData: any = [];
    for (const [key, value] of Object.entries(this.criticalObsData)) {
        let count = 0;
        count += this.criticalObsData[key]['5'] + this.criticalObsData[key]['4'];
        veryHighData.push(count);
      }
    series[0].data = veryHighData;

    let lowData: any = [];
    for (const [key, value] of Object.entries(this.criticalObsData)) {
        let lowDataCount = 0;
        lowDataCount += this.criticalObsData[key]['3'] + this.criticalObsData[key]['2'] + this.criticalObsData[key]['1'];
        lowData.push(lowDataCount);
      }

    series[1].data = lowData;

    let index = series[0].data.indexOf(Math.max.apply(null, series[0].data));

    let countOfSelectedTime = series[0].data[index];
      let totalCount = 0;
      for(let i = 0; i < series[0].data.length; i++){
        totalCount += series[0].data[i];
      }
      let startTime = xAxis.data[index]
      let endTime = xAxis.data.length == index +1 ? xAxis.data[0] : xAxis.data[index + 1]
      let obj ={
        startTime,
        endTime,
        countOfSelectedTime,
        totalCount
      }
      this.criticalObs.emit(obj)

      let sumOfCritical = [];
      veryHighData.forEach((data, index) =>{
        if(data == countOfSelectedTime){
          let startTime = xAxis.data[index]
          let endTime = xAxis.data.length == index +1 ? xAxis.data[0] : xAxis.data[index + 1]
          let obj ={
            startTime,
            endTime,
            countOfSelectedTime,
            totalCount
          }
          sumOfCritical.push(obj)
        }
      })
      this.sumOfCritical.emit(sumOfCritical)
      let allDataCount = 0;
    this.option.series.forEach(data =>{
      data.data.forEach(ele =>{
        allDataCount += ele
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
