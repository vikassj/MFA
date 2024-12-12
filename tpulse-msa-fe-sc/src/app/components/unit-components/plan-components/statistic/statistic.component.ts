import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import "dhtmlx-gantt";
import { gantt } from 'dhtmlx-gantt';
import * as moment from 'moment';
import { GanttChartService } from 'src/app/services/gantt-chart.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
declare var $: any;

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent implements OnInit, OnChanges {

  @ViewChild('gantt_here', { static: true }) ganttContainer!: ElementRef;

  msg: string = '';
  @Input() selectedUnit: any;
  @Input() selectedEquipmentCategory: any;
  @Input() selectedDepartment: any;
  @Input() selectedVendor: any;
  @Input() scale: string = 'W';
  @Input() reload: boolean;
  @Input() showCriticalPathTasks: boolean;
  @Input() overShoot: boolean;
  @Output() showSurpriseTask: EventEmitter<any> = new EventEmitter();
  task = [];
  button: any;
  linkTask = [];
  chartData = [];
  private _document: any;
  screenWidth: number;
  toDayDate: any;
  actualStartDate: any;
  actualEndDate: any;
  ganttChartLeftSideWidth: number = 500;
  show: boolean = true;

  constructor(private dataService: DataService, private snackbarService: SnackbarService, private GanttTaskService: GanttChartService, private router: Router) {

  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.screenWidth = window.innerWidth;
    this.ganttChartLeftSideWidth = (this.screenWidth / 3);
    gantt.config.grid_width = this.ganttChartLeftSideWidth;
  }

  ngOnInit() {
    console.log(this.selectedVendor)

  }


  ngOnChanges(changes: SimpleChanges): void {

    let isUnitChanged = changes['selectedUnit'] &&
      changes['selectedUnit'].currentValue != changes['selectedUnit'].previousValue;
    let isEquipmentCategoryChanged = changes['selectedEquipmentCategory'] &&
      changes['selectedEquipmentCategory'].currentValue != changes['selectedEquipmentCategory'].previousValue;
    let isDepartmentChanged = changes['selectedDepartment'] &&
      changes['selectedDepartment'].currentValue != changes['selectedDepartment'].previousValue;
    let isVendorChanged = changes['selectedVendor'] &&
      changes['selectedVendor'].currentValue != changes['selectedVendor'].previousValue;
    let isScaleChanged = changes['scale'] &&
      changes['scale'].currentValue != changes['scale'].previousValue;
    let isReload = changes['reload'] &&
      changes['reload'].currentValue != changes['reload'].previousValue;
    this.getScreenSize();
    this.newDateSelection();
    if (isDepartmentChanged || isEquipmentCategoryChanged || isScaleChanged || isVendorChanged || isReload || this.showCriticalPathTasks == true || this.showCriticalPathTasks == false || this.overShoot == true) {
      this.show = true;
      $(document).off('click', '#toggleColumns');
      this.dataService.passSpinnerFlag(true, true);
      var equipmentcat_name
      var dept_name
      if (this.selectedEquipmentCategory.id == null) {
        equipmentcat_name = 'All'
      }
      else {
        equipmentcat_name = this.selectedEquipmentCategory.name
      }
      if (this.selectedDepartment.id == 'All') {
        dept_name = 'All'
      }
      else {
        dept_name = this.selectedDepartment.name
      }
      this.GanttTaskService.getGanttChartData(this.selectedUnit.name, equipmentcat_name, dept_name, this.selectedVendor.id, this.showCriticalPathTasks, this.overShoot).subscribe((data) => {
        this.task = [];
        this.linkTask = [];
        this.chartData = data['message'];
        let ganttData = data['message'];
        ganttData = ganttData.sort((a, b) => {
          return a.id - b.id;
        });
        ganttData.forEach(data => {
          let start_Date;
          if (data.planned_date_to_start != null && data.actual_start_date == null) {
            start_Date = data.planned_date_to_start + ' ' + data.planned_time_to_start;
          } else if (data.planned_date_to_start != null && data.actual_start_date != null) {
            // start_Date = new Date(data.planned_date_to_start + ' ' + data.planned_time_to_start);
            let as: any = data.actual_start_date + ' ' + data.actual_start_time;
            let ss: any = data.planned_date_to_start + ' ' + data.planned_time_to_start;
            if (new Date(ss).getTime() > new Date(as).getTime()) {
              start_Date = as;
            }
            else if (new Date(ss).getTime() <= new Date(as).getTime()) {
              start_Date = ss;
            }
            //consider start_date whichever is minimum between planned and actual start date
            let dates = [];
            dates.push(new Date(as));
            dates.push(new Date(ss));
            let asDate = new Date(as);
            let ssDate = new Date(ss);
            // var maximumDate=new Date(Math.max.apply(null, dates));
            let minimumDate = new Date(Math.min.apply(null, dates));
            if (minimumDate.getTime() == ssDate.getTime()) {
              // start_Date = ss
              this.actualStartDate = ss;
            } else if (minimumDate.getTime() == asDate.getTime()) {
              // start_Date = as
              this.actualStartDate = as;
            }
          }
          else {
            start_Date = null;
          }

          // *************************************************************************
          // Important code block for Gantt. If you're touching this, check with Balaji and then do
          let d: any = moment((data.planned_date_to_complete + ' ' + data.planned_time_to_complete)).add((data.status === 'COMPLETED') ? (data.delay > 0 ? data.delay : 0) : ((data.delay > data.slack) ? data.delay : data.slack), 'hours');
          let end_Date = new Date(d);
          // *************************************************************************

          // if (data.planned_date_to_complete != null && data.actual_date_of_completion == null) {
          //   end_Date = data.planned_date_to_complete + ' ' + data.planned_time_to_complete;
          // } else if (data.planned_date_to_complete == null && data.actual_date_of_completion != null) {
          //   end_Date = data.actual_date_of_completion + ' ' + data.actual_time_of_completion;
          // } else if (data.planned_date_to_complete != null && data.actual_date_of_completion != null) {
          //   let as = data.actual_date_of_completion + ' ' + data.actual_time_of_completion;
          //   let ss = data.planned_date_to_complete + ' ' + data.planned_time_to_complete;
          //   let dates = [];
          //   dates.push(new Date(as));
          //   dates.push(new Date(ss));
          //   let asDate = new Date(as);
          //   let ssDate = new Date(ss);
          //   let maximumDate = new Date(Math.max.apply(null, dates));
          //   // let minimumDate=new Date(Math.min.apply(null, dates));
          //   if (maximumDate.getTime() == ssDate.getTime()) {
          //     end_Date = ss
          //   } else if (maximumDate.getTime() == asDate.getTime()) {
          //     end_Date = as
          //   }
          // } else {
          //   end_Date = null;
          // }
          // this.actualEndDate = end_Date;
          // if (data.status != 'COMPLETED' && data.actual_start_date) {
          //   let dates = [];
          //   let t = this.parseTask(data);
          //   let current_elapsed_end_date = gantt.calculateEndDate(t.actual_datetime_start, t.elapsed_duration);
          //   dates.push(current_elapsed_end_date);
          //   dates.push(new Date(end_Date));

          //   let asDate = new Date(end_Date);
          //   let maximumDate = new Date(Math.max.apply(null, dates));
          //   if (maximumDate.getTime() == current_elapsed_end_date.getTime()) {
          //     end_Date = current_elapsed_end_date
          //   } else if (maximumDate.getTime() == asDate.getTime()) {
          //     end_Date = end_Date
          //   }
          // }

          // let actualPercent = 100;
          let delayPercent = 40;
          let actualPercent = data.progress;
          //let delayPercent = data.delay_percent;
          let totalPercent;

          if (actualPercent == 100 && delayPercent > 0 && data.delay > 0) {
            let acStartDate = data.actual_start_date + ' ' + data.actual_start_time;
            let plStartDate = data.planned_date_to_start + ' ' + data.planned_time_to_start;
            let acEndDate = data.actual_date_of_completion + ' ' + data.actual_time_of_completion;
            let plEndDate = data.planned_date_to_complete + ' ' + data.planned_time_to_complete;
            let delayStart = new Date(acStartDate).getTime() - new Date(plStartDate).getTime();
            let delayEnd = new Date(acEndDate).getTime() - new Date(plEndDate).getTime();
            // totalPercent = ((actualPercent - delayPercent) / 100);
            if (delayStart > 0) {
              totalPercent = ((delayPercent) / 100);
            } else if (delayEnd > 0) {
              totalPercent = ((actualPercent - delayPercent) / 100);
            }
            // totalPercent = ((actualPercent - delayPercent) / 100);
          } else if (actualPercent == 100 && delayPercent > 0 && data.delay < 0) {
            totalPercent = ((actualPercent - delayPercent) / 100);
          } else if (actualPercent > 0 && delayPercent > 0) {
            let dates = [];
            dates.push(new Date(this.toDayDate));
            dates.push(new Date(this.actualEndDate));
            let toDayDate = new Date(this.toDayDate);
            let aeDate = new Date(this.actualEndDate);
            let asDate = new Date(this.actualEndDate);
            let maximumDate = new Date(Math.max.apply(null, dates));
            if (maximumDate.getTime() == toDayDate.getTime()) {
              let now: any = moment(toDayDate);
              let startDate: any = moment(this.actualStartDate);
              let endDate: any = moment(asDate);
              var percentage_complete = (endDate - startDate) / (now - startDate);
              var percentage_rounded = (Math.round(percentage_complete * 100) / 100);
              totalPercent = percentage_rounded;
            } else if (maximumDate.getTime() == aeDate.getTime()) {
              totalPercent = ((actualPercent + delayPercent) / (100 + delayPercent));
            }
          } else if (actualPercent == 0 && delayPercent > 0) {
            totalPercent = ((delayPercent) / (100));
          } else if (actualPercent > 0 && delayPercent == 0) {
            totalPercent = ((actualPercent) / (100));
          }

          let obj = {
            // for chart display
            id: data.id,
            text: data.text,
            start_date: start_Date,
            end_date: end_Date,
            parent: data.parent,
            type: data.type,
            actualProgress: actualPercent,
            delayProgress: delayPercent,
            progress: data.progress,
            slack: data.slack,
            open: data.open,
            delay: data.delay,
            planned_duration: data.planned_duration,
            critical: data.critical,
            status: data.status,
            actual_start_date: data.actual_start_date,
            actual_date_of_completion: data.actual_date_of_completion,
            planned_date_to_start: data.planned_date_to_start,
            planned_date_to_complete: data.planned_date_to_complete,
            elapsed_duration: data.elapsed_duration,
            actual_start_time: data.actual_start_time,
            actual_time_of_completion: data.actual_time_of_completion,
            planned_time_to_start: data.planned_time_to_start,
            planned_time_to_complete: data.planned_time_to_complete,
            issues_count: data.issue_count
          }
          this.task.push(obj);

          let linkObj = { source: data.source, target: data.target, type: 0 };
          if (linkObj.source) {
            let sourceArray = Array.isArray(linkObj.source);
            if (sourceArray) {
              linkObj.source.map(sourceData => {
                let sourceObj = { "source": sourceData, "target": data.target, "type": 0 }
                this.linkTask.push(sourceObj)
              })
            } else {
              let sourceObj = { "source": linkObj.source, "target": data.target, "type": 0 }
              this.linkTask.push(sourceObj)

            }

          } else {
            this.linkTask.push(linkObj)
          }
          // this.linkTask.push(linkObj);
        })


        gantt.clearAll();
        Promise.all([this.task, this.linkTask]).then(([data, links]) => {
          gantt.parse({ data, links });

        });
        this.setExpandCollapse(this.task);
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


    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.duration_unit = "minute";
    gantt.config.step = 60;
    gantt.config.scale_height = 50;
    gantt.config.bar_height = 20;
    gantt.config.row_height = 50;
    gantt.config.min_column_width = 20;
    gantt.config.drag_progress = false;
    gantt.config.drag_links = false;
    gantt.config.drag_resize = false;
    gantt.config.drag_move = false;
    gantt.config.link_wrapper_width = 30;
    //gantt.config.autosize = true;
    // gantt.config.scale_offset_minimal = true;
    gantt.config.auto_scheduling = true;
    gantt.config.open_tree_initially = false;

    gantt.plugins({
      tooltip: true
    });
    gantt.config.columns = [
      { name: "text", label: 'Task name', width: "*", tree: true, template: this.myFuncText },
      { name: "collapse", label: "<div id='toggleColumns' style='height:40px, align-items:center'>`<button style='height:40px; align-items:center; border:none; outline:none; float:right;' class='btn btn-sm text-light secondary-bg-color border-none-outline-none'>Create new Surprise Task</button>`</div>", width: "auto", align: "center" },
      { name: "start_date", label: "Actual/ Scheduled start date", hide: true, align: "center", width: 300, template: this.startDates },
      { name: "end_date", label: "Actual/ Scheduled end date", hide: true, align: "center", width: 300, template: this.endDates },
      { name: "duration", label: "Actual/ Planned duration", hide: true, align: "center", width: 300, template: this.duration }
    ];
    this.toggleColumns();

    if (this.scale == 'W') {
      gantt.config.scales = [
        {
          unit: "week", step: 1, format: function (date) {
            var monthStart = new Date(date);
            monthStart.setDate(1);
            var timeDiff = date.getTime() - monthStart.getTime()
            var weekIndex = timeDiff % (7 * 24 * 60 * 60 * 1000) == 0 ? Math.ceil(timeDiff / (7 * 24 * 60 * 60 * 1000)) + 1 : Math.ceil(timeDiff / (7 * 24 * 60 * 60 * 1000));
            var monthYear = gantt.date.date_to_str("%F %Y")(date)
            return 'Wk-' + weekIndex + ' ' + monthYear;
          }
        },
        { unit: "day", step: 1, format: "%j" }
      ]
    }
    else if (this.scale == 'M') {
      gantt.config.scales = [
        { unit: "month", step: 1, format: "%F, %Y" },
        {
          unit: "week", format: function (date) {
            var monthStart = new Date(date);
            monthStart.setDate(1);
            var timeDiff = date.getTime() - monthStart.getTime()
            var weekIndex = timeDiff % (7 * 24 * 60 * 60 * 1000) == 0 ? Math.ceil(timeDiff / (7 * 24 * 60 * 60 * 1000)) + 1 : Math.ceil(timeDiff / (7 * 24 * 60 * 60 * 1000));
            return 'Wk-' + weekIndex;
          }
        }
      ]
    }
    else {
      gantt.config.scales = [
        { unit: "month", step: 1, format: "%F, %Y" },
        { unit: "day", step: 1, format: "%j" }
      ];
    }

    gantt.attachEvent('onTaskClick', (id, e) => {
      var task = gantt.getTask(id);
      const isClickOnTaskText = e.target.classList.contains('taskClick');
      if (isClickOnTaskText) {
        this.dataService.passUnitTabs({ 'tab': 'task', 'data': { 'task_id': task.id } });
      }
      return true;
    });

    gantt.init(this.ganttContainer.nativeElement);

    gantt.templates.rightside_text = function (start, end, task) {
      if (task.critical) {
        return "<div class='fw-600 fs-12' style='margin:0px; color:#F65150'>" + task.text + "</div>";
      }
      else {
        if (task.status == 'COMPLETED') {
          return `<div class='text-blue fw-600 fs-12' style="margin:0px">${task.text}</div>`;
        } else if (task.status == 'NOT STARTED') {
          return `<div class='text-secondary fw-600 fs-12' style="margin:0px">${task.text}</div>`;
        } else if (task.status == 'IN-PROGRESS') {
          return `<div class='text-yellow fw-600 fs-12' style="margin:0px">${task.text}</div>`;
        } else if (task.status == 'DELAYED') {
          return `<div class='text-black fw-600 fs-12' style="margin:0px">${task.text}</div>`;
        } else if (task.status == null) {
          return `<div class='fw-600 fs-12' style="margin:0px; ">${task.text}</div>`;
        }
      }
      return '';
    };

    gantt.templates.task_text = (start, end, task) => {
      //   console.log(task.text, task.start_date, task.planned_date_to_start)
      //////////Phase2 Start///////////
      var task_timelines = [];

      task = this.parseTask(task);
      // if (!task.actual_start_date) {
      //   return '';
      // }
      task.actual_start_date = (task.actual_start_date) ? task.actual_start_date : '';
      // if (task.actual_datetime_start < task.planned_datetime_start && task.current_elapsed_end_date < task.planned_datetime_start) {
      //   task_timelines.push({
      //     'type': 'gain_on_start',
      //     'duration': gantt.calculateDuration(task.start_date, task.planned_datetime_start)
      //   });
      //   if (task.status == 'COMPLETED') {
      //     task_timelines.push({
      //       'type': 'gain_on_end',
      //       'duration': gantt.calculateDuration(task.planned_datetime_start, task.end_date)
      //     });
      //   }
      //   else {
      //     task_timelines.push({
      //       'type': 'remaining_on_end',
      //       'duration': gantt.calculateDuration(task.planned_datetime_start, task.end_date)
      //     });
      //   }
      // }
      // else if (task.actual_datetime_start < task.planned_datetime_start && (task.current_elapsed_end_date >= task.planned_datetime_start && task.current_elapsed_end_date <= task.planned_datetime_end)) {
      //   task_timelines.push({
      //     'type': 'gain_on_start',
      //     'duration': gantt.calculateDuration(task.start_date, task.planned_datetime_start)
      //   });
      //   task_timelines.push({
      //     'type': 'task_progress',
      //     'duration': gantt.calculateDuration(task.planned_datetime_start, task.current_elapsed_end_date)
      //   })
      //   if (task.status == 'COMPLETED') {
      //     task_timelines.push({
      //       'type': 'gain_on_end',
      //       'duration': gantt.calculateDuration(task.current_elapsed_end_date, task.end_date)
      //     });
      //   }
      //   else {
      //     task_timelines.push({
      //       'type': 'remaining_on_end',
      //       'duration': gantt.calculateDuration(task.current_elapsed_end_date, task.end_date)
      //     });
      //   }
      // }
      // else if (task.actual_datetime_start < task.planned_datetime_start && task.current_elapsed_end_date > task.planned_datetime_end) {
      //   task_timelines.push({
      //     'type': 'gain_on_start',
      //     'duration': gantt.calculateDuration(task.start_date, task.planned_datetime_start)
      //   });
      //   task_timelines.push({
      //     'type': 'task_progress',
      //     'duration': gantt.calculateDuration(task.planned_datetime_start, task.planned_datetime_end)
      //   })
      //   task_timelines.push({
      //     'type': 'delay_on_end',
      //     'duration': gantt.calculateDuration(task.planned_datetime_end, task.end_date)
      //   })
      // }
      // else if ((task.actual_datetime_start >= task.planned_datetime_start && task.actual_datetime_start <= task.planned_datetime_end) && (task.current_elapsed_end_date <= task.planned_datetime_end && task.current_elapsed_end_date >= task.planned_datetime_start)) {
      //   task_timelines.push({
      //     'type': 'delay_on_start',
      //     'duration': gantt.calculateDuration(task.start_date, task.actual_datetime_start)
      //   })
      //   task_timelines.push({
      //     'type': 'task_progress',
      //     'duration': gantt.calculateDuration(task.actual_datetime_start, task.current_elapsed_end_date)
      //   })
      //   if (task.status == 'COMPLETED') {
      //     task_timelines.push({
      //       'type': 'gain_on_end',
      //       'duration': gantt.calculateDuration(task.current_elapsed_end_date, task.end_date)
      //     });
      //   }
      //   else {
      //     task_timelines.push({
      //       'type': 'remaining_on_end',
      //       'duration': gantt.calculateDuration(task.current_elapsed_end_date, task.end_date)
      //     });
      //   }
      // }
      // else if ((task.actual_datetime_start >= task.planned_datetime_start && task.actual_datetime_start <= task.planned_datetime_end) && task.current_elapsed_end_date > task.planned_datetime_end) {
      //   task_timelines.push({
      //     'type': 'delay_on_start',
      //     'duration': gantt.calculateDuration(task.start_date, task.actual_datetime_start)
      //   })
      //   task_timelines.push({
      //     'type': 'task_progress',
      //     'duration': gantt.calculateDuration(task.actual_datetime_start, task.planned_datetime_end)
      //   })
      //   task_timelines.push({
      //     'type': 'delay_on_end',
      //     'duration': gantt.calculateDuration(task.planned_datetime_end, task.end_date)
      //   })
      // }
      // else if (task.actual_datetime_start > task.planned_datetime_end && task.current_elapsed_end_date > task.planned_datetime_end) {
      //   task_timelines.push({
      //     'type': 'delay_on_start',
      //     'duration': gantt.calculateDuration(task.start_date, task.actual_datetime_start)
      //   })
      //   task_timelines.push({
      //     'type': 'delay_on_end',
      //     'duration': gantt.calculateDuration(task.actual_datetime_start, task.end_date)
      //   })
      // }
      if (task.status === 'NOT STARTED') {
        task_timelines.push({
          'type': 'yet_to_start',
          'duration': gantt.calculateDuration(task.planned_datetime_start, task.planned_datetime_end)
        })
        if (task.slack === 0) {
          if (task.delay > 0) {
            let d: any = (moment(task.planned_datetime_end).add(Math.round(task.delay), 'hours'));
            let end_value = new Date(d);
            task_timelines.push({
              'type': 'delay',
              'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
            })
          }
        }
        else if (task.slack > 0) {
          if (task.delay === 0) {
            let d: any = (moment(task.planned_datetime_end).add(Math.round(task.slack), 'hours'));
            let end_value = new Date(d);
            task_timelines.push({
              'type': 'slack',
              'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
            })
          }
          else if (task.delay > 0 && task.delay >= task.slack) {
            let d: any = (moment(task.planned_datetime_end).add(Math.round(task.delay), 'hours'));
            let end_value = new Date(d);
            task_timelines.push({
              'type': 'delay',
              'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
            })
          }
          else if (task.delay > 0 && task.delay < task.slack) {
            let i: any = (moment(task.planned_datetime_end).add(Math.round(task.delay), 'hours'));
            let end_value = new Date(i);
            task_timelines.push({
              'type': 'delay',
              'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
            })
            let d: any = (moment(end_value).add(Math.round(task.slack - task.delay), 'hours'));
            let two_end_value = new Date(d);
            task_timelines.push({
              'type': 'slack',
              'duration': gantt.calculateDuration(end_value, two_end_value)
            })
          }
        }
        else {
          if (task.delay > 0) {
            let d: any = (moment(task.planned_datetime_end).add(Math.round(task.delay), 'hours'));
            let end_value = new Date(d);
            task_timelines.push({
              'type': 'delay',
              'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
            })
          }
        }
      }
      else if ((task.status === 'IN-PROGRESS' || task.status === 'DELAYED')) {
        task_timelines.push({
          'type': 'in_progress',
          'duration': gantt.calculateDuration(start, task.planned_datetime_end)
        })
        if (task.slack === 0) {
          if (task.delay > 0) {
            let d: any = (moment(task.planned_datetime_end).add(Math.round(task.delay), 'hours'));
            let end_value = new Date(d);
            task_timelines.push({
              'type': 'delay',
              'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
            })
          }
        }
        else if (task.slack > 0) {
          if (task.delay === 0) {
            let d: any = (moment(task.planned_datetime_end).add(Math.round(task.slack), 'hours'));
            let end_value = new Date(d);
            task_timelines.push({
              'type': 'slack',
              'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
            })
          }
          else if (task.delay > 0 && (task.delay >= task.slack)) {
            let d: any = (moment(task.planned_datetime_end).add(Math.round(task.delay), 'hours'));
            let end_value = new Date(d);
            task_timelines.push({
              'type': 'delay',
              'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
            })
          }
          else if (task.delay > 0 && (task.delay < task.slack)) {
            let i: any = (moment(task.planned_datetime_end).add(Math.round(task.delay), 'hours'));
            let end_value = new Date(i);
            task_timelines.push({
              'type': 'delay',
              'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
            })
            let d: any = moment(end_value).add(Math.round(task.slack - task.delay), 'hours');
            let two_end_value = new Date(d);
            task_timelines.push({
              'type': 'slack',
              'duration': gantt.calculateDuration(end_value, two_end_value)
            })
          }
          else if (task.delay < 0) {
            let i: any = (moment(task.planned_datetime_end).add(Math.round(task.slack), 'hours'));
            let end_value = new Date(i);
            task_timelines.push({
              'type': 'slack',
              'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
            })
          }
        }
      }
      else if (task.status === 'COMPLETED') {
        if (task.delay > 0) {
          task_timelines.push({
            'type': 'completed',
            'duration': gantt.calculateDuration(start, task.planned_datetime_end)
          })
          let d: any = moment(task.planned_datetime_end).add(Math.round(task.delay), 'hours');
          let end_value = new Date(d);
          task_timelines.push({
            'type': 'delay',
            'duration': gantt.calculateDuration(task.planned_datetime_end, end_value)
          })
        }
        else if (task.delay < 0) {
          let d: any = moment(task.planned_datetime_end).subtract(Math.round(-(task.delay)), 'hours');
          let end_value = new Date(d);
          if (end_value.getTime() > task.planned_datetime_start.getTime()) {
            task_timelines.push({
              'type': 'completed',
              'duration': gantt.calculateDuration(start, end_value)
            })
            let i: any = moment(end_value).add(Math.round(-(task.delay)), 'hours');
            let two_end_value = new Date(i);
            task_timelines.push({
              'type': 'gain',
              'duration': gantt.calculateDuration(end_value, two_end_value)
            })
          }
          else {
            task_timelines.push({
              'type': 'completed',
              'duration': gantt.calculateDuration(task.actual_datetime_start, task.actual_datetime_end)
            })
            task_timelines.push({
              'type': 'gain',
              'duration': gantt.calculateDuration(task.actual_datetime_end, task.planned_datetime_end)
            })
            // task_timelines.push({
            //   'type': 'completed',
            //   'duration': gantt.calculateDuration(task.planned_datetime_start, task.planned_datetime_end)
            // })
          }
        }
        else {
          task_timelines.push({
            'type': 'completed',
            'duration': gantt.calculateDuration(start, task.planned_datetime_end)
          })
        }
      }

      var task_bar = "";
      var total_duration = 0;
      task_timelines.forEach((t) => {
        total_duration += t.duration;
      })
      for (var i = 0; i < task_timelines.length; i++) {
        task_bar += this.renderTask(task_timelines[i], total_duration);
      }
      return task_bar;
    };

    gantt.templates.grid_grid_data = function (start, end, task) {
      if (task.status == 'COMPLETED')
        return "updColor";
      return '';
    };

    gantt.templates.task_class = (start, end, task) => {

      return '';
    };

    gantt.templates.grid_row_class = function (start, end, task) {
      if (task.highlight) {
        return "highlighted_task";
      }
      if (task.critical && task.status != 'COMPLETED') {
        return "criticalPath1_color"
      }
      return "";
    };

    gantt.templates.grid_folder = function (item) {
      return '';
      // return "<div class='gantt_tree_icon gantt_folder_" +
      // (item.$open ? "open" : "closed") + "'></div>";
    };


    gantt.templates.grid_file = function (item) {
      return '';
      // return "<div class='gantt_tree_icon gantt_file'></div>";
    };


    gantt.templates.tooltip_text = function (start, end, task) {

      let startDateTime = new Date(task.actual_start_date);

      let startDate;
      if (task.actual_start_date == null) {
        startDate = null;
      } else {
        let date: any = startDateTime.getDate();
        if (date < 10) {
          date = '' + 0 + date;
        }
        let month: any = (startDateTime.getMonth() + 1);
        if (month < 10) {
          month = '' + 0 + month;
        }
        startDate = date + "." + month + "." + startDateTime.getFullYear();
      }

      let endDateTime = new Date(task.actual_date_of_completion);
      let expDate;
      if (task.actual_date_of_completion == null) {
        expDate = null;
      } else {
        let date: any = endDateTime.getDate();
        if (date < 10) {
          date = '' + 0 + date;
        }
        let month: any = (endDateTime.getMonth() + 1);
        if (month < 10) {
          month = '' + 0 + month;
        }
        expDate = date + "." + month + "." + endDateTime.getFullYear();
      }
      let taskName;
      if (task.status == 'COMPLETED') {
        taskName = "<div class='fw-600 fs-12' style='margin:0px; color:#006699'>" + task.text + '</div>'
      } else if (task.status == 'NOT STARTED') {
        taskName = "<div class='fw-600 fs-12' style='margin:0px; color:#6D7885'>" + task.text + '</div>'
      } else if (task.status == 'IN-PROGRESS') {
        taskName = "<div class='fw-600 fs-12' style='margin:0px; color:#FFBC00'>" + task.text + '</div>'
      } else if (task.status == 'DELAYED') {
        taskName = "<div class='fw-600 fs-12' style='margin:0px; color:#1E3044'>" + task.text + '</div>'
      } else {
        taskName = "<div class='fw-600 fs-12' style='margin:0px;'>" + task.text + '</div>'
      }

      let taskStatus;
      // if (task.critical) {
      taskStatus = "<div class='fw-600 fs-12' style='margin:0px; color:#F65150'>" + task.type + '</div>'
      // }

      let gainDelay;
      let gainDelayTitle;
      if (task.delay < 0) {
        gainDelay = "<div class='fw-600 fs-12' style='margin:0px; color:#33A437'>" + task.delay + '</div>'
        gainDelayTitle = "<p class='fw-600 fs-12' style='margin:0px; color:#33A437'>Gain</p>"
      } else {
        gainDelay = "<div class='fw-600 fs-12' style='margin:0px; color:#F65150'>" + task.delay + '</div>';
        gainDelayTitle = "<p class='fw-600 fs-12' style='margin:0px; color:#F65150'>Delay</p>";

      }

      let taslSlack;
      if (task.slack < 0) {
        taslSlack = "<div class='fw-600 fs-12' style='margin:0px; color:#F65150'>" + task.slack + '</div>'
      } else {
        taslSlack = "<div class='fw-600 fs-12' style='margin:0px; color:#006699'>" + task.slack + '</div>'

      }
      if (task.actual_start_time == null) {
        task.actual_start_time = 'yet to start';
        actual_start = '';
        var actual_start = 'yet to start';
      }
      else {
        actual_start = task.actual_start_date
      }
      if (task.actual_time_of_completion == null) {
        task.actual_time_of_completion = 'yet to finish';
        actual_end = '';
        var actual_end = 'yet to finish';
      }
      else {
        actual_end = task.actual_date_of_completion
      }
      return `
      <p class='fw-600 fs-12'>ID:${task.id}</p>

      <p class='fw-600 fs-12' style="margin:0px; color:#006699">Actual Start / Planned Start</p>

      <div class='fw-600 fs-12 text_wrap pb-2'><span style='color:#006699;'> ${actual_start} ${task.actual_start_time} / </span><span style='color:#6D7885;'>${task.planned_date_to_start} ${task.planned_time_to_start}</span></div>

      <p class='fw-600 fs-12' style="margin:0px; color:#006699">Actual End / Planned End</p>
      <div class='fw-600 fs-12 text_wrap pb-2'><span style='color:#006699;'> ${actual_end} ${task.actual_time_of_completion} / </span><span style='color:#6D7885;'>${task.planned_date_to_complete} ${task.planned_time_to_complete}</span></div>


      <p class='fw-600 fs-12' style="margin:0px; color:#006699">Actual duration / Planned Duration</p>
      <div class='fw-600 fs-12 text_wrap pb-2'><span style='color:#006699;'> ${task.elapsed_duration} / </span><span style='color:#6D7885;'>${task.planned_duration}</span></div>
      <div class='d-flex w-100'>
      <div class='w-50'>
     ${gainDelayTitle}
      ${gainDelay}
      </div>
      <div class='w-50'>
     <p class='fw-600 fs-12' style="margin:0px; color:#006699">Slack</p>
      <div>${taslSlack}</div>
      </div>
      </div>

      `
      // return `
      //       <p class='fw-600 fs-12' style="margin:0px; color:#006699">task name :<small>${task.text}</small> </p>
      //       <p style="margin:0px; font-size:12px; color:#006699"><small><b>Actual Start / Actual End Date</b></small> </p>
      //       <p style="margin:0px; font-size:12px"><b><span style=" color:#006699">${startDate}</span> / <span style=" color:#6D7885">${expDate}</span></b></p>
      //       <p style="margin:0px; font-size:12px; color:#006699"><small><b>Actual  Start / Actual End time</b></small></p>
      //       <p style="margin:0px; font-size:12px"><b><span style=" color:#006699">${task.actual_start_time}</span> / <span style=" color:#6D7885">${task.actual_time_of_completion}</span></b></p>
      //       <hr style="width:100%;  color:#000000", size="3",>
      //       <p style="color:red;margin:0px">if there any delay will display here</p>`
    };
  }

  setExpandCollapse(tasks) {
    tasks.forEach(function (task) {
      if (task.open) {
        gantt.open(task.id);
      } else {
        gantt.close(task.id);
      }
    });
  }

  toggleColumns() {
    $(document).on('click', '#toggleColumns', () => {
      this.showSurpriseTask.emit(true);
      // if (this.show) {
      //   $(document).ready(() => {
      //     $('#toggleColumns>img').attr("src", "/assets/icons/expand.png");
      //   });
      // }
      // else {
      //   $(document).ready(() => {
      //     $('#toggleColumns>img').attr("src", "/assets/icons/collapse.png");
      //   });
      // }
      // this.showHideColumn('start_date', this.show);
      // this.showHideColumn('end_date', this.show);
      // this.showHideColumn('duration', this.show);
      // console.log(this.show);
      // this.show = !this.show;
      // gantt.render();
    })
  }

  showHideColumn(columnName, show) {
    if (show) {
      gantt.config.columns.find((col) => { return col.name === columnName }).hide = false;
    }
    else {
      gantt.config.columns.find((col) => { return col.name === columnName }).hide = true;
    }
  }

  parseTask(t) {
    let task = Object.assign({}, t)
    task.planned_datetime_start = new Date(task.planned_date_to_start + ' ' + task.planned_time_to_start);
    task.actual_datetime_start = new Date(task.actual_start_date + ' ' + task.actual_start_time);
    task.planned_datetime_end = new Date(task.planned_date_to_complete + " " + task.planned_time_to_complete);
    // task.planned_datetime_end = new Date(moment((task.planned_date_to_complete + ' ' + task.planned_time_to_complete)).add(task.slack + (task.delay > 0 ? task.delay : 0), 'hours') as any);
    task.actual_datetime_end = new Date(task.actual_date_of_completion + ' ' + task.actual_time_of_completion);
    task.elapsed_duration = this.parseDuration(task.elapsed_duration);
    task.planned_duration = this.parseDuration(task.planned_duration);
    // task.slack = this.parseDuration(task.slack);
    if (task.actual_start_date) {
      task.current_elapsed_end_date = gantt.calculateEndDate(task.actual_datetime_start, task.elapsed_duration)
    }
    return task;
  }

  renderTask(task, total_duration) {
    let relWidth = null;
    relWidth = (task.duration / total_duration) * 100;
    var cssClass = "custom_progress ";
    if (task.type == 'yet_to_start') {
      cssClass += "yet_to_start ";
    }
    else if (task.type == 'in_progress') {
      cssClass += "in_progress ";
    }
    else if (task.type == 'completed') {
      cssClass += "completed ";
    }
    else if (task.type == 'delay') {
      cssClass += "delay ";
    }
    else if (task.type == 'gain') {
      cssClass += "gain ";
    }
    else if (task.type == 'slack') {
      cssClass += "slack ";
    }
    return "<div class='" + cssClass + "' style='width:" + relWidth + "%'>" + "</div>";
  }

  newDateSelection() {
    let todayDate = new Date();
    let date;
    if (todayDate.getDate() < 10) {
      date = '0' + todayDate.getDate();
    } else {
      date = todayDate.getDate();
    }
    let month;
    if (todayDate.getMonth() + 1 < 10) {
      let newMonth = todayDate.getMonth() + 1
      month = '0' + newMonth;
    } else {
      month = todayDate.getMonth() + 1
    }
    let hours;
    if (todayDate.getHours() < 10) {
      hours = '0' + todayDate.getHours();
    } else {
      hours = todayDate.getHours()
    }
    let minutes;
    if (todayDate.getMinutes() < 10) {
      minutes = '0' + todayDate.getMinutes();
    } else {
      minutes = todayDate.getMinutes();
    }
    let sec;
    if (todayDate.getSeconds() < 10) {
      sec = '0' + todayDate.getSeconds();
    } else {
      sec = todayDate.getSeconds()
    }
    let newDate = todayDate.getFullYear() + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + sec;
    this.toDayDate = newDate;
  }

  getMonthStartDate(date) {
    var monthStart = new Date(date);
    monthStart.setDate(1);
    return monthStart;
  }

  myFuncText(task) {

    let text;
    if (task.text.length > 50) {
      text = task.text.slice(0, 49) + '...';
      // text = task.text;
    } else {
      text = task.text;
    }
    // if (task.status == 'COMPLETED') {
    //   // return "<div class='fw-600 fs-12 task_completed task_wrap'>" + text + "</div>";
    //   if (task.issues_count > 0) {
    //     return "<div class='fw-600 fs-12 d-flex w-100  justify-content-between align-items-center'>" + "<div class='task_completed task_wrap w-75'>" + text + "</div>" + "<div class='w-25 float-right'>" + '<i class="fas fa-exclamation-triangle text-danger float-right pointer"' +
    //       '></i>' + "</div>" + "</div>";
    //   } else {
    //     return "<div class='fw-600 fs-12 task_completed task_wrap'>" + text + "</div>";
    //   }
    // }
    // else {
    //   if (task.critical) {
    //     if (task.issues_count > 0) {
    //       return "<div class='fw-600 fs-12 d-flex w-100  justify-content-between align-items-center'>" + "<div class='task_cp1 task_wrap w-75'>" + text + "</div>" + "<div class='w-25 float-right'>" + '<i class="fas fa-exclamation-triangle text-danger float-right pointer"' +
    //         '></i>' + "</div>" + "</div>";
    //     } else {
    //       return "<div class='fw-600 fs-12 task_cp1 task_wrap'>" + text + "</div>";

    //     }
    //   }
    //   return '';
    // }
    if (task.critical) {
      return "<div class='fw-600 fs-12 d-flex justify-content-between align-items-center'>" + "<div class='task_cp1  taskClick  cursor task_wrap'>" + text + "</div>" + "</div>";
    } else {
      if (task.status == 'COMPLETED') {
        return "<div class='fw-600 fs-12 taskClick task_completed cursor task_wrap'>" + text + "</div>";
      } else if (task.status == 'NOT STARTED') {
        return "<div class='fw-600 fs-12 taskClick task_pending cursor task_wrap'>" + text + "</div>";
      } else if (task.status == 'IN-PROGRESS') {
        return "<div class='fw-600 fs-12 taskClick task_in_progress cursor task_wrap'>" + text + "</div>";
      } else if (task.status == 'DELAYED') {
        return "<div class='fw-600 fs-12 d-flex  justify-content-between align-items-center'>" + "<div class='task_delayed taskClick  cursor task_wrap'>" + text + "</div>" + "</div>";
      } else {
        return "<div class='fw-600 fs-12 task_wrap cursor taskClick'>" + text + "</div>";
      }
    }

  };

  startDates(task) {
    return "<div class='fw-600 fs-12 text_wrap'>" + "<div style='color:#006699;'>" + task.actual_start_date + ' / ' + "</div>" + "<div style='color:#6D7885;'>" + task.planned_date_to_start + "</div>" + "</div>"
  }

  endDates(task) {
    return "<div class='fw-600 fs-12 text_wrap'>" + "<div style='color:#006699;'>" + task.actual_date_of_completion + ' / ' + "</div>" + "<div style='color:#6D7885;'>" + task.planned_date_to_complete + "</div>" + "</div>"
  }
  duration(task) {
    return "<div class='fw-600 fs-12 text_wrap'>" + "<div style='color:#006699;'>" + task.elapsed_duration + ' / \n' + "</div>" + "<div style='color:#6D7885;'>" + task.elapsed_duration + "</div>" + "</div>"
  }

  formatDate(date) {
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    var seconds = date.getSeconds().toString().padStart(2, '0');

    var formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
  }
  parseDuration(durationString) {
    const daysRegex = /(\d+)\s*day(s)?/;
    const hoursRegex = /(\d+)\s*hr(s)?/;
    const minutesRegex = /(\d+)\s*min(s)?/;

    let totalMinutes = 0;

    const daysMatch = daysRegex.exec(durationString);
    const hoursMatch = hoursRegex.exec(durationString);
    const minutesMatch = minutesRegex.exec(durationString);

    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      totalMinutes += days * 24 * 60;
    }

    if (hoursMatch) {
      const hours = parseInt(hoursMatch[1]);
      totalMinutes += hours * 60;
    }

    if (minutesMatch) {
      const minutes = parseInt(minutesMatch[1]);
      totalMinutes += minutes;
    }

    return totalMinutes;
  }

  slackValue(task) {
    if (task.slack <= 0) {
      return "<span class='fw-600 fs-12' style='color:#F65150;'>" + task.slack + "</span>"
    } else if (task.slack === null) {
      return "<span class='fw-600 fs-12' style='color:#F65150;'>" + task.slack + "</span>"
    } else if (task.slack > 0) {
      return "<span class='fw-600 fs-12' style='color:#006699;'>" + task.slack + "</span>"
    }
    return '';
  }

  // ()=>{
  // this.button = document.getElementById('surpriseTask');

  // button?.addEventListener('click', function handleClick(event) {
  //   console.log('button clicked');
  //   console.log(event);
  //   console.log(event.target);
  // });
  // }

}
