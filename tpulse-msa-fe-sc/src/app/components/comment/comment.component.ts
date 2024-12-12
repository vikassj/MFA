import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AddReplyToCommentModel, CommentOnTaskModel } from 'src/app/shared/models/create-issue-model';
import { CommonService } from 'src/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { TaskService } from 'src/app/services/task.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
declare var $: any;
@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnChanges {
  @Output() dataChange = new EventEmitter();
  @Output() getLatestData = new EventEmitter();
  @Input() selectedTask: any;
  @Input() selectedUnit: any[];
  @Input() users: any[];
  newComments: any = '';
  commentOnTaskModel: CommentOnTaskModel;
  addReplyToCommentModel: AddReplyToCommentModel;
  replyshow: boolean = false;
  replyIndex: any;
  firtIssue: any;
  currentComment: any;
  comments_id: any;
  comments: any;
  newReply: string = '';
  statusWiseComments: any;
  show_hide_reply: boolean = false
  msg: string;
  selected: any[] = []
  rowId: any;
  rowId1: any;
  selected1: any[] = []
  loggedIssuesData: any[] = []
  log_id: any;
  emailList: string[];
  mentionConfig: any = {
    'dropUp': true
  }
  actionCommentImage1: string | ArrayBuffer;
  actionCommentImage: any[] = [];
  loggedUserEmail: string;
  constructor(private commonService: CommonService, private snackbarService: SnackbarService, private dataService: DataService, private taskService: TaskService) { }

  ngOnChanges() {
    //this.getUserList()
    // this.comments = this.selectedTask?.comments;
    this.loggedUserEmail = sessionStorage.getItem('user-email')
    this.emailList = this.users?.map(obj => obj.email);
    this.getCommentOnTask();
    let id = sessionStorage.getItem('taskCommentId')
    if(id){
      this.scrollToTaskComment(id)
    }
    console.log(this.comments);
    console.log(this.emailList);
  }
  downloadImg(imageUrl) {
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
  deleteActionCommentImage(comment_id, images_id) {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.deleteTaskCommentImage(comment_id, images_id).subscribe(data => {
      this.getCommentOnTask()
      // this.IssuesService.sendMatomoEvent('Delete media in comments', 'Comments');
      this.dataService.passSpinnerFlag(false, true);
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
  getCommentOnTask(){
    this.dataService.passSpinnerFlag(true, true)
    this.taskService.getCommentOnTask(this.selectedTask?.id).subscribe({
      next: (data) => {
      this.comments = data
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
  });
  }

  ngOnInit(): void {
    this.commentOnTaskModel = new CommentOnTaskModel({})
    this.addReplyToCommentModel = new AddReplyToCommentModel({})
    //this.getUserList();
  }

  alphaNumericWithoutSpaceValidator(value: any) {
    let regex = /^\S+(?: \S+)*$/;
    return regex.test(value);
  }


  // getUserList() {
  //   this.dataService.passSpinnerFlag(true, true)
  //   this.taskService.getUserList().subscribe({
  //     next: (data: any) => {

  //       this.firtIssue = this.selectedIssue
  //       this.comments = this.selectedIssue?.comments;
  //       if (this.firtIssue?.issue_number) {
  //         //this.loggedIssues()
  //       }
  //       else {
  //         this.selected = []
  //         this.statusWiseComments = []
  //         this.loggedIssuesData = []
  //         this.dataService.passSpinnerFlag(false, true);
  //       }

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



  commentOnTask() {
    let imagePaths = this.actionCommentImage.map(obj => { return obj.imagePath[0] });
    file_list: imagePaths
    this.commentOnTaskModel.unit_id = this.selectedUnit?.['id'];
    this.commentOnTaskModel.file_list = imagePaths;
    this.commentOnTaskModel.task_id = this.selectedTask?.id;
    this.commentOnTaskModel.comment = this.newComments;
    let taggedIds = [];
    let commentArray = this.newComments.split('@')
    this.users.forEach(user =>{
      let email = user.email.split('@')[0]
      let index = commentArray.findIndex(ele =>{ return ele === email})
      if(index >= 0){
        taggedIds.push(user.id)
      }
    })
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.commentOnTask(this.commentOnTaskModel).subscribe(data => {
      this.newComments = '';
        this.actionCommentImage = [];
        this.getCommentOnTask();
        window.dispatchEvent(new CustomEvent('user-tagged-task', {detail: taggedIds}))
      this.getLatestData.emit(this.selectedTask?.id);
      this.dataService.passSpinnerFlag(false, true);
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

  deleteSlectedCommentImg(i) {
    this.actionCommentImage.splice(i, 1)
  }
  toggleReply(commentId) {
    this.replyshow = true;
    this.replyIndex = commentId;
    this.currentComment = commentId;
    this.comments_id = (this.comments.find((c, i) => i === commentId)).id;
    this.newReply = '';
    this.dataService.passSpinnerFlag(false, true);
  }


  addReplyToComment() {
    this.addReplyToCommentModel.comment_id = this.comments_id;
    this.addReplyToCommentModel.reply = this.newReply;
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.replyToComment(this.addReplyToCommentModel).subscribe(data => {
      this.newReply = "";
      // this.getSingleIssue();
      this.replyshow = true;
      this.getLatestData.emit(this.firtIssue?.issue_number)
      this.dataService.passSpinnerFlag(false, true);
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

  // issueWiseComments() {
  //   this.issuesService.issueWiseComments(this.firtIssue.issue_number, this.selected[0]?.id).subscribe({
  //     next: (data: any) => {
  //       this.statusWiseComments = data
  //       this.selected1 = [this.statusWiseComments[0]]
  //       this.rowId1 = this.selected1[0]?.comments?.[0]?.id
  //     },
  //     error: () => {
  //       this.dataService.passSpinnerFlag(false, true);
  //       this.msg = 'Error occured. Please try again.';
  //       this.snackbarService.show(this.msg, true, false, false, false);
  //     },
  //     complete: () => {
  //       this.dataService.passSpinnerFlag(false, true);
  //     }
  //   })
  // }

  showReply() {
    this.show_hide_reply = !this.show_hide_reply;
  }

  // loggedIssues() {
  //   this.dataService.passSpinnerFlag(true, true);
  //   this.issuesService.loggedIssues(this.firtIssue.issue_number).subscribe({
  //     next: (data: any) => {
  //       if (data.length > 0) {
  //         this.loggedIssuesData = data;
  //         this.selected = [this.loggedIssuesData[0]]
  //         this.rowId = this.selected?.[0]['id']
  //         this.issueWiseComments()
  //       }
  //       else {
  //         this.loggedIssuesData = []
  //         this.statusWiseComments = []
  //         this.selected1 = []
  //         this.dataService.passSpinnerFlag(false, true);
  //       }
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

  scrollToTaskComment(commentId) {
    console.log('taskComment')
    setTimeout(() => {
      $('#taskComment').animate({
        scrollTop: $('#comment' + commentId)?.position()?.top - 200
      });
      sessionStorage.removeItem('taskCommentId')
    }, 500);
  }

  selectImage(event: any) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }
    event.target.files.forEach(ele =>{
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
        this.taskService.taskImageUpload(this.selectedUnit['name'], base64Image).subscribe(data => {
          // this.selectedCommentImageUrl.push(data)
          this.actionCommentImage.push({ actionImage: this.actionCommentImage1, actionImageName, imagePath: data })
          this.dataService.passSpinnerFlag(false, true);
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

  entertext(){
    // let mention = document.querySelector('.dropup');
    // mention.classList.add('top500px')
    let data = document.getElementById("commentSection").getBoundingClientRect();
    let top = data.top + 'px !important';
    let elements = document.querySelectorAll(".dropup")
    // console.log((elements[0] as HTMLElement).style.top)
    let rr = elements[0] as HTMLElement
    rr.style.top = "300px"
    if(elements[0] instanceof HTMLElement){
      elements[0].style.top = top
    }
  }
}
