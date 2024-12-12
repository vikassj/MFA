import { Component, Input, OnInit, Pipe, PipeTransform, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InspectionService } from 'src/app/services/inspection.service';
declare var $: any;

import { CommonService } from 'src/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';

@Component({
  selector: 'app-inspection-chatbox',
  templateUrl: './inspection-chatbox.component.html',
  styleUrls: ['./inspection-chatbox.component.scss']
})
export class InspectionChatboxComponent implements OnInit {
  @Input() recommendation_id: any;
  @Input() listOfUsers: any;
  @Input() unitsList: any;
  @Input() selectedUnit_id: any;
  @Input() selectedRecommendation: any;
  @Input() selectedEquipmentId: any;
  @Input() selectedRecommendationStatus: any;
  @Input() commentTagging: [];
  // listOfUsers: any;
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
  selectedCardName = 'comments';
  loggedUserEmail: string;

  historyData: any = []
  closedStatusData: any;
  commentImages: any[] = [];
  selectedCommentImage: any = {};
  selectedUnitName: any;
  url: any;

  constructor(private commonService: CommonService, private snackbarService: SnackbarService, private sanitizer: DomSanitizer, public InspectionService: InspectionService, private dataService: DataService, public commonServices: CommonService) {
    // this.endUserDetails = JSON.parse(sessionStorage.getItem('userData'));
    // this.webSocketUrl = sessionStorage.getItem('wsUrl');
  }

  ngOnInit() { }
  ngOnChanges(changes: SimpleChanges): void {
    this.selectedRecommendationStatus = this.selectedRecommendationStatus.toLowerCase()
    this.unitsList.filter(ele =>{
      if(ele.id == this.selectedUnit_id){
        this.selectedUnitName = ele.name
      }
    })
    this.loggedUserEmail = sessionStorage.getItem('user-email')
    let isUserChanged = changes['commentTagging'] &&
      changes['commentTagging'].currentValue != changes['commentTagging'].previousValue;
    if (isUserChanged) {
      // document.getElementById("comment").innerHTML = "";
      this.tributeOptions = {
        collection: [
          {
            trigger: '@',
            values: this.commentTagging,
            selectTemplate: (item) => {
              return (
                '<span contenteditable="false">  <a  style="color: #006699;font-weight: 800;" title="' +
                item.original.email +
                '">@' +
                item.original.value +
                "@</a>  </span>"
              );
            }
          },

        ]
      };
    }
    if (this.recommendation_id) {
      this.getComments(this.recommendation_id)
      this.getHostory(this.recommendation_id)
      // this.getAssigneeList(this.selectedUnit)
    }
    this.actionCommentImage = [];
    this.newComment = '';
  }
  getAssigneeList(unit) {
    // this.dataService.passSpinnerFlag(true, true);
    // this.InspectionService.getAssigneeList(unit).subscribe(data => {
    //   this.listOfUsers = data;
    //   let userMail = sessionStorage.getItem('user-email');
    //   this.listOfUsers.forEach(element => {
    //     if (element.email == userMail) {
    //       this.loginUserId = element.id
    //     }
    //   });
    //   this.dataService.passSpinnerFlag(false, true);
    // },
    //   error => {
    //     this.dataService.passSpinnerFlag(false, true);
    //     this.msg = 'Error occured. Please try again.';
    //     this.snackbarService.show(this.msg, true, false, false, false);
    //   },
    //   () => {
    //     this.dataService.passSpinnerFlag(false, true);
    //   }
    // )
  }

