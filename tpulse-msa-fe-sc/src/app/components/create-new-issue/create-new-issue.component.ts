import { Component, Input, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';
import { CreateIssueModel } from 'src/app/shared/models/create-issue-model';
import { IssuesService } from 'src/app/shared/services/issues.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { CommonService } from 'src/shared/services/common.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-create-new-issue',
  templateUrl: './create-new-issue.component.html',
  styleUrls: ['./create-new-issue.component.scss']
})
export class CreateNewIssueComponent implements OnInit, OnChanges {
  @Input() selectedUnitId: any;
  @Input() selectedPage: any;
  @Input() selectedUnitName: any;
  @Output() issueCreated: EventEmitter<any> = new EventEmitter()
  @Output() equipmentCategoryList : EventEmitter<any> = new EventEmitter()
  equipmentCategories: any[] = [];
  equipmentCategory_id: any;
  equipment_id: any;
  validateUser: boolean;
  equipmentsList: any;
  tasks_list: any;
  // selectedSummary : any;
  task_id: any;
  issue_types_list: any;
  created_by: any;
  issue_id: any;
  issue_created_date: any;
  searchRelatedEmailData: any;
  emailIds: any[] = []
  emailIdsCopy: any[] = []
  taggedEmailIds: any[] = []
  users_list: any[] = []
  risk_rating: any = 1;
  deadline_to_close: any;
  comments: any;
  issue_type_id: any;
  createIssueModel: CreateIssueModel
  msg: string;
  selectedEmail: any = [];
  summary: any;
  file_list: any[] = [];
  url = "/assets/images/panel.svg";
  photoFileName: any;
  actionCommentImage1: any;
  actionCommentImage: any[] = [];
  loginUserEmail: any;
  createIssueFilters: any;
  constructor(private issuesService: IssuesService,
    private dataService: DataService,
    private router: Router,
    private snackbarService: SnackbarService,
    public commonServices: CommonService) { }

