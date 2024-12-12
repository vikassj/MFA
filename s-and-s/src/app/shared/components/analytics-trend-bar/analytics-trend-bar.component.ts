import { Component, HostListener, Input, OnInit } from '@angular/core';
import { fontWeight } from 'html2canvas/dist/types/css/property-descriptors/font-weight';
import { SafetyAndSurveillanceCommonService } from '../../service/common.service';

@Component({
  selector: 'app-analytics-trend-bar',
  templateUrl: './analytics-trend-bar.component.html',
  styleUrls: ['./analytics-trend-bar.component.css']
})
export class AnalyticsTrendBarComponent implements OnInit {
  @Input() observationTrendData: any;
  @Input() selectedCategory: any;
  option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      }
    },
    title: {
      text: 'Category',
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
      itemSize: 10,
      iconStyle: {
        borderColor: "black",
        borderWidth: 1.1
      },
      feature: {
        saveAsImage: {}
      },
      top: '2px',
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
    grid: {
      bottom: 25,
      left:30,
      right: 25,
      top: 40,
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    xAxis: {
      type: 'category',
      data: []
    },
    series: [],
    dataZoom: []
  };
  noData: boolean;
  constructor(private safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    if(Object.keys(this.observationTrendData).length > 0 ){
      this.noData = true
    }else{
      this.noData = false
    }
    this.chartOptiondata();
    this.getScreenSize();
  }

  /**
   * formating the data populating on charts.
   */
  chartOptiondata() {
    this.option.series = [
      {
        name: 'HC',
        type: 'bar',
        color: '#006699',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [],
        barWidth: 15
      },
      {
        name: 'W@H',
        type: 'bar',
        stack: 'total',
        color: '#16C599',
        emphasis: {
          focus: 'series'
        },
        data: [],
        barWidth: 15
      },
      {
        name: 'PPE',
        type: 'bar',
        stack: 'total',
        color: '#969696',
        emphasis: {
          focus: 'series'
        },
        data: [],
        barWidth: 15
      },
      {
        name: 'CSC',
        type: 'bar',
        stack: 'total',
        color: '#EAB4B4',
        emphasis: {
          focus: 'series'
        },
        data: [],
        barWidth: 15
      },
      {
        name: 'VS',
        type: 'bar',
        stack: 'total',
        color: '#80D8FF',
        emphasis: {
          focus: 'series'
        },
        data: [],
        barWidth: 15
      },
      {
        name: 'HK',
        type: 'bar',
        stack: 'total',
        color: '#33A437',
        emphasis: {
          focus: 'series'
        },
        data: [],
        barWidth: 15
      },
      {
        name: 'L&H',
        type: 'bar',
        stack: 'total',
        color: '#FFBC00',
        emphasis: {
          focus: 'series'
        },
        data: [],
        barWidth: 15
      },
      {
        name: 'FO',
        type: 'bar',
        stack: 'total',
        color: '#1E3044',
        emphasis: {
          focus: 'series'
        },
        data: [],
        barWidth: 15
      }
    ]
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
    let hcData: any = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        hcData.push(this.observationTrendData[key]['HC']);
      }
    series[0].data = hcData;

    let whData: any = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        whData.push(this.observationTrendData[key]['W@H']);
      }
    series[1].data = whData;

    let ppeData: any = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        ppeData.push(this.observationTrendData[key]['PPE']);
      }
    series[2].data = ppeData;

    let cscData: any = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        cscData.push(this.observationTrendData[key]['CSC']);
      }
    series[3].data = cscData;

    let vsData: any = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        vsData.push(this.observationTrendData[key]['VS']);
      }
    series[4].data = vsData;

    let hkData: any = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        hkData.push(this.observationTrendData[key]['HK']);
      }
    series[5].data = hkData;

    let lhData: any = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        lhData.push(this.observationTrendData[key]['L&H']);
      }
    series[6].data = lhData;

    let foData: any = [];
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        foData.push(this.observationTrendData[key]['FO']);
      }
    series[7].data = foData;

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
    let array6 = series[5].data;
    array.push(Math.max(...array6.map(v1 => v1.value)))
    let array7 = series[6].data;
    array.push(Math.max(...array7.map(v1 => v1.value)))
    let array8 = series[7].data;
    array.push(Math.max(...array8.map(v1 => v1.value)))
    grids.left = (20 + (5 * JSON.stringify(Math.max(...array.map(v1 => v1))).length)) + 'px'
    if(this.selectedCategory){
      let seriesArray = [];
      this.option.series.forEach(obj =>{
        if(obj.name == this.selectedCategory){
          seriesArray.push(obj)
        }
      })
      this.option.series = seriesArray
    }
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
        allDataCount += ele
      })
    })
    if(allDataCount == 0 ){
      this.noData = false
    }else{
      this.noData = true
    }

    this.option.series.forEach(item =>{
      item.itemStyle = {
        color: this.safetyAndSurveillanceCommonService.getColorValue(
          item.name
        ),
      }
    })

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

  formatDate(inputDate) {
    const date = new Date(inputDate + ' 00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
      date
    );
    const year = String(date.getFullYear()).slice(-2);

    return `${day}-${month}-${year}`;
  }
}
