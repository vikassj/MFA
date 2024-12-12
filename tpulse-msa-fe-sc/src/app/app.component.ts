import { Component, HostListener, OnInit } from '@angular/core';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { IssuesService } from './shared/services/issues.service';
import { GlobalResultsPopupService } from './shared/services/global-results-popup.service';
import { NotificationService } from './shared/services/notification.service';
import { Router } from '@angular/router';
import { OverviewService } from './shared/services/overview.service';
import { CommonService } from './shared/services/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'schedule-control';
  msg: string;
  webSocketUrl: string | null;
  globalResultsPopupVisible: boolean;
  @HostListener('document:click', ['$event']) onClick(ev: Event) {
    if (
      this.globalResultsPopupVisible &&
      ev.target['id'] != 'globalSearchInput' &&
      ev.target['id'] != 'filteredList'
    ) {
      setTimeout(() => {
        this.globalResultsPopupService.closePopup();
      }, 100);
    }
  }
  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private issuesService: IssuesService,
    private globalResultsPopupService: GlobalResultsPopupService,
    private notificationService: NotificationService,
    private commonService: CommonService
  ) {
    this.globalResultsPopupService.isPopupVisible$.subscribe((isVisible) => {
      this.globalResultsPopupVisible = isVisible;
    });
    window.addEventListener("unitchanged", (evt) => {
      this.getUnreadCount();
    })
  }
  ngOnInit() {
    // this.webSocketUrl = sessionStorage.getItem('wsUrl');
    this.webSocketUrl = 'wss://tpulse-mfa-fe-api.detectpl.com/';
    // setInterval(() => {
    //   this.addNotification('hello');
    //   }, 10000);
    this.getLoggedUser();
    this.getUnitsList();
    if (sessionStorage.getItem('selectedIssue')) {
      var selectedIssue = JSON.parse(sessionStorage.getItem('selectedIssue'));
      var navigateToIssue = {
        unit_id: selectedIssue.unit,
        department_id: selectedIssue.department,
        issue_number: selectedIssue.id,
      };
      sessionStorage.setItem(
        'navigatingToIssue',
        JSON.stringify(navigateToIssue)
      );
      sessionStorage.setItem('storeSeletedPage', 'allIsuues');
      this.router.navigateByUrl('/schedule-control/' + selectedIssue.page);
    } else if (sessionStorage.getItem('selectedObsRec')) {
      var selectedObsRec = JSON.parse(sessionStorage.getItem('selectedObsRec'));
      if (selectedObsRec.tab == 'recommendations') {
        var navigatingToRecommendation = {
          unit_id: selectedObsRec.unit,
          equipment_category: selectedObsRec.equipment_category,
          equipment: selectedObsRec.equipment,
          recommendation_id: selectedObsRec.id,
        };
        sessionStorage.setItem('navigatingToInspection', JSON.stringify(navigatingToRecommendation));
      } else {
        var navigatingToObservation = {
          unit_id: selectedObsRec.unit,
          equipment_category: selectedObsRec.equipment_category,
          equipment: selectedObsRec.equipment,
          observation_id: selectedObsRec.id,
        };
        sessionStorage.setItem('navigatingToObservation', JSON.stringify(navigatingToObservation));
      }
      this.router.navigateByUrl('/schedule-control/' + selectedObsRec.page);
    } else if (sessionStorage.getItem('selectedTask')) {
      var selectedTask = JSON.parse(sessionStorage.getItem('selectedTask'));
      var navigatingToTask = [
        {
          task_id: selectedTask.id,
        },
      ];
      sessionStorage.setItem(
        'navigatingToTask',
        JSON.stringify(navigatingToTask)
      );
      this.router.navigateByUrl('/schedule-control/' + selectedTask.page);
    }
  }

  getUnitsList() {
    // this.dataService.passSpinnerFlag(true, true)
    this.commonService.getUnitsList().subscribe({
      next: (data: any) => {
        sessionStorage.setItem('units', JSON.stringify(data))
      },
      error: () => {
        // this.dataService.passSpinnerFlag(false, true);
        // this.msg = 'Error occured. Please try again.';
        // this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    })
  }


  getLoggedUser() {
    // this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getLoggedUser().subscribe({
      next: (data) => {
        this.getNotificationData(data);
      },
      error: () => {
        // this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      },
    });
  }
  getNotificationData(data) {
    webSocket(
      this.webSocketUrl +
        'api/1/schedule_control/ws/notifications/' +
        data?.user_id
    ).subscribe((dataFromServer: any) => {
      if (dataFromServer?.message) {
        this.addNotification(dataFromServer.message);
      }
    });
  }
  addNotification(data) {
    console.log('WS', data);
    this.msg = data;
    var x: any = document.getElementById('snackbarTop');
    x.className = 'show';
    setTimeout(function () {
      x.className = x.className.replace('show', '');
    }, 4000);
    // this.snackbarService.showNotification(data,true);
  }

  getUnreadCount(){
    this.notificationService.getNotificationCategories(sessionStorage.getItem('storedUnitId')).subscribe((response: any) =>{
      if (response?.length > 0) {
        let unreadcount = 0
        response.forEach((data) => {
          unreadcount += data?.unread_notification_count
        })
        sessionStorage.setItem('unreadNotificationCount', JSON.stringify(unreadcount));
        sessionStorage.setItem('notificationObj', JSON.stringify(response))
        window.dispatchEvent(new CustomEvent('unreadNotificationCount'))
      }
    },
    error => {
      sessionStorage.setItem('unreadNotificationCount', JSON.stringify(0))
      window.dispatchEvent(new CustomEvent('unreadNotificationCount'))
    },
    () => {
    }
  )
  }
}
