import { Component, Input, OnInit, Pipe, PipeTransform, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;
import * as CryptoJS from 'crypto-js';

import { ModalImageViewerService } from 'src/shared/components/modal-image-viewer/services/modal-image-viewer.service';
import { CommonService } from 'src/shared/services/common.service';
import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SafetyAndSurveillanceCommonService } from '../../service/common.service';
import { DataService } from 'src/shared/services/data.service';

@Component({
  selector: 'app-incidet-chatbox',
  templateUrl: './incidet-chatbox.component.html',
  styleUrls: ['./incidet-chatbox.component.scss']
})
export class IncidetChatboxComponent implements OnInit {
  @Input() faultId:any
  @Input() selectedUnit:any
  @Input() loginUserId:any
  @Input() commentTagging:any
  msg = '';
  listOfUsers:any
  actionCommentImage:any = []
  actionCommentImage1:any
  listOfComments:any;
  newComment:string;
  selectedCommentImageUrl = [];
  sortByTime = true;
  tributeOptions = {};
  newCommentValidation: string = '';
  commentId: any;
  commentImageId: any;

  constructor(private commonService: CommonService, private snackbarService: SnackbarService, private sanitizer: DomSanitizer, private modalPdfViewerService: ModalPdfViewerService, private modalImageViewerService: ModalImageViewerService, private SafetyAndSurveillanceCommonService:SafetyAndSurveillanceCommonService, private dataService: DataService, public commonServices: CommonService,) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    let isUserChanged = changes['commentTagging'] &&
      changes['commentTagging'].currentValue != changes['commentTagging'].previousValue;
    document.getElementById("commentbar").innerHTML = "";
    if (isUserChanged) {
      this.tributeOptions = {
        collection: [
          {
            trigger: '@',
            values: this.commentTagging,
            selectTemplate: (item) => {
              return (
                '<span contenteditable="false"><a  style="color: #006699;font-weight: 800;">' +
                item.original.value +
                "</a></span>"
              );
            }
          },

        ]
      };
    }

