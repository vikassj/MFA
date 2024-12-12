import { Component, Input, OnInit, Pipe, PipeTransform, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;
import * as CryptoJS from 'crypto-js';

import { CommonService } from 'src/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SafetyAndSurveillanceCommonService } from '../../service/common.service';
import { ModalImageViewerService } from 'src/shared/components/modal-image-viewer/services/modal-image-viewer.service';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.scss']
})
export class ChatboxComponent implements OnInit {
  @Input() faultId: any;
  @Input() selectedUnit: any;
  @Input() currentId: any;
  @Input() selectedIssue: any;
  @Input() selectedIssueStatus: any;
  @Input() commentTagging: [];
  @Input() allListOfUsers: [];
  listOfUsers: any;
  loginUserId: any;
  msg = '';
  actionCommentImage: any = [];
  actionCommentImage1: any;
  listOfComments: any;
  newComment: string;
  selectedCommentImageUrl = [];
  sortByTime = true;
  placeholder = 'Enter new comments here...';
  tributeOptions = {};
  previousFaultId: any;
array =[]
  arrayOfImages: any;
  selectedImageName: any;
  selectedImage: any;
  selectedCardName = 'comments';
  loggedUserEmail: string;

  historyData: any = []
  closedStatusData: any;
  commentImages: any[] = [];
  selectedCommentImage: any = {};
  taggedUserInComment: any[] = []
  newCommentValidation: string = '';
  comment_Id:any;
  image_Id:any;
  comments:any;
  commentsObservation : boolean = false;

  constructor(private commonService: CommonService, private snackbarService: SnackbarService, private sanitizer: DomSanitizer, public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService, private dataService: DataService, public commonServices: CommonService, private modalPdfViewerService: ModalPdfViewerService, private modalImageViewerService: ModalImageViewerService, public SafetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) {
  }

  ngOnInit() { }
  ngOnChanges(changes: SimpleChanges): void {
    let isUserChanged = changes['commentTagging'] &&
      changes['commentTagging'].currentValue != changes['commentTagging'].previousValue;
      if(this.commentTagging?.length == 0){
        this.array = [];
      }
      this.commentTagging?.forEach(ele =>{
        this.array.push(ele)
      })
      if (isUserChanged) {
        this.tributeOptions = {
          collection: [
            {
              trigger: '@',
              values: this.array,
              selectTemplate: (item) => {
                return (
                  '<span contenteditable="false"><a style="color: #006699;font-weight: 800;">' +
                  item.original.value +
                  "</a></span>"
                );
              }
            },

          ]
        };
      }
    if (this.faultId != this.previousFaultId) {
      this.previousFaultId = this.faultId
      if(this.faultId){
        this.getComments(this.faultId)
      }
      this.getAssigneeList(this.allListOfUsers)
    }
    this.actionCommentImage = [];
    this.newComment = '';
  }

  /**
   * get users list.
   */
  getAssigneeList(data) {
      this.listOfUsers = data;
      let userMail = sessionStorage.getItem('user-email');
      this.listOfUsers.forEach(element => {
        if (element.email == userMail) {
          this.loginUserId = element.id
        }
      });
      this.dataService.passSpinnerFlag(false, true);
  }

