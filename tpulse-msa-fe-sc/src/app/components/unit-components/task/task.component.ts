import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as panzoom from 'src/assets/js/imageZoom.js';
import { v4 as uuidv4 } from 'uuid';
import { Router, RouterStateSnapshot } from '@angular/router';

import { CommonService } from '../../../../shared/services/common.service';
import { DataService } from '../../../../shared/services/data.service';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { TaskService } from 'src/app/services/task.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { IssuesService } from 'src/app/services/issues.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';
declare var $: any;
@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
  @ViewChild('myTable', { static: false }) table: any;
  @ViewChild('progressModalClose') progressModalClose;
  @ViewChild('taskCompleteModalClose') taskCompleteModalClose;
  ColumnMode = ColumnMode;
  msg: string = '';
  @Input() selectedUnit: any;
  @Input() equipmentCategory: any;
  @Input() department: any;
  @Input() allTasks: boolean = false;
  @Input() routingData: any;
  unit: string = '';
  @Output() taggedPersons: EventEmitter<any> = new EventEmitter();
  @Output() showTaskDetailPage: EventEmitter<any> = new EventEmitter()
  equipment: string = '';
  equipmentId: number = null;
  taskData: any[] = [];
  taskRows: any[] = [];
  selectedTaskRow: any[] = [];
  selectedTask: any;
  issues: any[] = [];
  selectedTaskMediaData: any[] = [];
  selectedTaskTimelapseData: any[] = [];
  selectedMedia: any = {};
  currentIndex: number = 0;
  nextBtn: boolean = false;
  prevBtn: boolean = false;
  readonly IMAGE = 'Image';
  readonly VIDEO = 'Video';
  selectedImageVideoButton = this.IMAGE;
  selectedMode: boolean = false;
  zoom: any;
  sendObservationData: any = {
    showAnimation: true,
    imageData: null,
    emailID: '',
    emailIDList: []
  };
  actionPoints: any[] = [];
  selectAnnotation: any = {};
  canvasHeight: number = 0;
  canvasWidth: number = 0;
  canvasRatio: number = 0;
  bufferMargin: number = 0;
  trigger: number = 0;
  showAll: boolean = false;
  allImages: boolean = false;
  showAllImages: boolean = true;
  issuePopupShow: boolean = false;
  imageLeftArrow = "assets/images/arrow-left.png";
  imageRightArrow = "assets/images/arrow-right.png";
  issueId: any;
  groupExpansionDefaultStatus = true;
  rowDataNotAvailable = false

  /////Phase 3///////
  selectedTab: string = 'visual';
  recommendationCreated: boolean = false;
  predecessors: any[] = [];
  successors: any[] = [];
  openedPopup: string = '';
  newTaskProgress: number;
  users: any[];
  mannualDateTimeEntry: boolean = false;
  date: any;
  time: any;
  totalPermitStatus: any[] = []
  permitStatus: any;
  Status: any;

  availableChecklists: any[] = [];
  selectedChecklistId: number = null;
  selectedChecklist: any = {};
  selectedChecklistColumns: any[] = [];
  selectedChecklistRows: any[] = [];
  userDepartment: any;
  file: any;

  taskHistory;
  allUsersList
  loginUserEmail
  loginUserId
  task_id: any;
  selectedTime: any;
  url;
  format;
  constructor(private modalService: NgbModal, private dataService: DataService, private snackbarService: SnackbarService, private taskService: TaskService, private commonService: CommonService, private changeDetector: ChangeDetectorRef, private router: Router, private issuesService: IssuesService, private activityMonitorService: ActivityMonitorService) {
    this.webSocketUrl = sessionStorage.getItem('wsUrl');
    window.addEventListener('user-tagged-task', (evt: any) => {
      // this.taggeduserFromComments = []
      this.firstEmail = evt.detail
      this.addTaggedUser();
    })
  }

  ngOnInit() {
    this.myWebSocket = webSocket(this.webSocketUrl + this.socket);
    let filters = sessionStorage.getItem('taskFilter');
    // this.getStatusForOnlinePersons();
    this.myWebSocket.subscribe(dataFromServer => {
      this.ActivePersons = dataFromServer;
    });
    this.id = setInterval(() => {
      // this.getStatusForOnlinePersons();
    }, 5000);
    this.getUserDepartment();

    this.issuesService.getUserList().subscribe({
      next: (data: any) => {
        this.allUsersList = data;
        console.log('allUsersList ', this.allUsersList)
        this.allUsersList.forEach(element => {
          let userMail = sessionStorage.getItem('user-email');
          this.loginUserEmail = userMail
          if (element.email == userMail) {
            this.loginUserId = element.id
          }
        })
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

  ngOnChanges(changes: SimpleChanges): void {
    this.unit = this.selectedUnit.name;
    let isUnitChanged = changes['unit'] &&
      changes['unit'].currentValue != changes['unit'].previousValue;
    let isDepartmentChanged = changes['department'] &&
      changes['department'].currentValue != changes['department'].previousValue;
    let isEquipmentCategoryChanged = changes['equipmentCategory'] &&
      changes['equipmentCategory'].currentValue != changes['equipmentCategory'].previousValue;
    let isRoutingData = changes['routingData'] &&
      changes['routingData'].currentValue != changes['routingData'].previousValue;
    if (isUnitChanged || isDepartmentChanged || isEquipmentCategoryChanged || isRoutingData) {
      this.predecessors = [];
      this.successors = [];
      this.issuePopupShow = false;
      this.selectedMode = false;
      this.showAll = false;
      this.allImages = false;
      this.showAllImages = true;
      this.selectedImageVideoButton = this.IMAGE;
      this.dataService.passSpinnerFlag(true, true);
      if (this.routingData?.task_id) {
        if (this.task_id != this.routingData?.task_id) {
          this.task_id = this.routingData?.task_id
          this.getPermitStatus()
        }
      }
      else {
        this.getPermitStatus()
        this.getPrimaryTask();
      }
      this.changeDetector.detectChanges();
    }
  }


  getSelectedTab(tabName: string) {
    this.selectedTab = tabName;
  }

  open(content: any, modalClass?: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', windowClass: modalClass === null ? 'mediumModal' : modalClass }).result.then((result) => {

    });
  }


  showPopup(popup) {
    setTimeout(() => {        //Set time out is necessary here because close event of popup is getting triggered before it so popup is not opening
      if (popup == 'predecessors') {
        this.openedPopup = 'predecessors';
      }
      else if (popup == 'successors') {
        this.openedPopup = 'successors';
      }
    }, 100);
  }

  hidePopup() {
    this.openedPopup = '';

  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('.popups') && this.openedPopup != '') {
      this.hidePopup();
    }
  }

  switchTask(direction) {
    if (direction == 'next') {
      if (this.successors.length == 1) {
        this.getPrimaryTask(this.successors[0].id);
      }
      else if (this.successors.length > 1) {
        this.showPopup('successors');
      }
    }
    else if (direction == 'previous') {
      if (this.predecessors.length == 1) {
        this.getPrimaryTask(this.predecessors[0].id);
      }
      else if (this.predecessors.length > 1) {
        this.showPopup('predecessors');
      }
    }
  }

  getEquipmentChecklist() {
    this.availableChecklists = [];
    this.activityMonitorService.getEquipmentChecklistGroupings(this.equipmentId).subscribe((res: any) => {
      if (res) {
        this.availableChecklists = res;
        this.selectedChecklistId = (res.length > 0) ? ((res[0].checklists.length > 0) ? res[0].checklists[0].id : null) : null;
        if (this.selectedChecklistId != null) {
          this.getSelectedChecklistDetails();
        }
        else {
          this.dataService.passSpinnerFlag(false, true);
        }
      }
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Unable to fetch equipment checklists.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  getSelectedChecklistDetails() {
    this.selectedChecklist = {};
    this.selectedChecklistColumns = [];
    this.selectedChecklistRows = [];
    this.activityMonitorService.getEquipmentChecklistData(this.selectedChecklistId).subscribe((res: any) => {
      if (res) {
        this.selectedChecklist = res[0];
        this.selectedChecklistColumns = this.selectedChecklist.columns.sort((a, b) => a.order - b.order);
        let rows = this.selectedChecklist.rows;
        let keys = Object.keys(rows).map(item => Number(item));
        keys.sort(function (a, b) {
          return a - b;
        });
        keys.forEach(key => {
          let row = {};
          this.selectedChecklistColumns.forEach(column => {
            row[column.id] = rows[key].find(e => e.checklist_column_id === column.id).value;
            row['master_data'] = rows[key];
          });
          this.selectedChecklistRows.push(row);
        });
        this.selectedChecklistRows = [...this.selectedChecklistRows];
        this.dataService.passSpinnerFlag(false, true);
      }
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Unable to fetch equipment data.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  onSelectChecklist(event) {
    this.dataService.passSpinnerFlag(true, true);
    this.selectedChecklistId = Number(event);
    this.getSelectedChecklistDetails();
  }

  onChecklistSave(event) {
    this.dataService.passSpinnerFlag(true, true);
    let data = [];
    event.forEach(item => {
      item.master_data.forEach(element => {
        let obj = {};
        obj['checklist_id'] = element.checklist_value_id;
        obj['value'] = item[element.checklist_column_id];
        data.push(obj);
      });
    });
    this.activityMonitorService.saveEquipmentChecklistData(data).subscribe((res) => {
      if (res) {
        this.getSelectedChecklistDetails();
        this.snackbarService.show('Checklist saved successfully.', false, false, false, false);
      }
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Unable to save equipment checklist data.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  onChecklistSubmit(event) {
    this.dataService.passSpinnerFlag(true, true);
    this.activityMonitorService.submitEquipmentChecklistData(this.selectedChecklistId, event).subscribe((res) => {
      if (res) {
        this.getSelectedChecklistDetails();
        this.snackbarService.show('Checklist submitted successfully.', false, false, false, false);
      }
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Unable to submit equipment checklist.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  getPredecessorSuccessorTasks() {
    this.successors = [];
    this.predecessors = [];
    this.taskService.getPredecessorSuccessorTasks(this.selectedTask?.id).subscribe((res) => {
      if (res) {
        this.predecessors = res['predecessor_tasks'];
        this.successors = res['successor_tasks'];
      }
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Unable to fetch Predecessor tasks and Successor tasks!';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }


  getPrimaryTask(task_id?) {
    this.dataService.passSpinnerFlag(true, true);
    console.log(this.selectedUnit?.id, this.equipmentCategory?.id, this.department?.id)
    this.taskService.getPrimaryTask(this.selectedUnit?.id, this.equipmentCategory?.id, this.department?.id, task_id).subscribe(
      (data: any) => {


        this.selectedTask = Array.isArray(data) ? { ...data[0] } : { ...data };
        this.permitStatus = this.selectedTask?.task_permit
        this.newTaskProgress = this.selectedTask?.actual_percentage_completed
        if (this.selectedTask?.id) {
          this.equipment = this.selectedTask.equipment;
          this.equipmentId = this.selectedTask.equipment_id;
          this.selectedImageVideoButton = this.IMAGE;
          this.selectedMode = false;
          this.showAll = false;
          this.allImages = false;
          this.showAllImages = true;
          this.selectedImageVideoButton = this.IMAGE;
          if (this.equipmentId) {
            this.getEquipmentChecklist();
          }
          this.getPredecessorSuccessorTasks();
          this.taggedPersonsList(this.selectedTask);
          this.getIssuesForTask();
          this.getActualDuration()
        }
        else {
          this.selectedTask = {};
          this.issues = [];
          this.equipment = '';
          this.equipmentId = null;
          this.selectedTaskMediaData = [];
          this.selectedMedia = {};
          this.currentIndex = 0;
          this.dataService.passSpinnerFlag(false, true);
          this.snackbarService.show("Tasks are not available for selected Unit/Equipment/Department", true, false, false, false);
        }
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    );
  }
  getMediaData() {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getMediaData(this.unit, this.equipmentCategory.name, this.selectedTask?.equipment, this.selectedTask?.id, this.department?.id, this.selectedImageVideoButton?.toLowerCase()).subscribe(
      (data: any) => {
        this.selectedTaskMediaData = data.message.map(item => { return { checked: false, ...item } });
        if (this.selectedTaskMediaData.length > 0) {
          this.selectedMedia = (!$.isEmptyObject(this.selectedMedia) ? (this.selectedTaskMediaData.filter(i => i.id === this.selectedMedia.id).length > 0) ? { ...this.selectedTaskMediaData.find(i => i.id === this.selectedMedia.id), uuid: uuidv4() } : this.selectedTaskMediaData[0] : { ...this.selectedTaskMediaData[0], uuid: uuidv4() });
          this.selectedMedia.annotations.forEach((annotation, index) => {
            annotation['index'] = index + 1;
            annotation['createdIn'] = 'user';
          });
          if (this.selectedMode) {
            this.scaleAspectRatio();
            this.trigger = Date.now();
          }
          else {
            setTimeout(() => {
              this.clearCanvas();
            }, 200);
          }
        }
        else {
          this.selectedMedia = {};
          this.currentIndex = 0;
        }
        this.selectedMedia = { ...this.selectedMedia };
        this.navigationBtnDisable(this.selectedTaskMediaData);
        if(this.selectedImageVideoButton == 'Image'){
        this.initiateZoom();
        }
        this.dataService.passSpinnerFlag(false, true);
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  getTimelapseData() {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getTimelapseData(this.unit, this.equipmentCategory.name, this.selectedTask.equipment, this.selectedTask.id, this.department?.id).subscribe(
      (data: any) => {
        this.selectedTaskTimelapseData = data.message.map(video => { return { ...video, uuid: uuidv4() } });
        this.showAllImages = !this.showAllImages;
        this.dataService.passSpinnerFlag(false, true);
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  selectImages() {
    this.allImages = this.selectedTaskMediaData.every(item => item.checked);
  }



  changeShowMode() {
    this.showAllImages = true;
    this.showAll = !this.showAll;
    this.selectedMode = false;
    this.selectedTaskMediaData.forEach(item => {
      item.checked = false;
    });
    this.allImages = false;
    this.showAllImages = true;
  }

  onToggleChange() {
    this.selectedTaskMediaData.forEach(item => {
      item.checked = false;
    });
    this.allImages = false;
    if (this.showAllImages) {
      this.getTimelapseData();
    }
    else {
      this.showAllImages = !this.showAllImages;
    }
  }

  selectAllImages() {
    this.allImages = !this.allImages;
    this.selectedTaskMediaData.forEach(item => {
      if (this.allImages) {
        item.checked = true;
      }
      else {
        item.checked = false;
      }
    });
  }

  navigateImages(direction) {
    if ((direction === 'next' && !this.nextBtn && this.selectedMedia) || (direction === 'prev' && !this.prevBtn && this.selectedMedia)) {
      this.selectedMode = false;
      // this.selectedImageVideoButton = this.IMAGE;
      this.resetZoom();
      this.selectedMedia = (direction === 'next') ? JSON.parse(JSON.stringify(this.selectedTaskMediaData[this.selectedTaskMediaData.findIndex(item => item.id === this.selectedMedia.id) + 1])) : JSON.parse(JSON.stringify(this.selectedTaskMediaData[this.selectedTaskMediaData.findIndex(item => item.id === this.selectedMedia.id) - 1]));
      this.selectedMedia.annotations.forEach((annotation, index) => {
        annotation['index'] = index + 1;
        annotation['createdIn'] = 'user';
      });
      setTimeout(() => {
        this.clearCanvas();
        this.scaleAspectRatio();
        this.navigationBtnDisable(this.selectedTaskMediaData);
        this.initiateZoom();
      }, 100);
    }
  }

  selectImage(i) {
    console.log('cliekd')
    this.selectedMode = false;
    // this.selectedImageVideoButton = this.IMAGE;
    this.resetZoom();
    this.selectedMedia = this.selectedTaskMediaData[i];
    this.selectedMedia.annotations.forEach((annotation, index) => {
      annotation['index'] = index + 1;
      annotation['createdIn'] = 'user';
    });
    setTimeout(() => {
      this.clearCanvas();
      this.scaleAspectRatio();
      this.navigationBtnDisable(this.selectedTaskMediaData);
      if(this.selectedImageVideoButton === 'Image'){
        this.initiateZoom();
      }
    }, 100);
  }
  navigationBtnDisable(masterImageRows) {
    if (masterImageRows && this.selectedMedia) {
      if (masterImageRows.length <= 1) {
        this.prevBtn = true;
        this.nextBtn = true;
      }
      else {
        if (masterImageRows.findIndex(item => (item['id'] === this.selectedMedia.id)) === masterImageRows.length - 1) {
          this.nextBtn = true;
        }
        else {
          this.nextBtn = false;
        }
        if (masterImageRows.findIndex(item => (item['id'] === this.selectedMedia.id)) === 0) {
          this.prevBtn = true;
        }
        else {
          this.prevBtn = false;
        }
      }
      this.currentIndex = (masterImageRows.findIndex(item => (item['id'] === this.selectedMedia.id)) + 1);
    }
  }

  selectedImageVideoButtons(data) {
    this.selectedImageVideoButton = data;
  }

  toggleExpandGroup(group) {
    this.table.groupHeader.toggleExpandGroup(group);
  }

  changeMode() {
    this.selectedMode = !this.selectedMode;
    let image: any = document.getElementById('imageModal');
    console.log(image.height, image)
    var style = image.currentStyle || window.getComputedStyle(image);
    this.canvasHeight = image.height;
    this.canvasWidth = image.width;
    this.canvasRatio = 2160 / this.canvasHeight;
    this.bufferMargin = Number(style.marginLeft.slice(0, style.marginLeft.length - 2));
    this.zoom.reset();
    if (!this.selectedMode) {
      this.clearCanvas();
      this.zoom.resume();
    }
    else {
      this.zoom.pause();
    }
    this.scaleAspectRatio();
    this.trigger = Date.now();

  }


  getTaskRowClass = (row) => {
    return {
      // 'in-progres': row['task_status'] == 'IN PROGRESS',
      'delayed': row['task_status'] == 'DELAYED',
      'background-white': row['task_status'] != 'DELAYED',
      'selected-row': row['id'] == this.selectedTask.id,
    };
  }
  fetchEncryptedImageData(imageId, imageUrl) {
    if (imageUrl && imageId && imageUrl.includes('.enc')) {
      this.commonService.fetchEncryptedImageData(imageId, imageUrl).subscribe(
        imageData => {
        },
        error => {
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        }
      )
    }
  }

  initiateZoom() {
    setTimeout(() => {
      this.zoom = panzoom(document.getElementsByClassName('img-zoom')[0], {
        minZoom: 1,
        smoothScroll: false,
        zoomDoubleClickSpeed: 1,
        bounds: true,
        boundsPadding: 1.0
      });
    }, 50);
  }

  resetZoom() {
    this.zoom.reset();
  }

  disableDownload() {
    return this.selectedTaskMediaData.every(item => !item.checked);
  }

  downloadAll() {
    this.selectedTaskMediaData.forEach(item => {
      if (item.checked) {
        this.downloadTileImage(item.id);
      }
    });
    this.selectedTaskMediaData.forEach(item => {
      item.checked = false;
    });
    this.allImages = false;
  }

  downloadImage() {
    if (this.selectedImageVideoButton === 'Image') {
      this.resetZoom();
    }
    let imageUrl = document.getElementById('imageModal').getAttribute('src');
    if (imageUrl.includes('data:image/jpeg;base64')) {
      let a = document.createElement('a');
      a.href = imageUrl;
      a.download = this.selectedTask.name + '_' + this.selectedMedia.id + '.jpg';
      document.body.appendChild(a);
      a.click();
    }
    else {
      this.commonService.fetchImageData(imageUrl).subscribe(
        imageData => {
          let a: any = document.createElement('a');
          a.href = URL.createObjectURL(imageData);
          a.download = (imageUrl.includes('.mp4') ? this.selectedTask.name + '_' + this.selectedMedia.id + '.mp4' : this.selectedTask.name + '_' + this.selectedMedia.id + '.jpg');
          document.body.appendChild(a);
          a.click();
        },
        error => {
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        }
      )
    }
  }

  downloadTileImage(id) {
    let imageUrl = document.getElementById('tileImage' + id).getAttribute('src');
    if (imageUrl.includes('data:image/jpeg;base64')) {
      let a = document.createElement('a');
      a.href = imageUrl;
      a.download = this.selectedTask.name + '_' + id + '.jpg';
      document.body.appendChild(a);
      a.click();
    }
    else {
      this.commonService.fetchImageData(imageUrl).subscribe(
        imageData => {
          let a: any = document.createElement('a');
          a.href = URL.createObjectURL(imageData);
          a.download = (imageUrl.includes('.mp4') ? this.selectedTask.name + '_' + this.selectedMedia.id + '.mp4' : this.selectedTask.name + '_' + this.selectedMedia.id + '.jpg');
          document.body.appendChild(a);
          a.click();
        },
        error => {
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        }
      )
    }
  }

  clearCanvas() {
    if (!$.isEmptyObject(this.selectedMedia)) {
      let canvas: any = document?.getElementById('canvas');
      canvas?.getContext('2d')?.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
  }

  openAnnotationModal(annotation) {
    $("[id^='content']").hide();
    $('#content' + annotation.index).css('left', annotation.left + 'px');
    $('#content' + annotation.index).css('top', annotation.top + 'px');
    $('#content' + annotation.index).show();
    this.selectAnnotation = { ...annotation };
  }

  closeAnnotationModal(index) {
    $('#content' + index).hide();
  }

  openSelectedAnnotation($event) {
    this.selectAnnotation = this.actionPoints.find(item => item.index === $event.index);
    this.openAnnotationModal(this.selectAnnotation);
  }

  scaleAspectRatio() {
    this.actionPoints = [];
    this.selectedMedia.annotations.forEach(item => {
      if (item.shape === 'rectangle') {
        this.actionPoints.push({ index: item.index, top: (item.coordinates[1] / this.canvasRatio) - 15, left: ((item.coordinates[0] / this.canvasRatio) - 15) + this.bufferMargin, comment: item.comments[0].comment, coordinates: item.coordinates });
      }
      else if (item.shape === 'circle') {
        this.actionPoints.push({ index: item.index, top: ((item.coordinates[1] / this.canvasRatio) - (item.coordinates[2] / this.canvasRatio)) - 15, left: (item.coordinates[0] / this.canvasRatio - 15) + this.bufferMargin, comment: item.comments[0].comment, coordinates: item.coordinates });
      }
    });
  }

  returnPercentageStyle(percentage) {
    let styles = {
      'width': percentage + '%',
    };
    return styles;
  }

  returnDotMargin(margin) {
    let marginLeft: any;
    if (margin >= 75) {
      marginLeft = {
        'margin-left': 'calc(100% - ' + (margin) + '%)'
      }
    } else if (margin >= 50 && margin < 75) {
      marginLeft = {
        'margin-left': 'calc(' + (margin) + '% - 12px)'
      }
    } else {
      marginLeft = {
        'margin-left': 'calc(' + (margin) + '% - 8px)'
      }
    }
    return marginLeft;
  }

  navigateToIssues(row, flag, issueId) {
    sessionStorage.setItem('issueFilter', JSON.stringify([this.unit, row.equipment_category, row.department, row.equipment, row.id, flag, issueId]));
    this.router.navigateByUrl('/schedule-control/issues');
  }

  ngOnDestroy() {
    sessionStorage.removeItem('taskFilter');
    if (this.id) {
      clearInterval(this.id);
    }
  }
  showIssuePopupBox(data) {
    this.issueId = data;
    this.issuePopupShow = true;
    console.log('this.selectedTask', this.selectedTask, this.selectedTaskRow)
  }
  closePopUp() {
    this.issuePopupShow = false;
  }

  ///Active persons////
  socket: string = '/get_user_online_status/'
  myWebSocket: any;
  webSocketUrl: string;
  @Output() surpriseTaskOpen: EventEmitter<boolean> = new EventEmitter();
  allTaskStatic: string = 'statistic';
  activePersons: any;


  activePersonShow: boolean = false;
  surpriseTaskShows: boolean = false;

  emails: any[] = [];
  firstEmail: string;

  unTaggedEmails = [];
  userClickOverview = {
    moduleName: 'activityMonitoring',
    level: 'unit',
    page: 'issues',
    feature: 'status'
  }
  filteredArray: any;
  id: any = 0;
  tagged_users: any[];
  ActivePersons: any;
  Active: any;


  taggedPersonsList(data) {
    this.activePersonShow = false;
    this.activePersons = data;
    this.tagged_users = data.tagged_users
    this.getUsers();

  }
  deleteselectedTaggedPerson(id, userName) {
    let deletePerson = { task_id: id, user_id: userName.id };
    this.taskService.deleteTaggedUser(deletePerson).subscribe(data => {

      this.getPrimaryTask(this.selectedTask.id);
    });
  }

  getUsers() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getUserList().subscribe((data: any[]) => {
      sessionStorage.setItem('listOfUsers', JSON.stringify(data))
      this.emails = data;
      this.users = data;
      this.firstEmail = '';
      this.activePersons.tagged_users.forEach((email, taggedIndex) => {
        this.activePersons.tagged_users[taggedIndex]['acronym'] = email.email_id[0].toUpperCase();
        this.users.forEach((allEmail, i) => {
          if (email.id == allEmail.id) {
            this.activePersons.tagged_users[taggedIndex]['acronym'] = this.calculateAcronym(allEmail['name']);
            this.emails.splice(i, 1);
          }
        })
      });
      this.unTaggedEmails = this.emails;
      this.users = JSON.parse(sessionStorage.getItem('listOfUsers'));
      console.log(this.activePersons.tagged_users, this.unTaggedEmails)
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

  getUserDepartment() {
    this.activityMonitorService.getUserDepartment().subscribe((data: any[]) => {
      this.userDepartment = data[0]?.department__name;
      // this.userDepartment = 'Operation';
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  addTaggedUser() {
    console.log(this.firstEmail);
    let addPersons = { unit_id: this.selectedUnit?.id, task_id: this.activePersons.id, user_ids: this.firstEmail };
    this.taskService.addTaggedUser(addPersons).subscribe(data => {

      this.getPrimaryTask(this.selectedTask.id);
    });
    this.firstEmail = '';
  }


  activePersonsTags() {
    this.activePersonShow = !this.activePersonShow;
    if (this.activePersonShow) {
      this.getUsers();
    }
  }

  getStatusForOnlinePersons() {
    this.Active = []
    if (this.ActivePersons !== undefined) {
      this.ActivePersons.forEach(e => {
        this.Active.push(e['email'])
      })
    }
    this.issuesService.getStatusForOnlinePersons(this.userClickOverview).subscribe(data => {
      // this.filteredArray = ['sowndarya.s@detecttechnologies.com', 'akshaya@detecttechnologies.com', 'hari@detecttechnologies.com', 'balaji@detecttechnologies.com', 'nithyashree.a@detecttechnologies.com', 'sreedhar@detecttechnologies.com']
      // this. filteredArray = this.tagged_users.filter(value => this.Active.includes(value));
      this.filteredArray = this.Active;

    })
  }

  ///////////////ISSUES////////////////////
  issuesList: any[] = [];
  getIssuesForTask() {
    this.getMediaData();
    //this.dataService.passSpinnerFlag(true, true);
    console.log(this.selectedUnit);
    this.taskService.getIssuesList(this.selectedUnit.id, this.department?.id, this.selectedTask.id).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.issuesList = data;
        }
        else {
          this.issuesList = []
          // this.dataService.passSpinnerFlag(false, true);
        }
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        //this.dataService.passSpinnerFlag(false, true);
      }
    })

  }

  //////////Inspection///////////
  status: string = 'open';
  linkedObservations: any[] = [
    {
      "observation": "@Sonu @Samraat Taking action and submitted the related documents",
      "email": "abc@detecttechnologies.com",
      "attachment": ""
    },
    {
      "observation": "@Sonu @Samraat Action taken and submitting the form and did it",
      "email": "abcd@detecttechnologies.com",
      "attachment": ""
    },
    {
      "observation": "@spna Didn't take action and submitted the related documents",
      "email": "abrec@detecttechnologies.com",
      "attachment": ""
    }
  ]

  ////////////// Task progress /////////////////
  //UPDATE:  TASK UPDATE DONE USING
  updateTaskProgress() {
    if (this.selectedTask.percentage_completed > this.newTaskProgress) {
      this.snackbarService.show("Progress can't be decreased!", true, false, false, false);
      return;
    }
    const data = {
      "actual_percentage_completed": this.newTaskProgress,
      "current_date": this.date,
      "current_time": this.time
    }
    this.taskService.updateTaskProgress(this.selectedTask.id, data).subscribe((res) => {
      this.date = null;
      this.time = null;
      this.getPrimaryTask(this.selectedTask.id);
      this.progressModalClose.nativeElement.click();
      this.snackbarService.show('Successfully updated the progress!', false, false, false, false);
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = error.error.message;
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  startTask() {
    //this.snackbarService.show("Do you want to start this task?", false, false, true, false);
    const data = {
      "status": this.Status,
      "current_date": this.date,
      "current_time": this.time

    }
    this.taskService.updateTaskProgress(this.selectedTask.id, data).subscribe((res) => {
      this.mannualDateTimeEntry = false
      this.date = null;
      this.time = null;
      this.getPrimaryTask(this.selectedTask.id);
      this.snackbarService.show('Successfully started the task!', false, false, false, false);
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = error.error.message;
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  finishTask() {
    const data = {
      "status": "Completed"
    }
    this.taskService.updateTaskProgress(this.selectedTask.id, data).subscribe((res) => {
      this.getPrimaryTask(this.selectedTask.id);
      this.snackbarService.show('Successfully finished the task!', false, false, false, false);
    })
  }
  getLatestData() {
    this.getPrimaryTask(this.selectedTask.id);
  }

  navigate(issue_id) {
    // console.log(issue_id,this.selectedUnit?.id,this.department?.id)
    // let queryParams = {unit_id:this.selectedUnit?.id,department_id:this.department?.id,issue_number:issue_id};
    // this.router.navigate(['schedule-control/issues'],{queryParams:queryParams})
    sessionStorage.setItem('navigatingToIssue', JSON.stringify([{ unit_id: this.selectedUnit?.id, department_id: (this.department?.id.toString().toLowerCase().includes('all') ? 'All Departments' : this.department?.id), issue_number: issue_id }]));
    console.log(sessionStorage.getItem('navigatingToIssue'))
    sessionStorage.setItem('storeSeletedPage', 'allIsuues');
    this.router.navigateByUrl('schedule-control/issues');
  }

  navigateToCreateIssues() {
    sessionStorage.setItem('storeSeletedPage', 'createIsuue');
    sessionStorage.setItem('createIssueNavigation', JSON.stringify({ page: 'create-issues', unit_id: this.selectedUnit?.id, equipmentCategory_id: this.selectedTask?.equipment_category, equipment: this.selectedTask?.equipment_id, task_id: this.selectedTask?.id, }));
    console.log(sessionStorage.getItem('createIssueNavigation'))
    this.router.navigateByUrl('schedule-control/issues');
  }
  mannualUpdationOfDateAndTime(booleanValue, task_staus) {
    this.mannualDateTimeEntry = booleanValue;
    this.Status = task_staus
  }
  getPermitStatus() {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getPermitStatus().subscribe({
      next: (data: any) => {
        this.totalPermitStatus = data;
        this.getPrimaryTask(this.routingData.task_id);
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
      }
    })
  }
  updatePermitStatus() {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.updatePermitStatus(this.selectedTask?.id, { "task_permit_id": this.permitStatus }).subscribe({
      next: (data) => {
        this.snackbarService.show('Permit status updated Successfully!', false, false, false, false);
      },
      error: () => {
        this.permitStatus = this.selectedTask?.task_permit
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  showTaskSummary(data) {
    this.showTaskDetailPage.emit(data)
  }
  onChange(event: any) {
    this.dataService.passSpinnerFlag(true, true);
    const file = event.target.files && event.target.files[0];
    let image_upload = new FormData();
    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      if (file.type.indexOf('image') > -1) {
        this.format = 'image';
        image_upload.append('task_id', this.selectedTask?.id);
        event?.target?.files.forEach((file) => { image_upload.append('images', file); });
        image_upload.append('unit_name', this.selectedUnit?.name);
        image_upload.append('object_type', 'image')
      } else if (file.type.indexOf('video') > -1) {
        image_upload.append('task_id', this.selectedTask?.id);
        event?.target?.files.forEach((file) => { image_upload.append('images', file); });
        image_upload.append('unit_name', this.selectedUnit?.name);
        image_upload.append('object_type', 'video')
        this.format = 'video';
      }
      // reader.onload = (event) => {
      //   this.url = (<FileReader>event.target).result;
      // }
    }
    // let image_upload = new FormData();
    // image_upload.append('task_id', this.selectedTask?.id);
    // event?.target?.files.forEach((file) => { image_upload.append('images', file); });
    // image_upload.append('unit_name', this.selectedUnit?.name);
    this.taskService.imageUpload(image_upload).subscribe({
      next: (data) => {
        this.file = null;
        image_upload.delete('task_id');
        image_upload.delete('images');
        image_upload.delete('unit_name');
        if(this.selectedImageVideoButton == 'Image'){
          this.msg = 'Images Uploaded successfully';
        }
        else{
          this.msg = 'Videos Uploaded successfully';
        }
        
        this.snackbarService.show(this.msg, false, false, false, false);
        this.getMediaData();
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
  updateProgress(event: MouseEvent) {
    const progressBarElement: HTMLElement = event.target as HTMLElement;
    const progressBarWidth = progressBarElement.clientWidth;
    const clickPosition = event.offsetX;
    const newProgressPercentage = (clickPosition / progressBarWidth) * 100;
    // Update the progress in your data model
    // this.updatedPercentage = Math.round(Math.min(Math.max(newProgressPercentage, 0), 100))
    this.newTaskProgress = Math.round(Math.min(Math.max(newProgressPercentage, 0), 100))
    // this.selectedTask.actual_percentage_completed = Math.round(Math.min(Math.max(newProgressPercentage, 0), 100));
    // Perform any additional actions, such as sending an API request to update the progress on the server
  }
  clearPreviousData() {
    this.date = null;
    this.time = null;
  }


  // --------------------------------------------------------------

  // triggered on click - start update reopen
  onTaskUpdate(taskStatus) {

    if (taskStatus == "Reopen") {
      this.newTaskProgress = 90;
    } else {
      this.newTaskProgress = this.selectedTask.actual_percentage_completed;
    }

    this.Status = taskStatus;

    this.date = this.getFormattedDate()
    this.time = this.getFormattedTime()
  }

  updateTaskStatus() {

    if (new Date().getTime() < new Date(this.date + ' ' + this.selectedTime).getTime()) {
      this.snackbarService.show(
        "Date/Time should not be greater then current date-time",
        true,
        false,
        false,
        false
      );
      this.dataService.passSpinnerFlag(false, true);
      return;
    }
    this.dataService.passSpinnerFlag(true, true);
    let data;
    let progressData;
    this.time = `${this.selectedTime}:00`
    if (this.Status == 'Start') {
      data = {
        status: this.Status,
        current_date: this.date,
        current_time: this.time,
      };
    }
    else if (this.Status == 'Update') {

      if (this.newTaskProgress == 100) {
        data = {
          status: "Completed",
          current_date: this.date,
          current_time: this.time,
        };
      }
      else {
        data = {
          actual_percentage_completed: this.newTaskProgress,
          current_date: this.date,
          current_time: this.time,
        };
      }
    }
    else if (this.Status == "Reopen") {
      data = {
        status: "Reopen",
        actual_percentage_completed: this.newTaskProgress,
        current_date: this.date,
        current_time: this.time,
      }

      //  progressData = {
      //   actual_percentage_completed: 0,
      // }

      // this.taskService.updateTaskProgress(this.selectedTask.id, progressData).subscribe(
      //   (res) => {
      //     this.date = null;
      //     this.time = null;
      //   },
      //   (error) => {
      //     this.dataService.passSpinnerFlag(false, true);
      //     this.msg = error.error.message;
      //     this.snackbarService.show(this.msg, true, false, false, false);
      //   })

    }

    this.taskService.updateTaskProgress(this.selectedTask.id, data).subscribe(
      (res) => {
        // this.mannualDateTimeEntry = false
        this.date = null;
        this.time = null;
        // this.getFilteredTasks(this.selectedTaskFilter);
        this.progressModalClose.nativeElement.click();
        this.taskCompleteModalClose.nativeElement.click();
        this.getPrimaryTask(this.selectedTask.id);
        this.snackbarService.show(
          'Successfully updated the progress!',
          false,
          false,
          false,
          false
        );


        // this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error.message;
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    );
  }

  inputDateTimeDisabled(event) {
    this.selectedTime = event.target.value;
  }

  getActualDuration() {
    let startDate = `${this.selectedTask.actual_start_date} ${this.selectedTask.actual_start_time}`
    let endDate = `${this.selectedTask.actual_date_of_completion} ${this.selectedTask.actual_time_of_completion}`
    let startTime = this.selectedTask.actual_start_time
    let endTime = this.selectedTask.actual_time_of_completion
    const date1 = new Date(startDate).valueOf();
    const date2 = new Date(endDate).valueOf();
    const timeDifferenceInMillis = Math.abs(date1 - date2)
    const millisecondsPerMinute = 60 * 1000;
    const millisecondsPerHour = 60 * millisecondsPerMinute;
    const millisecondsPerDay = 24 * millisecondsPerHour;

    const days = Math.floor(timeDifferenceInMillis / millisecondsPerDay);
    let remainingMillis = timeDifferenceInMillis % millisecondsPerDay;
    const hours = Math.floor(remainingMillis / millisecondsPerHour);
    remainingMillis = remainingMillis % millisecondsPerHour;
    const minutes = Math.floor(remainingMillis / millisecondsPerMinute);

    this.selectedTask['actual_duration'] = `${days}days ${hours}hrs ${minutes}mins`

    let plannedDateOfCompletion = `${this.selectedTask.planned_date_to_complete} ${this.selectedTask.planned_time_to_complete}`
    const plannedDate = new Date(plannedDateOfCompletion)
    if (new Date() > plannedDate && this.selectedTask.status != "COMPLETED") {
      this.selectedTask['planned_date_elapsed'] = true
    } else {
      this.selectedTask['planned_date_elapsed'] = false
    }
  }

  modalHeader
  isPdfLoaded
  pdfData
  getSOP() {

    this.isPdfLoaded = false
    this.modalHeader = "Standard operation procedure"
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.gettaskSOP(this.selectedTask.id).subscribe(
      (data: any) => {
        this.pdfData = data
        this.isPdfLoaded = true
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error.message;
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    )
  }

  getDrawing() {

    this.isPdfLoaded = false
    this.modalHeader = "Drawing"
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getDrawing(this.selectedTask.equipment_id).subscribe(
      (data) => {
        this.pdfData = data
        this.isPdfLoaded = true
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error.message;
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    )
  }


  getFormattedTime(): string {
    this.time = new Date()
    const hours = this.time.getHours();
    const minutes = this.time.getMinutes();
    const formattedHours = this.padZero(hours);
    const formattedMinutes = this.padZero(minutes);
    return `${formattedHours}:${formattedMinutes}`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }


  getFormattedDate(): string {
    this.date = new Date()
    const year = this.date.getFullYear();
    const month = this.padZero(this.date.getMonth() + 1);
    const day = this.padZero(this.date.getDate());
    return `${year}-${month}-${day}`;

  }


  taskEscalated() {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.updateTaskProgress(this.selectedTask.id, { is_escalated: true }).subscribe({
      next: (data: any) => {
        this.dataService.passSpinnerFlag(true, true);
        // this.issue_number = this.selectedIssue.issue_number
        this.getPrimaryTask(this.selectedTask.id);
        $('#escalateModal').modal('hide');
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


  userValidation() {

    let index = this.selectedTask?.tagged_users?.findIndex(ele => { return ele.id == this.loginUserId })
    if ((index >= 0 || this.loginUserEmail == this.selectedTask?.created_by) && this.selectedTask?.status != 'Closed') {
      return false
    } else {
      return true
    }
  }


  getTaskHistory() {

    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getTaskHistory(this.selectedTask.id).subscribe((data) => {
      this.taskHistory = data;
      this.taskHistory = [...this.taskHistory].reverse()
      console.log(this.taskHistory)
      this.dataService.passSpinnerFlag(false, true);
    }, (error) => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    });
  }

  onCaptureKnowledge() {
    this.dataService.passSpinnerFlag(true, true);
    let captureStatus = !this.selectedTask.is_knowledge_captured;
    this.taskService.captureKnowledge(this.selectedTask.id, captureStatus).subscribe(
      (data) => {
        this.getPrimaryTask(this.selectedTask.id);
        // this.getFilteredTasks(this.selectedTaskFilter);
        // this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    );
  }

  calculateAcronym(name: string): string {
    const words = name.split(' ');
    const acronym = words.map(word => word.charAt(0)).join('').toUpperCase();
    return acronym;
  }
  restrictValue() {
    if (this.newTaskProgress < 1) {
      this.newTaskProgress = 0;
    }
    if (this.newTaskProgress > 100) {
      this.newTaskProgress = 100;
    }
  }

  returnCompletedTask(array) {
    let count = 0;
    array.forEach(ele => {
      if (ele.status == "COMPLETED") {
        count += 1
      }
    })
    return count;
  }

  inputDateDisabled() {
    let dtToday = new Date();
    var month: any = dtToday.getMonth() + 1;
    var day: any = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    let minDate = ''
    let maxDate = ''
    minDate = year + '-' + month + '-' + day;

    $('#update').attr('max', minDate);
    // $('#endDate').attr('max', maxDate);
  }
  changeMediaType(type: any) {
    this.selectedImageVideoButton = type
    this.getMediaData()
  }
}

