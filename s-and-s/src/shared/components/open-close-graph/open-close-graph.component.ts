import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-open-close-graph',
  templateUrl: './open-close-graph.component.html',
  styleUrls: ['./open-close-graph.component.css']
})
export class OpenCloseGraphComponent implements OnInit {

  @Input() open:any;
  @Input() close:any;
  dataIsThere: boolean = false;

  constructor() { }

  option = {
    title: {
      show: true
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      },
      formatter: function (params) {
        var seriesName = ""
        if(params.seriesName == "open") {
          seriesName = "Open"
        } else if(params.seriesName == "close") {
          seriesName = "Closed"
        }
        return `<div class="text-center" style="color: #2196F3; font-weight: 500">${seriesName} </div>
          <div class="text-center">${params.data}</div>
        `;
      },
    },
    legend: {
      show: false,
      padding:0,
      itemHeight:0
    },
    grid: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    },
    xAxis: {
      type: 'value',
      max: 'dataMax',
      showGrid: false,
      splitLine: false,
      showAxis: false,
      show: false,
      tooltip: false
    },
    yAxis: {
      type: 'category',
      color: 'white',
      showGrid: false,
      splitLine: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }, 
      tooltip: false,
      show :false
     
    },
    series: [
      {
        name: 'open',
        type: 'bar',
        stack: 'total',
        color: "#F65251",
        label: {
          show: false,
          formatter: function(d) {
            return 'open'
             }
        },
       barWidth: 25,
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0],
          borderType: 'solid'
        },
        data: []
      },
      {
        name: 'close',
        type: 'bar',
        color: "#44AB48",
        stack: 'total',
        label: {
          show: false,
          formatter: function(d) {
            return 'close'
             }
        },
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0],
          borderType: 'solid',
        },
        data: []
      }
    ]
  };

  ngOnInit(): void {
  }

  ngOnChanges(): void{

    const borderradiusAtStart = [5, 0, 0, 5]
    const borderradiusAtEnd = [0, 5, 5, 0]
    const borderAll=[5,5,5,5]
    
    let series = this.option.series || [] as any;

        series[0].data = [this.open];
        series[1].data = [this.close];

    if(this.open >0 || this.close >0){
      this.dataIsThere =true
    }

    if(this.open >0 && this.close >0){
      this.option.series[0].itemStyle.barBorderRadius=borderradiusAtStart;
      this.option.series[1].itemStyle.barBorderRadius=borderradiusAtEnd;
    } else if(this.open >0 && this.close == 0){
      this.option.series[0].itemStyle.barBorderRadius=borderAll;
    } else if(this.open==0 && this.close > 0){
      this.option.series[1].itemStyle.barBorderRadius=borderAll;
    }

    this.option = Object.assign({}, this.option);
    
  }

}
