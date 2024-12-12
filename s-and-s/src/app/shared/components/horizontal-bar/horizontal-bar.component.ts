import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-horizontal-bar',
  templateUrl: './horizontal-bar.component.html',
  styleUrls: ['./horizontal-bar.component.css']
})
export class HorizontalBarComponent implements OnInit {

  @Input() total_obs:any;
  @Input() difference:any;
  @Input() color:any;

  option = {
    grid: {
      height: 15,
      left: '0px',
      right: '0px',
      top: '0%'
    },
    xAxis: {
      type: 'value',
      max: 'dataMax',
        show: false
    },
    yAxis: {
      type: 'category',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      data: ['']
    },
    series: [
      {
        name: 'Direct',
        type: 'bar',
        stack: 'total',
        color: '',
        data: [],
        barWidth: 15
      }
    ]
  };
  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
      let isTotal_obs = changes['total_obs'] &&
        changes['total_obs'].currentValue != changes['total_obs'].previousValue;
      let isDifference = changes['difference'] &&
        changes['difference'].currentValue != changes['difference'].previousValue;
      let isColor = changes['color'] &&
        changes['color'].currentValue != changes['color'].previousValue;
      if (isTotal_obs || isDifference || isColor) {
        this.chartOptiondata();
      }
  }

  /**
   * formating the data populating on charts.
   */
  chartOptiondata() {
    let series = this.option.series || [] as any;
    let total_obs: any = [];
    total_obs.push({
      value: this.total_obs,
      itemStyle: {}
    })

    series[0].data = total_obs;
    series[0].color = '#006699';
    this.option = Object.assign({}, this.option);
  }
}
