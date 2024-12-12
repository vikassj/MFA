import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as echarts from 'echarts';
import * as moment from 'moment';

import { SafetyAndSurveillanceCommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit, AfterViewInit {

  @ViewChild('yourDiv') yourDiv: ElementRef;
  @Input() xAxisData: any;
  @Input() barData: any;
  @Input() categoryMapStatus: any;
  @Input() categoryMap: any;
  @Output() emitEvent = new EventEmitter();
  noDataMsg: any = {}
  dataIsThere: boolean = false;
  barOptions: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      itemWidth: 10,
      itemHeight: 10,
      left: 0,
      top: '20',
      textStyle: {
        fontSize: 10,
        fontWeight: 800,
      },
      selected: {
      },
      tooltip: {
        position: 'right',
        show: true,
        formatter: function (params) {
          var categoryMap = [...this.categoryMap];
          // Custom legend formatter to include a tooltip
          var fullForm = categoryMap.filter((cat) => cat.name == params.name);
          return (
            '<div class="legend-tooltip text-center" style="color: #2196F3; font-weight: 550">' +
            fullForm[0].value +
            '</div>'
          );
        },
      },
    },
    grid: {
      left: '0.5%',
      right: '3%',
      bottom: '0.5%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: [],
        axisTick: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        minInterval: 1,
      },
    ],
    series: [],
    dataZoom: [],
  };

  selectedLegendItems: any = {};

  constructor(
    private safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService
  ) { }

  ngOnInit() {}

  ngAfterViewInit() {}

  giveSum(data: any[]) {
    let sum = 0;
    data.forEach((value) => {
      sum += parseInt(value);
    });
    return sum;
  }

  ngOnChanges(changes: SimpleChanges): void {
    let isxAxisDataChanged =
      changes['xAxisData'] &&
      changes['xAxisData'].currentValue != changes['xAxisData'].previousValue;
    let isBarDataChanged =
      changes['barData'] &&
      changes['barData'].currentValue != changes['barData'].previousValue;
      let categoryMapTooltip = this.categoryMap
    if (isxAxisDataChanged || isBarDataChanged) {
      let count = 0;
      this.barOptions = { ...this.barOptions };
      this.barData.forEach((item) => {
        if(item.name != 'Closed'){
          item.itemStyle = {
            color: this.safetyAndSurveillanceCommonService.getColorValue(
              item.name
            ),
          };
        }else{
          item.itemStyle = {
            color: '#28a745',
          };
        }
        count += this.giveSum(item.data);
      });

      if (count == 0) {
        this.dataIsThere = false;
        this.barOptions = {
          title: {
              show: true,
              textStyle:{
                color:'Black',
                fontSize: "14px",
                fontFamily: 'Montserrat',
                fontWeight: '600'
              },
              text: "No observations recorded",
              left: 'center',
              top: 'center'
            },
          xAxis: {
              show: false
          },
          yAxis: {
              show: false
          },
          series: [],
          legend: {
            show: false
          },
          dataZoom: []
      };
        echarts.init(document.getElementById('legend-chart')).setOption(this.barOptions)
      } else {
        this.dataIsThere = true;
       this.barOptions = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {
            itemWidth: 10,
            itemHeight: 10,
            left: 0,
            top: '20',
            textStyle: {
              fontSize: 10,
              fontWeight: 800,
            },
            selected: {
            },
            tooltip: {
              position: 'right',
              show: true,
              formatter: function (params) {
                var categoryMap = JSON.parse(sessionStorage.getItem("safety-and-surveillance-configurations"))['module_configurations']['iogp_categories'].map((item) => {
                  return {
                    name: item.acronym,
                    value: item.name
                  }
                })
                categoryMap.push({name: "Closed", value: "Closed Observations"})

                // Custom legend formatter to include a tooltip
                var fullForm = categoryMap.filter((cat) => cat.name == params.name);
                return (
                  '<div class="legend-tooltip text-center" style="color: #2196F3; font-weight: 550">' +
                  fullForm[0].value +
                  '</div>'
                );
              },
            },
          },
          grid: {
            left: '0.5%',
            right: '3%',
            bottom: '0.5%',
            containLabel: true,
          },
          xAxis: [
            {
              type: 'category',
              data: [],
              axisTick: {
                show: false,
              },
            },
          ],
          yAxis: [
            {
              type: 'value',
              minInterval: 1,
            },
          ],
          series: [],
          dataZoom: [],
        }
        echarts.init(document.getElementById('legend-chart')).setOption(this.barOptions)

      }
      let arrays = [...this.barData].map((category) => {
        return this.returnIndexes(category.data);
      });
      let indexes = [];
      if (arrays.length > 0) {
        indexes = arrays.reduce((a, b) => a.filter((c) => b.includes(c)));
      }
      this.xAxisData = [...this.xAxisData].filter(
        (item, i) => indexes.indexOf(i) === -1
      );
      this.barData.forEach((item) => {
        item.data = item.data.filter((item, i) => indexes.indexOf(i) === -1);
      });
      if (this.xAxisData.length > 30) {
        let startIndex = 100 - (30 / this.xAxisData.length) * 100;
        this.barOptions.dataZoom = [
          {
            type: 'inside',
            show: true,
            zoomOnMouseWheel: false,
            moveOnMouseWheel: true,
            xAxisIndex: [0],
            start: startIndex,
            end: 100,
          },
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: startIndex,
            end: 100,
            height: 15,
            fillerColor: 'rgb(0, 0, 153, 0.4)',
            borderColor: 'rgb(0, 0, 0, 0.2)',
          },
        ];
      } else {
        this.barOptions.dataZoom = [];
      }
      if(this.barOptions?.xAxis[0]){
      this.barOptions.xAxis[0].data = this.xAxisData?.map((xAxis) =>
        this.formatDate(xAxis?.date)
      
      );
    }
      this.barOptions.series = this.barData;

          /* code for the legend selection
             Initialize the chart component,
             get the selections, invert them, set the selected item as selectedLegend,
             parse through the selection and keep adding the to the list of selectedLegend,
             and update the chart options accordingly.   */
          var echartsInstance = echarts.init(document.getElementById('legend-chart'));
          let selectedLegend: any = [];

            //Listen for the legend-item-selection change event
             echartsInstance.on('legendselectchanged', (params: any) => {

              //check if all the items are selected and on the next click make that as the first selection again.
              if(selectedLegend.length == Object.keys(params.selected).length) {
                selectedLegend = []
              }

              //Invert all the selection keys for the categories.
              //(params.selected returns inverted selection as that is the default funtionality)
               for(var key in params.selected) {
                 if(key == params.name) {
                  //add the selected items in selectedLegend object after doing null check and validity check.
                   if(!(selectedLegend.findIndex(item => item.name == params.name) > -1)) {
                    //if one item is selected and that is not in the selectedLegend object then add it into the selectedLegend object.
                     selectedLegend.push({'name' : params.name , 'value': params.selected[key]})
                    //and make the selection as true
                     params.selected[key] = true
                   } else {
                    //if the selected item is there in the selectedLegendObject then splice it.
                     selectedLegend.splice(selectedLegend.findIndex(item => item.name == params.name), 1)
                    //and make the selection false.
                     params.selected[key] = false
                   }
                 } else {
                  //make all the other items as false while selecting something apart from the already selected ones.
                   params.selected[key] = false
                 }
               }


               //once selectedLegend is built, we do remaining checks and set the barOptions.
               if(selectedLegend.length < 1) {
                //if no more seleted items are there then reset the selection to default.(all items selected)
                 this.selectAllLegendItems()
               } else {
                //for every item in selectedLegend, we find the corresponding item in
                //params.selected and mark it as true if found or else false.
                 selectedLegend.forEach(item => {
                   if(item.name in params.selected) {
                     params.selected[item.name] = true
                   } else {
                     params.selected[item.name] = false
                   }
                 })
                 //set the legend selection in barOptions after the objects are built according to the selectedLegend.
                 this.barOptions.legend.selected = params.selected

               }
              //  after all the funtionality is done, finally set the bar options.
               echartsInstance.setOption(this.barOptions)
             });
      }
    }

  selectAllLegendItems() {
    var allCategories = JSON.parse(sessionStorage.getItem("safety-and-surveillance-configurations"))['module_configurations']['iogp_categories'].map(item => item.acronym)
    var result = {};
    allCategories.forEach(acronym => {
      result[acronym] = true;
    })
    result['CLOSED'] = true
    this.barOptions.legend.selected = allCategories
  }

  count(data: any) {
    let trueCount = 0;
    let falseCount = 0;
    for (const key in data) {
      if (data[key] == true) {
        trueCount++;
      } else if (data[key] == false) {
        falseCount++;
      }
    }
    return [{ true: trueCount, false: falseCount }];
  }

  updateSelection(selectedObject, selectedCategory) {
    for (const category in selectedObject) {
      if (category === selectedCategory) {
        selectedObject[category] = !selectedObject[category];
      }
    }
    return selectedObject
  }

  onClick($event) {
    this.emitEvent.emit(
      this.xAxisData.find((xAxis) => xAxis.label === $event.name).date
    );
  }

  returnIndexes(array) {
    let indexes = array.reduce((r, n, i) => {
      n === 0 && r.push(i);
      return r;
    }, []);
    return indexes;
  }

  formatDate(inputDate) {
    const date = new Date(inputDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
      date
    );
    const year = String(date.getFullYear()).slice(-2);

    return moment(inputDate).format('DD-MMM-YYYY');
    // return `${day}-${month}-${year}`;
  }

  onMouseMove(event: MouseEvent) {
    const divElement = this.yourDiv.nativeElement;
    const boundingRect = divElement.getBoundingClientRect();
    const leftPosition = boundingRect.left;
    const rightPosition = boundingRect.right;
    let findCenterPosition = ((rightPosition - leftPosition) / 2) + leftPosition;
    let tooltip = this.barOptions.legend.tooltip || [] as any;
    if(findCenterPosition >= event.clientX && tooltip.position == 'left'){
      tooltip.position = 'right';
      this.barOptions = Object.assign({}, this.barOptions);
    }else if(findCenterPosition < event.clientX && tooltip.position == 'right'){
      tooltip.position = 'left';
      this.barOptions = Object.assign({}, this.barOptions);
    }
  }
}

