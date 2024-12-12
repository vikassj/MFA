import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { AddReplyToCommentModel, CommentOnIssueModel, DeleteTagPersonsIssueModel, TagPersonsIssueModel } from 'src/app/shared/models/create-issue-model';
import { IssuesService } from 'src/app/shared/services/issues.service';
import { CommonService } from 'src/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
declare var $: any;
@Component({
  selector: 'app-issue-popup-box',
  templateUrl: './issue-popup-box.component.html',
  styleUrls: ['./issue-popup-box.component.scss']
})
export class IssuePopupBoxComponent implements OnInit, OnChanges {
  ColumnMode = ColumnMode;
  selectionType = SelectionType;
  @Output() dataChange = new EventEmitter();
  @Output() getLatestData = new EventEmitter();
  emailIds: any[] = []
  searchRelatedEmailData: any[] = []
  selectedEmail: any = [];
  taggedEmailIds: any[] = []
  newComments: any = '';
  commentOnIssueModel: CommentOnIssueModel;
  addReplyToCommentModel: AddReplyToCommentModel;
  tagPersonsIssueModel: TagPersonsIssueModel;
  deleteTagPersonsIssueModel: DeleteTagPersonsIssueModel
  msg: string;
  firtIssue: any;
  replyshow: boolean = false;
  replyIndex: any;
  currentComment: any;
  comments_id: any;
  comments: any;
  newReply: string = '';
  riskRating: any;
  status: any[] = ["Open", "Closed", "Reopen"];
  selectedStatus: any;
  @Input() selectedIssue: any;
  @Input() departmentList: any;
  @Input() selectedUnitName: any;
  @Input() selectedUnit_id: any;
  users_list: any;
  recordRows: any[] = []
  loggedIssuesData: any[] = []
  log_id: any;
  selected: any[] = []
  rowId: any;
  rowId1: any;
  statusWiseComments: any;
  show_hide_reply: boolean = false
  selected1: any[] = []
  issueRelatedChat: boolean = false;
  submitRatingBtn: boolean = false;
  allUsersList: any;
  loginUserId: any;
  validateUser: boolean;
  commentTagging = [];
  selectedRiskRating = 1;
  loginUserEmail: any;
  loggedUserEmail: string;
  selectedImage = {};
  taggeduserFromComments: any = []

  constructor(public commonService: CommonService,
    private dataService: DataService,
    private issuesService: IssuesService,
    private snackbarService: SnackbarService,
    private router: Router) {
      window.addEventListener('user-tagged', (evt: any) => {
        // this.taggeduserFromComments = []
        this.taggeduserFromComments = evt.detail
        this.addEmailIds();
      })
      window.addEventListener('comment-deleted', (evt: any) => {
      //  console.log(evt.detail)
      this.taggeduserFromComments = []
       var taggedUsersInDeletedComment = evt.detail.comment.filter(item => item.includes('#@'))
       taggedUsersInDeletedComment.forEach((item, i) => {
        let index = this.taggedEmailIds.findIndex(item1 => item1.id == item.split("@")[1])
        if(index >= 0) {
          // if(i + 1 < taggedUsersInDeletedComment.length)
          this.deleteselectedTaggedPerson(this.taggedEmailIds[index], false)
        // } else {
          // this.deleteselectedTaggedPerson(this.taggedEmailIds[index], true)
        }
      });
      })
     }


