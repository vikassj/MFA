import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode, SelectionType, DatatableComponent } from '@swimlane/ngx-datatable';
// import { IssuesService } from 'src/app/services/issues.service';
import { ActivityMonitorSCurvePendingService } from 'src/app/services/s-curve.service';
import { TaskService } from 'src/app/services/task.service';
import { CommonService } from 'src/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { IssuesService } from '../../services/issues.service';
import { InspectionService } from 'src/app/services/inspection.service';
import { HttpClient } from '@angular/common/http';
declare var $: any;
import * as moment from 'moment';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

import { AddCommentsToRecomondations, CreateObservations, CreateRecomondations, TagUsersInRecomondations, UpdateObservationRemarks, UpdateRecomondationStatus } from 'src/app/shared/models/inspection.model';

@Component({
  selector: 'app-inspection',
  templateUrl: './inspection.component.html',
  styleUrls: ['./inspection.component.scss']
})
export class InspectionComponent implements OnInit {
  createObservations: CreateObservations
  createRecomondations: CreateRecomondations
  tagUsersInRecomondations: TagUsersInRecomondations
  addCommentsToRecomondations: AddCommentsToRecomondations
  updateRecomondationStatus: UpdateRecomondationStatus
  updateObservationRemarks: UpdateObservationRemarks
  ColumnMode = ColumnMode;
  selectionType = SelectionType;
  selectedImage: any = {};
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('myInput') myInputVariable: ElementRef;
  category: any = []
  clicked = false;
  selectedCategoryData = []
  selectedCategory: any;
  observationAndRecommendation = [{ name: 'Show all', id: 1 }, { name: 'Show only with observations and recommendations', id: 2 }];
  observationAndRecommendationFilter = this.observationAndRecommendation[0]?.name;
  status: any[] = ["Open", "Maintenance Accepted", "Maintenance Rejected"];
  equipmentClass = [];
  equipmentNumber = [];
  selectedEquipmentClass = [];
  selectedEquipmentNumber = [];
  statusFilter: string[] = [];
  isRouteClicked: boolean = false;

  selected: any[] = []
  selectedObservation: any = {
    component_name: "",
    date: "",
    time: "",
    observation_id: 0,
    observation: "",
    remarks: "",
    obs_created_by: "",
    remarks_created_by: "",
    image_path: []
  }

  equipments: any = {};

  unitName: any = ""
  units: any[] = [];
  selectedUnit: any;
  observationsRecommendationsToggle: boolean = false;
  componentId: any;
  rows: any[] = []

  activities: any[] = []

  commentAttachments: any[] = [
  ]
  actionCommentImage: any[] = []

  linkedObs: any[] = []

  recStatus: any = 'Open'
  msg: string;
  activityComment: string = ''
  selectedUnitId: any;
  observationsList: any[] = []
  remarksEdit: boolean = false;
  selectedEquipCategory: string = '';
  selectedEquipment: string = '';
  selectedRecommendation: any = {}
  selectedEquipmentName: string = '';
  selectedEmail: any = { email: '', id: '' };
  emailIds: any;
  taggedUsersList: any[] = [];
  loggedInUserDepartment: string = '';
  searchRelatedEmailData: any;
  allUsersList: any;
  remarksUpdate: boolean;
  selectedObservationRemarks: any;
  tempCategory: any;
  filterEquipment: any;
  categoryAndEquipment: any;
  allEquipmentNumber: any;

  file: any;
  componentList: any[] = []
  imageSrc: any[] = [];
  url: any;
  actionPoints: any[] = [];
  selectAnnotation: any = {};
  selectedMedia: any = {};
  canvasHeight: number = 0;
  canvasWidth: number = 0;
  canvasRatio: number = 0;
  bufferMargin: number = 0;
  trigger: number = 0;
  selectedMode: boolean = false;
  @ViewChild('closeModal') closeModal;
  images: any[] = [];
  otherFiles: any[] = [];
  dropDownShow: boolean = false;
  userGroup: any;
  commentTagging: any;
  hasCreateAccess: boolean = false;
  date: any = new Date()

  canvasData: any = {
    canvas: null,
    context: null,
    height: null,
    width: null,
    ratio: null,
    index: null,
    drawClicked: false,
    shape: 'rectangle',
    color: '#0412fb',
    thickness: 3,
    comments: '',
    annotation: {
      xcoordi: 0,
      ycoordi: 0,
      width: 0,
      height: 0,
      shape: '',
      color: '',
      thickness: null,
      createdIn: '',
      comments: '',
      index: null
    },
    boundingBoxes: [],
    o: {},
    m: {},
    start: {},
    isDrawing: false,
    drawn: false,
    circles: [],
    offsetX: null,
    offsetY: null,
    startX: null,
    startY: null,
    isMouseDown: false,
    circle: {
      startX: 0,
      startY: 0,
      radius: 0,
      shape: '',
      color: '',
      thickness: null,
      createdIn: '',
      comments: '',
      index: null
    },
    radius: null
  };
  selectedImageName: any;
  name: any;
  id: any;
  attachmentCount: number = null
  equipmentCategoryName: string;
  selectedDate: any;
  currentDate: Date = new Date();
  oneYearBack: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  oneMonthBack: Date = null;
  endDate: string;
  startDate: string;
  selectedRecImages: any[] = [];
  loggedInUserMail: string
  filter_type: string = 'show_all'
  storePreviousFilter: boolean = true;
  constructor(private http: HttpClient, private inspectionService: InspectionService, private commonService: CommonService, public IssuesService: IssuesService, private ssCurvePendingService: ActivityMonitorSCurvePendingService, private taskService: TaskService, private dataService: DataService, private snackbarService: SnackbarService, private router: Router) {
    this.units = JSON.parse(sessionStorage.getItem('units'))
    pdfDefaultOptions.assetsFolder = 'ngx-extended-pdf-viewer';
    // this.selectedDate = [this.oneYearBack, this.currentDate]
  }
  loggedInUser
  ngOnInit(): void {
    if (sessionStorage.getItem('dashboard-navigation-filter')) {
      this.filter_type = 'show_only'
      this.observationAndRecommendationFilter = this.observationAndRecommendation[1]?.name;
    }
    else {
      this.filter_type = 'show_all'
      this.observationAndRecommendationFilter = this.observationAndRecommendation[0]?.name;
    }
    // sessionStorage.setItem('selectedTabInspection', 'observation')
    let userAccess = JSON.parse(sessionStorage.getItem('plantModules'))
    let index = userAccess.findIndex(ele => { return ele.key == 'schedule_control' });
    this.userGroup = userAccess[index].plant_access_type;
    this.hasCreateAccess = this.userGroup.includes('observation_or_recommendation') ? false : true
    // console.log("userGroup : >>>>>>>>>>>>>>>>>>>>" + JSON.stringify(this.userGroup))
    this.createObservations = new CreateObservations({})
    this.createRecomondations = new CreateRecomondations({})
    this.tagUsersInRecomondations = new TagUsersInRecomondations({})
    this.addCommentsToRecomondations = new AddCommentsToRecomondations({})
    this.updateRecomondationStatus = new UpdateRecomondationStatus({})
    this.updateObservationRemarks = new UpdateObservationRemarks({})
    this.loggedInUserMail = sessionStorage.getItem("user-email")
    this.createObservations.date = moment().format('YYYY-MM-DD');
    let selectedTabInspection = sessionStorage.getItem('selectedTabInspection');
    this.loggedInUser = sessionStorage.getItem('user-email')
    if (selectedTabInspection == 'recommendation') {
      this.observationsRecommendationsToggle = true;
    } else {
      this.observationsRecommendationsToggle = false;
    }
    if (!sessionStorage.getItem('selectedObsRec')) {
      console.log('proof1', sessionStorage.getItem('storeUnit'))
      if (sessionStorage.getItem('storeUnit') || sessionStorage.getItem('storedUnitId')) {
        console.log('proof3', sessionStorage.getItem('storeUnit'))
        if (sessionStorage.getItem('dashboard-navigation-filter')) {
          var filters = JSON.parse(sessionStorage.getItem('dashboard-navigation-filter'))
          this.observationsRecommendationsToggle = filters.tab == 'observations' ? false : true
          var sidebarFilters = filters.filter
          if (this.observationsRecommendationsToggle) {
            console.log(sidebarFilters)
            //
            if (sidebarFilters == 'open_recommendations') {
              this.statusFilter.push('Open')
            } else if (sidebarFilters == 'closed_recommendations') {
              this.statusFilter.push('Maintenance Accepted')
              this.statusFilter.push('Maintenance Rejected')
            }
          }
          this.selectedUnit = JSON.parse(sessionStorage.getItem('storeUnit'))?.id
          this.getEquipmentCategoryEquipments(this.selectedUnit, '', '')
          this.getUserList(false);
          // this.getAllfilters();
        } else {
          // this.selectedUnit = this.units[0]?.id
          // this.getEquipmentCategoryEquipments(this.selectedUnit, '', '')
          // this.getUserList(false);
          this.selectedUnit = JSON.parse(sessionStorage.getItem('storedUnitId'))
          this.getEquipmentCategoryEquipments(this.selectedUnit, '', '')
          this.getUserList(false);
          // this.getAllfilters();
        }

      }
      else {
        if (sessionStorage.getItem('dashboard-navigation-filter')) {
          var filters = JSON.parse(sessionStorage.getItem('dashboard-navigation-filter'))
          this.observationsRecommendationsToggle = filters.tab == 'observations' ? false : true
          var sidebarFilters = filters.filter
          if (this.observationsRecommendationsToggle) {
            console.log(sidebarFilters)
            //
            if (sidebarFilters == 'open_recommendations') {
              this.statusFilter.push('Open')
            } else if (sidebarFilters == 'closed_recommendations') {
              this.statusFilter.push('Maintenance Accepted')
              this.statusFilter.push('Maintenance Rejected')
            }
          }
        }
        this.selectedUnit = this.units[0]?.id
        this.getEquipmentCategoryEquipments(this.selectedUnit, '', '')
        this.getUserList(false);
        // this.getAllfilters();
      }
    }
    else {
      console.log('proof2', sessionStorage.getItem('storeUnit'))
      var selectedObsRec = JSON.parse(sessionStorage.getItem('selectedObsRec'))
      this.observationsRecommendationsToggle = selectedObsRec.tab == "observations" ? false : true
      this.selectedUnit = selectedObsRec.unit
      this.selectedEquipCategory = selectedObsRec.equipment_category;
      this.selectedEquipment = selectedObsRec.equipment;
      this.selectedObservation.observation_id = selectedObsRec.id;
      this.getEquipmentCategoryEquipments(this.selectedUnit, this.selectedEquipCategory, this.selectedEquipment)
      this.getUserList(false);
      // this.getAllfilters();
    }

    // this.unitName = sessionStorage.getItem('unit-navigation-id') ? this.units.filter(item => item.unit == sessionStorage.getItem('unit-navigation-id')) : this.units[0]
    // this.selectedUnitId = sessionStorage.

    // console.log(this.unitName)
  }

