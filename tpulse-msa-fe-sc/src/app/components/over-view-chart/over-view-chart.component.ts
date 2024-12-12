import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-over-view-chart',
  templateUrl: './over-view-chart.component.html',
  styleUrls: ['./over-view-chart.component.scss']
})
export class OverViewChartComponent implements OnInit,OnChanges {
  @Input() graphData:any
  overViewChart: any = {
    tooltip: {
      // trigger: 'axis',
      // axisPointer: {
      //   type: 'shadow'
      // }
    },
    grid: {
      top: 0,
      bottom:0,
      left:0,
      right:30,
    },
    xAxis: {
      type: 'value',
      position: 'top',
      axisLabel: { show: false },
      splitLine: { show: false },
      // splitLine: {
      //   lineStyle: {
      //     type: 'dashed'
      //   }
      // }
      data: ["Planned","Actual"]

    },
    yAxis: {
      type: 'category',
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      data:[]
    },
    series: [
      {
        type: 'bar',
        stack: 'Total',
        barCategoryGap: '0%',
        label: {
          show: true,
          formatter: '{b}'
        },
        data: [
          { value:0, itemStyle:{color:'#33A437'}},
          { value:0,itemStyle:{color: '#707070'} },
        ]
      },
      // {
      //   type: 'bar',
      //   stack: 'Total',
      //   barCategoryGap: '0%',
      //   label: {
      //     show: true,
      //     formatter: '{b}'
      //   },
      //   data: [
      //     { value:25, itemStyle:{color:'#33A437'}},
      //     { value:40,itemStyle:{color: '#707070'} },
      //   ]
      // }
    ]
  };
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('this.graphData',this.graphData)
    this.overViewChart.series[0].data[1].value = this.graphData?.planned_percentage_completed
    this.overViewChart.series[0].data[0].value = this.graphData?.actual_percentage_completed
  }
  ngOnInit(): void {
  }




}