  /**
   * get the comments.
   */
  getComments(faultId) {
    this.safetyAndSurveillanceCommonService.getActionComment(faultId, this.currentId).subscribe((data: any) => {
      data.forEach((element, i) => {
        data[i].comment_files.forEach((ele, j)=>{
          data[i].comment_files[j].url = this.decryptUrl(ele.url);
        })
      });
      this.listOfComments = data;
      this.listOfComments.forEach((ele, i) => {
        let commentText = ele?.comment?.replace(/\d+/g, '$&`~`')
        let textArray = commentText.split('#@').join('`~`#@').split('`~`');
        this.listOfComments[i].comment = textArray;
      })
      if (this.sortByTime) {
        this.listOfComments.sort((date1, date2) => { return new Date(date2.created_at).getTime() - new Date(date1.created_at).getTime() })
      } else {
        this.listOfComments.sort((date1, date2) => { return new Date(date1.created_at).getTime() - new Date(date2.created_at).getTime() })
      }
      let id = sessionStorage.getItem('issueCommentId')
      if (id) {
        this.scrollToIssueComment(id)
      }
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

  /**
   * sort the comments and history data based on date and time.
   */
  sortUsingTime() {
    this.sortByTime = !this.sortByTime;
    if (this.sortByTime) {
      this.listOfComments.sort((date1, date2) => { return new Date(date2.created_at).getTime() - new Date(date1.created_at).getTime() })
      this.historyData.sort((date1, date2) => { return new Date(date2.datetime).getTime() - new Date(date1.datetime).getTime() })
    } else {
      this.listOfComments.sort((date1, date2) => { return new Date(date1.created_at).getTime() - new Date(date2.created_at).getTime() })
      this.historyData.sort((date1, date2) => { return new Date(date1.datetime).getTime() - new Date(date2.datetime).getTime() })
    }
  }

  /**
   * download the images.
   */
  downloadImg(imageUrl) {
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

  /**
   * select the images to upload.
   */
  selectImage(event: any) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }
    let allImages = [];
    event.target.files.forEach((ele, i) => {
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
          allImages.push({actionImage: this.actionCommentImage1, base64Image, actionImageName})
        }
      } else {
        this.snackbarService.show('Max. size is 5MB', false, false, false, true);
      }
      if(event.target.files.length == (i + 1)){
        setTimeout(()=>{
          allImages.forEach(ele1 =>{
            this.safetyAndSurveillanceCommonService.actionImageUpload(this.selectedUnit, ele1.base64Image).subscribe(data => {
              this.actionCommentImage.push({ actionImage: ele1.actionImage, actionImageName: ele1.actionImageName, imagePath: data })
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
          })
        }, 500)
      }
    })
  }

  /**
   * post the new comment.
   */
  submitComment() {
    this.taggedUserInComment = []
    let newComment = '';
    let enteredText = document.getElementById("comment").innerHTML;
    let comment = enteredText.split('<span contenteditable="false"><a style="color: #006699;font-weight: 800;">').join('`~`@').split('</a></span>&nbsp;').join('`~`').split('</a></span>').join('`~`').split('&nbsp;').join(' ').split('<br>').join('').split('<div>').join('').split('</div>').join('').split('`~`');
    comment.forEach(ele1 => {
      let ele = '';
      if(ele1.slice(0, 1) == '@'){
        ele = ele1.slice(1, ele1.length)
        let index = this.listOfUsers.findIndex(data => { return data.name == ele })
        if (index >= 0) {
          this.taggedUserInComment.push(this.listOfUsers[index])
          newComment = newComment[newComment.length - 1] == '' ? newComment + '#@' + this.listOfUsers[index].id +' ' : newComment + '#@' + this.listOfUsers[index].id + ' '
        } else {
          newComment = newComment + '' + ele
        }
      }else{
        ele = ele1
        newComment = newComment + '' + ele
      }
    })
    this.newComment = newComment.replace(/<[^>]*>/g, '');
    this.newCommentValidation = '';
    document.getElementById("comment").innerHTML = "";
    this.imageUpload();
  }
  /**
   * upload the selected images in comment section.
   */
  imageUpload() {
    this.dataService.passSpinnerFlag(true, true);
    let imagePaths = this.actionCommentImage.map(obj => { return obj.imagePath[0] });
    if (imagePaths.length > 0) {
    }
    setTimeout(() => {
      let obj = {
        unit_id: this.selectedUnit,
        issue_id: this.faultId,
        comment: this.newComment,
        file_list: imagePaths
      }
      this.safetyAndSurveillanceCommonService.creatingActionComment(this.faultId, this.newComment, imagePaths, this.currentId).subscribe(data => {
        this.newComment = '';
        this.selectedCommentImageUrl = [];
        this.actionCommentImage = [];
        this.getComments(this.faultId);
        this.dataService.passSpinnerFlag(false, true);
      },
        error => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          window.dispatchEvent(new CustomEvent('user-tagged', { detail: this.taggedUserInComment }))
        }
      )
    }, 1000);
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

  /**
   * cancel the new comment.
   */
  cancelComment() {
    this.newComment = '';
    document.getElementById("comment").innerHTML = "";
    this.selectedCommentImageUrl = [];
    this.actionCommentImage = [];
  }
  /**
   * delete the selected comment.
   */
  deleteComment(comment) {
    this.comments = comment.id
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.deleteActionComment(comment.id).subscribe(data => {
      this.msg = 'Comment deleted successfully';
      $('#deleteModals').modal('hide')
      this.snackbarService.show(this.msg, false, false, false, false);
      this.getComments(this.faultId)
      window.dispatchEvent(new CustomEvent('comment-deleted', { detail: comment }))
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

  /**
   * delete the images in comment.
   */
  deleteActionCommentImage(comment_id, images_id) {
    this.comment_Id = comment_id
    this.image_Id = images_id
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.deleteActionCommentImage(comment_id, images_id).subscribe(data => {
      this.msg = 'File deleted successfully';
      $('#deleteModal').modal('hide')
      this.snackbarService.show(this.msg, false, false, false, false);
      this.getComments(this.faultId)
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
  showConfirmationModal(comment_id, images_id) {
      this.comment_Id = comment_id
      this.image_Id = images_id
  }
  showConfirmationModals(comment) {
    this.comments = comment
  }

  deleteObservation() {
      this.deleteActionCommentImage(this.comment_Id, this.image_Id)

  }
  deleteObservations() {

    this.deleteComment(this.comments)

  }

  deleteSlectedCommentImg(i) {
    this.actionCommentImage.splice(i, 1)
  }

  onMentioned(event) {
    let typedText = document.getElementById('comment').innerText
    this.newComment = typedText.split('').join('')
    let enteredText = document.getElementById('comment').innerHTML;
    this.newCommentValidation = enteredText.split('<span contenteditable="false"><a style="color: #006699;font-weight: 800;">').join('').split('</a></span>&nbsp;').join('').split('</a></span>').join('').split('&nbsp;').join(' ').split('<br>').join('').split('<div>').join('').split('</div>').join('');
  }

  /**
   * formating the entered new comment.
   */
  getCommentText() {
    let typedText = document.getElementById('comment').innerText
    this.newComment = typedText.split('').join('')
    let enteredText = document.getElementById('comment').innerHTML;
    this.newCommentValidation = enteredText.split('<span contenteditable="false"><a style="color: #006699;font-weight: 800;">').join('').split('</a></span>&nbsp;').join('').split('</a></span>').join('').split('&nbsp;').join(' ').split('<br>').join('').split('<div>').join('').split('</div>').join('');
  }
  mentionItemSelected(event) {
  }

  /**
   * return user name based on user id.
   */
  returnUserMail(user) {
    let userID = user.slice(2, user.length)
    let index = this.listOfUsers?.findIndex(data => { return data.id == userID })
    if (index >= 0) {
      this.listOfUsers[index].name
      return this.listOfUsers[index].name
    }
  }

  /**
   * find the user name or comment text in comment line.
   */
  containsSpecialChars(str) {
    let userID = str.slice(0, 2)
    if(str.slice(0, 2) == '#@'){
      return true;
    }else{
      return false;
    }
  }

  /**
   * select comment section tab or history section tab.
   */
  selectCommentHistory(type) {
    if (type == 'comments') {
      this.getComments(this.faultId)
    } else {
      this.getHostory(this.faultId)
    }
  }

  /**
   * hide the text if lenght is more than 20.
   */
  displayImageFileName(val) {
    if (val && val.length >= 20) {
      val = val.slice(0, 19) + "...";
    }
    return val;
  }

  /**
   * get history list data.
   */
  getHostory(faultId) {
    this.safetyAndSurveillanceCommonService.getActionHistory(faultId).subscribe(data => {
      this.historyData = data;
      this.closedStatusData = {};
      this.historyData.forEach((ele, i) => {
        if (ele.log_type == 'comment') {
          let array = ele.metadata.comment?.split('')
          let text = '';
          if (array?.length > 0) {
            array.forEach(arrayEle => {
              if (arrayEle == ' ') {
                text = text + '_'
              } else {
                text = text + '' + arrayEle
              }
            })
          }
          let textArray = text.split('_')
          this.historyData[i].metadata.comment = textArray;
        }
      })
      this.historyData.sort((date1, date2) => { return new Date(date2.datetime).getTime() - new Date(date1.datetime).getTime() })
      if (this.selectedIssue?.status == 'Close') {
        let index = this.historyData.findIndex(ele => { return ele.metadata.to_status == 'Close' })
        if (index >= 0) {
          this.closedStatusData = this.historyData[index]
        }
      }
      if (this.sortByTime) {
        this.historyData.sort((date1, date2) => { return new Date(date2.datetime).getTime() - new Date(date1.datetime).getTime() })
      } else {
        this.historyData.sort((date1, date2) => { return new Date(date1.datetime).getTime() - new Date(date2.datetime).getTime() })
      }

    })
  }

  /**
   * scroll down to perticular comment by using comment id.
   */
  scrollToIssueComment(commentId) {
    setTimeout(() => {
      $('#issueComment').animate({
        scrollTop: $('#comment' + commentId)?.position()?.top - 200
      });
      sessionStorage.removeItem('issueCommentId')
    }, 500);
  }

  returnDateTime(date, time) {
    let dateTime = time.split('.');
    if (dateTime.length > 0) {
      return new Date(date + ' ' + dateTime[0])
    } else {
      return time;
    }
  }

  /**
   * return rating lavel name based on rating number.
   */
  returnRatingName(rating) {
    if (rating == 1) {
      return 'Very Low';
    } else if (rating == 2) {
      return 'Low';
    } else if (rating == 3) {
      return 'Medium';
    } else if (rating == 4) {
      return 'High';
    } else if (rating == 5) {
      return 'Very High';
    }
  }


  /**
   * display popup to display all images..
   */
  selectImageToDisplay(obj, array) {
    this.arrayOfImages = array
    this.selectedImageName = obj.filename
    this.selectedImage = obj;
    $('#actionCommentImageViewer').modal('show');
    // if (!this.selectedImage.file.includes('pdf')) {
    //   this.initiateDrawing();
    // }
    if(obj.url?.includes('.pdf')){
      let name = obj?.url.split('/');
      name = name[name.length - 1].split('?')[0];
      name = name.replace('.pdf', '');

      // this.supportDocPdfViewerService.show(name, obj?.file);
    }else{
      // this.supportDocPdfViewerService.show('', '');
    }
  }
  onImageSelect(obj) {
    this.selectedImage = obj;

    // if (!this.selectedImage.file.includes('pdf')) {
    //   this.initiateDrawing();
    // }
    if(obj.url?.includes('.pdf')){
      let name = obj?.url.split('/');
      name = name[name.length - 1].split('?')[0];
      name = name.replace('.pdf', '');

      // this.supportDocPdfViewerService.show(name, obj?.file);
    }else{
      // this.supportDocPdfViewerService.show('', '');
    }
  }

  decryptUrl(url) {
    var encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
    var encryptedFilepath = url;
    var key = CryptoJS.enc.Hex.parse(encryptionKey);
    const decrypted = CryptoJS.AES.decrypt(encryptedFilepath, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
    });
    var decryptedFilepath = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedFilepath.replace(/^"|"$/g, '');
    }

  ngOnDestroy() {
    // this.chatWebsocketUrl.close();
  }

}

@Pipe({
  name: 'imageNameHideInfo',
  pure: true,
})
export class ImageNameHideInfoPipe implements PipeTransform {
  locale: string;
  transform(value: any, ...args: any) {
    let val: string = value + '';
    if (val && val.length >= 20) {
      val = val.slice(0, 19) + "...";
    }
    return val;
  }
}
