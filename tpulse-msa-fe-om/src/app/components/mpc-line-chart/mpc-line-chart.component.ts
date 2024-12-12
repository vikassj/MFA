import { Component, OnInit, Input } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-mpc-line-chart',
  templateUrl: './mpc-line-chart.component.html',
  styleUrls: ['./mpc-line-chart.component.scss']
})
export class MpcLineChartComponent implements OnInit {

  @Input() locationData: any = '';
  @Input() lineData: any;
  @Input() thresholdData: any;
  @Input() noDataMsg: any;
  @Input() fixSDate: any;
  @Input() fixEDate: any;
  @Input() overallMpcData: any;
  @Input() fdate: any;
  @Input() fedate: any;
  lineOptions: EChartsOption = {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '2%',
      top: '5%',
      bottom: '0%',
      containLabel: true
    },
    graphic: {
      type: 'text',
      left: 'center',
      top: 'middle',
      style: { text: "" }
    },
    xAxis: [
      {
        type: "category",
        data: [],
        position: "bottom",
        boundaryGap: true,
        axisLabel: {
          hideOverlap: true,
          rotate: 45,
          margin: 15,
        }
      }
    ],
    yAxis: {
      scale: true,
      axisLabel: {
        margin: 0,
        padding: [0, 5, 0, 5]
      },
      splitLine: {
        show: false
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    series: {
      type: 'line',
      smooth: true,
      itemStyle: { color: "#cc0000" },
      data: [],
      markLine: {
        silent: true,
        data: []
      }
    }
  }

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.lineOptions = { ...this.lineOptions };
    this.lineOptions.xAxis[0].data = this.lineData.map(item => { return item[0].slice(0, 6) + "\n" + item[0].slice(6, 12) });
    this.lineOptions.series['data'] = this.lineData.map(item => { return item[1] });
    this.lineOptions.series['markLine'].data = this.thresholdData;
  }

}
