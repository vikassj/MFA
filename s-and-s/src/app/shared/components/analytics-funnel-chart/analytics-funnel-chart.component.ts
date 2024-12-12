import { Component, HostListener, Input, OnInit } from '@angular/core';
import { number } from 'echarts';

@Component({
  selector: 'app-analytics-funnel-chart',
  templateUrl: './analytics-funnel-chart.component.html',
  styleUrls: ['./analytics-funnel-chart.component.css']
})
export class AnalyticsFunnelChartComponent implements OnInit {
  @Input() observationByRiskRating: any
  riskRatingLevels: any = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'))['module_configurations']['risk_rating_levels'];
  option = {
    title: {
      text: 'Overall Risk score',
      textStyle: {
        color: '#006699',
        fontSize: '12px',
        display: 'block',
        padding: '5px',
        innerWidth: '50%',
        fontFamily: "Montserrat",
        fontWeight: 600
      },
    },
    toolbox: {
      padding: [0, 0, 5, 0],
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
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '',
        type: 'pie',
        top: '18',
        radius: [0, '0%'],
        label: {
          position: 'inner',
          fontSize: 15,
          fontWeight: 'bold',
          color: 'black'
        },
        labelLine: {
          show: false
        },
        data: []
      },
      {
        name: '',
        type: 'pie',
        top: '18',
        radius: ['90%', '45%'],
        labelLine: {
          length: 40,
          show: false
        },
        label: {
          show: false
        },
        data: [],
        color: []
      }
    ],
    color: [
    ]
  };
  screensize: number;
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.chartOptiondata();
    this.getScreenSize()
  }

  /**
   * formating the data populating on charts.
   */
  chartOptiondata() {

    let series = this.option.series || [] as any;
    let seriesData1 = [];
    let count = 0;
    for (const [key, value] of Object.entries(this.observationByRiskRating)) {

      count += this.observationByRiskRating[key]
    }
    let totalCount = (5 * (this.observationByRiskRating[5] ? this.observationByRiskRating[5] : 0)) + (4 * (this.observationByRiskRating[4] ? this.observationByRiskRating[4] : 0)) + (3 * (this.observationByRiskRating[3] ? this.observationByRiskRating[3] : 0)) + (2 * (this.observationByRiskRating[2] ? this.observationByRiskRating[2] : 0)) + (1 * (this.observationByRiskRating[1] ? this.observationByRiskRating[1] : 0));
    let round_figure = Math.round((totalCount / count)*10)/10
    seriesData1.push({ value: count, name: Math.round(round_figure) ? Math.round(round_figure) : 0  });
    series[0].data = seriesData1;

    if(count == 0){
      series[1].color = [
        '#33A437'
      ]
      series[1].data = []
    } else {
      let seriesData = [];
      for(let i=1; i <= 5; i++){
        if (i == 5) {
          this.observationByRiskRating[i] ? seriesData.push({ value: this.observationByRiskRating[i], name: 'Very High' }) : seriesData.push({ value: 0, name: 'Very High' })
        } else if (i == 4) {
          this.observationByRiskRating[i] ? seriesData.push({ value: this.observationByRiskRating[i], name: 'High' }) : seriesData.push({ value: 0, name: 'High' })
        } else if (i == 3) {
          this.observationByRiskRating[i] ? seriesData.push({ value: this.observationByRiskRating[i], name: 'Medium' }) : seriesData.push({ value: 0, name: 'Medium' })
        } else if (i == 2) {
          this.observationByRiskRating[i] ? seriesData.push({ value: this.observationByRiskRating[i], name: 'Low' }) : seriesData.push({ value: 0, name: 'Low' })
        } else if (i == 1) {
          this.observationByRiskRating[i] ? seriesData.push({ value: this.observationByRiskRating[i], name: 'Very Low' }) : seriesData.push({ value: 0, name: 'Very Low' })
        }
      }
      series[1].data = seriesData;
      series[1].color = this.riskRatingLevels.map(item => item.colorCode)
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
      let title = this.option.title || [] as any;
      if(screenSize < 1300){
      title.textStyle.fontSize = '12px'
      }else{
        title.textStyle.fontSize = '12px'
      }
      this.option = Object.assign({}, this.option);
    }
  }
}
