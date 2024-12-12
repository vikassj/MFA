import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
declare var $: any;

import { DataService } from '../../services/data.service';
import { CommonService } from 'src/app/common/common.service';
import { LoginService } from '../../services/login.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit, AfterViewChecked {
  msg: string = '';
  selectedRating:any;
  ratingSubmited : boolean = false;
  subscription: Subscription = new Subscription();
  idleState : string = 'Not started.';
  timedOut : boolean = false;
  lastPing?: Date = null;
  feedbackTriggers: any;
  userFeedback: any;
  triggerId: any;
  questionId: any;
  allFeedbackQuestions: any;
  selectedQuestion: any;
  currentPage: string;
  timerCount: number;
  pageVisitCount: number;
  numberOfPageVisit: any;
  userId: any;
  constructor(private dataService: DataService, private commonService: CommonService, private loginService: LoginService, private snackbarService: SnackbarService) {
    window.addEventListener("button_click", (evt) => {
      this.initiateTrigger('button_click', sessionStorage.getItem('type'), '')
    })
    this.subscription.add(this.dataService.getTriggerEvent.subscribe(showFlag =>{
      this.initiateTrigger(showFlag.type, showFlag.function, '')
    }))
    this.subscription.add(this.dataService.getFeedBackFlag.subscribe(showFlag =>{
      if(showFlag.feedBackFlag && !this.ratingSubmited){
      }else{
        $('#feedBackModal').modal('hide');
      }
    }))
  }

  ngOnInit(): void {
    this.getUserAndCompanyIds();
  }
  closeFeedBackModal(){
    this.dataService.passFeedBackFlag(false);
    this.dataService.passNavigateEvent(true);
    this.selectedRating = {};
  }
  sendFeedBack(){
    // Submit rating
    let obj = {
      "question_id": this.questionId,
      "user_feedback": [this.selectedRating?.name ? this.selectedRating.name : 0]

    };
    this.ratingSubmited = true;
    this.dataService.passSpinnerFlag(true, true);
    this.commonService.postUserFeedback(obj).subscribe((data) =>{
      this.dataService.passFeedBackFlag(false);
      this.selectedRating = {};
      this.getFeedbackQuestions();
      this.getFeedbackTriggers();
      this.getUserFeedback();
      window.dispatchEvent(new CustomEvent('submit_feedback'))
      setTimeout(()=>{
        this.msg = 'Rating submitted successfully';
        this.snackbarService.show(this.msg, false, false, false, false);
      }, 100)
      this.dataService.passNavigateEvent(true);
      this.dataService.passSpinnerFlag(false, true);
    },
    error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    },
    () => {
      this.dataService.passSpinnerFlag(false, true);
    })
  }
  ngAfterViewChecked(): void {
      $('[data-toggle="tooltip"]').tooltip();
  }

  getUserAndCompanyIds(){
    this.dataService.passSpinnerFlag(true, true);
    this.loginService.getUserAccessDetails().subscribe(data=>{
      this.userId = data['user_id']
      this.getFeedbackQuestions();
      this.getFeedbackTriggers();
      this.getUserFeedback();
      this.startTimer();
      this.dataService.passSpinnerFlag(false, true);
    },
    error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    },
    () => {
      this.dataService.passSpinnerFlag(false, true);
    })
  }
  getFeedbackQuestions(){
    this.dataService.passSpinnerFlag(true, true);
    this.commonService.getFeedbackQuestions().subscribe((data) =>{
      this.allFeedbackQuestions = data;
      this.dataService.passSpinnerFlag(false, true);
    },
    error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    },
    () => {
      this.dataService.passSpinnerFlag(false, true);
    })
  }
  getFeedbackTriggers(){
    this.dataService.passSpinnerFlag(true, true);
    this.commonService.getFeedbackTriggers().subscribe((data) =>{
      let array:any = data
      sessionStorage.setItem('feedbackTriggers', 'true')
      if(array.length == 0){
        sessionStorage.setItem('feedbackTriggers', 'false')
      }
      this.feedbackTriggers ={}
      array.forEach(ele => {
        if(ele.exit_intent_url){
          let object = ele;
          if(this.feedbackTriggers[ele.question_id]){
            this.feedbackTriggers[ele.question_id]['exit_intent_url'].push(object)
          }else{
            this.feedbackTriggers[ele.question_id] = {
              exit_intent_url: [],
              time_delay_url: [],
              button_click: [],
              inactivity: [],
              pageVisitCount: []
            }
            this.feedbackTriggers[ele.question_id]['exit_intent_url'].push(object)
          }
        }
        if(ele.button_click){
          let object = ele;
          if(this.feedbackTriggers[ele.question_id]){
            this.feedbackTriggers[ele.question_id]['button_click'].push(object)
          }else{
            this.feedbackTriggers[ele.question_id] = {
              exit_intent_url: [],
              time_delay_url: [],
              button_click: [],
              inactivity: [],
              pageVisitCount: []
            }
            this.feedbackTriggers[ele.question_id]['button_click'].push(object)
          }
        }
        if(ele.time_delay_url){
          let object = ele;
          if(this.feedbackTriggers[ele.question_id]){
            this.feedbackTriggers[ele.question_id]['time_delay_url'].push(object)
          }else{
            this.feedbackTriggers[ele.question_id] = {
              exit_intent_url: [],
              time_delay_url: [],
              button_click: [],
              inactivity: [],
              pageVisitCount: []
            }
            this.feedbackTriggers[ele.question_id]['time_delay_url'].push(object)
          }
        }
        if(ele.inactivity){
          let object = ele;
          if(this.feedbackTriggers[ele.question_id]){
            this.feedbackTriggers[ele.question_id]['inactivity'].push(object)
          }else{
            this.feedbackTriggers[ele.question_id] = {
              exit_intent_url: [],
              time_delay_url: [],
              button_click: [],
              inactivity: [],
              pageVisitCount: []
            }
            this.feedbackTriggers[ele.question_id]['inactivity'].push(object)
          }
        }
        if(ele.pageVisitCount){
          let object = ele;
          if(this.feedbackTriggers[ele.question_id]){
            this.feedbackTriggers[ele.question_id]['pageVisitCount'].push(object)
          }else{
            this.feedbackTriggers[ele.question_id] = {
              exit_intent_url: [],
              time_delay_url: [],
              button_click: [],
              inactivity: [],
              pageVisitCount: []
            }
            this.feedbackTriggers[ele.question_id]['pageVisitCount'].push(object)
          }
        }
      });
      this.dataService.passSpinnerFlag(false, true);
    },
    error => {
      sessionStorage.setItem('feedbackTriggers', 'false')
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    },
    () => {
      this.dataService.passSpinnerFlag(false, true);
    })
  }
  getUserFeedback(){
    this.dataService.passSpinnerFlag(true, true);
    this.commonService.getUserFeedback(this.userId).subscribe((data) =>{
      this.userFeedback = data;
      this.dataService.passSpinnerFlag(false, true);
    },
    error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    },
    () => {
      this.dataService.passSpinnerFlag(false, true);
    })
  }

  initiateTrigger(type, v1, v2){
    let boolean = false;
    if(this.feedbackTriggers){
      if(type == 'exit_intent_url'){
        if(Object.keys(this.feedbackTriggers).length > 0){
          for (const [key, value] of Object.entries(this.feedbackTriggers)) {
            this.feedbackTriggers[key].exit_intent_url.forEach(exit=>{
              let index = this.userFeedback.findIndex(ele=>{return ele.question_id == exit.question_id})
              if(exit.exit_intent_url == v1 && index == -1 ){
                this.triggerId = exit.id
                this.questionId = exit.question_id
                boolean = true;
                let questionIndex = this.allFeedbackQuestions.findIndex(ele=>{return ele.id == this.questionId})
                if(questionIndex >= 0){
                  this.selectedQuestion = this.allFeedbackQuestions[questionIndex]
                }
                $('#feedBackModal').modal('show');
              }
            })
            setTimeout(()=>{
              if(!boolean){
                this.dataService.passNavigateEvent(true);
              }
            }, 200)
          }
        }
      }else if(type == 'time_delay_url'){
        if(Object.keys(this.feedbackTriggers).length > 0){
          for (const [key, value] of Object.entries(this.feedbackTriggers)) {
            this.feedbackTriggers[key].time_delay_url.forEach(exit=>{
              let index = this.userFeedback.findIndex(ele=>{return ele.question_id == exit.question_id})
              if(exit.time_delay_url == v1 && index == -1 && exit.time_delay == v2){
                this.triggerId = exit.id
                this.questionId = exit.question_id
                let questionIndex = this.allFeedbackQuestions.findIndex(ele=>{return ele.id == this.questionId})
                if(questionIndex >= 0){
                  this.selectedQuestion = this.allFeedbackQuestions[questionIndex]
                }
                $('#feedBackModal').modal('show');
              }
            })
          }
        }
      }else if(type == 'button_click'){
        if(Object.keys(this.feedbackTriggers).length > 0){
          for (const [key, value] of Object.entries(this.feedbackTriggers)) {
            this.feedbackTriggers[key].button_click.forEach(exit=>{
              let index = this.userFeedback.findIndex(ele=>{return ele.question_id == exit.question_id})
              if(exit.button_click == v1 && index == -1 ){
                this.triggerId = exit.id
                this.questionId = exit.question_id
                let questionIndex = this.allFeedbackQuestions.findIndex(ele=>{return ele.id == this.questionId})
                if(questionIndex >= 0){
                  this.selectedQuestion = this.allFeedbackQuestions[questionIndex]
                }
                $('#feedBackModal').modal('show');
              }
            })
          }
        }
      }else if(type == 'inactivity'){
        if(Object.keys(this.feedbackTriggers).length > 0){
          for (const [key, value] of Object.entries(this.feedbackTriggers)) {
            this.feedbackTriggers[key].inactivity.forEach(exit=>{
              let index = this.userFeedback.findIndex(ele=>{return ele.question_id == exit.question_id})
              if(exit.inactivity == v2 && index == -1 ){
                this.triggerId = exit.id
                this.questionId = exit.question_id
                let questionIndex = this.allFeedbackQuestions.findIndex(ele=>{return ele.id == this.questionId})
                if(questionIndex >= 0){
                  this.selectedQuestion = this.allFeedbackQuestions[questionIndex]
                }
                $('#feedBackModal').modal('show');
              }
            })
          }
        }
      }else if(type == 'pageVisitCount'){
        if(Object.keys(this.feedbackTriggers).length > 0){
          for (const [key, value] of Object.entries(this.feedbackTriggers)) {
            this.feedbackTriggers[key].pageVisitCount.forEach(exit=>{
              let index = this.userFeedback.findIndex(ele=>{return ele.question_id == exit.question_id})
              if(exit.pageVisitCount == v2 && index == -1 ){
                this.triggerId = exit.id
                this.questionId = exit.question_id
                let questionIndex = this.allFeedbackQuestions.findIndex(ele=>{return ele.id == this.questionId})
                if(questionIndex >= 0){
                  this.selectedQuestion = this.allFeedbackQuestions[questionIndex]
                }
                setTimeout(()=>{
                  this.pageVisitCount = 0;
                  this.numberOfPageVisit = [];
                  $('#feedBackModal').modal('show');
                }, 1000)
              }
            })
          }
        }
      }
    }
  }

  startTimer(){
    this.numberOfPageVisit = [];
    let pageIndex = '';
    setInterval(()=>{
      let pathname = window.location.pathname.split('/');
    let moduleName = '';
    if(pathname[1] == 'safety-and-surveillance'){
      moduleName = 'HSSE';
    }else if(pathname[1] == 'manpower-counting'){
      moduleName = 'OM';
    }else if(pathname[1] == 'live-streaming'){
      moduleName = 'LS';
    }else if(pathname[1] == 'employee-wellness'){
      moduleName = 'EM';
    }else if(pathname[1] == 'vendor-management'){
      moduleName = 'VM';
    }else if(pathname[1] == 'admin-app'){
      moduleName = 'Admin';
    }
    let exit_url = '';
    if(pathname.length > 3){
      exit_url = moduleName + '/' + (pathname[2] == 'highlights' ? 'sif' : pathname[2]) + '/' + pathname[3]
    }else{
      exit_url = moduleName + '/' + (pathname[2] == 'highlights' ? 'sif' : pathname[2])
    }
    if(this.currentPage == exit_url){
      this.timerCount += 1;
    }else{
      this.currentPage = exit_url;
      this.timerCount = 0;
    }
    let url = exit_url.split('/')
    let modifiedUrl = '';
    url.forEach((ele, i) =>{
      if(url.length == (i + 1)){
        modifiedUrl = modifiedUrl + '' + (ele == 'dashboard' ? 'home' : ele)
      }else{
        modifiedUrl = modifiedUrl + '' + ele + '/'
      }
    })
    exit_url = modifiedUrl
    if(pageIndex != exit_url){
      pageIndex = exit_url
      this.numberOfPageVisit.push(exit_url)
    }
    this.initiateTrigger('time_delay_url', exit_url, this.timerCount)
    this.initiateTrigger('inactivity', '', this.timerCount)
    if(this.pageVisitCount != this.numberOfPageVisit.length){
      this.pageVisitCount = this.numberOfPageVisit.length
      this.initiateTrigger('pageVisitCount', '', this.numberOfPageVisit.length)
    }
    }, 1000)

  }

  validationSubmit(){
    if(this.selectedRating){
      if(Object.keys(this.selectedRating)?.length >= 1){
        return false
      }else{
        return true;
      }
    }else{
      return true;
    }
  }

}
