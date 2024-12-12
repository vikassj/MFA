import {
  Component,
  HostListener,
  OnInit,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
declare var $: any;

import { SafetyAndSurveillanceCommonService } from 'src/app/shared/service/common.service';
import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {
  msg: string = '';
  activePage: number = 1;
  selectedUnitName: any = 'tagging_chat_Activity';
  close_btn = 'assets/images/close_black.png';
  mute_icon = 'assets/images/volume_off_black.png';
  status: any;
  isChecked: boolean = false;
  shortName: string = '';
  unreadcount: any;
  notificationsTaskView: any;
  notificationsTaskViewTemp: any;
  notificationLength: any;
  listOfIssue: any;
  surpriseTaskTotifications: any;
  surpriseTaskTotificationsTemp: any = [];
  unReadSurpriseTask = [];
  nonDeletedArray = [];
  surpriseTaskLength = [];
  observationsName: any;
  observationsName1: any;
  observationsName2: any;
  observationsId: any;
  observationsId2: any;
  observationsId3: any;
  displayArray = [];
  notifications: any;
  noOfRows: number;
  arrayLength: any;
  del: any;
  screenHeight: number = 0;
  plant_name: any;

  startNotification: number;
  endNotification: number;
  notificationCategories: any[] = [];
  selectedCategoryName: any;
  selectedCategory: any;
  plantModules:any[] = []
  selectedPlantDetails:any;
  constructor(
    private router: Router,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    private SafetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,
    private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService
  ) {
    // window.onresize = this.displayWindowSize();
    let plantModules = JSON.parse(sessionStorage.getItem('plantModules'))
    this.plantModules = plantModules.filter((val,ind) => {
      return val.key == 'live_streaming'
    })
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)

    window.addEventListener('in-page-obs-nav', (evt: CustomEvent) => {
      this.safetyAndSurveillanceDataService.passGlobalSearch(evt.detail)   
    })

  }

  /**
   * get screen size on resize event of window.
   */
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    let screenSize = window.innerHeight;
    if (this.screenHeight != screenSize) {
      this.screenHeight = screenSize;
      let ss = (this.screenHeight - 225) / 70;
      this.noOfRows = Math.round(ss);
      this.displayActivePage(this.activePage, true);
    }
  }

  ngOnInit() {
    if(this.plantModules?.[0]?.key == 'live_streaming' && this.selectedPlantDetails?.[0]?.access_type.includes('permit_notification')){
      this.notificationCategories = [
        {
          id: 1,
          name: 'Observations',
          key: 'observation',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_obs_notification_count',
        },
        {
          id: 2,
          name: 'Actions',
          key: 'action',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_action_notification_count',
        },
        {
          id: 3,
          name: 'Streaming',
          key: 'streaming',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_stream_notification_count',
        },
        {
          id: 4,
          name: 'Permit',
          key: 'permit',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_permit_notification_count',
        },
        {
          id:5,
          name: 'Incident',
          key: 'incident',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_incident_notification_count',
        }
      ];
    }
    else if(this.plantModules?.[0]?.key == 'live_streaming'){
      this.notificationCategories = [
        {
          id: 1,
          name: 'Observations',
          key: 'observation',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_obs_notification_count',
        },
        {
          id: 2,
          name: 'Actions',
          key: 'action',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_action_notification_count',
        },
        {
          id: 3,
          name: 'Streaming',
          key: 'streaming',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_stream_notification_count',
        },
        {
          id:4,
          name: 'Incident',
          key: 'incident',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_incident_notification_count',
        }
      ];
    }
    else if(this.selectedPlantDetails?.[0]?.access_type.includes('permit_notification')){
      this.notificationCategories = [
        {
          id: 1,
          name: 'Observations',
          key: 'observation',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_obs_notification_count',
        },
        {
          id: 2,
          name: 'Actions',
          key: 'action',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_action_notification_count',
        },
        {
          id: 4,
          name: 'Permit',
          key: 'permit',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_permit_notification_count',
        },
        {
          id:5,
          name: 'Incident',
          key: 'incident',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_incident_notification_count',
        }
      ];
    }
    else{
      this.notificationCategories = [
        {
          id: 1,
          name: 'Observations',
          key: 'observation',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_obs_notification_count',
        },
        {
          id: 2,
          name: 'Actions',
          key: 'action',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_action_notification_count',
        },
        {
          id:3,
          name: 'Incident',
          key: 'incident',
          notification_is_muted: true,
          notification_count: 0,
          unread_notification_count: 0,
          unread: 'unread_incident_notification_count',
        }
      ];
    }
    this.selectedCategoryName = this.notificationCategories[0]['key'];
    this.dataService.passSpinnerFlag(true, true);
    setTimeout(() => {
      this.getAllNotifications();
      this.unreadNotification();
      // this. muteNotification()
      this.mute_Notification();
      // this.getSurpriseTaskTotification();
      this.getavailableObservations();

      // this.unreadCount()

      this.plant_name = sessionStorage.getItem('plantName');
    }, 1000);
  }
  //select category
  getSelectedCategory(notificationCategory) {
    this.selectedCategory = notificationCategory.id;
    this.selectedCategoryName = notificationCategory.key;
    this.activePage = 1;
    this.startNotification = 0;
    this.endNotification = 0;
    this.getAllNotifications();
  }

  /**
   * get all the notifications
   */
  getAllNotifications() {
    this.SafetyAndSurveillanceCommonService.getNotifications(
      1,
      3,
      this.selectedCategoryName
    ).subscribe(
      (data) => {
        this.arrayLength = data;
        // this.observationsName = data['0']['notifications'].triggered_by_name
        // const mapped = Object.keys(this.arrayLength).map(key => ({type: key, value: this.arrayLength[key]}));
        this.notificationLength = data['pagination']?.total;
        this.screenHeight = 0;
        this.getScreenSize();
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }

  /**
   * displaying active page in pagination logic.
   * @param activePageNumber active page
   * @param value
   */
  displayActivePage(activePageNumber: number, value?: boolean) {
    this.activePage = activePageNumber > 0 ? activePageNumber : 1;
    let start;
    let end;
    if (this.activePage > 0) {
      start = Number(this.noOfRows * (this.activePage - 1)) + 1;
      end = Number(this.noOfRows * this.activePage);
      if (
        (this.startNotification != start && this.endNotification != end) ||
        value
      ) {
        this.startNotification = start;
        this.endNotification = end;
        if (start >= 0 && end >= 0) {
          this.SafetyAndSurveillanceCommonService.getNotifications(
            start,
            end,
            this.selectedCategoryName
          ).subscribe((data) => {
            // this.surpriseTaskTotificationsTemp = data;
            let arrayData = data;

            this.notifications = data['notifications'];

            this.notifications?.forEach((ele, i) => {
              let array = ele.notification_framing;
              this.notifications[i].notification_framing = array.split(' ');
            });
            // let addData = {}
            // arrayData['notification'].forEach(val =>{
            //   let value = val.notification_framing.split('$')
            //   if(addData[value]){
            //     addData[value].push(val)
            //   }
            //   else{
            //     addData[value] = [val]
            //   }
            // })
            // let addDataArray = Object.entries(addData).map(([name, items])=>({
            //   [name] : items
            // }))
            // this.surpriseTaskTotificationsTemp = [...addDataArray]
            //   data['notifications'].forEach(x =>  {
            //     x.notification_framing = x.notification_framing ? '' || 'XXX' : 'MyVAL'
            //  });

            let transformData = {};
            const mapped = Object.keys(arrayData).map((key) => ({
              name: key,
              value: arrayData[key],
            }));
            arrayData['notifications']?.forEach((item) => {
              let dateKey = item?.date_time?.slice(0, 10);
              if (transformData[dateKey]) {
                transformData[dateKey]?.push(item);
              } else {
                transformData[dateKey] = [item];
              }
            });
            // }
            let transformDataArray = Object.entries(transformData).map(
              ([date, items]) => ({
                [date]: items,
              })
            );
            this.surpriseTaskTotificationsTemp = [...transformDataArray];
          });
        }
      }
    }
  }

  /**
   * update read or unread status for a notification.
   */
  updateTheReadStatusForNotification(obj) {
    if (!obj.is_read) {
      this.screenHeight = 0;
      let notificationId = {
        notification_id: obj.id,
        object_type: this.selectedCategoryName,
      };
      this.dataService.passSpinnerFlag(false, true);
      this.SafetyAndSurveillanceCommonService.readNotifications(
        notificationId
      ).subscribe(
        (data) => {
          this.getAllNotifications();
          this.unreadNotification();
          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    }
  }
  unreadNotification() {
    this.SafetyAndSurveillanceCommonService.unreadNotifications().subscribe(
      (data) => {
        this.unreadcount = data['unread_notifications_count'];
        for (let [key, value] of Object.entries(data)) {
          this.notificationCategories.forEach((val, ind) => {
            if (val.unread == key) {
              this.notificationCategories[ind]['unread_notification_count'] =
                value;
            }
          });
        }
      }
    );
  }

  /**
   * delete a selected notification.
   */
  deleteNotification(id, notification_status) {
    this.screenHeight = 0;
    let deleted = confirm('Press this confirm button!');
    if (deleted == true) {
      let notificationId = {
        notification_id: id,
        object_type: this.selectedCategoryName,
      };
      this.dataService.passSpinnerFlag(false, true);
      this.SafetyAndSurveillanceCommonService.deleteNotifications(
        notificationId
      ).subscribe(
        (data) => {
          setTimeout(() => {
            this.getAllNotifications();
          }, 1000);

          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    }
  }
  muteNotification(status, notification_type, type_status) {
    if (status == 'muteAll') {
      this.isChecked = !this.isChecked;
      let muteStatus = { mute_status: this.isChecked };
      this.muteNotifications(muteStatus);
    } else if (status == 'muteIndividual') {
      type_status = !type_status;
      let muteStatus = {
        mute_status:false,
        notification_type: notification_type,
        type_status: type_status,
      };
      this.muteNotifications(muteStatus);
    }
  }
  muteNotifications(muteStatus) {
    this.SafetyAndSurveillanceCommonService.muteNotifications(muteStatus).subscribe({
      next: (result) => {
        this.mute_Notification();
      },
      error: () => {
        this.isChecked = !this.isChecked;
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {},
    });
  }
  mute_Notification() {
    this.SafetyAndSurveillanceCommonService.mute_Notification().subscribe(
      (data) => {
        this.isChecked = data['mute_status'];
        for (let [key, value] of Object.entries(data)) {
          this.notificationCategories.forEach((val, ind) => {
            if (val.key == key) {
              this.notificationCategories[ind]['notification_is_muted'] = value;
            }
          });
        }
      }
    );
  }

  deleteAllNotification() {
    // this.SafetyAndSurveillanceCommonService.getNotifications(1, this.notificationLength).subscribe(data => {
    //   let arrayData = data
    //   this.notifications = data['notifications']
    //   this.nonDeletedArray = data['notifications'].map((v) => console.log(v.id))
    // })
    this.screenHeight = 0;
    let deleted = confirm('Press this confirm button!');
    if (deleted == true) {
      let notificationId = { object_type: this.selectedCategoryName };
      this.dataService.passSpinnerFlag(false, true);
      this.SafetyAndSurveillanceCommonService.deleteNotifications(
        notificationId
      ).subscribe(
        (data) => {
          this.getAllNotifications();
          this.unreadNotification();
          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    }
  }

/**
 * mark all notifications as read logic.
 */
  readAllNotification() {
    this.screenHeight = 0;
    let notificationId = { object_type: this.selectedCategoryName };

    this.SafetyAndSurveillanceCommonService.readNotifications(
      notificationId
    ).subscribe((data) => {
      this.getAllNotifications();
      this.unreadNotification();
    });
  }

  /**
   * navigate to the issue in the selected notification
   */
  navigateToIssues(row) {
    this.updateTheReadStatusForNotification(row.id);
    sessionStorage.setItem(
      'issueFilter',
      JSON.stringify([
        row.unit,
        row.equipment_category,
        row.department,
        row.equipment,
        row.id,
        false,
        row.issue_id,
      ])
    );
    this.router.navigateByUrl('/activity-monitoring/issues');
  }

  getavailableObservations() {
    this.dataService.passSpinnerFlag(true, true);

    this.SafetyAndSurveillanceCommonService.getavailableObservations().subscribe(
      (data) => {
        this.listOfIssue = data;

        if (this.listOfIssue?.length > 0) {
          this.listOfIssue?.sort((id1, id2) => {
            return id2?.id - id1?.id;
          });
        }

        this.dataService.passSpinnerFlag(false, true);
      },

      (error) => {
        this.dataService.passSpinnerFlag(false, true);

        this.msg = 'Error occured. Please try again.';

        this.snackbarService.show(this.msg, true, false, false, false);
      },

      () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    );
  }

   /**
   * navigate to the task in the selected notification
   */
  navigateToTask(row, text) {
    let text1 = text.slice(0, 1);
    if (text1 == '%') {
      this.updateTheReadStatusForNotification(row);
      if (row.object_type === 'observation') {
        let index = this.listOfIssue.findIndex((obs) => {
          return obs.id == row.object_type_id;
        });
        let obj = {
          unit: this.listOfIssue[index].unit,
          id: row.object_type_id,
          zone:row?.zone,
          date: this.listOfIssue[index].date,
          fault_status: this.listOfIssue[index].fault_status,
        };
        let availableUnits = JSON.parse(sessionStorage.getItem('unitDetails'));
        let selectedUnitDetails: any = availableUnits.find(
          (unit) => unit.unitName === row.unit
        );
        sessionStorage.setItem('selectedUnit', obj.unit);
        sessionStorage.setItem('searchObservation', JSON.stringify(obj));
        sessionStorage.setItem('manually-selected-units',JSON.stringify([row?.unit]))
        sessionStorage.removeItem('manuallySelectedPermits')
        sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
        this.router.navigateByUrl('/safety-and-surveillance/observations');
      } else if (row.object_type === 'action') {
        sessionStorage.setItem('ActionId', JSON.stringify(row.object_type_id));
        this.router.navigateByUrl('/safety-and-surveillance/actions');
      } else if (row.object_type === 'incident') {
        sessionStorage.setItem('searchIncident', row.object_type_id);
        this.router.navigateByUrl('/safety-and-surveillance/incidents');
      } else if (row.object_type === 'streaming') {
        sessionStorage.setItem('searchStreaming', JSON.stringify(row));
        this.router.navigateByUrl('/live-streaming/dashboard');
      }
      else if (row.object_type === 'permit') {
        sessionStorage.setItem('searchStreaming', JSON.stringify(row));
        this.router.navigateByUrl('/live-streaming/dashboard');
      }
    }
  }

  navigate(level, text, val) {
    let text1 = text.slice(0, 1);
    switch (level) {
      case 1: {
        if (text1 == '$' || text1 == '%') {
          let text2 = text.slice(1, text.length - 1);
          if (text1 == '$') {
            return '@' + text2;
          }
        }
      }
      case 2: {
        if (text1 == '$' || text1 == '%') {
          let text2 = text.slice(1, text.length - 1);
          if (text1 == '%') {
            return text2;
          }
        }
      }
      default: {
        return text;
      }
    }
  }

  returnFraming(text) {
    let text1 = text.slice(0, 1);
    let textEnding = text.slice(-1)
    if (text1 == '$'|| text1 == '%') {
      let text2 = text.slice(1, text.length);
      if((text1 == '$' && textEnding == '$') || (text1 == '%' && textEnding == '%')){
        text2 = text.slice(1, text.length - 1);
      }
      if (text1 == '$') {
        return '@' + text2.split('_').join(' ');
      } else if (text1 == '%') {
        return text2;
      }
    } else {
        if(textEnding == '$'){
          let str = text.slice(0, text.length - 1);
          return str
        }
      return text;
    }
  }

  styleForNameAndId(text ,notification_framing) {
    let nameStartIndex ;
    let nameEndIndex;
    let textIndex;
    for (let i = 0; i < notification_framing.length; i++) {
      let str = notification_framing[i];
      if(notification_framing[i]===text){
        textIndex = i;
      }
      if (str.startsWith('$')){
        nameStartIndex = i;
      }
      if(str.endsWith('$')){
        nameEndIndex = i;
      }
    }
    if(textIndex > nameStartIndex && textIndex < nameEndIndex){
      text = text + '$'
    }
    let textEnd = text.slice(text.length-1, text.length)
    let perfectText:string = ''
    if(textEnd == ','){
      let text1 = text.slice(0, text.length-1)
      perfectText = text1.slice(0, 1);
    }
    else{
      perfectText = text.slice(0, 1);
    }
    if (perfectText == '$' || perfectText == '%' || textEnd == '$') {
      if (perfectText == '$' || textEnd == '$') {
        return { color: '#006699', 'text-transform': 'capitalize' };
      } else {
        return {
          color: 'red',
          cursor: 'pointer',
        };
      }
    }
  }


  navigateToObsAndAction() {}
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
    let yesterday =
      yyyy + '-' + this.leadingZero(mm) + '-' + this.leadingZero(dd);
    let val = value;
    if (val == this.today) {
      val = 'TODAY';
    }else if (val == yesterday) {
      val = 'YESTERDAY';
    }else{
      val = moment(value).format('DD-MMM-YYYY')
    }
    return val;
  }
  leadingZero(value) {
    if (value < 10) {
      return '0' + value.toString();
    }
    return value.toString();
  }

  ngAfterViewChecked(): void {
    $('[data-toggle="tooltip"]').tooltip();
  }
}
