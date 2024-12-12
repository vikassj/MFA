import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-comparison-bar-chart',
  templateUrl: './comparison-bar-chart.component.html',
  styleUrls: ['./comparison-bar-chart.component.scss']
})
export class ComparisonBarChartComponent implements OnInit {
  constructor() { }
  
  option = {
    tooltip: {
      show: false,
    },
    legend: {
      show: false,
    },
    grid: {
      top: '0%',
      left: '2%',
      right: '5%',
      bottom: '0%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      showGrid: false,
      splitLine: false,
      showAxis: false,
      show: false,
      tooltip: false
    },
    yAxis: {
      type: 'category',
      data: ['unit 1  ', 'unit 2  ', 'unit 3 ', 'unit 4 ', 'unit 5 '],
      color: 'white',
      showGrid: false,
      splitLine: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }, 
      tooltip: false
    },
    series: [
      {
        name: 'Direct',
        type: 'bar',
        stack: 'total',
        color: "#FFBC00",
        label: {
          show: true
        },
        data: [320, 302, 301, 334, 390]
      },
      {
        name: 'Mail Ad',
        type: 'bar',
        color: "#DC9222",
        stack: 'total',
        label: {
          show: true
        },
        data: [120, 132, 101, 134, 90]
      },
      {
        name: 'Affiliate Ad',
        type: 'bar',
        stack: 'total',
        color: "#FF5E28",
        label: {
          show: true
        },
        data: [220, 182, 191, 234, 290]
      },
      {
        name: 'Video Ad',
        type: 'bar',
        color: "#D90504",
        stack: 'total',
        label: {
          show: true
        },
        data: [150, 212, 201, 154, 190]
      },
      {
        name: 'Search Engine',
        type: 'bar',
        color: "#910707",
        stack: 'total',
        data: [150, 233, 342, 234, 389],
        label: {
              show: true
          }
      },
       {
        name: '',
        type: 'bar',
        color: 'white' ,
        stack: 'total',
       label: {
              normal: {
                  show: true,
                  fontWeight: '800',
                  position: '',
                  formatter: (params) => {
                      let total = 0;
                      this.option.series.forEach(serie => {
                         total += serie.data[params.dataIndex];
                      })
                      return "             Total - " + total;
                  }
              }
          },
        data: [400,400,400,400,400,400,400]
      },
    ]
  };
 

  ngOnInit(): void {
  }

}