  getComments(recommendation_id) {
    this.dataService.passSpinnerFlag(true, true);
    this.InspectionService.recommendationWiseComments(recommendation_id).subscribe(data => {
      this.listOfComments = data;
      let array = [];
      // this.listOfComments.forEach(obj => {
      //   array = [...array, ...obj.comments]
      // })
      // this.listOfComments = [...array]
      this.listOfComments.forEach((ele, i) => {
        let array = ele.comment?.split('')
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
        this.listOfComments[i].comment = textArray;
      })
      if (this.sortByTime) {
        this.listOfComments.sort((date1, date2) => { return new Date(date2.date + ' ' + date2.time).getTime() - new Date(date1.date + ' ' + date1.time).getTime() })
      } else {
        this.listOfComments.sort((date1, date2) => { return new Date(date1.date + ' ' + date1.time).getTime() - new Date(date2.date + ' ' + date2.time).getTime() })
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
  sortUsingTime() {
    this.sortByTime = !this.sortByTime;
    if (this.sortByTime) {
      this.listOfComments.sort((date1, date2) => { return new Date(date2.date + ' ' + date2.time).getTime() - new Date(date1.date + ' ' + date1.time).getTime() })
      this.historyData.sort((date1, date2) => { return new Date(date2.date + ' ' + date2.time).getTime() - new Date(date1.date + ' ' + date1.time).getTime() })
    } else {
      this.listOfComments.sort((date1, date2) => { return new Date(date1.date + ' ' + date1.time).getTime() - new Date(date2.date + ' ' + date2.time).getTime() })
      this.historyData.sort((date1, date2) => { return new Date(date1.date + ' ' + date1.time).getTime() - new Date(date2.date + ' ' + date2.time).getTime() })
    }
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
  selectImage(event: any) {
    
    // if (!event.target.files[0] || event.target.files[0].length == 0) {
    //   return;
    // }
    // event.target.files.forEach(ele =>{
    //   let actionImage: any
    // this.actionCommentImage1 = ''
    // if (ele.size / 1024 / 1024 <= 5) {
    //   let mineType = ele.type;
    //   if (mineType.match(/image\/*/) == null) {
    //     return;
    //   }
    //   let reader = new FileReader();
    //   reader.readAsDataURL(ele);
    //   reader.onload = (e: any) => {
    //     this.actionCommentImage.push(e.target.result)
    //   }
    // } else {
    //   this.snackbarService.show('Max. size is 5MB', false, false, false, true);
    // }
    // })

    // this.clearObservationCanvas();
    // // this.imagePath = event.target.files;
    // this.imageName = event.target.files[0].name
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }
    event.target.files.forEach(ele =>{
      let actionImage: any
    this.actionCommentImage1 = ''
    if (ele.size / 1024 / 1024 <= 5) {
      let mineType = ele.type;
      if (mineType.match(/image\/*/) == null && mineType.match(/pdf\/*/) == null) {
        return;
      }
      let reader = new FileReader();
      reader.readAsDataURL(ele);
      reader.onload = (e: any) => {
        this.actionCommentImage.push(e.target.result)
        console.log(this.actionCommentImage)
      }
    } else {
      this.snackbarService.show('Max. size is 5MB', false, false, false, true);
    }
    })


  }

  submitComment() {
    let newComment = '';
    let comment = this.newComment.split('@')
    comment.forEach(ele => {
      let index = this.listOfUsers.findIndex(data => { return data.name === ele })
      if (index >= 0) {
        newComment = newComment[newComment.length - 1] == ' ' ? newComment + ' #@' + this.listOfUsers[index].id : newComment + ' #@' + this.listOfUsers[index].id + ' '
      } else {
        newComment = newComment + '' + ele
      }
    })
    this.newComment = newComment;
    document.getElementById("comment").innerHTML = "";
    this.imageUpload();
  }
  imageUpload() {
    this.dataService.passSpinnerFlag(true, true);
    // let imagePaths = this.actionCommentImage.map(obj => { return obj.imagePath[0] });
    setTimeout(() => {
      let obj = {
        unit_id: this.selectedUnit_id,
        unit_name: this.selectedUnitName,
        equipment_id: this.selectedEquipmentId,
        recommendation_id: this.recommendation_id,
        update_comment: this.newComment,
        comment_file: this.actionCommentImage
    }
      this.InspectionService.commentOnRecommendation(obj).subscribe(data => {
        this.newComment = '';
        this.selectedCommentImageUrl = [];
        this.actionCommentImage = [];
        this.getComments(this.recommendation_id);
        // this.InspectionService.sendMatomoEvent('Successful comment creation', 'Comments');
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

  cancelComment() {
    this.newComment = '';
    document.getElementById("comment").innerHTML = "";
    this.selectedCommentImageUrl = [];
    this.actionCommentImage = [];
  }
  deleteComment(comment) {
    this.dataService.passSpinnerFlag(true, true);
    this.InspectionService.deleteRecommendationComment(comment.comment_id).subscribe(data => {
      this.getComments(this.recommendation_id)
      // this.InspectionService.sendMatomoEvent('Delete comment', 'Comments');
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
  deleteActionCommentImage(commentfile_id) {
    this.dataService.passSpinnerFlag(true, true);
    this.InspectionService.deleteRecommendationCommentImage(commentfile_id).subscribe(data => {
      this.getComments(this.recommendation_id)
      // this.InspectionService.sendMatomoEvent('Delete media in comments', 'Comments');
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

  deleteSlectedCommentImg(i) {
    this.actionCommentImage.splice(i, 1)
  }

  onMentioned(event) {
    let typedText = document.getElementById('comment').innerText
    this.newComment = typedText.split('').join('')
  }
  getCommentText() {
    let typedText = document.getElementById('comment').innerText
    this.newComment = typedText.split('').join('')
  }
  mentionItemSelected(event) {
  }
  returnUserMail(user) {
    let userID = user.slice(2, user.length)
    let index = this.listOfUsers.findIndex(data => { return data.id == userID })
    if (index >= 0) {
      this.listOfUsers[index].name
      return this.listOfUsers[index].name
    }
  }
  containsSpecialChars(str) {
    const specialChars = /[@#]/;
    return specialChars.test(str);
  }
  selectCommentHistory(type) {
    if (type == 'comments') {
      this.getComments(this.recommendation_id)
    } else {
      this.getHostory(this.recommendation_id)
    }
  }
  displayImageFileName(val) {
    let url = val.split('/');
    return url[url.length - 1];
  }

  getHostory(recommendation_id) {
    this.InspectionService.getRecommendationHostory(recommendation_id).subscribe(data => {
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
      this.historyData.sort((date1, date2) => { return new Date(date2.date + ' ' + date2.time).getTime() - new Date(date1.date + ' ' + date1.time).getTime() })
      if (this.selectedRecommendationStatus.toLowerCase() == 'Maintenance Accepted') {
        let index = this.historyData.findIndex(ele => { return ele.metadata.status_updated_to == 'Maintenance Accepted' })
        if (index >= 0) {
          this.closedStatusData = this.historyData[index]
        }
      }
      if (this.sortByTime) {
        this.historyData.sort((date1, date2) => { return new Date(date2.date + ' ' + date2.time).getTime() - new Date(date1.date + ' ' + date1.time).getTime() })
      } else {
        this.historyData.sort((date1, date2) => { return new Date(date1.date + ' ' + date1.time).getTime() - new Date(date2.date + ' ' + date2.time).getTime() })
      }

    })
  }
  scrollToIssueComment(commentId) {
    console.log('issueComment')
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

  openCommentImagePopup(commentImages, selectedCommentImage) {
    this.commentImages = commentImages;
    this.selectedCommentImage = selectedCommentImage;
    $('#commentImagesPopupModal').modal('show');
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
