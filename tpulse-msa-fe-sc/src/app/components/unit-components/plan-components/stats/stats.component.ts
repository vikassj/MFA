import { Component, Input, OnChanges, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { ActivityMonitorSCurveStatsService } from '../../../../services/s-curve.service';
import * as moment from 'moment';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit, OnChanges {

  @Input() unitName: string;
  @Input() department: string;
  @Input() vendor: any;
  @Output() showSelectedGraph: EventEmitter<any> = new EventEmitter();
  msg: string = '';
  graphFilter = []
  selectedGraph: string = '';
  graph: string;

  zones = []
  deparment: any;
  selectedZone: string;

  departmentDropdown: boolean = false;
  graphDropdown: boolean = false;

  statsChartArray = [];
  overviewData: any;
  graphDropdownWidth: number;
  departmentDropdownWidth: number = 130;

  chartDataNotAvailable: boolean = false;
  constructor(private sCurveService: ActivityMonitorSCurveStatsService, private dataService: DataService, private snackbarService: SnackbarService, private router: Router) { }
  chartArrayNoData: boolean = true;

  ngOnInit() {
    this.getChartFilter();
    //  this.dataService.passCreateTask('yes',true)
    console.log(this.deparment)
    console.log(this.vendor)

  }
  ngOnChanges(changes: SimpleChanges): void {
    let isUnitChanged = changes['unitName'] &&
      changes['unitName'].currentValue != changes['unitName'].previousValue;
    let isDepartmentChanged = changes['department'] &&
      changes['department'].currentValue != changes['department'].previousValue;
    let isVendorChanged = changes['vendor'] &&
      changes['vendor'].currentValue != changes['vendor'].previousValue;
    if (isUnitChanged || isDepartmentChanged || isVendorChanged) {
      this.dataService.passSpinnerFlag(true, true);
      // this.getAvailableDepartments(this.unitName);
      this.getOverviewData(this.unitName, this.department, this.vendor);
      this.getChartData(this.unitName, this.department, this.selectedGraph, this.vendor);
      console.log(this.vendor)
    }
  }

  departmentDropdownShow() {
    this.departmentDropdown = !this.departmentDropdown;
    this.graphDropdown = false;
  }
  graphDropdownShow() {
    this.graphDropdown = !this.graphDropdown;
    this.departmentDropdown = false;
  }

  selecteGraph(graph?) {
    if (graph) {
      this.selectedGraph = graph;
      console.log(this.selectedGraph)
    }
    this.getChartData(this.unitName, this.department, this.selectedGraph, this.vendor);
  }


  getChartFilter() {
    this.dataService.passSpinnerFlag(true, true);
    this.sCurveService.getChartFilter().subscribe((data) => {
      this.graphFilter = data;
      console.log(this.graphFilter)
      // this.graphFilter.push("Time over run tasks");
      console.log(this.graphFilter)
      this.selecteGraph(this.graphFilter[0]);
      console.log(this.selectedGraph)
      this.dataService.passSpinnerFlag(false, true);

    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }
  getOverviewData(unitName, department, vendor) {
    console.log(this.vendor)
    this.dataService.passSpinnerFlag(true, true);
    this.sCurveService.getOverviewData(unitName, department, this.vendor).subscribe((data) => {
      this.overviewData = data;
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }
  getChartData(unitName, department, graphType, vendor) {
    console.log(unitName, this.deparment, this.vendor)
    if (this.selectedGraph == 'Delayed finish tasks' || this.selectedGraph == 'Delayed start tasks graph' || this.selectedGraph == 'Planned vs. Actual Bar Graph (count)' || this.selectedGraph == 'Planned vs. Actual S-Curve (hours)' || this.selectedGraph == 'Time overrun tasks') {
      console.log(this.selectedGraph)
      if (this.selectedGraph == 'Planned vs. Actual Bar Graph (count)' || this.selectedGraph == 'Planned vs. Actual S-Curve (hours)' || this.selectedGraph == 'Time overrun tasks') {
        this.dataService.passCreateTask('yes', true)
      }
      else {
        this.dataService.passCreateTask('no', true)
      }
      this.dataService.passSpinnerFlag(true, true);
      this.sCurveService.getChartData(unitName, department, graphType, this.vendor).subscribe((data) => {
        this.statsChartArray = data;

        this.statsChartArray.forEach(data => {
          this.chartArrayNoData = true;
          for (let key in data) {
            this.chartArrayNoData = false;
          }
        })

        if (this.statsChartArray[0]['message'] || this.chartArrayNoData) {
          this.chartDataNotAvailable = true;
        } else {
          this.chartDataNotAvailable = false;
        }
        this.chartOptiondata();
        this.dataService.passSpinnerFlag(false, true);
      },
        error => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        })
    }
  }

  sCurveTimeOverRunChart: any = {};

  sCurveDelayedStartChart: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    grid: {
      left: '3%',
      right: '14%',
      // top: '5%',
      bottom: '7%',
      containLabel: true,
      show: false
    },
    legend: [
      {
        data: ['Delayed start'],
        icon: "circle",
        textStyle: {
          fontSize: 10,
          lineHeight: 0,
          width: 69,
          height: 86,
          color: 'black',
          overflow: "breakAll"
        },
        width: "50px",
        right: '0px',
        left: '90%',
        top: '32%'
      },

    ],
    dataZoom: [
      // {
      //   type: 'slider',
      //   show: false,
      //   xAxisIndex: [0],
      //   start: 0,
      //   end: 35
      // },

      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 35
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: [],

        axisPointer: {
          type: 'shadow'
        },
        offset: 5,
        name: "Duration(Date/Week/Month)",
        nameLocation: "middle",
        nameTextStyle: {
          color: "#909090",
          fontStyle: "normal",
          fontFamily: "am-Montserrat",
          fontWeight: "bold",
          fontSize: 12,
        },
        nameGap: 30
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: {
          show: false
        },
        axisLine: {
          show: true
        }
      }
    ],
    series: [
      {
        name: 'Delayed start',
        type: 'bar',
        itemStyle: { color: '#B0B0B0' },
        data: [],
        barWidth: "14px",
      }
    ]
  }
  sCurveDelayedFinishChart: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    grid: {
      left: '3%',
      right: '14%',
      // top: '5%',
      bottom: '7%',
      containLabel: true,
      show: false
    },
    legend: [
      {
        data: ['Delayed finish'],
        icon: "circle",
        textStyle: {
          fontSize: 10,
          lineHeight: 0,
          width: 69,
          height: 86,
          color: "string",
          overflow: "breakAll"
        },
        width: "50px",
        right: '0px',
        left: '90%',
        top: '32%'
      },

    ],
    dataZoom: [
      // {
      //   type: 'slider',
      //   show: false,
      //   xAxisIndex: [0],
      //   start: 0,
      //   end: 35
      // },

      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 35
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: [],

        offset: 5,
        name: "Duration(Date/Week/Month)",
        nameLocation: "middle",
        nameTextStyle: {
          color: "#909090",
          fontStyle: "normal",
          fontFamily: "am-Montserrat",
          fontWeight: "bold",
          fontSize: 12,
        },
        nameGap: 30
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: {
          show: false
        },
        axisLine: {
          show: true
        }
      }
    ],
    series: [
      {
        name: 'Delayed finish',
        type: 'bar',
        //icon: "circle",
        itemStyle: { color: '#006699' },
        data: [],
        barWidth: "14px",
      }
    ]
  }
  sCurvePlannedVsActualBarChart: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // type: 'cross',
        crossStyle: {
          color: '#999',
        }
      },
      formatter: function (params) {
        let html = '';
        let axisValue = params[0].axisValue;
        html = html + axisValue + '</br>';
        params.forEach(param => {
          if (param.value == 'NA') {
            html = html + param.marker + param.seriesName + ': ' + param.value + '</br>';
          } else {
            html = html + param.marker + param.seriesName + ': ' + param.value + '%</br>';
          }
        });
        return html;
      }
    },
    grid: {
      left: '20px',
      right: '30%',
      // top: '5%',
      bottom: '7%',
      containLabel: true,
      show: false
    },
    legend: [
      {

        data: ['Daily Actual progress (%)', 'Daily Planned progress (%)'],
        icon: "circle",
        orient: 'vertical',
        textStyle: {
          fontSize: 10,
          lineHeight: 10,
          width: 200,
          height: 10,
          color: "black",
          overflow: "breakAll"
        },

        left: '80.5%',
        top: '32%'
      },
      // {

      //   data: ['Cumulative Planned Progress (%)', 'Cumulative Actual Progress (%)'],
      //   orient: 'vertical',
      //   textStyle: {
      //     fontSize: 10,
      //     lineHeight: 10,
      //     width: 200,
      //     height: 10,
      //     color: "black",
      //     overflow: "breakAll"
      //   },
      //   top: "45%",
      //   left: '80%'
      // },

    ],
    dataZoom: [
      // {
      //   type: 'slider',
      //   show: false,
      //   xAxisIndex: [0],
      //   start: 0,
      //   end: 35
      // },

      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 35
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: [],

        offset: 5,
        name: "Duration(Date/Week/Month)",
        nameLocation: "middle",
        nameTextStyle: {
          color: "#909090",
          fontStyle: "normal",
          fontFamily: "am-Montserrat",
          fontWeight: "bold",
          fontSize: 12,
        },
        nameGap: 30
      }
    ],
    yAxis: [
      {
        type: 'value',
        min: 0,
        // max: 100,
        axisLabel: {
          show: true,
          interval: 'auto',
          formatter: '{value}%'
        },
        splitLine: {
          show: false
        },
        axisLine: {
          show: true
        }
      },
      {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          show: true,
          interval: 'auto',
          formatter: '{value}%'
        },
        splitLine: {
          show: false
        },
        axisLine: {
          show: true
        }
      }
    ],
    series: [
      {
        name: 'Daily Planned progress (%)',
        type: 'bar',
        //icon: "circle",
        itemStyle: { color: '#B0B0B0' },
        data: [],
        barWidth: "14px",
      },
      {
        name: 'Daily Actual progress (%)',
        type: 'bar',
        itemStyle: { color: '#006699' },
        data: [],
        barWidth: "14px",
      },
      // {
      //   name: 'Cumulative Actual Progress (%)',
      //   type: 'line',
      //   smooth: true,
      //   symbolSize: 8,
      //   symbol: 'circle',
      //   yAxisIndex: 1,
      //   itemStyle: { color: '#33A437' },
      //   data: []
      // },
      // {
      //   name: 'Cumulative Planned Progress (%)',
      //   type: 'line',
      //   smooth: true,
      //   symbolSize: 8,
      //   symbol: 'circle',
      //   itemStyle: { color: '#F65150' },
      //   yAxisIndex: 1,
      //   data: []
      // }
    ]
  };
  sCurvePlannedVsActualCurveChart: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // type: 'cross',
        crossStyle: {
          color: '#999',
        }
      },
      formatter: function (params) {
        let html = '';
        let axisValue = params[0].axisValue;
        html = html + axisValue + '</br>';
        params.forEach(param => {
          if (param.value == 'NA') {
            html = html + param.marker + param.seriesName + ': ' + param.value + '</br>';
          } else {
            html = html + param.marker + param.seriesName + ': ' + param.value + '%</br>';
          }
        });
        return html;
      }
    },
    grid: {
      left: '20px',
      right: '30%',
      // top: '5%',
      bottom: '7%',
      containLabel: true,
      show: false
    },
    legend: [
      // {

      //   data: ['Daily Actual progress (%)', 'Daily Planned progress (%)'],
      //   icon: "circle",
      //   orient: 'vertical',
      //   textStyle: {
      //     fontSize: 10,
      //     lineHeight: 10,
      //     width: 200,
      //     height: 10,
      //     color: "black",
      //     overflow: "breakAll"
      //   },

      //   left: '80.5%',
      //   top: '32%'
      // },
      {

        data: ['Cumulative Actual Progress (%)', 'Cumulative Planned Progress (%)'],
        orient: 'vertical',
        textStyle: {
          fontSize: 10,
          lineHeight: 10,
          width: 200,
          height: 10,
          color: "black",
          overflow: "breakAll"
        },
        top: "45%",
        left: '80%'
      },

    ],
    dataZoom: [
      // {
      //   type: 'slider',
      //   show: false,
      //   xAxisIndex: [0],
      //   start: 0,
      //   end: 35
      // },

      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 35
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: [],

        offset: 5,
        name: "Duration(Date/Week/Month)",
        nameLocation: "middle",
        nameTextStyle: {
          color: "#909090",
          fontStyle: "normal",
          fontFamily: "am-Montserrat",
          fontWeight: "bold",
          fontSize: 12,
        },
        nameGap: 30
      }
    ],
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          show: true,
          interval: 'auto',
          formatter: '{value}%'
        },
        splitLine: {
          show: false
        },
        axisLine: {
          show: true
        }
      }
    ],
    series: [
      // {
      //   name: 'Daily Planned progress (%)',
      //   type: 'bar',
      //   //icon: "circle",
      //   itemStyle: { color: '#B0B0B0' },
      //   data: [],
      //   barWidth: "14px",
      // },
      // {
      //   name: 'Daily Actual progress (%)',
      //   type: 'bar',
      //   itemStyle: { color: '#006699' },
      //   data: [],
      //   barWidth: "14px",
      // },
      {
        name: 'Cumulative Actual Progress (%)',
        type: 'line',
        smooth: true,
        z: 1,
        symbolSize: 8,
        symbol: 'circle',
        itemStyle: { color: '#33A437' },
        data: []
      },
      {
        name: 'Cumulative Planned Progress (%)',
        type: 'line',
        smooth: true,
        z: 0,
        symbolSize: 8,
        symbol: 'circle',
        itemStyle: { color: '#F65150' },
        data: []
      }
    ]
  };


  chartOptiondata() {
    if (this.sCurveTimeOverRunChart && this.selectedGraph == 'Time overrun tasks') {
      let xData = [];
      let yData = [];
      this.statsChartArray.forEach((data) => {
        xData.push(data.date);
        yData.push(data.critical_path_delay);
      })
      this.sCurveTimeOverRunChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        grid: {
          left: '3%',
          right: '3%',
          // top: '5%',
          bottom: '7%',
          containLabel: true,
          show: false
        },
        legend: [
          {
            data: ['Critical Path delay'],
            icon: "circle",
            textStyle: {
              fontSize: 10,
              lineHeight: 0,
              width: 69,
              height: 86,
              color: 'black',
              overflow: "breakAll"
            },
            width: "50px",
            right: '0px'
          },

        ],
        dataZoom: [
          // {
          //   type: 'slider',
          //   show: false,
          //   xAxisIndex: [0],
          //   start: 0,
          //   end: 35
          // },

          {
            type: 'inside',

          },
        ],
        xAxis: [
          {
            type: 'category',
            data: xData,

            axisPointer: {
              type: 'shadow'
            },
            offset: 5,
            name: "Duration(Date/Week/Month)",
            nameLocation: "middle",
            nameTextStyle: {
              color: "#909090",
              fontStyle: "normal",
              fontFamily: "am-Montserrat",
              fontWeight: "bold",
              fontSize: 12,
            },
            nameGap: 30
          }
        ],
        yAxis: [
          {
            name: "Critical Path delay",
            type: 'value',
            splitLine: {
              show: false
            },
            axisLine: {
              show: true
            }
          }
        ],
        series: [
          {
            name: 'Daily Critical Path Delay',
            type: 'bar',
            itemStyle: {},
            data: yData,
            barWidth: "14px",
          }
        ]
      }
    }

    if (this.sCurvePlannedVsActualBarChart && this.selectedGraph == 'Planned vs. Actual Bar Graph (count)') {
      let xAxis = this.sCurvePlannedVsActualBarChart.xAxis || [] as any;
      let xAxisDta = [];
      let count = 0;
      this.statsChartArray.forEach(statsDate => {
        let statsData = statsDate;
        for (const [key, value] of Object.entries(statsData)) {
          xAxisDta.push(key);
          count += 1;
        }
      })
      xAxis[0].data = xAxisDta;
      let dataZoom = this.sCurvePlannedVsActualBarChart.dataZoom || [] as any;
      let grid = this.sCurvePlannedVsActualBarChart.grid || {} as any;
      let avgBarData = (15 / count) * 100
      if (count >= 15) {
        dataZoom[0].show = true;
        dataZoom[0].end = 100;
        grid.bottom = '17%';
      } else {
        dataZoom[0].show = false;
        dataZoom[0].end = 100;
        grid.bottom = '7%';
      }

      let evaporationSeries = this.sCurvePlannedVsActualBarChart.series || [] as any;
      let evaporationSeriesObj = evaporationSeries[0];
      let evaporationSeriesdata = [];
      this.statsChartArray.forEach(statsDate => {
        let statsData = statsDate;
        for (const [key, value] of Object.entries(statsData)) {
          evaporationSeriesdata.push(value['planned']);
        }
      });
      evaporationSeriesObj.data = evaporationSeriesdata;

      let precipitationSeries = this.sCurvePlannedVsActualBarChart.series || [] as any;
      let precipitationSeriesObj = precipitationSeries[1];
      let precipitationSeriesdata = [];
      this.statsChartArray.forEach(statsDate => {
        let statsData = statsDate;
        for (const [key, value] of Object.entries(statsData)) {
          precipitationSeriesdata.push(value['actual']);
        }
      });
      precipitationSeriesObj.data = precipitationSeriesdata;

      // let actualTempSeries = this.sCurvePlannedVsActualChart.series || [] as any;
      // let actualTempSeriesObj = actualTempSeries[2];
      // let actualTempSeriesdata = [];
      // this.statsChartArray.forEach(statsDate => {
      //   let statsData = statsDate;
      //   for (const [key, value] of Object.entries(statsData)) {
      //     actualTempSeriesdata.push(value['actualTemp']);
      //   }
      // });
      // actualTempSeriesObj.data = actualTempSeriesdata;

      // let plannedTempSeries = this.sCurvePlannedVsActualChart.series || [] as any;
      // let plannedTempSeriesObj = plannedTempSeries[3];
      // let plannedTempSeriesdata = [];
      // this.statsChartArray.forEach(statsDate => {
      //   let statsData = statsDate;
      //   for (const [key, value] of Object.entries(statsData)) {
      //     plannedTempSeriesdata.push(value['plannedTemp']);
      //   }
      // });
      // plannedTempSeriesObj.data = plannedTempSeriesdata;

      this.sCurvePlannedVsActualBarChart = Object.assign({}, this.sCurvePlannedVsActualBarChart);
    }

    if (this.sCurvePlannedVsActualCurveChart && this.selectedGraph == 'Planned vs. Actual S-Curve (hours)') {
      let xAxis = this.sCurvePlannedVsActualCurveChart.xAxis || [] as any;
      let xAxisDta = [];
      let count = 0;
      this.statsChartArray.forEach(statsDate => {
        let statsData = statsDate;
        xAxisDta.push(statsData.date);
        count += 1;
      })
      xAxis[0].data = xAxisDta;
      let dataZoom = this.sCurvePlannedVsActualCurveChart.dataZoom || [] as any;
      let grid = this.sCurvePlannedVsActualCurveChart.grid || {} as any;
      let avgBarData = (15 / count) * 100
      if (count >= 15) {
        dataZoom[0].show = true;
        dataZoom[0].end = 100;
        grid.bottom = '17%';
      } else {
        dataZoom[0].show = false;
        dataZoom[0].end = 100;
        grid.bottom = '7%';
      }

      // let evaporationSeries = this.sCurvePlannedVsActualChart.series || [] as any;
      // let evaporationSeriesObj = evaporationSeries[0];
      // let evaporationSeriesdata = [];
      // this.statsChartArray.forEach(statsDate => {
      //   let statsData = statsDate;
      //   for (const [key, value] of Object.entries(statsData)) {
      //     evaporationSeriesdata.push(value['planned']);
      //   }
      // });
      // evaporationSeriesObj.data = evaporationSeriesdata;

      // let precipitationSeries = this.sCurvePlannedVsActualChart.series || [] as any;
      // let precipitationSeriesObj = precipitationSeries[1];
      // let precipitationSeriesdata = [];
      // this.statsChartArray.forEach(statsDate => {
      //   let statsData = statsDate;
      //   for (const [key, value] of Object.entries(statsData)) {
      //     precipitationSeriesdata.push(value['actual']);
      //   }
      // });
      // precipitationSeriesObj.data = precipitationSeriesdata;

      let actualTempSeries = this.sCurvePlannedVsActualCurveChart.series || [] as any;
      let actualTempSeriesObj = actualTempSeries[0];
      let actualTempSeriesdata = [];
      this.statsChartArray.forEach(statsDate => {
        if (moment(statsDate.date) <= moment()) {
          let statsData = statsDate;
          actualTempSeriesdata.push(statsData['actual_cumulative_percentage']);
        }
        // for (const [key, value] of Object.entries(statsData)) {
        // }
      });
      actualTempSeriesObj.data = actualTempSeriesdata;

      let plannedTempSeries = this.sCurvePlannedVsActualCurveChart.series || [] as any;
      let plannedTempSeriesObj = plannedTempSeries[1];
      let plannedTempSeriesdata = [];
      this.statsChartArray.forEach(statsDate => {
        let statsData = statsDate;
        plannedTempSeriesdata.push(statsData['planned_cumulative_percentage']);
      });
      plannedTempSeriesObj.data = plannedTempSeriesdata;

      this.sCurvePlannedVsActualCurveChart = Object.assign({}, this.sCurvePlannedVsActualCurveChart);
    }


    if (this.sCurveDelayedStartChart && this.selectedGraph == 'Delayed start tasks graph') {
      let xAxis = this.sCurveDelayedStartChart.xAxis || [] as any;
      let xAxisDta = [];
      let count = 0;
      this.statsChartArray.forEach(delayedStartDate => {
        let delayedStartData = delayedStartDate;
        for (const [key, value] of Object.entries(delayedStartData)) {
          xAxisDta.push(key)
          count += 1;
        }
      })
      xAxis[0].data = xAxisDta;

      let dataZoom = this.sCurveDelayedStartChart.dataZoom || [] as any;
      let grid = this.sCurveDelayedStartChart.grid || {} as any;
      let avgBarData = (31 / count) * 100
      if (count >= 31) {
        dataZoom[0].show = true;
        dataZoom[0].end = 100;
        grid.bottom = '17%';
      } else {
        dataZoom[0].show = false;
        dataZoom[0].end = 100;
        grid.bottom = '7%';
      }

      let evaporationSeries = this.sCurveDelayedStartChart.series || [] as any;
      let evaporationSeriesObj = evaporationSeries[0];
      let evaporationSeriesdata = [];
      this.statsChartArray.forEach(delayedStartDate => {
        let delayedStartData = delayedStartDate;
        for (const [key, value] of Object.entries(delayedStartData)) {
          evaporationSeriesdata.push(value);
        }
      });
      evaporationSeriesObj.data = evaporationSeriesdata;

      // let precipitationSeries = this.sCurvePlannedVsActualChart.series || [] as any;
      // let precipitationSeriesObj = precipitationSeries[1];
      // let precipitationSeriesdata = [];
      // this.statsChartArray.forEach(statsDate => {
      //   let statsData = statsDate;
      //   for (const [key, value] of Object.entries(statsData)) {
      //     precipitationSeriesdata.push(value['actual']);
      //   }
      // });
      // precipitationSeriesObj.data = precipitationSeriesdata;

      // let plannedTempSeries = this.sCurvePlannedVsActualChart.series || [] as any;
      // let plannedTempSeriesObj = plannedTempSeries[2];
      // let plannedTempSeriesdata = [];
      // this.statsChartArray.forEach(statsDate => {
      //   let statsData = statsDate;
      //   for (const [key, value] of Object.entries(statsData)) {
      //     plannedTempSeriesdata.push(value['plannedTemp']);
      //   }
      // });
      // plannedTempSeriesObj.data = plannedTempSeriesdata;

      // let actualTempSeries = this.sCurvePlannedVsActualChart.series || [] as any;
      // let actualTempSeriesObj = actualTempSeries[3];
      // let actualTempSeriesdata = [];
      // this.statsChartArray.forEach(statsDate => {
      //   let statsData = statsDate;
      //   for (const [key, value] of Object.entries(statsData)) {
      //     actualTempSeriesdata.push(value['actualTemp']);
      //   }
      // });
      // actualTempSeriesObj.data = actualTempSeriesdata;

      this.sCurveDelayedStartChart = Object.assign({}, this.sCurveDelayedStartChart);
    }
    if (this.sCurveDelayedFinishChart && this.selectedGraph == 'Delayed finish tasks') {
      let xAxis = this.sCurveDelayedFinishChart.xAxis || [] as any;
      let xAxisDta = [];
      let count = 0;
      this.statsChartArray.forEach(delayedFinishedDate => {
        let delayedFinishedData = delayedFinishedDate;
        for (const [key, value] of Object.entries(delayedFinishedData)) {
          xAxisDta.push(key);
          count += 1;
        }
      })
      xAxis[0].data = xAxisDta;

      let dataZoom = this.sCurveDelayedFinishChart.dataZoom || [] as any;
      let grid = this.sCurveDelayedFinishChart.grid || {} as any;
      let avgBarData = (31 / count) * 100
      if (count >= 31) {
        dataZoom[0].show = true;
        dataZoom[0].end = 100;
        grid.bottom = '17%';
      } else {
        dataZoom[0].show = false;
        dataZoom[0].end = 100;
        grid.bottom = '7%';
      }

      let evaporationSeries = this.sCurveDelayedFinishChart.series || [] as any;
      let evaporationSeriesObj = evaporationSeries[0];
      let evaporationSeriesdata = [];
      this.statsChartArray.forEach(delayedFinishedDate => {
        let delayedFinishedData = delayedFinishedDate;
        for (const [key, value] of Object.entries(delayedFinishedData)) {
          evaporationSeriesdata.push(value);
        }
      });
      evaporationSeriesObj.data = evaporationSeriesdata;

      this.sCurveDelayedFinishChart = Object.assign({}, this.sCurveDelayedFinishChart);
    }
  }

  navigateToTaskPage() {
    if (this.overviewData.no_of_critical_path_tasks_delayed > 0) {
      sessionStorage.setItem('taskFilter', JSON.stringify([this.unitName, undefined, undefined, undefined, undefined]));
      this.router.navigateByUrl('/activity-monitoring/task');
    }
  }
}