  navigateToLinkedObservation(obs) {

    this.observationsRecommendationsToggle = false;
    sessionStorage.setItem('navigatingToObservation', JSON.stringify({ unit_id: this.selectedUnitId, equipment: this.selectedEquipment, equipment_category: this.selectedEquipCategory, observation_id: obs.id }));
    this.getObservationsList(this.selectedUnit, this.selectedEquipCategory, this.selectedEquipment, true, true)
    this.getEquipmentCategoryEquipments(this.selectedUnit, '', '', true)
    this.getUserList(false);
    this.getAllfilters();

  }

  getUserList(booleanValue?) {
    this.dataService.passSpinnerFlag(true, true);
    this.IssuesService.getUserList().subscribe({
      next: (data: any) => {
        this.emailIds = data;
        this.taggedUsersList = data.filter(d => d.department === 'Maintenance' || d.department === 'Inspection');
        let email = sessionStorage.getItem('user-email');
        this.loggedInUserDepartment = data.find(d => d.email === email).department;
        this.allUsersList = data;
        this.commentTagging = [];
        this.allUsersList.forEach(element => {
          this.commentTagging.push({ "key": element.name, "value": element.name, "email": element.email, "id": element.id, "username": element.username, "mobile_number": element.mobile_number, "mobile_token": element.mobile_token },)
        })
        this.commentTagging = [...this.commentTagging]
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
        if (booleanValue == true || this.rows?.length > 0) {
          this.dataService.passSpinnerFlag(false, true);
        }
      }
    })
  }
  getSelectedEmail(email: any) {
    if (email != '') {
      this.searchRelatedEmailData = this.emailIds.filter(filter => {
        return filter.email.toUpperCase().match(email.toUpperCase())
      })
    }
    else if (email == '') {
      this.searchRelatedEmailData = []
    }
    console.log('hnvefvbhefhvgh', this.searchRelatedEmailData)
  }
  addEmailIds(id, emailIds) {
    // this.emailIds.forEach((val, ind) => {
    //   if (this.selectedEmail == val) {
    //     this.emailIds.splice(ind, 1)
    //   }
    // })
    this.addTaggedUser(id, emailIds)
    this.selectedEmail.email = ''
    this.selectedEmail.id = ''
    this.createRecomondations.tagged_users = [];
  }
  addTaggedUser(id, emailIds) {
    this.inspectionService.personsTaggedRecommendations(id, emailIds, this.selectedUnit, this.selectedCategory).subscribe({
      next: (data) => {
        this.getRecommendations(true);
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    });
  }
  inputDisable() {
    var dtToday = new Date();

    var month: any = dtToday.getMonth() + 1;
    var day: any = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    var minDate = year + '-' + month + '-' + day;

    $('#dateTime').attr('min', minDate);
  }
  getFile(event: any) {
    var name = document.getElementById('fileInput');
    console.log(event.target.files[0].name)
    this.commentAttachments[0].image_name = event.target.files[0].name;

  }

  onObsSelect(row: any) {
    // if(row.type == 'click') {
    if (this.observationsRecommendationsToggle == false) {
      this.selectedObservation = { ...row.selected[0] }
      this.attachmentCount = 0
      this.selectedObservation?.images_path?.forEach((val, ind) => {
        if (val != null) {
          this.attachmentCount += 1
        }
      })
      console.log('len', this.selectedObservation, this.attachmentCount)
    } else {
      this.selectedRecommendation = { ...row.selected[0] }
      this.selectedRecImages = [];
      this.dataService.passSpinnerFlag(true, true);
      this.getObservationDetails(true);
      this.attachmentCount = 0
      this.selectedRecommendation?.images?.forEach((val, ind) => {
        if (val != null) {
          this.attachmentCount += 1
        }
      })
      // this.getRecommendationsComments();
      console.log(this.selectedRecommendation)
    }
    this.selectedObservationRemarks = this.selectedObservation?.remarks
  }
  chipsData(data: any) {
    this.selectedEmail.email = data.email
    this.selectedEmail.id = data.id
    this.searchRelatedEmailData = []
    console.log(data)
  }

  getUserName(name, type) {
    let index = this.allUsersList.findIndex(ele => { return ele.username == name.username })
    if (index >= 0) {
      if (type == 'full') {
        return this.allUsersList[index].name
      } else {
        return this.allUsersList[index].name.slice(0, 1)
      }
    }
  }
  addComment() {
    var activity = {
      comment: this.activityComment,
      email: sessionStorage.getItem('loggedInUser'),
      taggedPeople: [],
      attachments: []
    }

    this.activities.push(activity)
    this.activityComment = ''
  }
  navigateToObservation(filter) {
    this.observationsRecommendationsToggle = false;
    sessionStorage.setItem('inspectionNavigationFilter', JSON.stringify(filter.navigationDetails));
    let par = JSON.parse(sessionStorage.getItem('inspectionNavigationFilter'))
    if (par) {
      this.router.navigateByUrl('schedule-control/inspection');
    }
  }

  createRecommendation(obsId) {
    this.observationsRecommendationsToggle = true
    this.createRecomondations.observation_id = obsId;
    if (this.selectedRecommendation.status === 'Maintenance Rejected') {
      this.componentId = this.componentList.find(c => c.component_name === this.selectedRecommendation.component_name).id;
      this.createObservations.date = this.selectedRecommendation.date;
      this.createRecomondations.fault = this.selectedRecommendation.fault;
      this.createRecomondations.observation_id = this.selectedRecommendation.observation_id;
      this.createRecomondations.recommendation_desc = this.selectedRecommendation.recommendation;
      this.createRecomondations.tagged_users = this.taggedUsersList.filter(d => this.selectedRecommendation.tagged_user.map(e => e.username).indexOf(d.email) > -1).map(e => e.id);
    }
    else {
      this.componentId = this.componentList.find(c => c.component_name === this.selectedObservation.component_name).id;
      this.createObservations.date = this.selectedObservation.date;
    }
    this.getRecommendations(true);
  }

  downloadImg(imageUrl, event) {

    if (event) {
      setTimeout(() => {
        $('#inspectionImageViewer').modal('hide');
      }, 100)
    }
    // this.resetZoom();
    // let imageUrl = document.getElementById('modalImage').getAttribute('src');
    if (imageUrl.includes('data:image/jpeg;base64')) {
      let a = document.createElement('a');
      a.href = imageUrl;
      a.download = 'image_' + Math.floor((Math.random() * 99) * 7) + '.jpg';
      document.body.appendChild(a);
      a.click();
    }
    else {
      this.commonService.fetchImageData(imageUrl).subscribe(
        imageData => {
          let a: any = document.createElement('a');
          a.href = URL.createObjectURL(imageData);
          let imageName = imageUrl.split('/')
          a.download = imageName[imageName.length - 1];
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

  keys() {
    return Object.keys(this.category);
  }
  switchBetweenUnits(selectedUnit) {
    // this.selectedDate = ['', '']
    // this.selectedEquipmentClass = []
    // this.selectedEquipmentNumber = []
    this.filterReset()
    this.getEquipmentCategoryEquipments(selectedUnit, '', '')
  }
  getEquipmentCategoryEquipments(unit_id: any, category_id: any, equipment_id: any, retainPrevSelections?) {
    console.log('eventTriggred1')
    this.dataService.passSpinnerFlag(true, true);
    sessionStorage.setItem('storeUnit', unit_id);
    sessionStorage.setItem('storedUnitId', unit_id);
    window.dispatchEvent(new CustomEvent('unitchanged'))
    this.inspectionService.getEquipmentCategoryList(unit_id, category_id, equipment_id, this.filter_type, this.selectedEquipmentClass, this.selectedEquipmentNumber).subscribe({
      next: (data: any) => {
        if (data?.length > 0) {
          console.log('eventTriggred2')
          data.forEach((d, index) => {
            d.istoggled = (index === 0) ? true : false
            d.equipments.sort((a, b) => (b.total_obs_count + b.total_rec_count) - (a.total_obs_count + a.total_rec_count));
          });
          this.category = data
          this.selectedEquipmentName = data?.[0]?.equipments[0]?.equipment_name
          this.equipmentCategoryName = data?.[0]?.equipment_category_name
          this.tempCategory = data
          console.log(this.category)
          sessionStorage.setItem('tempCategory', JSON.stringify(this.tempCategory))
          this.getComponentList(unit_id, data?.[0]?.equipment_category_id, false)
          if (!retainPrevSelections) {
            if ((equipment_id != '' && category_id != '')) {
              this.selectedCategory = equipment_id;
              this.selectedEquipment = equipment_id;
              this.selectedEquipCategory = category_id;
              this.selectedEquipmentClass = [];
              this.selectedEquipmentNumber = [];
              this.selectedUnit = unit_id;
            } else {
              this.selectedCategory = data[0]?.equipments[0]?.equipment_id;
              this.selectedEquipment = data[0]?.equipments[0]?.equipment_id;
              this.selectedEquipCategory = data[0]?.equipment_category_id;
              this.selectedUnit = unit_id;
              // this.getObservationsList(unit_id, this.selectedEquipCategory, this.selectedEquipment);
              // this.getRecommendations();
            }
          }
          let navigatingToInspection = JSON.parse(sessionStorage.getItem('navigatingToInspection'));
          if (navigatingToInspection?.equipment_category_id) {
            this.selectedCategory = navigatingToInspection?.equipment_id;
            this.selectedEquipment = navigatingToInspection?.equipment_id;
            this.selectedEquipCategory = navigatingToInspection?.equipment_category_id;
          }
          if (this.observationsRecommendationsToggle) {
            this.getRecommendations(false);
          }
          else {
            this.getObservationsList(unit_id, this.selectedEquipCategory, this.selectedEquipment, true, false);
          }
          this.getAllfilters();
        }
        else {
          this.category = []
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'observations and recommendations are not available for this unit.';
          this.snackbarService.show(this.msg, false, false, false, true);
        }
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        if (this.category?.length < 1 && this.rows?.length > 0) {
          this.dataService.passSpinnerFlag(false, true);
        }
      }
    })

    // this.ssCurvePendingService.getEquipmentCategoryEquipments(unitName).subscribe((data) => {
    //   this.category = data;
    //   this.keys();
    //   let categoryKeys = this.keys();
    //   // if (categoryKeys.length > 0) {
    //   //   this.planCategory = categoryKeys[0];
    //   //   this.milestoneCategory = categoryKeys[0];

    //   //   let number = 0;
    //   //   let name = '';
    //   //   categoryKeys.forEach(element => {
    //   //     if (number < element.length) {
    //   //       number = element.length;
    //   //       name = element;
    //   //     }
    //   //   });
    //   //   let categorywidth: number;
    //   //   if (name.toUpperCase() == name) {
    //   //     categorywidth = number * 11;
    //   //   } else {
    //   //     categorywidth = number * 10;
    //   //   }
    //   //   if (this.categoryDropdownWidth < categorywidth) {
    //   //     this.categoryDropdownWidth = categorywidth
    //   //   }
    //   //   this.selectedPlanCategory(this.planCategory);
    //   //   this.selectMilestoneCategory(this.milestoneCategory);
    //   // }
    //   // else {
    //   //   this.dataService.passSpinnerFlag(false, true);
    //   // }
    // },
    //   error => {
    //     this.dataService.passSpinnerFlag(false, true);
    //     var msg = 'Error occured. Please try again.';
    //     this.snackbarService.show(msg, true, false, false, false);
    //   },
    //   () => {
    //   })
  }

  getObservationsList(unit_id: any, category_id: any, equipment_id: any, booleanValue, flag?) {
    if (flag == true) {
      this.dataService.passSpinnerFlag(true, true);
    }
    this.observationsList = []
    this.rows = [];
    this.inspectionService.getObservationsList(unit_id, category_id, equipment_id, this.startDate, this.endDate).subscribe({
      next: (data: any) => {
        if (this.observationsRecommendationsToggle == false) {
          this.rows = data
        }
        this.observationsList = data
        console.log(this.observationsList)
        let navigatingToObservation = JSON.parse(sessionStorage.getItem('navigatingToObservation'));
        if (navigatingToObservation?.observation_id) {
          this.selectedObservation.observation_id = navigatingToObservation.observation_id
          this.createRecomondations.observation_id = navigatingToObservation.observation_id
          console.log(this.selectedObservation.observation_id)
          if (this.selectedObservation?.observation_id) {
            let index = this.rows.findIndex(ele => { return ele.observation_id == this.selectedObservation?.observation_id });
            if (index >= 0) {
              this.selectedObservation = { ...this.rows[index] }
              this.scrollToSelectedRow(index)
              this.attachmentCount = 0
              this.selectedObservation.images_path.forEach((val, ind) => {
                if (val != null) {
                  this.attachmentCount += 1
                }
              })
            } else {
              this.selectedObservation = { ...data[0] }
              this.attachmentCount = 0
              this.selectedObservation.images_path.forEach((val, ind) => {
                if (val != null) {
                  this.attachmentCount += 1
                }
              })
            }
          } else {
            this.selectedObservation = { ...data[0] }
            this.attachmentCount = 0
            this.selectedObservation.images_path.forEach((val, ind) => {
              if (val != null) {
                this.attachmentCount += 1
              }
            })
          }
        } else {
          this.createRecomondations.observation_id = data[0]?.observation_id
          if (this.selectedObservation?.observation_id) {
            let index = this.rows.findIndex(ele => { return ele.observation_id == this.selectedObservation?.observation_id });
            if (index >= 0) {
              this.selectedObservation = this.rows[index]
              this.scrollToSelectedRow(index)
              this.attachmentCount = 0
              this.selectedObservation.images_path.forEach((val, ind) => {
                if (val != null) {
                  this.attachmentCount += 1
                }
              })
            } else {
              this.selectedObservation = data[0]
              this.attachmentCount = 0
              this.selectedObservation?.images_path?.forEach((val, ind) => {
                if (val != null) {
                  this.attachmentCount += 1
                }
              })
            }
          } else {
            this.selectedObservation = data[0]
            this.attachmentCount = 0
            this.selectedObservation?.images_path?.forEach((val, ind) => {
              if (val != null) {
                this.attachmentCount += 1
              }
            })
          }
        }

        this.selected = [this.selectedObservation]
        this.selectedUnit = unit_id;
        this.selectedEquipCategory = category_id;
        this.selectedEquipment = equipment_id;
        this.selectedObservationRemarks = this.selectedObservation?.remarks
        // this.getAllfilters();
        setTimeout(() => {
          sessionStorage.removeItem('navigatingToObservation')
          sessionStorage.removeItem('selectedTabInspection')
          sessionStorage.removeItem('selectedObsRec')
          sessionStorage.removeItem('dashboard-navigation-filter')
        }, 500)
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

  auto_grow(element) {
    this.remarksEdit = true
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
  }

  selectSidebar(category, id, name, equipment_category_name) {
    this.filterEquipment = '';
    this.selectedCategory = id;
    this.selectedEquipmentName = name
    this.equipmentCategoryName = equipment_category_name
    console.log(category)
    if (this.observationsRecommendationsToggle == false) {
      this.observationsList = []
      this.getComponentList(this.selectedUnit, category, false)
      this.getObservationsList(this.selectedUnit, category, id, true, true)
    }
    else if (this.observationsRecommendationsToggle == true) {
      // this.getObservationsList(this.selectedUnit, category, id, false)
      this.observationsList = []
      this.selectedEquipCategory = category
      this.selectedEquipment = id
      this.getComponentList(this.selectedUnit, category, false)
      this.getRecommendations(true);
      this.getObservationsList(this.selectedUnit, category, id, true, true)
    }

  }

  toggle() {
    // this.dataService.passSpinnerFlag(true, true);
    this.observationsRecommendationsToggle = !this.observationsRecommendationsToggle
    this.dropDownShow = false;
    if (this.observationsRecommendationsToggle) {
      //call recs
      this.dataService.passSpinnerFlag(true, true);
      this.getRecommendations(true);

    } else {
      //call obs
      this.dataService.passSpinnerFlag(true, true);
      this.getObservationsList(this.selectedUnit, this.selectedEquipCategory, this.selectedEquipment, true, true);
    }
    // this.dataService.passSpinnerFlag(true, true);
  }

  saveRemarks() {

  }

  getRecommendations(flag?) {
    if (flag == true) {
      this.dataService.passSpinnerFlag(true, true);
    }
    this.rows = [];
    this.selectedRecommendation = []
    this.inspectionService.getRecommendationsList(this.selectedUnit, this.selectedEquipCategory, this.selectedEquipment, this.statusFilter, this.startDate, this.endDate).subscribe({
      next: (data: any) => {
        if (this.observationsRecommendationsToggle == true) {
          this.rows = data
        }
        let navigatingToInspection = JSON.parse(sessionStorage.getItem('navigatingToInspection'));
        console.log(navigatingToInspection)
        if (navigatingToInspection?.recommendation_id) {
          let index = this.rows.findIndex(ele => { return ele.recommendation_id == navigatingToInspection?.recommendation_id });
          if (index >= 0) {
            this.selectedRecommendation = this.rows[index]
            this.scrollToSelectedRow(index)
          } else {
            this.selectedRecommendation = data[0]
          }
        } else {
          if (this.selectedRecommendation?.recommendation_id) {
            let index = this.rows.findIndex(ele => { return ele.recommendation_id == this.selectedRecommendation?.recommendation_id });
            if (index >= 0) {
              this.selectedRecommendation = this.rows[index]
              this.scrollToSelectedRow(index)
              this.attachmentCount = 0
              this.selectedRecommendation?.images?.forEach((val, ind) => {
                if (val != null) {
                  this.attachmentCount += 1
                }
              })
            } else {
              this.selectedRecommendation = data[0]
              this.attachmentCount = 0
              this.selectedRecommendation?.images?.forEach((val, ind) => {
                if (val != null) {
                  this.attachmentCount += 1
                }
              })
            }
          } else {
            this.selectedRecommendation = data[0]
            this.attachmentCount = 0
            this.selectedRecommendation?.images?.forEach((val, ind) => {
              if (val != null) {
                this.attachmentCount += 1
              }
            })
          }
        }
        this.selectedRecImages = [];
        this.getObservationDetails(false);
        this.selected = [this.selectedRecommendation]
        // this.dataService.passSpinnerFlag(true, true);
        setTimeout(() => {
          sessionStorage.removeItem('navigatingToInspection')
          sessionStorage.removeItem('selectedTabInspection')
          sessionStorage.removeItem('selectedObsRec')
          sessionStorage.removeItem('dashboard-navigation-filter')
        }, 500)
        console.log(this.selectedRecommendation)
        // this.getRecommendationsComments()
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        var msg = 'Error occured. Please try again.';
        this.snackbarService.show(msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }

  selectedPlanCategory(selectedKey, id?) {
    // this.planCategory = selectedKey;
    this.selectedCategoryData = this.category[selectedKey];
    if (id) {
      this.selectedPlanCategoryData(id);
    }
    else {
      this.selectedPlanCategoryData(this.selectedCategoryData[0]);
    }

  }

  removeTaggedEmail(email: any) {
    this.deleteselectedTaggedPerson(email)
  }
  deleteselectedTaggedPerson(userName) {
    // this.dataService.passSpinnerFlag(true, true);
    // this.deleteTagPersonsIssueModel.user_id = userName.id
    // this.deleteTagPersonsIssueModel.issue_id = this.firtIssue.issue_number
    // this.inspectionService.DeletePersonsTaggedInIssues(this.deleteTagPersonsIssueModel).subscribe({
    //   next: (data) => {
    //     this.emailIds.push(userName)
    //     let obj = { issue_number: this.firtIssue?.issue_number, type: '' }
    //     this.getLatestData.emit(obj)
    //   },
    //   error: () => {
    //     this.taggedEmailIds.push(userName)
    //     this.userValidation();
    //     this.dataService.passSpinnerFlag(false, true);
    //     this.msg = 'Error occured. Please try again.';
    //     this.snackbarService.show(this.msg, true, false, false, false);
    //   },
    //   complete: () => {
    //     // this.dataService.passSpinnerFlag(false, true);
    //   }
    // })
    // this.getIssuesList
    // this.refreshData = true;
  }
  changeIssueStatus() {
    this.dataService.passSpinnerFlag(true, true);
    this.inspectionService.updateStatusRecommendations(this.selectedRecommendation?.recommendation_id, this.selectedRecommendation?.status).subscribe({
      next: (data: any) => {
        // this.selectedRecommendation.status = null
        this.getRecommendations(true);
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
  getRecommendationsComments() {
    this.dataService.passSpinnerFlag(true, true);
    this.inspectionService.getRecommendationsComments(this.selectedRecommendation.recommendation_id).subscribe({
      next: (data: any) => {

        this.dataService.passSpinnerFlag(false, true);
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
  updateRemarkObservation() {
    this.dataService.passSpinnerFlag(true, true);
    this.inspectionService.updateRemarkObservation(this.selectedObservation?.observation_id, this.selectedObservationRemarks).subscribe({
      next: (data: any) => {
        this.getObservationsList(this.selectedUnit, this.selectedEquipCategory, this.selectedEquipment, true, true);
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        if (this.rows?.length > 0) {
          this.dataService.passSpinnerFlag(false, true);
        }
      }
    })
  }
  getCategoryAndEquipment() {
    console.log(this.isRouteClicked)
    this.isRouteClicked = true
    console.log(this.isRouteClicked)
  }
  getAllfilters() {
    // this.dataService.passSpinnerFlag(true, true);
    this.inspectionService.getCategoryAndEquipment(this.selectedUnit).subscribe({
      next: (data: any) => {
        this.categoryAndEquipment = data;
        sessionStorage.setItem('categoryAndEquipment', JSON.stringify(this.categoryAndEquipment))
        this.equipmentClass = [];
        this.allEquipmentNumber = [];
        data.forEach(ele => {
          this.allEquipmentNumber = [...this.allEquipmentNumber, ...ele.equipments]
          let classIndex = this.equipmentClass.findIndex(element => { return element == ele.equipment_category_name })
          if (classIndex < 0) {
            this.equipmentClass.push(ele);
          }
        })
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        if (this.rows?.length > 0) {
          this.dataService.passSpinnerFlag(false, true);
        }
      }
    })
  }
  onFilterChange() {
    this.storePreviousFilter = false
    if (this.observationAndRecommendationFilter['name'] == 'Show all') {
      this.filter_type = 'show_all'
      console.log(this.filter_type)
    }
    else if (this.observationAndRecommendationFilter['name'] == 'Show only with observations and recommendations') {
      this.filter_type = 'show_only'
      console.log(this.filter_type)
    }
    this.equipmentNumber = [];
    this.categoryAndEquipment.forEach(ele => {
      let equipmentIndex = this.selectedEquipmentClass.findIndex(element => { return element == ele.equipment_category_id })
      if (equipmentIndex >= 0) {
        ele.equipments.forEach(data => {
          // this.equipmentNumber.push(data.equipment_name)
          // let index = this.equipmentNumber.findIndex(data1 => { return data1 == data.equipment_id})
          // if (index < 0) {
          if (this.filter_type == 'show_all') {
            this.equipmentNumber.push(data);
            console.log('show all', this.observationAndRecommendationFilter['name'])
          }
          else {
            if (data.total_obs_count > 0 || data.total_rec_count > 0) {
              this.equipmentNumber.push(data);
              console.log('show obs  and rec', this.observationAndRecommendationFilter['name'])
            }
          }
          // }
        })
      }
    })
    let array = [];
    this.selectedEquipmentNumber.forEach((ele, i) => {
      let index = this.equipmentNumber.findIndex(data => { return data == ele });
      console.log(index);
      if (index >= 0) {
        array.push(ele)
      }
    })
    this.selectedEquipmentNumber = [...array]
    console.log(this.equipmentNumber, this.categoryAndEquipment, this.selectedEquipmentClass)
  }
  statusFilterChange() {
    this.storePreviousFilter = false
  }
  onEquipmentChange() {
    this.storePreviousFilter = false
  }
  filterEquipmentList() {
    // this.category = data
    this.tempCategory = JSON.parse(sessionStorage.getItem('tempCategory'))
    this.tempCategory.forEach((ele, i) => {
      let obj = ele;
      let index = this.category.findIndex(data => { return data.equipment_category_id == ele.equipment_category_id })
      if (index >= 0) {
        this.category[index].equipments = this.tempCategory[i].equipments.filter((str) => { return str.equipment_name.toLowerCase().includes(this.filterEquipment.toLowerCase()); });
        if (this.category[index].equipments.length == 0) {
          this.category.splice(index, 1)
        }
      } else {
        let data = this.tempCategory[i].equipments.filter((str) => { return str.equipment_name.toLowerCase().includes(this.filterEquipment); });
        if (data.length > 0) {
          this.category.push(ele);
          let index = this.category.findIndex(data => { return data.equipment_category_id == ele.equipment_category_id })
          if (index >= 0) {
            this.category[index].equipments = data
          }
        }
      }
    })
    let newObsCategoriesData = [];
    this.category.forEach(category => {
      let data = { ...category, 'index': this.tempCategory.findIndex(data => { return data.equipment_category_name === category.equipment_category_name }) }
      newObsCategoriesData.push(data);
    })
    newObsCategoriesData.sort((v1, v2) => { return v1.index - v2.index })
    newObsCategoriesData.forEach(obj => {
      delete obj.index
    })
    this.category = newObsCategoriesData
    this.category = this.category.filter(d => d.equipments.length > 0);
    this.category = [...this.category]
  }

  filterApply() {
    this.isRouteClicked = false;
    this.storePreviousFilter = true;
    console.log(this.observationAndRecommendationFilter['name'])
    console.log(this.selectedEquipmentNumber, this.selectedEquipmentClass)
    if (this.observationAndRecommendationFilter['name'] == 'Show all') {
      this.filter_type = 'show_all'
      console.log(this.filter_type)
    }
    else if (this.observationAndRecommendationFilter['name'] == 'Show only with observations and recommendations') {
      this.filter_type = 'show_only'
      console.log(this.filter_type)
    }
    this.filterEquipment = ''
    let categoryAndEquipment: any[] = JSON.parse(sessionStorage.getItem('categoryAndEquipment'))
    let selectedEquipCategory = [];
    let selectedEquipmentNumber = [];
    this.selectedEquipmentClass.forEach(ele => {
      let index = categoryAndEquipment.findIndex(data => { return data.equipment_category_name == ele });
      if (index >= 0) {
        selectedEquipCategory.push(categoryAndEquipment[index])
      }
    })
    selectedEquipCategory.forEach((ele, i) => {
      selectedEquipCategory[i].equipments = []
    })
    categoryAndEquipment = JSON.parse(sessionStorage.getItem('categoryAndEquipment'))
    this.selectedEquipmentNumber.forEach(ele => {
      categoryAndEquipment.forEach((ele1, i) => {
        let index1 = selectedEquipCategory.findIndex(ele2 => { return ele2.equipment_category_name == ele1.equipment_category_name });
        if (index1 >= 0) {
          let index2 = categoryAndEquipment[i].equipments.findIndex(ele3 => { return ele3.equipment_name == ele });
          if (index2 >= 0) {
            selectedEquipCategory[index1].equipments.push(categoryAndEquipment[i].equipments[index2])
          }
        }
      })
      this.category = [...selectedEquipCategory]
      sessionStorage.setItem('tempCategory', JSON.stringify(this.category))
    })
    this.selectedCategory = this.category[0]?.equipments[0]?.equipment_id;
    this.selectedEquipment = this.category[0]?.equipments[0]?.equipment_id;
    this.selectedEquipCategory = this.category[0]?.equipment_category_id;
    this.getEquipmentCategoryEquipments(this.selectedUnit, '', '',)
  }
  filterReset() {
    this.filter_type = 'show_all'
    this.observationAndRecommendationFilter = this.observationAndRecommendation[0]?.name;
    this.filterEquipment = ''
    this.startDate = ''
    this.endDate = ''
    this.selectedDate = ['', '']
    let data = JSON.parse(sessionStorage.getItem('categoryAndEquipment'));
    this.category = data
    sessionStorage.setItem('tempCategory', JSON.stringify(this.category))
    this.isRouteClicked = false;
    this.selectedEquipmentClass = [];
    this.selectedEquipmentNumber = [];
    this.statusFilter = [];
    this.selectedCategory = data[0].equipments[0].equipment_id;
    this.selectedEquipment = data[0].equipments[0].equipment_id;
    this.selectedEquipCategory = data[0].equipment_category_id;
    this.getEquipmentCategoryEquipments(this.selectedUnit, '', '',)
  }
  onRouteClicked() {
    this.isRouteClicked = false;
    this.selectedEquipmentClass = [];
    this.selectedEquipmentNumber = [];
    this.statusFilter = [];
  }
  selectedAllEquipmentClass() {
    let selectAll = []
    this.equipmentClass.forEach((ele) => {
      selectAll.push(ele?.equipment_category_id)
    })
    this.selectedEquipmentClass = selectAll;
    this.equipmentNumber = [];
    // this.categoryAndEquipment.forEach(ele => {
    //   ele.equipments.forEach(data => {
    //     let index = this.equipmentNumber.findIndex(data1 => { return data1 == data.equipment_name })
    //     if (index < 0) {
    //       this.equipmentNumber.push(data);
    //     }
    //   })

    // })
    this.onFilterChange()
  }
  unSelectAllEquipmentClass() {
    this.selectedEquipmentClass = [];
    this.equipmentNumber = [];
    this.selectedEquipmentNumber = [];
  }
  selectedAllEquipmentNumber() {
    let selectAll = []
    this.equipmentNumber.forEach((ele) => {
      selectAll.push(ele.equipment_id)
    })
    this.selectedEquipmentNumber = selectAll
    this.storePreviousFilter = false
    // this.onFilterChange()
  }
  unSelectAllEquipmentNumber() {
    this.selectedEquipmentNumber = []
  }
  selectedAllFilter() {
    this.statusFilter = this.status
    this.storePreviousFilter = false
  }
  unSelectAllFilter() {
    this.statusFilter = []
  }

  showCauseBtns() {
    setTimeout(() => {
      this.remarksUpdate = true
    }, 300)
  }
  closeAllOpenBtns() {
    this.remarksUpdate = false
  }
  selectedPlanCategoryData(selectedCategory) {
    this.selectedCategory = selectedCategory;
    // this.getFunctionWiseIssuesCount(this.unitName, this.planCategory, this.selectedCategory, this.department);
    // this.getTasks(this.unitName, this.planCategory, this.selectedCategory, this.department);
  }
  onChange(event: any) {
    console.log(event?.[0]?.size)
    this.selectedMode = false;
    if (event?.[0]?.size / 1024 / 1024 <= 5) {
      console.log(event?.[0]?.size)
      this.file = event?.[0]
      // console.log('event.target.files', event.target.files[0])
      if (event) {
        // for (let i = 0; i < File?.length; i++) {
        //   var reader = new FileReader();
        //   reader.readAsDataURL(event?.target?.files[i]);
        //   reader.onload = (e: any) => {
        //     this.imageSrc.push(e.target.result)
        //   }
        // }
        var reader = new FileReader();
        reader.readAsDataURL(event?.[0]);
        let format = event?.[0].type;
        reader.onload = (e: any) => {
          if (format.includes('image')) {
            this.url = e.target.result
          }
          else if (format.includes('pdf')) {
            this.url = e.target.result
          }
          else {
            this.otherFiles.push({ 'image': e.target.result });
          }
        }
      }
      this.myInputVariable.nativeElement.value = "";
    }
    else {
      this.myInputVariable.nativeElement.value = "";
      this.url = ''
      this.snackbarService.show('Max. size is 5MB', false, false, false, true);
    }
  }

  storeAnnotation(event) {
    this.images = [event];
    let annotationComment = event['label']
    console.log(this.images, annotationComment)
    this.annotationSaved = true
  }
  createObServation() {
    this.dataService.passSpinnerFlag(true, true);
    let unit_name = ''
    if (this.images.length < 1 && this.url) {
      this.images.push({ image: this.url })
    }
    else if (this.images.length < 1 && !this.url) {
      this.images = []
    }
    this.units.forEach((val, ind) => {
      if (this.selectedUnit == val.id) {
        unit_name = val.name
      }
    })
    let image_upload = {};
    image_upload['unit'] = Number(this.selectedUnit);
    image_upload['unit_name'] = unit_name;
    image_upload['equipment_id'] = this.selectedCategory;
    image_upload['component_id'] = this.componentId;
    image_upload['observation_desc'] = this.createObservations.observation_desc;
    image_upload['date'] = this.createObservations.date;
    image_upload['images'] = this.images;
    this.inspectionService.createObServation(image_upload).subscribe({
      next: (data) => {
        image_upload = {}
        this.url = '';
        this.images = [];
        this.file = null;
        this.selectedMode = false;
        this.clearPopUpData('')
        this.createObservations.date = moment().format('YYYY-MM-DD');
        this.closeModal.nativeElement.click();
        this.msg = 'Observation Created successfully';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.getEquipmentCategoryEquipments(this.selectedUnit, '', '', true)
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
  onObsNavigation() {
    this.observationsRecommendationsToggle = !this.observationsRecommendationsToggle
    // this.selectedUnit = this.units[0]?.id
    // this.getEquipmentCategoryEquipments(this.selectedUnit, '', '')
    // this.getUserList();
    // this.getAllfilters();
  }
  clearPopUpData(data) {

    this.dropDownShow = true
    this.url = ''
    this.file = null
    this.createObservations.observation_desc = ''
    this.createObservations.date = moment().format('YYYY-MM-DD');
    this.images = []
    this.otherFiles = []
    this.selectedMode = false;
    this.createRecomondations.recommendation_desc = ''
    this.createRecomondations.fault = ''
    if (data == 'clearObservation') {
      this.createRecomondations.observation_id = []
      this.createRecomondations.tagged_users = []
    }
  }
  createRecomondation() {
    this.dataService.passSpinnerFlag(true, true);
    let unit_name = ''
    if (this.images.length < 1 && this.url) {
      this.images.push({ image: this.url })
    }
    else if (this.images.length < 1 && !this.url) {
      this.images = []
    }
    this.units.forEach((val, ind) => {
      if (this.selectedUnit == val.id) {
        unit_name = val.name
      }
    })
    let image_upload = {};
    image_upload['unit'] = Number(this.selectedUnit);
    image_upload['unit_name'] = unit_name;
    image_upload['equipment_id'] = this.selectedCategory;
    image_upload['component_id'] = this.componentId;
    image_upload['recommendation_desc'] = this.createRecomondations.recommendation_desc;
    image_upload['fault'] = this.createRecomondations.fault;
    image_upload['tagged_users'] = this.createRecomondations.tagged_users;
    image_upload['observation_id'] = Array.isArray(this.createRecomondations.observation_id) ? this.createRecomondations.observation_id : this.createRecomondations.observation_id ? [this.createRecomondations.observation_id] : [];
    image_upload['images'] = this.images.concat(this.otherFiles);
    image_upload['date'] = this.createObservations.date;
    this.inspectionService.createRecomondation(image_upload).subscribe({
      next: (data: any) => {
        this.url = ''
        this.file = null;
        this.images = [];
        this.createObservations.date = moment().format('YYYY-MM-DD');
        this.closeModal.nativeElement.click();
        this.msg = 'Recommendation Created successfully';
        // this.observationsList = []
        this.clearPopUpData('clearObservation')
        this.selectedMode = false;
        this.addEmailIds(data.recommendation_id, this.createRecomondations?.tagged_users);
        this.getEquipmentCategoryEquipments(this.selectedUnit, '', '', true)
        this.snackbarService.show(this.msg, false, false, false, false);
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
  getComponentList(unit_id, equipmentCategory, booleanValue?) {
    this.dataService.passSpinnerFlag(true, true);
    this.inspectionService.getComponentList(unit_id, equipmentCategory).subscribe({
      next: (data: any) => {
        this.componentList = data?.[0].component_list
        this.componentId = this.componentList[0]?.id
        console.log(this.componentList, data)
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        if (booleanValue == true || this.rows.length > 0) {
          this.dataService.passSpinnerFlag(false, true);
        }
      }
    })
  }

  getObservationDetails(booleanValue?) {
    if (this.selectedRecommendation?.recommendation_id !== undefined) {
      this.inspectionService.getObservationDetails(this.selectedRecommendation?.recommendation_id).subscribe({
        next: (data: any) => {
          this.selectedRecImages = this.selectedRecommendation.images;
          data[0].linked_obs.forEach(d => {
            this.selectedRecImages = this.selectedRecImages.concat(d.image_info);
          });
          this.attachmentCount = this.selectedRecImages.length;
        },
        error: () => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        complete: () => {
          if (booleanValue == true || this.rows?.length > 0) {
            this.dataService.passSpinnerFlag(false, true);
          }
        }
      })
    }
  }

  scaleAspectRatio() {
    this.actionPoints = [];
    // this.selectedMedia.annotations.forEach(item => {
    //   if (item.shape === 'rectangle') {
    //     this.actionPoints.push({ index: item.index, top: (item.coordinates[1] / this.canvasRatio) - 15, left: ((item.coordinates[0] / this.canvasRatio) - 15) + this.bufferMargin, comment: item.comments[0].comment, coordinates: item.coordinates });
    //   }
    //   else if (item.shape === 'circle') {
    //     this.actionPoints.push({ index: item.index, top: ((item.coordinates[1] / this.canvasRatio) - (item.coordinates[2] / this.canvasRatio)) - 15, left: (item.coordinates[0] / this.canvasRatio - 15) + this.bufferMargin, comment: item.comments[0].comment, coordinates: item.coordinates });
    //   }
    // });
  }

  openAnnotationModal(annotation) {
    $("[id^='content']").hide();
    $('#content' + annotation.index).css('left', annotation.left + 'px');
    $('#content' + annotation.index).css('top', annotation.top + 'px');
    $('#content' + annotation.index).show();
    this.selectAnnotation = { ...annotation };
  }
  openSelectedAnnotation($event) {
    this.selectAnnotation = this.actionPoints.find(item => item.index === $event.index);
    this.openAnnotationModal(this.selectAnnotation);
  }
  annotationSaved = true
  changeMode() {
    this.selectedMode = !this.selectedMode;
    if (this.selectedMode) {
      this.annotationSaved = false
    }
    let image: any = document.getElementById('modalImage');
    var style = image.currentStyle || window.getComputedStyle(image);
    this.canvasHeight = image.height;
    this.canvasWidth = image.width;
    this.canvasRatio = 2160 / this.canvasHeight;
    this.bufferMargin = Number(style.marginLeft.slice(0, style.marginLeft.length - 2));
    if (!this.selectedMode) {
      this.clearCanvas();
    }
    else {
    }
    this.scaleAspectRatio();
    this.trigger = Date.now();
  }

  clearCanvas() {
    if (!$.isEmptyObject(this.selectedMedia)) {
      let canvas: any = document.getElementById('canvas');
      canvas.getContext('2d').clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
  }
  scrollToSelectedRow(index) {
    setTimeout(() => {
      console.log(index)
      let tableBody = document.querySelector('.ngx-datatable.material .datatable-body');
      if (tableBody) {
        let rowHeight = 70;
        tableBody.scrollTop = index * rowHeight
      }
    }, 500)

  }

  selectImageToDisplay(obj) {
    console.log('obj', obj)
    let myArray = obj?.image_path.split("/");
    myArray.reverse()
    this.selectedImageName = myArray?.[0]
    $('#inspectionImageViewer').modal('show');
    this.selectedImage = obj;
    if (!this.selectedImage.image_path.includes('pdf')) {
      this.initiateDrawing();
    }
  }

  onImageSelect(obj) {
    this.selectedImage = obj;
    let myArray = obj?.image_path.split("/");
    myArray.reverse()
    this.selectedImageName = myArray?.[0]
    if (!this.selectedImage.image_path.includes('pdf')) {
      this.initiateDrawing();
    }
    console.log(obj)
  }

  initiateDrawing() {
    setTimeout(() => {
      this.canvasData.boundingBoxes = [];
      this.canvasData.circles = [];
      this.initializeCanvas();
      document.getElementById('popupCanvas').style.zIndex = '9';
    }, 200);
  }

  initializeCanvas() {
    let image: any = document.getElementById('popupModalImage').getBoundingClientRect();
    let canvas = document.getElementById('popupCanvas');
    this.canvasData.height = image.height;
    this.canvasData.width = image.width;
    canvas.setAttribute('height', this.canvasData.height);
    canvas.setAttribute('width', this.canvasData.width);
    this.canvasData.canvas = canvas;
    this.canvasData.context = this.canvasData.canvas.getContext('2d');
    this.canvasData.index = this.canvasData.boundingBoxes.length + this.canvasData.circles.length + 1;
    this.canvasData.canvasOffset = $('#popupCanvas').offset();
    this.resetCanvas();
  }

  resetCanvas() {
    this.canvasData.m = {};
    this.canvasData.o = {};
    this.canvasData.start = {};
    this.canvasData.circle = null;
    this.canvasData.radius = null;
    this.canvasData.startX = null;
    this.canvasData.startY = null;
    this.canvasData.isMouseDown = false;
    this.canvasData.finalPos = { x: 0, y: 0 };
    this.canvasData.startPos = { x: 0, y: 0 };
    this.canvasData.context.clearRect(0, 0, this.canvasData.canvas.width, this.canvasData.canvas.height);
    this.canvasData.boundingBoxes = this.selectedImage.annotations.filter(item => item.drawing_type === 'rectangle');
    this.canvasData.circles = this.selectedImage.annotations.filter(item => item.drawing_type === 'circle');
    this.canvasData.boundingBoxes.map(r => { this.drawRect(r) });
    this.canvasData.circles.map(c => this.drawCircle(c));
  }

  drawRect(o) {
    let d = o.coordinates.map(e => e / (2160 / this.canvasData.height));
    this.canvasData.context.strokeStyle = (o.color) ? o.color : this.canvasData.color;
    this.canvasData.context.lineWidth = (o.thickness) ? o.thickness : this.canvasData.thickness;
    let a = { x: d[0], y: d[1], w: d[2], h: d[3] };
    this.canvasData.context.beginPath(a);
    this.canvasData.context.rect(a.x, a.y, a.w, a.h);
    this.canvasData.context.stroke();
  }

  drawCircle(c) {
    let d = c.coordinates.map(e => e / (2160 / this.canvasData.height));
    this.canvasData.context.beginPath();
    this.canvasData.context.arc(d[0], d[1], d[2] / 2, 0, 2 * Math.PI);
    this.canvasData.context.strokeStyle = (c.color) ? c.color : this.canvasData.color;
    this.canvasData.context.lineWidth = (c.thickness) ? c.thickness : this.canvasData.thickness;
    this.canvasData.context.stroke();
  }

  removePdf() {
    this.file = null;
    this.url = '';
    // this.imageSrc = []
    console.log('imageSrc', this.imageSrc)
  }

  onFileUpload(event, type) {

    this.dataService.passSpinnerFlag(true, true);
    let imageSrc = [];
    if (event.target.files) {
      for (let i = 0; i < event?.target?.files?.length; i++) {
        if (event.target.files[i].size / 1024 / 1024 <= 5) {
          var reader = new FileReader();
          reader.readAsDataURL(event?.target?.files[i]);
          reader.onload = (e: any) => {
            imageSrc.push({ 'image': e.target.result })
          }
        } else {
          this.snackbarService.show('Max. size is 5MB', false, false, false, true);
        }
      }
    }
    // this.selectedMode = false;
    // if (event?.target.files?.[0]?.size / 1024 / 1024 < 5) {
    //   console.log(event?.target?.files?.[0]?.size)
    //   this.file = event?.[0]
    //   if (event.target.files) {
    //     var reader = new FileReader();
    //     reader.readAsDataURL(event?.target?.files[0]);
    //     let format = event?.target?.files?.[0].type;
    //     reader.onload = (e: any) => {
    //       if (format.includes('image')) {
    //         this.imageSrc.push({'image':e.target.result})
    //         console.log('imageSrc', this.imageSrc)
    //         // this.url = e.target.result
    //       }
    //       else if (format.includes('pdf')) {
    //         // this.url = e.target.result
    //         this.imageSrc.push({'image':e.target.result})
    //         console.log('imageSrc', this.imageSrc)
    //       }
    //     }
    //   }
    //   this.myInputVariable.nativeElement.value = "";
    // }
    // else {
    //   this.myInputVariable.nativeElement.value = "";
    //   this.imageSrc = []
    //   this.snackbarService.show('Max. size is 5MB', false, false, false, true);
    // }
    setTimeout(() => {
      let unit_name = ''
      this.units.forEach((val, ind) => {
        if (this.selectedUnit == val.id) {
          unit_name = val.name
        }
      })
      let image_upload = {};
      image_upload['unit_name'] = unit_name;
      if (type === 'obs') {
        console.log(this.selectedObservation);
        image_upload['observation_id'] = this.selectedObservation.observation_id;
      }
      else {
        image_upload['recommendation_id'] = this.selectedRecommendation.recommendation_id;
      }
      image_upload['file_attachment'] = imageSrc;
      this.inspectionService.addFile(image_upload).subscribe({
        next: (data) => {
          image_upload = {}
          event.target.value = null
          this.msg = 'File(s) added successfully';
          this.snackbarService.show(this.msg, false, false, false, false);
          if (this.observationsRecommendationsToggle) {
            this.getRecommendations(true);
          } else {
            this.getObservationsList(this.selectedUnit, this.selectedEquipCategory, this.selectedEquipment, true, true);
          }
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
    }, 500);
  }
  displayImageFileName(val) {
    let url = val.split('/');
    return url[url.length - 1];
  }
  deleteAttachment(name, id) {
    this.dataService.passSpinnerFlag(true, true);
    this.inspectionService.deleteAttachment({ name: name, id: id }).subscribe({
      next: (data) => {
        this.msg = 'File deleted successfully';
        $('#deleteModal').modal('hide')
        this.snackbarService.show(this.msg, false, false, false, false);
        if (this.observationsRecommendationsToggle) {
          this.getRecommendations(true);
        } else {
          this.getObservationsList(this.selectedUnit, this.selectedEquipCategory, this.selectedEquipment, true, true);
        }
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
  showConfirmationModal(name, id, user?, item?) {
    console.log(user, item)
    this.name = name
    this.id = id
  }
  deleteObservation() {
    this.deleteAttachment(this.name, this.id)
  }
  generateReport() {
    if (this.validateReportGenerate()) {
      $('#exampleModalToggle').modal('show');
    }
  }
  createGenerateReport() {
    // this.selectedObservation
    this.dataService.passSpinnerFlag(true, true);
    let data = {}
    data['unit_id'] = this.selectedUnit
    data['equipment_category_name'] = this.equipmentCategoryName
    data['equipment_category_id'] = this.selectedEquipCategory
    data['equipment_name'] = this.selectedEquipmentName
    data['equipment_id'] = this.selectedCategory
    // this.snackbarService.show("Report generation action sucessfully done", false, false, false, false);
    // setTimeout(() => {
    //   this.snackbarService.show("Report will generate after 5 min", false, false, false, true);
    // },4000)

    this.inspectionService.generateReport(data).subscribe({
      next: (data) => {
        $('#exampleModalToggle').modal('hide');
        // this.snackbarService.show("Report generation action sucessfully done", false, false, false, false);
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
        setTimeout(() => {
          this.snackbarService.show("Report will generate in 5 minutes and will be available in Reports page", false, false, false, true);
        }, 4000)
      }
    })
  }
  onToggleClick(categoryKey) {
    categoryKey.istoggled = !categoryKey.istoggled
  }
  datePicker(data) {
    this.storePreviousFilter = false
    // let date = this.selectedDate.split(',');
    let stDate = new Date(this.selectedDate[0])
    let startDate: any = stDate.getDate();
    if (startDate < 10) {
      startDate = '0' + startDate;
    } else {
      startDate = startDate;
    }
    let startMonth: any = stDate.getMonth() + 1;
    if (startMonth < 10) {
      startMonth = '0' + startMonth;
    } else {
      startMonth = startMonth;
    }
    this.startDate = stDate.getFullYear() + '-' + startMonth + '-' + startDate
    // this.startDate = stDate.getFullYear() + '-' + (stDate.getMonth() + 1) + '-' + stDate.getDate()
    let edDate = new Date(this.selectedDate[1])
    let endDate: any = edDate.getDate();
    if (endDate < 10) {
      endDate = '0' + endDate;
    } else {
      endDate = endDate;
    }
    let endMonth: any = edDate.getMonth() + 1;
    if (endMonth < 10) {
      endMonth = '0' + endMonth;
    } else {
      endMonth = endMonth;
    }
    this.endDate = edDate.getFullYear() + '-' + endMonth + '-' + endDate
    console.log(this.startDate, this.endDate, this.selectedDate)
    this.selectedDate = [this.startDate, this.endDate]
  }
  validateReportGenerate() {
    let categoryIndex = -1;
    let equipmentsIndex = -1;
    this.category.forEach((ele, i) => {
      let index = ele.equipments.findIndex(ele1 => { return ele1.equipment_id == this.selectedCategory })
      if (index >= 0) {
        categoryIndex = i;
        equipmentsIndex = index;
      }
    })
    if (categoryIndex >= 0 && equipmentsIndex >= 0) {
      if (this.category[categoryIndex].equipments[equipmentsIndex].total_obs_count == 0 && this.category[categoryIndex].equipments[equipmentsIndex].total_rec_count == 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  returnObsRecEquipmentCount(data) {
    return data.filter(d => (d.total_obs_count + d.total_rec_count) > 0).length;
  }
}