  ngOnInit(): void {
    this.createIssueModel = new CreateIssueModel({})
    let date = new Date();
    var m: any = date.getMonth() + 1
    if (m.toString().length == 1) {
      console.log('m', m)
      var month: any = '0' + m
    }
    this.issue_created_date = date.getFullYear() + "-" + month + "-" + date.getDate();
    console.log('issue_created_date', this.issue_created_date)
    this.getLoggedUser()
    let userMail = sessionStorage.getItem('user-email');
    this.loginUserEmail = userMail
    this.createIssueFilters = JSON.parse(sessionStorage.getItem('createIssueNavigation'));
    sessionStorage.removeItem('createIssueNavigation');
  }
  getLoggedUser() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getLoggedUser().subscribe({
      next: (data) => {
        this.created_by = data
        console.log(this.created_by)
        this.getUserList()
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

  // updateRiskRating() {
  //   this.dataService.passSpinnerFlag(true, true);
  //   this.issuesService.updateRiskRating({ issue_id: this.firtIssue.issue_number, risk_rating: this.selectedRiskRating }).subscribe({
  //     next: (data: any) => {
  //       this.getLatestData.emit(this.firtIssue?.issue_number)
  //       // this.dataService.passSpinnerFlag(false, true);
  //     },
  //     error: () => {
  //       this.dataService.passSpinnerFlag(false, true);
  //       this.msg = 'Error occured. Please try again.';
  //       this.snackbarService.show(this.msg, true, false, false, false);
  //     },
  //     complete: () => {
  //       // this.dataService.passSpinnerFlag(false, true);
  //     }
  //   })
  // }

  // onSelectFile(e){
  //   if(e.target.files){
  //     var reader = new FileReader()
  //     reader.readAsDataURL(e.target.files[0])
  //     reader.onload=(event : any)=>{
  //       this.url = event.target.result
  //     }
  //   }

  // }

  onSelectFile(event: any) {
    console.log(event.target.files)

    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }
    event.target.files.forEach(ele =>{
      console.log(ele)
      let actionImage: any
      this.actionCommentImage1 = ''
      if (ele.size / 1024 / 1024 <= 5) {
        let mineType = ele.type;
        if (mineType.match(/image\/*/) == null) {
          return;
        }
        let reader = new FileReader();
        reader.readAsDataURL(ele);
        reader.onload = (_event) => {
          actionImage = reader.result;
          this.actionCommentImage1 = reader.result;
          let actionImageName = ele.name

          let data = actionImageName.split('.')
          let row_pathName = Math.floor((Math.random() * 99) * 7) + '' + data[0] + '.' + data[1];

          var file = this.dataURLtoFile(this.actionCommentImage1, row_pathName);
          let base64Image = [file]
          this.dataService.passSpinnerFlag(true, true);
          this.issuesService.createIssueImageUpload(this.selectedUnitName, base64Image).subscribe(data => {
            // this.selectedCommentImageUrl.push(data)
            this.actionCommentImage.push({ actionImage: this.actionCommentImage1, actionImageName, imagePath: data })
            this.dataService.passSpinnerFlag(false, true);
            console.log(this.actionCommentImage)
            this.file_list = this.actionCommentImage.map(o => o.imagePath[0]);
            // this.file_list = this.actionCommentImage[0]?.['imagePath']
            console.log(this.file_list)
          },
            error => {
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            },
            () => {
              this.dataService.passSpinnerFlag(false, true);
            }
          )
        }
      } else {
        this.snackbarService.show('Max. size is 5MB', false, false, false, true);
      }
    })
    // this.clearObservationCanvas();
    // // this.imagePath = event.target.files;
    // this.imageName = event.target.files[0].name
  }
  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }





  getUserList() {
    // this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getUserList().subscribe({
      next: (data: any) => {
        this.users_list = data
        this.emailIds = data
        this.emailIdsCopy = data
        this.getIssueType()
        this.getSelectedEmail('');
        // this.userValidation();
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
  getIssueType() {
    // this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getIssueType().subscribe({
      next: (data: any) => {
        this.issue_types_list = data
        // this.issue_type_id = this.issue_types_list[0]?.id
        this.issue_type_id = null
        this.getIssueId()
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
  getIssueId() {
    // this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getIssueId().subscribe({
      next: (data: any) => {
        this.issue_id = data.issue_number
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
  ngOnChanges() {
    this.getEquipmentCategories()
  }
  getEquipmentCategories() {
    if (this.selectedUnitId) {
      this.dataService.passSpinnerFlag(true, true);
      this.issuesService.getEquipmentCategories(this.selectedUnitId).subscribe({
        next: (data: any) => {
          if (data.length > 0) {
            this.equipmentCategories = data
            this.equipmentCategoryList.emit(this.equipmentCategories)
            this.equipmentCategory_id = (this.createIssueFilters) ? this.equipmentCategories.find(dep => dep.name === this.createIssueFilters.equipmentCategory_id).id : this.equipmentCategories?.[0].id
            this.getEquipments(false)
          }
          else {
            this.equipmentCategories = []
            this.equipmentsList = []
            this.tasks_list = []
            this.dataService.passSpinnerFlag(false, true);
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
  }
  validateSummary() {
    let regexp1 = new RegExp(/^[^-\s][ A-Za-z0-9_!~`$%^*()={}:;"'<>?[@.,/#&+-]*$/);
    let regexp2 = new RegExp(/^[A-Za-z0-9@.,?-_\s-]*$/);
    //console.log(regexp.test(this.name), this.name);
    var z = document.getElementById('sum');
    if (this.summary == '') {
      z.innerHTML = "";
    }
    else if (regexp1.test(this.summary) == false) {
      z.innerHTML = "Space is not allowed at the start";
      z.style.color = "Red";
      return false;
    }
    else if (regexp2.test(this.summary) == true) {
      z.innerHTML = "";
      return true;
    }
    else {
      z.innerHTML = "Special characters and numbers are not allowed";
      z.style.color = "Red";
      return false;
    }
  }
  getEquipments(showFlag) {
    if (showFlag == true) {
      this.dataService.passSpinnerFlag(true, true);
    }
    this.issuesService.getEquipments(this.equipmentCategory_id).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.equipmentsList = data
          this.equipment_id = (this.createIssueFilters) ? this.createIssueFilters.equipment : this.equipmentsList?.[0].id
          this.getTasks(false)
        }
        else {
          this.equipmentsList = []
          this.tasks_list = []
          this.dataService.passSpinnerFlag(false, true);
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
  getTasks(showFlag) {
    if (showFlag == true) {
      this.dataService.passSpinnerFlag(true, true);
    }
    this.issuesService.getTasks(this.equipment_id).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.tasks_list = data
          // this.task_id = this.tasks_list?.[0].id
          this.task_id = (this.createIssueFilters) ? this.createIssueFilters.task_id : null;
        }
        else {
          this.tasks_list = []
          this.dataService.passSpinnerFlag(false, true);
        }
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        if (this.issue_types_list?.length > 0) {
          this.dataService.passSpinnerFlag(false, true);
        }
      }
    })
  }
  createIssue() {
    let user_ids: any[] = []
    this.dataService.passSpinnerFlag(true, true);
    this.taggedEmailIds.forEach((e, i) => {
      user_ids.push(e.id)
    })
    let images_ids: any[] = []
    this.dataService.passSpinnerFlag(true, true);
    this.actionCommentImage.forEach((e, i) => {
      images_ids.push(e.id)
    })
    this.createIssueModel.unit_id = this.selectedUnitId
    this.createIssueModel.date = this.issue_created_date
    this.createIssueModel.issue_number = this.issue_id
    this.createIssueModel.deadline_to_close = this.deadline_to_close
    this.createIssueModel.task_id = this.task_id
    this.createIssueModel.created_by = this.created_by.email
    this.createIssueModel.issue_status = "Open"
    this.createIssueModel.tag_person_ids = user_ids
    this.createIssueModel.comments = this.comments
    this.createIssueModel.risk_rating = this.risk_rating
    this.createIssueModel.issue_type_id = this.issue_type_id
    this.createIssueModel.summary = this.summary
    this.createIssueModel.file_list = this.file_list;
    this.issuesService.createIssue(this.createIssueModel).subscribe({
      next: (data: any) => {
        this.msg = 'Issue Created Sucessfully.';
        let index = this.tasks_list.findIndex(ele => { return ele.id == this.task_id })
        let department_id = null;
        if (index >= 0) {
          department_id = this.tasks_list[index].department_id
        }
        this.selectedPage = 'myIsuues';
        let obj = {
          page: this.selectedPage,
          department_id
        }
        this.issueCreated.emit(obj)
        // this.router.navigateByUrl('/schedule-control/issue');
        this.snackbarService.show(this.msg, false, false, false, false);
        this.risk_rating = 1;
        this.deadline_to_close = '';
        this.emailIds = [];
        this.issue_type_id = null;
        this.summary = '';
        this.task_id = null;
        this.taggedEmailIds = [];
        if (this.emailIdsCopy?.length > 0) {
          this.emailIds = []
          this.emailIdsCopy.forEach((currentValue) => {
            this.emailIds.push(currentValue)
          })
        }
        user_ids = [];
      },
      error: () => {
        if ((this.issue_type_id === 'null') && (this.task_id === 'null')) {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Issue Type and Task Name cannot be null';
          this.snackbarService.show(this.msg, false, false, false, true);
        }
        else if (this.task_id === 'null') {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Task Name cannot be null';
          this.snackbarService.show(this.msg, false, false, false, true);
        }
        else if ((this.issue_type_id === 'null')) {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Issue Type cannot be null';
          this.snackbarService.show(this.msg, false, false, false, true);
        }
        else {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        }

      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  getSelectedEmail(email: any) {
    this.searchRelatedEmailData = this.emailIds.filter(filter => {
      return filter.email.toUpperCase().match(email.toUpperCase())
    })
    // if (email != '') {
    // }
    // else if (email == '') {
    //   this.searchRelatedEmailData = []
    // }

    console.log('hnvefvbhefhvgh', this.searchRelatedEmailData)
    console.log(this.created_by)
  }
  userValidate() {
    if (this.selectedEmail.email == this.created_by) {
      this.searchRelatedEmailData = this.searchRelatedEmailData
    }
  }
  chipsData(data: any) {
    // this.selectedEmail.email = data.email
    // this.selectedEmail.id = data.id
    this.searchRelatedEmailData = []
    console.log(data)
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

    $('#txtDates').attr('min', minDate);
  }
  addEmailIds() {
    // this.taggedEmailIds = []
    // this.userValidation();
    this.selectedEmail.forEach((val, ind) => {
      let index = this.emailIds.findIndex(ele =>{ return ele.id == val})

      if (index >= 0) {
        this.taggedEmailIds.push({ email: this.emailIds[index].email, id: this.emailIds[index].id })
        this.emailIds.splice(index, 1)
      }
    })
    console.log(this.selectedEmail.id, this.selectedEmail.email)
    this.selectedEmail = []
    console.log('this.taggedEmailIds', this.taggedEmailIds)

  }
  removeTaggedEmail(email: any) {
    this.taggedEmailIds.forEach((val, ind) => {
      if (email.id == val.id) {
        this.taggedEmailIds.splice(ind, 1)
      }
    })
    this.emailIds.push(email)
  }
  increaseRiskRatingLevel() {
    this.risk_rating += 1;
    if (this.risk_rating === 6) {
      this.risk_rating = 5
    }
    console.log(this.risk_rating)
  }
  decreaseRiskRatingLevel() {
    this.risk_rating -= 1;
    if (this.risk_rating === 0) {
      this.risk_rating = 1
    }
    console.log(this.risk_rating)
  }
  selectRiskRating(rating) {
    // if (this.firtIssue.status !== 'Closed' && !this.validateUser) {
    //   this.submitRatingBtn = false
    //     this.risk_rating = rating
    //   }
    this.risk_rating = rating
    console.log(this.risk_rating)
  }

  resetCreateIssueForm() {
    this.taggedEmailIds = []
    this.risk_rating = 1
    this.comments = ''
    this.deadline_to_close = ''
    this.summary = '';
    this.task_id = null;
    this.issue_type_id = null;
    this.actionCommentImage = []
    if (this.createIssueFilters) {
      this.router.navigateByUrl('schedule-control/unit');
      setTimeout(() => {
        this.dataService.passUnitTabs({ 'tab': 'task', 'data': { 'task_id': this.createIssueFilters.task_id } })
      }, 500);
    }
  }
  deleteSlectedCommentImg(i){
    this.actionCommentImage.splice(i, 1)
    this.file_list.splice(i, 1)
  }
  //   userValidation(){
  //     let index = this.taggedEmailIds.findIndex(ele =>{ return ele.id == this.selectedEmail.id})
  //     if(index >= 0 || this.selectedEmail.email == this.created_by){
  //       this.validateUser = false
  //     }else{
  //       this.validateUser =  true
  //     }

  // }
}
