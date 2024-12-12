import { Component, HostListener, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { DataService } from 'src/shared/services/data.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { Router } from '@angular/router';
import { IssuesService } from 'src/app/services/issues.service';
import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';
declare var $: any;

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  ColumnMode = ColumnMode;
  close_btn = 'assets/images/close_black.png'
  rowsLimit: any;
  totalNotificationCount: number = 0;
  unreadcount: number = 0;
  notificationCategories: any[] = []
  selectedCategory: any;
  recordColumns: any[] = []
  msg: string;
  notificationData: any;
  unitsList: any;
  selectedUnit_id: any;
  muteAllNotification: any;
  notificationLength: any;
  activePage: number = 1;
  screenHeight: number = 0;
  noOfRows: number;
  startNotification: any;
  endNotification: any;
  selectedCategoryName: any;
  tempNotificationData: { [x: string]: unknown; }[];
  allUsersList: any;
  constructor(private router: Router, private activityService: ActivityMonitorService, private issuesService: IssuesService, private commonService: CommonService, private notificationService: NotificationService, private dataService: DataService, private snackbarService: SnackbarService) { }
  ngOnInit(): void {
    var w = window.innerWidth;
    var h = window.innerHeight;
    this.rowsLimit = Math.floor(h / 100);
    this.selectedCategory = this.notificationCategories[0]?.id
    this.getUnitsList()
    this.issuesService.getUserList().subscribe({
      next: (data: any) => {
        this.allUsersList = data;
        // this.users_list.forEach((val, ind) => {
        //   this.emailIds.push(val.email)
        // })
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getUnitsList() {
    this.dataService.passSpinnerFlag(true, true)
    this.commonService.getUnitsList().subscribe({
      next: (data: any) => {
        if (data?.length > 0) {
          this.unitsList = data.sort((a, b) => (a.order < b.order) ? -1 : 1);
          if (!sessionStorage.getItem('storedUnitId')) {
            this.selectedUnit_id = this.unitsList?.[0].id
          }
          else {
            this.selectedUnit_id = sessionStorage.getItem('storedUnitId')
          }
          this.getNotificationCategories(true)
          this.getTasksIssueOverviewData()

        }
        else {
          this.dataService.passSpinnerFlag(false, true);
          this.unitsList = []
        }
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getSelectedCategory(notification_category) {
    this.selectedCategory = notification_category.id
    this.selectedCategoryName = notification_category.name
    // sessionStorage.setItem('selected_notification_category', this.selectedCategory)
    this.getNotificationData()
  }
  getNotificationCategories(boolean_value) {
    this.getTasksIssueOverviewData()
    this.dataService.passSpinnerFlag(true, true);
    if (sessionStorage.getItem('storedUnitId') != this.selectedUnit_id) {
      sessionStorage.removeItem('notificationCategory')
    }
    sessionStorage.setItem('storedUnitId', this.selectedUnit_id)
    this.notificationService.getNotificationCategories(this.selectedUnit_id).subscribe({
      next: (response: any) => {
        if (response?.length > 0) {
          let muteAllNotification = []
          this.totalNotificationCount = 0
          this.unreadcount = 0
          this.notificationCategories = response
          console.log(this.notificationCategories)
          this.notificationCategories.forEach((data) => {
            this.totalNotificationCount += data?.notification_count
            this.unreadcount += data?.unread_notification_count
            if (data?.notification_is_muted) {
              muteAllNotification.push(data?.notification_is_muted)
            }
          })
          sessionStorage.setItem('unreadNotificationCount', JSON.stringify(this.unreadcount))
          window.dispatchEvent(new CustomEvent('unreadNotificationCount'))
          if (muteAllNotification.length == this.notificationCategories.length) {
            this.muteAllNotification = true
          } else {
            this.muteAllNotification = false
          }
          if (!sessionStorage.getItem('notificationCategory')) {
            this.selectedCategory = response[0]?.id
          }
          else {
            this.selectedCategory = sessionStorage.getItem('notificationCategory')
          }
          if (boolean_value == true) {
            this.getNotificationData()
          }
          else {
            this.dataService.passSpinnerFlag(false, true);
          }
        }
        else {
          this.notificationCategories = []
          this.notificationData = []
          this.dataService.passSpinnerFlag(false, true);
        }
      },
      error: () => {
        sessionStorage.setItem('unreadNotificationCount', JSON.stringify(0))
        window.dispatchEvent(new CustomEvent('unreadNotificationCount'))
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getNotificationData() {
    sessionStorage.setItem('notificationCategory', this.selectedCategory)
    this.dataService.passSpinnerFlag(true, true);
    this.notificationService.getNotificationData(this.selectedCategory, this.selectedUnit_id).subscribe({
      next: (response) => {
        let arrayData = response;
        this.notificationLength = 0;
        this.screenHeight = 0;
        this.notificationLength = arrayData['notifications'].length;
        this.tempNotificationData = [];
        this.notificationData = [];
        this.tempNotificationData = arrayData['notifications']
        this.tempNotificationData.forEach((ele, i) => {
          let array: any = ele.description
          this.tempNotificationData[i].description = array?.split(' ')
        })
        this.tempNotificationData.sort((date1, date2) => { return new Date(date2.date + ' ' + date2.time).getTime() - new Date(date1.date + ' ' + date1.time).getTime() })
        this.getScreenSize();
        // this.notificationCategories = Object.keys(response)
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  deleteNotification(notification_id) {
    this.dataService.passSpinnerFlag(true, true);
    this.notificationService.deleteNotifications(this.selectedUnit_id, notification_id).subscribe({
      next: (response) => {
        this.getNotificationCategories(true)
        this.dataService.passSpinnerFlag(false, true);
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  deleteAllNotification() {
    this.dataService.passSpinnerFlag(true, true);
    this.notificationService.deleteAllNotifications(this.selectedUnit_id, this.selectedCategory).subscribe({
      next: (response) => {
        this.getNotificationCategories(true)
        this.dataService.passSpinnerFlag(false, true);
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  muteNotifications(notification_access_id, is_muted) {
    let notification_is_muted: boolean;
    if (is_muted == true) {
      notification_is_muted = false
    }
    else {
      notification_is_muted = true
    }
    this.dataService.passSpinnerFlag(true, true);
    this.notificationService.muteNotifications(this.selectedUnit_id, notification_access_id, notification_is_muted).subscribe({
      next: (response) => {
        this.getNotificationCategories(false)
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  returnFraming(text) {
    let text1 = text.slice(0, 1);
    if (text1 == '$' || text1 == '%') {
      let text2 = text.slice(1, (text.length - 1))
      if (text1 == '$') {
        let index = this.allUsersList.findIndex(ele => { return ele.id == text2 });
        if (index >= 0) {
          return '@' + this.allUsersList[index].name;
        } else {
          let returnText = text2.split('_').join(' ')
          return '@' + returnText;
        }
      } else if (text1 == '%') {
        let returnText = text2.split('_').join(' ')
        return returnText;

      }
    } else {
      return text
    }
  }
  styleForNameAndId(text) {
    let text1 = text.slice(0, 1);
    if (text1 == '$' || text1 == '%') {
      if (text1 == '$') {
        return { 'color': '#006699' };
      } else {
        return { 'color': 'red', 'border-bottom': '1px solid red', 'cursor': 'pointer' }
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    let screenSize = window.innerHeight;
    if (this.screenHeight != screenSize) {
      this.screenHeight = screenSize;
      let ss = (this.screenHeight - 225) / 60;
      this.noOfRows = Math.round(ss);
      this.displayActivePage(this.activePage, true);
    }


  }
  displayActivePage(activePageNumber: number, value?: boolean) {
    this.activePage = activePageNumber
    let start;
    let end;
    this.notificationData = [];
    if (this.activePage > 0) {
      start = Number(this.noOfRows * (this.activePage - 1));
      end = Number(this.noOfRows * this.activePage);
      let arrayData = this.tempNotificationData.slice(start, end);
      let transformData = {};
      const mapped = Object.keys(arrayData).map(key => ({ name: key, value: arrayData[key] }));
      arrayData.forEach(item => {
        let dateKey: any = item.date;
        if (transformData[dateKey]) {
          transformData[dateKey].push(item);
        } else {
          transformData[dateKey] = [item]
        }
      })
      // }
      let transformDataArray = Object.entries(transformData).map(([date, items]) => ({
        [date]: items
      }))
      this.notificationData = [...transformDataArray]
    }
  }

  updateTheReadStatusForNotification(obj) {
    if (!obj.viewed) {
      this.screenHeight = 0;
      this.dataService.passSpinnerFlag(false, true);
      this.notificationService.readNotifications(this.selectedUnit_id, obj.id).subscribe(data => {
        this.getNotificationCategories(true)
        this.dataService.passSpinnerFlag(false, true);
      },
        error => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        });
    }
  }
  readAllNotifications() {
    this.screenHeight = 0;
    this.dataService.passSpinnerFlag(false, true);
    this.notificationService.readAllNotifications(this.selectedUnit_id, this.selectedCategory).subscribe(data => {
      this.getNotificationCategories(true)
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      });
  }
  totalTAdelayHrs


  getTasksIssueOverviewData() {
    this.activityService
      .getTaskIssueOverViewData(this.selectedUnit_id)
      .subscribe((data: any) => {
        const TAdelay = data?.task_overview?.total_ta_delay_hrs
        const hours = Math.floor(TAdelay);
        const minutes = Math.round((TAdelay - hours) * 60);
        const seconds = Math.round(((TAdelay - hours) * 60 - minutes) * 60);
        this.totalTAdelayHrs = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      },
        error => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        });
  }


  navigateToTask(row, text) {
    let text1 = text.slice(0, 1);
    if (text1 == '%') {
      this.updateTheReadStatusForNotification(row)
      if (row.entity == 'issue') {
        if (text.toLowerCase().includes('issue')) {
          sessionStorage.setItem('storeSeletedPage', 'allIsuues')
          // sessionStorage.setItem('issueCommentId', row.metadata.issue_id)
          sessionStorage.setItem('navigatingToIssue', JSON.stringify([{ unit_id: row.metadata.unit_id, department_id: row.metadata.department_id, issue_number: row.metadata.issue_id }]));
          this.router.navigateByUrl('schedule-control/issues');
        } else {
          sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_id, department_id: row.metadata.department_id, task_id: row.metadata.task_id }]));
          sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
          sessionStorage.setItem('selectedTab', 'task')
          this.router.navigateByUrl('schedule-control/unit');
        }
      } else if (row.entity == 'issue_comment') {
        if (text.toLowerCase().includes('comment') || text.toLowerCase().includes('issue')) {
          sessionStorage.setItem('storeSeletedPage', 'allIsuues')
          sessionStorage.setItem('issueCommentId', row.metadata.comment_id)
          sessionStorage.setItem('navigatingToIssue', JSON.stringify([{ unit_id: row.metadata.unit_id, department_id: row.metadata.department_id, issue_number: row.metadata.issue_id }]));
          this.router.navigateByUrl('schedule-control/issues');
        } else {
          sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_id, department_id: row.metadata.department_id, task_id: row.metadata.task_id }]));
          sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
          sessionStorage.setItem('selectedTab', 'task')
          this.router.navigateByUrl('schedule-control/unit');
        }
      } else if (row.entity == 'task') {
        sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_id, department_id: row.metadata.department_id, task_id: row.metadata.task_id }]));
        sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
        sessionStorage.setItem('selectedTab', 'task')
        this.router.navigateByUrl('schedule-control/unit');
      } else if (row.entity == 'critical_path_task') {
        sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_id, department_id: row.metadata.department_id, task_id: row.metadata.task_id }]));
        sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
        sessionStorage.setItem('selectedTab', 'task')
        this.router.navigateByUrl('schedule-control/unit');
      } else if (row.entity == 'comment' || row.entity == 'task_comment') {
        sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_id, department_id: row.metadata.department_id, task_id: row.metadata.task_id }]));
        sessionStorage.setItem('taskCommentId', JSON.stringify(row.metadata.comment_id))
        sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
        sessionStorage.setItem('selectedTab', 'task')
        this.router.navigateByUrl('schedule-control/unit');
      } else if (row.entity == 'surprise_task') {
        sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_id, department_id: row.metadata.department_id, task_id: row.metadata.task_id }]));
        sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
        sessionStorage.setItem('selectedTab', 'task')
        this.router.navigateByUrl('schedule-control/unit');
      } else if (row.entity == 'recommendation' || row.entity == 'recommendation_tagging') {
        if (text.toLowerCase().includes('recommendation')) {
          sessionStorage.setItem('navigatingToInspection', JSON.stringify({ unit_id: row.metadata.unit_id, equipment_id: row.metadata.equipment_id, equipment_category_id: row.metadata.equipment_category_id, recommendation_id: row.metadata.recommendation_id }));
          sessionStorage.setItem('storeUnit', row.metadata.unit_id)
          sessionStorage.setItem('selectedTabInspection', 'recommendation')
          this.router.navigateByUrl('schedule-control/inspection');
        } else {
          sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_name, equipment_id: row.metadata.equipment_name }]));
          sessionStorage.setItem('type', 'recommendation')
          sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
          sessionStorage.setItem('selectedTab', 'equipment')
          this.router.navigateByUrl('schedule-control/unit');
        }

      } else if (row.entity == 'observation') {
        sessionStorage.setItem('navigatingToObservation', JSON.stringify({ unit_id: row.metadata.unit_id, equipment: row.metadata.equipment_id, equipment_category: row.metadata.equipment_category_id, observation_id: row.metadata.observation_id }));
        sessionStorage.setItem('storeUnit', row.metadata.unit_id)
        sessionStorage.setItem('selectedTabInspection', 'observation')
        this.router.navigateByUrl('schedule-control/inspection');
      }else if (row.entity == 'recommendation_comment') {
        if (text.toLowerCase().includes('recommendation')) {
          sessionStorage.setItem('navigatingToInspection', JSON.stringify({ unit_id: row.metadata.unit_id, equipment_id: row.metadata.equipment_id, equipment_category_id: row.metadata.equipment_category_id, recommendation_id: row.metadata.recommendation_id }));
          sessionStorage.setItem('storeUnit', row.metadata.unit_id)
          sessionStorage.setItem('selectedTabInspection', 'recommendation')
          this.router.navigateByUrl('schedule-control/inspection');
        } else {
          sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_name, equipment_id: row.metadata.equipment_name }]));
          sessionStorage.setItem('type', 'recommendation')
          sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
          sessionStorage.setItem('selectedTab', 'equipment')
          this.router.navigateByUrl('schedule-control/unit');
        }
      }else if (row.entity == 'checklist') {
        sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_name, equipment_id: row.metadata.equipment_name }]));
        sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
        sessionStorage.setItem('checklist', 'checklist')
        sessionStorage.setItem('selectedTab', 'equipment')
        this.router.navigateByUrl('schedule-control/unit');
      }else if (row.entity == 'report') {
        sessionStorage.setItem('reportSelectedUnit', JSON.stringify(row.metadata.unit_id))
        this.router.navigateByUrl('schedule-control/reports');
      }

    }


  }
  ngOnDestroy(): void {
    sessionStorage.removeItem('notificationCategory')
  }
}


@Pipe({
  name: 'todayYesterday',
  pure: true,
})
export class FindTodayAndYesterdayPipe implements PipeTransform {
  locale: string;
  today = new Date().toJSON().slice(0, 10);
  date = new Date();
  curr = this.date.getDate();

  transform(value: any, ...args: any) {
    this.date.setDate(this.curr - 1);
    let mm = this.date.getMonth() + 1;
    let dd = this.date.getDate();
    let yyyy = this.date.getFullYear();
    let yesterday = yyyy + "-" + this.leadingZero(mm) + "-" + this.leadingZero(dd)
    let val = value;
    if (val == this.today) {
      val = 'TODAY';
    }
    if (val == yesterday) {
      val = 'YESTERDAY';
    }
    return val;
  }
  leadingZero(value) {
    if (value < 10) {
      return "0" + value.toString();
    }
    return value.toString();
  }

  ngAfterViewChecked(): void {
    $('[data-toggle="tooltip"]').tooltip();
  }
}
