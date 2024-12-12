import { Component, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-analytics-rating-bar',
  templateUrl: './analytics-rating-bar.component.html',
  styleUrls: ['./analytics-rating-bar.component.scss']
})
export class AnalyticsRatingBarComponent implements OnInit {
  @Input() observationTrendData: any;
  riskRatingLevels: any = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'))['module_configurations']['risk_rating_levels'];
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
      text: 'Rating',
      textStyle: {
        color: '#006699',
        fontSize: '14px',
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
        color: '#910707',
        name: 'Very High',
        type: 'bar',
        stack: 'one',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
      {
        color: '#D90504',
        name: 'High',
        type: 'bar',
        stack: 'one',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
      {
        color: '#FF5E28',
        name: 'Medium',
        type: 'bar',
        stack: 'one',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      },
      {
        color: '#DC9222',
        name: 'Low',
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
        stack: 'one',
        emphasis: this.emphasisStyle,
        data: [],
        barWidth: 15
      }
    ],
    dataZoom: []
  };
  noData: boolean;
  screensize: number;


  constructor() { }

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
        if(this.observationTrendData[key] && this.observationTrendData[key]['5']){
          count += this.observationTrendData[key]['5']
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
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        let countHigh = 0;
        if(this.observationTrendData[key] && this.observationTrendData[key]['4']){
          countHigh += this.observationTrendData[key]['4']
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
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        let countM = 0;
        if(this.observationTrendData[key] && this.observationTrendData[key]['3']){
          countM += this.observationTrendData[key]['3']
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
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        let countL = 0;
        if(this.observationTrendData[key] && this.observationTrendData[key]['2']){
          countL += this.observationTrendData[key]['2']
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
      for (const [key, value] of Object.entries(this.observationTrendData)) {
        let countVl = 0;
        if(this.observationTrendData[key] && this.observationTrendData[key]['1']){
          countVl += this.observationTrendData[key]['1']
        }
        veryLowData.push({
          value: countVl,
          itemStyle: {}
        })
      }
    series[4].name = this.riskRatingLevels[0].ratingName
    series[4].color = this.riskRatingLevels[0].colorCode
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


    // this.option.xAxis.data = this.option.xAxis.data.map((xAxis) =>
    //     this.formatDate(xAxis.date)
    //   );

    this.option = Object.assign({}, this.option);
    }
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
