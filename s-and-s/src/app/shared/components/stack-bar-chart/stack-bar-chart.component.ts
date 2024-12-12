import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';

import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-stack-bar-chart',
  templateUrl: './stack-bar-chart.component.html',
  styleUrls: ['./stack-bar-chart.component.scss']
})
export class StackBarChartComponent implements OnInit {
  @Input() riskRatio = {};
  total: number;
  openChart = {
    tooltip: {
      trigger: 'item',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      },
      formatter: function (params) {
        return `<div class="text-center" style="color: #2196F3; font-weight: 550">${params.seriesName} </div>
          <div class="text-center">Very Low: ${params.data.rating_1}</div>
          <div class="text-center">Low: ${params.data.rating_2}</div>
          <div class="text-center">Medium: ${params.data.rating_3}</div>
          <div class="text-center">High: ${params.data.rating_4}</div>
          <div class="text-center">Very High: ${params.data.rating_5}</div>
          <div class="text-center"><b>Total: ${params.data.total}</b></div>
        `;
      },
    },
    legend: {
      show: false
    },
    grid: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    },
    xAxis: {
      type: 'value',
      show: false,
      max: 'dataMax'
    },
    yAxis: {
      type: 'category',
      show: false,
      "itemStyle": {
        normal: {
          barBorderRadius: [5, 5, 5, 5]
        }
      },
    },
    series: [


    ]
  };
  echartsInstance: any;

  ngOnInit(): void {
    this.setOption();
  }

  ngOnChanges() {
    this.calculatePercentage();
    this.setOption();
    this.pushInSeries();
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  keys(ob) {
    return Object.keys(ob);
  }
  calculatePercentage() {
    if (this.riskRatio) {
      var total = 0;
      this.keys(this.riskRatio).forEach(unit => {
        if (!this.riskRatio[unit]['total']) {
          this.riskRatio[unit]['total'] = 0;
        }
        this.riskRatio[unit]['total'] = this.riskRatio[unit]['rating_1'] + this.riskRatio[unit]['rating_2'] + this.riskRatio[unit]['rating_3'] + this.riskRatio[unit]['rating_4'] + this.riskRatio[unit]['rating_5'];
        total += this.riskRatio[unit]['total'];
      });
      this.keys(this.riskRatio).forEach(unit => {
        this.riskRatio[unit]['percentage'] = this.riskRatio[unit]['total'] / total * 100;
      });
    }
  }

  giveLevels(level) {
    if (level == 'rating_1') {
      return "Very Low";
    }
    else if (level == 'rating_2') {
      return "Low";
    }
    else if (level == 'rating_3') {
      return "Medium";
    }
    else if (level == 'rating_4') {
      return "High";
    }
    else if (level == 'rating_5') {
      return "Very High";
    }
  }
  pushInSeries() {
    if (this.riskRatio) {
      const s = [];
      const colorCoding = ['#002650','#006699', '#2196F3', '#ACE2FF'];
      const borderradiusAtStart = [5, 0, 0, 5]
      const noBorderradius = [0, 0, 0, 0]
      const borderradiusAtEnd = [0, 5, 5, 0]
      let arrayLenght = 0
      this.keys(this.riskRatio).forEach((unit, index) => {
        arrayLenght += 1
      }),

        this.keys(this.riskRatio).forEach((unit, index) => {
          let borderRadius = [];
          if (arrayLenght == 1) {
            borderRadius = [5, 5, 5, 5];
          } else {
            if (index === 0) {
              borderRadius = borderradiusAtStart;
            } else if (index != 0 && index != arrayLenght - 1) {
              borderRadius = noBorderradius;
            } else if (index == arrayLenght - 1) {
              borderRadius = borderradiusAtEnd;
            }
          }

          const series = {
            name: unit,
            type: 'bar',
            "itemStyle": {
              normal: {
                barBorderRadius: [...borderRadius]
              }
            },
            stack: 'total',
            label: {
              show: true,
              fontSize: 9,
              formatter: '{c}%'

            },
            emphasis: {
              focus: 'series'
            },
            data: [{
              "value": Math.round(10 * this.riskRatio[unit]['percentage']) / 10,
              "itemStyle": {
                color: colorCoding[index],

              },
              "rating_1": this.riskRatio[unit]['rating_1'],
              "rating_2": this.riskRatio[unit]['rating_2'],
              "rating_3": this.riskRatio[unit]['rating_3'],
              "rating_4": this.riskRatio[unit]['rating_4'],
              "rating_5": this.riskRatio[unit]['rating_5'],
              "total": this.riskRatio[unit]['total'],

            }],
            barWidth: "30px",
          };
          s.push(series);
        });
      this.openChart.series = s;
      this.openChart = { ...this.openChart }
    }
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  setOption() {


  }

}
