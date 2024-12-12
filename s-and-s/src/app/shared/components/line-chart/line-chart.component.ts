import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit, OnChanges {
  @Input() xData = [];
  @Input() yData = [];
  @Input() xLabel = '';
  @Input() yLabel = '';

  openChart: EChartsOption = {};
  constructor() { }

  ngOnInit(): void {
    this.setOption();
  }

  ngOnChanges() {
    this.setOption();
  }

  /**
   * formating the data populating on charts.
   */
  setOption() {
    // this.xData = this.xData.map(date => this.formatDate(date))
    this.openChart = {
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let name = params[0].name
          var r = /\d+/g;
          let name1 = name.match(r)
          let tooltipName = ''
          if (name1) {
            let date = params[0].name.slice(8, 10)
            let month = params[0].name.slice(5, 7)
            let monthName = '';
            if (month == '01') {
              monthName = 'JAN';
            } else if (month == '02') {
              monthName = 'FEB';
            } else if (month == '03') {
              monthName = 'MAR';
            } else if (month == '04') {
              monthName = 'APR';
            } else if (month == '05') {
              monthName = 'MAY';
            } else if (month == '06') {
              monthName = 'JUN';
            } else if (month == '07') {
              monthName = 'JUL';
            } else if (month == '08') {
              monthName = 'AUG';
            } else if (month == '09') {
              monthName = 'SEP';
            } else if (month == '10') {
              monthName = 'OCT';
            } else if (month == '11') {
              monthName = 'NOV';
            } else if (month == '12') {
              monthName = 'DEC';
            }
            tooltipName = date + " " + monthName
          } else {
            tooltipName = params[0].name
          }
          return `<div class="border-radius"><div class="text-center">${params[0].name}</div>
          <div>Observation: ${params[0].value}</div></div>`;
        },
      },
      grid: {
        left: '0%',
        right: '7%',
        bottom: '5%',
        top: '15%',
        containLabel: true
      },
      dataZoom: [{
        show: false
      }, {
        type: 'inside'
      }],
      xAxis: {
        name: this.xLabel,
        type: 'category',
        data: this.xData,
        axisTick: {
          show: false
        }

      },
      yAxis: {
        name: this.yLabel,
        type: 'value',
        minInterval: 1
      },
      series: [
        {
          data: this.yData,
          type: 'line'
        }
      ]
    };
  }

  formatDate(inputDate) {
    const date = new Date(inputDate + ' 00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    const year = String(date.getFullYear()).slice(-2);
    return moment(inputDate).format('DD-MMM-YYYY');
    // return `${day}-${month}-${year}`;
}

}