  ngOnChanges() {
    this.loggedUserEmail = sessionStorage.getItem('user-email')
    this.getUserList()
    this.submitRatingBtn = true
    this.commentTagging = [];
    this.issuesService.getUserList().subscribe({
      next: (data: any) => {
        this.allUsersList = data;
        sessionStorage.setItem('searchRelatedEmailData', JSON.stringify(data));
        console.log('allUsersList ', this.allUsersList)
        this.allUsersList.forEach(element => {
          this.commentTagging.push({ "key": element.name, "value": element.name, "email": element.email, "id": element.id, "username": element.username, "mobile_number": element.mobile_number, "mobile_token": element.mobile_token },)
          let userMail = sessionStorage.getItem('user-email');
          this.loginUserEmail = userMail
          if (element.email == userMail) {
            this.loginUserId = element.id
          }
        })
        this.commentTagging = [...this.commentTagging]
        this.users_list = data
        this.emailIds = data
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
    this.getSelectedEmail('');
  }

  ngOnInit(): void {
    this.commentOnIssueModel = new CommentOnIssueModel({})
    this.addReplyToCommentModel = new AddReplyToCommentModel({})
    this.tagPersonsIssueModel = new TagPersonsIssueModel({})
    this.deleteTagPersonsIssueModel = new DeleteTagPersonsIssueModel({})
  }
  getUserList() {
    if (this.selectedIssue?.issue_number) {
      this.selectedEmail = [];
      // this.users_list = []
      this.emailIds = []
      // this.selectedEmail.email = ''
      // this.selectedEmail.id = ''
      this.searchRelatedEmailData = []
      this.taggedEmailIds = []
      this.firtIssue = undefined
      this.dataService.passSpinnerFlag(true, true)
      this.emailIds = this.users_list
      this.firtIssue = this.selectedIssue
      this.selectedRiskRating = this.firtIssue.risk_rating
      // this.comments = this.selectedIssue?.comments
      this.selectedStatus = this.selectedIssue?.status
      this.taggedEmailIds = this.firtIssue?.persons_tagged
      this.userValidation();
      this.taggedEmailIds?.forEach((email, index) => {
        this.emailIds?.forEach((e, i) => {
          if (email.id == e.id) {
            this.emailIds.splice(i, 1)
          }
        })
      })
      // console.log('this.emailIds', this.emailIds)
      if (this.firtIssue?.issue_number) {
        this.getIssueComments(this.firtIssue?.issue_number)
        this.loggedIssues()
      }
      else {
        this.selected = []
        this.statusWiseComments = []
        this.loggedIssuesData = []
        this.dataService.passSpinnerFlag(false, true);
      }
      // console.log(this.firtIssue)

    }
  }

  getIssueComments(issue_id) {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getIssueComments(issue_id).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.comments = data?.[0]?.comments;
        }
        else {

          this.dataService.passSpinnerFlag(false, true);
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
  closePopUp() {
    this.dataChange.emit(false);
  }
  getSelectedEmail(email: any) {
    // if (email != '') {
    //   this.searchRelatedEmailData = this.emailIds.filter(filter => {
    //     return filter.email.toUpperCase().match(email.toUpperCase())
    //   })
    // }
    // else if (email == '') {
    //   this.searchRelatedEmailData = []
    // }
    // this.taggedEmailIds.forEach(ele =>{
    //   let index = this.searchRelatedEmailData.findIndex(data =>{return data.id == ele.id})
    //   if(index >= 0){
    //     this.searchRelatedEmailData.splice(index, 1);
    //   }
    // })
    // this.searchRelatedEmailData = [...this.searchRelatedEmailData]
    // console.log('hnvefvbhefhvgh', this.searchRelatedEmailData)
this.searchRelatedEmailData = JSON.parse(sessionStorage.getItem('searchRelatedEmailData'))
this.taggedEmailIds.forEach((email, taggedIndex) => {
  this.searchRelatedEmailData.forEach((allEmail, i) => {
    if (email.id == allEmail.id) {
      this.searchRelatedEmailData.splice(i, 1);
    }
  })
});
this.searchRelatedEmailData = [...this.searchRelatedEmailData];
  }
  chipsData(data: any) {
    this.selectedEmail.email = data.email
    this.selectedEmail.id = data.id
    this.searchRelatedEmailData = []
    console.log(data)
  }

  addEmailIds() {
    // this.dataService.passSpinnerFlag(true, true)
    this.taggedEmailIds = [];
    // debugger
    if(this.selectedEmail?.length > 0) {
      this.taggedEmailIds = this.selectedEmail
    } else if(this.taggeduserFromComments.length > 0) {
      this.taggeduserFromComments.forEach(item => {
        this.taggedEmailIds.push(item)
      });
    }
    console.log(this.taggedEmailIds)
    // this.taggeduserFromComments = []

    this.userValidation();
    this.emailIds.forEach((val, ind) => {
      if (this.selectedEmail == val) {
        this.emailIds.splice(ind, 1)
      }
    })
    this.addTaggedUser()
    this.selectedEmail = [];
  }
  removeTaggedEmail(email: any) {
    if (this.loginUserEmail == this.firtIssue?.created_by) {
      this.deleteselectedTaggedPerson(email, true)
    }
  }
  commentOnIssue() {
    this.commentOnIssueModel.issue_id = this.firtIssue?.issue_number;
    this.commentOnIssueModel.comment = this.newComments;
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.commentOnIssue(this.commentOnIssueModel).subscribe(data => {
      this.newComments = '';
      // this.getSingleIssue();
      this.getIssueComments(this.firtIssue?.issue_number)
      // this.getLatestData.emit(this.firtIssue?.issue_number)
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
    this.msg = 'Sucessfully added the comment.';
    this.snackbarService.show(this.msg, false, false, false, false);
  }
  toggleReply(commentId) {
    this.replyshow = true;
    this.replyIndex = commentId;
    this.currentComment = commentId;
    this.comments_id = (this.comments.find((c, i) => i === commentId)).id;
    this.newReply = '';
    this.dataService.passSpinnerFlag(false, true);
  }
  getSingleIssue() {
    // this.taskService.getSingleIssue(this.issueId).subscribe((data) => {
    //   this.firtIssue = data;
    //   this.riskRating = this.firtIssue['risk_rating'];
    //   this.comments = this.firtIssue['comments'];
    //   this.persons_Tagged = this.firtIssue['persons_tagged']
    //   this.status = this.firtIssue.status;
    //   this.disableNewMessage = (this.persons_Tagged.findIndex(item => item === this.loggedUser) > -1) ? false : true;
    //   this.defineChatboxEndpoints();
    //   console.log('singleIssueObject', this.issue_id, this.comments)
    // },
    //   error => {
    //     this.dataService.passSpinnerFlag(false, true);
    //     this.msg = 'Error occured. Please try again.';
    //     this.snackbarService.show(this.msg, true, false, false, false);
    //   },
    //   () => {
    //   }
    // )
  }
  addReplyToComment() {
    this.addReplyToCommentModel.comment_id = this.comments_id;
    this.addReplyToCommentModel.reply = this.newReply;
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.replyToComment(this.addReplyToCommentModel).subscribe(data => {
      this.newReply = "";
      this.getSingleIssue();
      this.replyshow = true;
      this.getIssueComments(this.firtIssue?.issue_number)
      // this.getLatestData.emit(this.firtIssue?.issue_number)
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
    this.msg = 'Sucessfully reply to the comment.';
    this.snackbarService.show(this.msg, false, false, false, false);
  }

  addTaggedUser() {
    let user_ids: any[] = []
    console.log(this.taggedEmailIds)
    if (this.taggedEmailIds.length !== 0) {
      this.dataService.passSpinnerFlag(true, true);
      this.taggedEmailIds.forEach((e, i) => {
        if(typeof (e) == 'number'){
          user_ids.push(e)
        }else{
          user_ids.push(e.id)
        }
      })
      // user_ids.push(this.taggeduserFromComments.id)
      this.userValidation();
      this.tagPersonsIssueModel.unit_id = this.selectedUnit_id
      this.tagPersonsIssueModel.user_ids = user_ids
      this.tagPersonsIssueModel.issue_id = this.firtIssue.issue_number
      this.issuesService.personsTaggedInIssues(this.tagPersonsIssueModel).subscribe({
        next: (data) => {
          let obj = { issue_number: this.firtIssue?.issue_number, type: '' }
          this.getLatestData.emit(obj)
        },
        error: () => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        complete: () => {
          // this.taggedEmailIds = [];
          this.getUserList();
        }
      });

      this.userValidation();
    }
  }
  deleteselectedTaggedPerson(userName, boolean) {
    this.dataService.passSpinnerFlag(true, true);
    this.deleteTagPersonsIssueModel.user_id = userName.id
    this.deleteTagPersonsIssueModel.issue_id = this.firtIssue.issue_number
    this.issuesService.DeletePersonsTaggedInIssues(this.deleteTagPersonsIssueModel).subscribe({
      next: (data) => {
        this.emailIds.push(userName)
        let obj = { issue_number: this.firtIssue?.issue_number, type: '' }
        this.getLatestData.emit(obj)
      },
      error: () => {
        this.taggedEmailIds.push(userName)
        this.userValidation();
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
        // if(boolean == true) {
          this.getUserList()
        // }
      }
    })
    // this.getIssuesList
    // this.refreshData = true;
  }
  selectRiskRating(rating) {
    if (this.firtIssue.status !== 'Closed' && !this.validateUser) {
      this.submitRatingBtn = false
      this.selectedRiskRating = rating
    }
  }
  increaseRiskRatingLevel() {
    if (this.firtIssue.status !== 'Closed') {
      this.submitRatingBtn = false
      this.selectedRiskRating += 1;
      if (this.selectedRiskRating === 6) {
        this.selectedRiskRating = 5
      }
    }
  }
  decreaseRiskRatingLevel() {
    if (this.firtIssue.status !== 'Closed') {
      this.submitRatingBtn = false
      this.selectedRiskRating -= 1;
      if (this.selectedRiskRating === 0) {
        this.selectedRiskRating = 1
      }
    }
  }
  changeIssueStatus() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.changeIssueStatus(this.firtIssue.issue_number, { issue_status: this.selectedStatus }).subscribe({
      next: (data: any) => {
        let obj = { issue_number: this.firtIssue?.issue_number, type: '' }
        this.getLatestData.emit(obj)
        // this.dataService.passSpinnerFlag(false, true);
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
  loggedIssues() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.loggedIssues(this.firtIssue.issue_number).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.loggedIssuesData = data;
          this.selected = [this.loggedIssuesData[0]]
          this.rowId = this.selected?.[0]['id']
          this.issueWiseComments()
        }
        else {
          this.loggedIssuesData = []
          this.statusWiseComments = []
          this.selected1 = []
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
  issueWiseComments() {
    this.issuesService.issueWiseComments(this.firtIssue.issue_number, this.selected[0]?.id).subscribe({
      next: (data: any) => {
        this.statusWiseComments = data
        this.selected1 = [this.statusWiseComments[0]]
        this.rowId1 = this.selected1[0]?.comments?.[0]?.id
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
  updateRiskRating() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.updateRiskRating({ issue_id: this.firtIssue.issue_number, risk_rating: this.selectedRiskRating }).subscribe({
      next: (data: any) => {
        let obj = { issue_number: this.firtIssue?.issue_number, type: 'RISKRATING' }
        this.getLatestData.emit(obj)
        // this.dataService.passSpinnerFlag(false, true);
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
  onSelect(data: any) {
    console.log(data)
    if (this.rowId != this.selected?.[0]['id']) {
      this.dataService.passSpinnerFlag(true, true);
      this.issueWiseComments()
    }
    this.rowId = this.selected[0]['id']
  }
  onSelect1(data: any) {
    if (this.rowId1 != this.selected1[0]?.comments?.[0]?.id) {
      this.show_hide_reply = true
      console.log(this.selected1)
    }
    this.rowId1 = this.selected1[0]?.comments?.[0]?.id
  }
  showReply() {
    this.show_hide_reply = !this.show_hide_reply;
  }
  showIssueRelatedChat() {
    this.issueRelatedChat = !this.issueRelatedChat
  }
  closeChatBox(data: boolean) {
    this.issueRelatedChat = data
  }
  riskRatingLevel() {

  }

  getUserName(name, type) {
    let index = this.allUsersList.findIndex(ele => { return ele.id == name.id })
    if (index >= 0) {
      if (type == 'full') {
        return this.allUsersList[index].name
      } else {
        return this.allUsersList[index].name.slice(0, 1)
      }
    }
  }
  selectImageToDisplay(obj) {
    $('#staticBackdrop').modal('show');
    this.selectedImage = obj;
  }

  downloadImg(imageUrl, event) {
    if (event) {
      setTimeout(() => {
        $('#staticBackdrop').modal('hide');
      }, 100)
    }
    //this.resetZoom();
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
  userValidation() {
    let index = this.taggedEmailIds.findIndex(ele => { return ele.id == this.loginUserId })
    if (index >= 0 || this.loginUserEmail == this.firtIssue?.created_by) {
      this.validateUser = false
    } else {
      this.validateUser = true
    }
  }

  navigateToTask() {
    let index = this.departmentList.findIndex(ele=>{return ele.name == this.selectedIssue.department});
    sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: this.selectedUnit_id, equipment_category_id: this.selectedIssue.equipment_category_id, department_id: this.departmentList[index].id, task_id: this.selectedIssue.task_id }]));
    sessionStorage.setItem('unit-navigation-id', JSON.stringify(this.selectedUnit_id))
    sessionStorage.setItem('selectedTab', 'task')
    setTimeout(() => {
      // this.dataService.passUnitTabs({ 'tab': 'task', 'data': { 'task_id': this.firtIssue.task_id } })
      this.router.navigateByUrl('schedule-control/unit');
    }, 500);
  }
}