    if(this.faultId){
      this.getComments(this.faultId)
      this.getAssigneeList(this.selectedUnit)
    }
    this.actionCommentImage = [];
    this.newComment = '';
  }

  /**
   * get all users list.
  */
  getAssigneeList(unit) {
    this.SafetyAndSurveillanceCommonService.getAssigneeList(unit).subscribe(data => {
      this.listOfUsers = data;
      let userMail = sessionStorage.getItem('user-email');
      this.listOfUsers.forEach(element => {
        if (element.email == userMail) {
          this.loginUserId = element.id
        }
      });
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

  containsSpecialChars(str) {
    let userID = str.slice(0, 2)
    if(str.slice(0, 2) == '#@'){
      return true;
    }else{
      return false;
    }
  }
  /**
   * return user name by using user id.
  */
  returnUserMail(user) {
    let userID = user.slice(2, user.length)
    let index = this.listOfUsers.findIndex(data => { return data.id == userID })
    if (index >= 0) {
      this.listOfUsers[index].name
      return this.listOfUsers[index].name
    }
  }

  /**
   * get all comments for selected incident.
  */
  getComments(faultId){

    this.SafetyAndSurveillanceCommonService.getActionComment(faultId,'incident_id').subscribe((data: any)=>{
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
      if(this.sortByTime){
        this.listOfComments.sort((date1, date2)=>{return new Date(date2.created_at).getTime() - new Date(date1.created_at).getTime()})
      }else{
        this.listOfComments.sort((date1, date2)=>{return new Date(date1.created_at).getTime() - new Date(date2.created_at).getTime()})
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
   * sorting the all comments based on date and time.
  */
  sortUsingTime(){
    this.sortByTime = !this.sortByTime;
    if(this.sortByTime){
      this.listOfComments.sort((date1, date2)=>{return new Date(date2.created_at).getTime() - new Date(date1.created_at).getTime()})
    }else{
      this.listOfComments.sort((date1, date2)=>{return new Date(date1.created_at).getTime() - new Date(date2.created_at).getTime()})
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
   * select images to upload.
  */
  selectImage(event: any) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }
    let actionImage:any
    this.actionCommentImage1 = ''
    if (event.target.files[0].size / 1024 / 1024 < 5) {
      let mineType = event.target.files[0].type;
      if (mineType.match(/image\/*/) == null) {
        return;
      }
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (_event) => {
        actionImage = reader.result;
        this.actionCommentImage1 = reader.result;
        let actionImageName = event.target.files[0].name

        let data = actionImageName.split('.')
        let row_pathName = Math.floor((Math.random() * 99) * 7) + '' + data[0] + '.' + data[1];

        var file = this.dataURLtoFile(this.actionCommentImage1, row_pathName);
        let base64Image = [file]
        this.dataService.passSpinnerFlag(true, true);
        this.SafetyAndSurveillanceCommonService.actionImageUpload(this.selectedUnit, base64Image).subscribe(data=>{
          this.actionCommentImage.push({actionImage: this.actionCommentImage1, actionImageName, imagePath: data})
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
      alert("Observation images (Max 5 MB Each images)")
    }
  }

  /**
   * functionality for mention the users in new comment.
  */
  onMentioned(event) {
    let typedText = document.getElementById('commentbar').innerText
    this.newComment = typedText.split('').join('')
    let enteredText = document.getElementById('commentbar').innerHTML;
    this.newCommentValidation = enteredText.split('<span contenteditable="false"><a style="color: #006699;font-weight: 800;">').join('').split('</a></span>&nbsp;').join('').split('&nbsp;').join(' ').split('<br>').join('').split('<div>').join('').split('</div>').join('');
  }
  getCommentText() {
    let typedText = document.getElementById('commentbar').innerText
    this.newComment = typedText.split('').join('')
    let enteredText = document.getElementById('commentbar').innerHTML;
    this.newCommentValidation = enteredText.split('<span contenteditable="false"><a style="color: #006699;font-weight: 800;">').join('').split('</a></span>&nbsp;').join('').split('&nbsp;').join(' ').split('<br>').join('').split('<div>').join('').split('</div>').join('');
  }

  /**
   * posting new comment.
  */
  submitComment(){
    let newComment = '';
    let enteredText = document.getElementById("commentbar").innerHTML;
    let comment = enteredText.split('<span contenteditable="false"><a style="color: #006699;font-weight: 800;">').join('`~`@').split('</a></span>&nbsp;').join('`~`').split('&nbsp;').join(' ').split('<br>').join('').split('<div>').join('').split('</div>').join('').split('`~`');
    comment.forEach(ele1 => {
      let ele = '';
      if(ele1.slice(0, 1) == '@'){
        ele = ele1.slice(1, ele1.length)
        let index = this.listOfUsers.findIndex(data => { return data.name == ele })
        if (index >= 0) {
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
    document.getElementById("commentbar").innerHTML = "";
    this.imageUpload();
  }

  /**
   * upload the selected images to comment.
  */
  imageUpload(){

    this.dataService.passSpinnerFlag(true, true);
   let imagePaths =  this.actionCommentImage.map(obj => { return obj.imagePath[0]});
    setTimeout(() => {
      this.SafetyAndSurveillanceCommonService.creatingActionComment(this.faultId, this.newComment, imagePaths, 'incident_id').subscribe(data=>{
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
        this.dataService.passSpinnerFlag(false, true);
      }
    )
    }, 2500);
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
  cancelComment(){
    this.newComment = '';
    document.getElementById("commentbar").innerHTML = "";
    this.newCommentValidation ='';
    this.selectedCommentImageUrl = [];
    this.actionCommentImage = [];
  }

  /**
   * confirmation popup for delete the comment.
  */
  deleteComment(comment){
    this.commentId = comment.id
    $('#deleteIncidentCommentModals').modal('show')

  }

  /**
   * delete the comment.
  */
  deleteIncidentComment(){
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.deleteActionComment(this.commentId).subscribe(data=>{
      this.getComments(this.faultId)
      $('#deleteIncidentCommentModals').modal('hide')
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
   * confirmation popup for delete the images in comment.
  */
  deleteActionCommentImage(comment_id, images_id){
    this.commentId = comment_id
    this.commentImageId = images_id
    $('#deleteIncidentCommentImageModal').modal('show')
  }

  /**
   * delete the images in comment.
  */
  deleteIncidentCommentImage(){
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.deleteActionCommentImage(this.commentId, this.commentImageId).subscribe(data=>{
      this.getComments(this.faultId)
      $('#deleteIncidentCommentImageModal').modal('hide')
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

  deleteSlectedCommentImg(i){
    this.actionCommentImage.splice(i, 1)
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
