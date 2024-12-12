///////////////////////////////////////////////////////////////////////////////
// Filename : annotation.component.ts
// Description : Annotation tool for adding comments in images
// Revision History:
// Version  | Date        |  Change Description
// ---------------------------------------------
// 1.0      | 01-Jul-2019 |  Single Unit First Production Release
// 2.0      | 31-Jul-2019 |  Single Unit Second Production Release
// 3.0      | 01-Nov-2019 |  Multi Unit Production Release
// 4.0      | 06-Jan-2020 |  Release for Copyright
// Copyright : Detect Technologies Pvt Ltd.
///////////////////////////////////////////////////////////////////////////////

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
declare var $: any;

import { SnackbarService } from 'src/shared/services/snackbar.service';
import { CommonService } from 'src/shared/services/common.service';
import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';
import { SafetyAndSurveillanceCommonService } from 'src/app/shared/service/common.service';
import { IogpService } from 'src/shared/components/unit-ss-dashboard/services/iogp.service';

@Component({
  selector: 'app-safety-and-surveillance-annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.css']
})
export class SafetyAndSurveillanceAnnotationComponent implements OnInit {

  msg: string = '';
  userGroup: any = [];
  @Input() canvasHeight: number = 0;
  @Input() canvasWidth: number = 0;
  @Input() canvasRatio: number = 0;
  @Input() imageModalData: any;
  @Input() trigger: number = 0;
  @Output() selectedAnnotation = new EventEmitter();
  @Output() showEditSymbol = new EventEmitter();
  annotationMode: boolean = false;
  annotationIndex: number = 0;
  annotationNumber: number;
  annotationId: number = null;
  canvasData: any = {
    canvas: null,
    context: null,
    height: null,
    width: null,
    ratio: null,
    index: null,
    drawClicked: false,
    shape: 'rectangle',
    lineColor: '#0412fb',
    lineThickness: 3,
    comments: '',
    annotation: {
      xcoordi: 0,
      ycoordi: 0,
      width: 0,
      height: 0,
      shape: '',
      lineColor: '',
      lineThickness: null,
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
      lineColor: '',
      lineThickness: null,
      createdIn: '',
      comments: '',
      index: null
    },
    radius: null
  };
  newComment: string = '';
  lineLength: number = null;
  mouseDown: any = this.handleMouseDown.bind(this);
  mouseMove: any = this.handleMouseMove.bind(this);
  mouseUp: any = this.handleMouseUp.bind(this);
  deleteAnnotationIndex: any;

  constructor(private iogpService: IogpService, private snackbarService: SnackbarService, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, public commonService: CommonService, public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) {
    window.addEventListener("manualObservation", (evt) => {
       if(this.annotationMode){
        this.annotationMode = false;
        setTimeout(()=>{
          this.annotationMode = true;
        },10)
       }
    })
   }

  ngOnInit() {
  }

  ngOnChanges() {
    this.userGroup = JSON.parse(sessionStorage.getItem('selectedUnitDetails')).userGroup;
    if (this.newComment === '') {
      this.canvasData.height = this.canvasHeight;
      this.canvasData.width = this.canvasWidth;
      this.canvasData.ratio = this.canvasRatio;
      this.canvasData.boundingBoxes = this.scaleAspectRatio(this.imageModalData.annotations.filter(item => item.shape === 'rectangle'));
      this.canvasData.circles = this.scaleAspectRatio(this.imageModalData.annotations.filter(item => item.shape === 'circle'));
      this.initializeCanvas();
    }
    else {
      this.newComment = '';
      setTimeout(() => {
        $('#collapse' + this.annotationIndex).collapse('show');
        $('#collapse' + this.annotationIndex).animate({
          scrollTop: 0
        }, 'slow');
      }, 500);
    }
    this.showEditSymbol.emit({tab: this.annotationMode, annotation: this.canvasData.drawn});
  }

  /**
   * return the bounding box sizes.
   */
  scaleAspectRatio(annotations) {
    let boundingBoxes = [];
    annotations.forEach(annotation => {
      if (annotation.shape === 'rectangle') {
        let coords = annotation.coords.map(point => Math.round(point / this.canvasData.ratio));
        boundingBoxes.push({ ...annotation, x: coords[0], y: coords[1], w: coords[2], h: coords[3] });
      }
      else if (annotation.shape === 'circle') {
        let coords = annotation.coords.map(point => Math.round(point / this.canvasData.ratio));
        boundingBoxes.push({ ...annotation, startX: coords[0], startY: coords[1], radius: coords[2] });
      }
    });
    return boundingBoxes;
  }

  initiateDrawing() {
    this.initializeCanvas();
    this.newComment = '';
    document.getElementById('canvas').style.zIndex = '9';
    this.annotationMode = true;
    this.newComment = '';
    this.canvasData.drawClicked = true;
    this.addEventListeners();
    $("[id^='content']").hide();
    this.showEditSymbol.emit({tab: this.annotationMode, annotation: this.canvasData.drawn});
  }

  /**
   * handle the mouse down event.
   */
  handleMouseDown(e) {
    if (this.canvasData.shape === 'rectangle') {
      this.drawRectangleMouseDown(e);
    }
    else if (this.canvasData.shape === 'circle') {
      this.drawCircleMouseDown(e);
    }
  }

  /**
   * handle the mouse move event.
   */
  handleMouseMove(e) {
    if (this.canvasData.shape === 'rectangle') {
      this.drawRectangleMouseMove(e);
    }
    else if (this.canvasData.shape === 'circle') {
      this.drawCircleMouseMove(e);
    }
  }

  /**
   * handle the mouse up event.
   */
  handleMouseUp(e) {
    if (this.canvasData.shape === 'rectangle') {
      this.drawRectangleMouseUp(e);
    }
    else if (this.canvasData.shape === 'circle') {
      this.drawCircleMouseUp(e);
    }
  }

   /**
   * draw a rectangle on mouse down event.
   */
  drawRectangleMouseDown(e) {
    if (this.canvasData.drawClicked) {
      this.canvasData.start = this.oMousePos(this.canvasData.canvas, e);
      this.canvasData.isDrawing = true;
      this.canvasData.canvas.style.cursor = 'crosshair';
    }
  }

   /**
   * draw a rectangle on mouse move event.
   */
  drawRectangleMouseMove(e) {
    if (this.canvasData.isDrawing && this.canvasData.drawClicked) {
      this.canvasData.m = this.oMousePos(this.canvasData.canvas, e);
      this.draw();
    }
  }

   /**
   * draw a rectangle on mouse up event.
   */
  drawRectangleMouseUp(e) {
    if (this.canvasData.drawClicked) {
      this.canvasData.canvas.style.cursor = 'default';
      this.canvasData.isDrawing = false;
      const box = Object.create(this.canvasData.annotation);
      box.x = this.canvasData.o.x;
      box.y = this.canvasData.o.y;
      box.w = this.canvasData.o.w;
      box.h = this.canvasData.o.h;
      box.lineColor = this.canvasData.lineColor;
      box.lineThickness = this.canvasData.lineThickness;
      box.createdIn = 'system';
      box.comments = this.canvasData.comments;
      box.shape = this.canvasData.shape;
      box.index = this.canvasData.index;
      if (box.x) {
        this.canvasData.boundingBoxes.push(box);
        this.draw();
        this.canvasData.drawClicked = false;
        this.canvasData.drawn = true;
        this.showEditSymbol.emit({tab: this.annotationMode, annotation: this.canvasData.drawn});
        $('#collapseAddNewCommentDiv').animate({
          scrollTop: $('#actions').position().top
        }, 'slow');
      }
    }
  }

  draw() {
    this.canvasData.o.x = this.canvasData.start.x;
    this.canvasData.o.y = this.canvasData.start.y;
    this.canvasData.o.w = this.canvasData.m.x - this.canvasData.start.x;
    this.canvasData.o.h = this.canvasData.m.y - this.canvasData.start.y;
    this.canvasData.context.clearRect(0, 0, this.canvasData.canvas.width, this.canvasData.canvas.height);
    this.canvasData.boundingBoxes.map(r => { this.drawRect(r) });
    this.canvasData.circles.map(c => this.drawCircle(c));
    this.drawRect(this.canvasData.o);
  }

  /**
   * reset the all stored data.
   */
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
    this.canvasData.boundingBoxes = this.canvasData.boundingBoxes.filter(item => item.createdIn != 'system');
    this.canvasData.circles = this.canvasData.circles.filter(item => item.createdIn != 'system');
    this.canvasData.boundingBoxes.map(r => { this.drawRect(r) });
    this.canvasData.circles.map(c => this.drawCircle(c));
  }

  drawRect(o) {
    this.canvasData.context.strokeStyle = (o.lineColor && o.createdIn != 'system') ? o.lineColor : this.canvasData.lineColor;
    this.canvasData.context.lineWidth = (o.lineThickness && o.createdIn != 'system') ? o.lineThickness : this.canvasData.lineThickness;
    let a = { x: o.x, y: o.y, w: o.w, h: o.h };
    this.canvasData.context.beginPath(a);
    this.canvasData.context.rect(a.x, a.y, a.w, a.h);
    this.canvasData.context.stroke();
  }

  /**
   * draw a circle on mouse down event.
   */
  drawCircleMouseDown(e) {
    if (this.canvasData.drawClicked) {
      this.canvasData.startX = this.oMousePos(this.canvasData.canvas, e).x;
      this.canvasData.startY = this.oMousePos(this.canvasData.canvas, e).y;
      this.canvasData.isMouseDown = true;
      this.canvasData.circle = {
        startX: this.canvasData.startX,
        startY: this.canvasData.startY,
        radius: this.canvasData.radius,
        lineColor: this.canvasData.lineColor,
        lineThickness: this.canvasData.lineThickness,
        createdIn: 'system',
        comments: this.canvasData.comments,
        shape: this.canvasData.shape,
        index: this.canvasData.index
      };
      this.drawCircle(this.canvasData.circle);
      this.canvasData.circles.push(this.canvasData.circle);
    }
  }

  /**
   * draw a circle on mouse up event.
   */
  drawCircleMouseUp(e) {
    this.canvasData.isMouseDown = false;
    this.canvasData.circle = null;
    if (this.getDistance(this.canvasData.startX, this.canvasData.startY, this.oMousePos(this.canvasData.canvas, e).x, this.oMousePos(this.canvasData.canvas, e).y) > 0) {
      if (this.canvasData.drawClicked) {
        this.canvasData.drawClicked = false;
        this.canvasData.drawn = true;
        this.showEditSymbol.emit({tab: this.annotationMode, annotation: this.canvasData.drawn});
        $('#collapseAddNewCommentDiv').animate({
          scrollTop: $('#actions').position().top
        }, 'slow');
      }
    }
  }

  /**
   * draw a circle on mouse move event.
   */
  drawCircleMouseMove(e) {
    if (this.canvasData.drawClicked) {
      if (!this.canvasData.isMouseDown) {
        return;
      }
      this.canvasData.mouseX = this.oMousePos(this.canvasData.canvas, e).x;
      this.canvasData.mouseY = this.oMousePos(this.canvasData.canvas, e).y;
      this.canvasData.circle.radius = this.getDistance(this.canvasData.startX, this.canvasData.startY, this.canvasData.mouseX, this.canvasData.mouseY);
      this.canvasData.radius = this.getDistance(this.canvasData.startX, this.canvasData.startY, this.canvasData.mouseX, this.canvasData.mouseY);
      this.canvasData.context.clearRect(0, 0, this.canvasData.canvas.width, this.canvasData.canvas.height);
      this.canvasData.circles.map(c => this.drawCircle(c));
      this.canvasData.boundingBoxes.map(r => { this.drawRect(r) });
    }
  }

  drawCircle(c) {
    this.canvasData.context.beginPath();
    this.canvasData.context.arc(c.startX, c.startY, c.radius, 0, 2 * Math.PI);
    this.canvasData.context.strokeStyle = (c.lineColor && c.createdIn != 'system') ? c.lineColor : this.canvasData.lineColor;
    this.canvasData.context.lineWidth = (c.lineThickness && c.createdIn != 'system') ? c.lineThickness : this.canvasData.lineThickness;
    this.canvasData.context.stroke();
  }

  getDistance(p1X, p1Y, p2X, p2Y) {
    return Math.sqrt(Math.pow(p1X - p2X, 2) + Math.pow(p1Y - p2Y, 2));
  }

  oMousePos(canvas, evt) {
    let ClientRect = canvas.getBoundingClientRect();
    return {
      x: Math.round(evt.clientX - ClientRect.left),
      y: Math.round(evt.clientY - ClientRect.top)
    }
  }

  onParametersChange() {
    this.canvasData.context.clearRect(0, 0, this.canvasData.canvas.width, this.canvasData.canvas.height);
    this.canvasData.boundingBoxes.map(r => { this.drawRect(r) });
    this.canvasData.circles.map(c => this.drawCircle(c));
  }

  changeDrawMode() {
    this.newComment = '';
    this.resetCanvas();
    this.resetCanvasData();
    this.annotationMode = false;
    this.canvasData.drawn = false;
    this.showEditSymbol.emit({tab: this.annotationMode, annotation: this.canvasData.drawn});
    this.removeEventListeners();
    document.getElementById('canvas').style.zIndex = '2';
  }

  onSave() {
    let annotation = (this.canvasData.shape === 'rectangle') ? this.canvasData.boundingBoxes.find(item => item.createdIn === 'system') : this.canvasData.circles.find(item => item.createdIn === 'system');
    let coordinates = (annotation.shape === 'rectangle') ? [annotation.x, annotation.y, annotation.w, annotation.h].map(point => point * this.canvasData.ratio).join(',') : [annotation.startX, annotation.startY, annotation.radius].map(point => point * this.canvasData.ratio).join(',');
    this.iogpService.addAnnotation(this.imageModalData.imageId, coordinates, this.canvasData.lineColor, this.canvasData.lineThickness, annotation.shape, this.canvasData.comments).subscribe(
      addStatus => {
        this.msg = 'Annotation added successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.safetyAndSurveillanceDataService.passSelectedDate(this.imageModalData.date, true);
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful observation annotation', 'Annotate observation');
        this.changeDrawMode();
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  /**
   * confirmation popup for delete the annotation.
   */
  onDeleteAnnotation(annotationId, index) {
    this.annotationId = annotationId;
    this.deleteAnnotationIndex = index;
    $('#confirmationModal').modal('show');
  }

  /**
   * close the confirmation popup.
   */
  closeConfirmationModal() {
    this.deleteAnnotationIndex = null;
    $('#confirmationModal').modal('hide');
  }

  deleteAnnotation() {
    this.iogpService.deleteAnnotation(this.annotationId).subscribe(
      addStatus => {
        $('#confirmationModal').modal('hide');
        $('#content' + this.deleteAnnotationIndex).hide();
        this.deleteAnnotationIndex = null;
        this.msg = 'Annotation deleted successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.safetyAndSurveillanceDataService.passSelectedDate(this.imageModalData.date, true);
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Delete annotation', 'Annotate observation');
        this.changeDrawMode();
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  sendSelectedAnnotation(annotation) {
    this.selectedAnnotation.emit(annotation);
  }

  annotationSelect(index) {
    this.annotationNumber = index;
    this.newComment = '';
  }
  addComment(annotation) {
    this.annotationIndex = annotation.index;
    this.iogpService.addComment(annotation.annotationId, this.newComment).subscribe(
      addStatus => {
        this.msg = 'Comment added successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.safetyAndSurveillanceDataService.passSelectedDate(this.imageModalData.date, true);
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Adding comment to annotation', 'Annotation comments');
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  onShapeChange() {
    this.resetCanvas();
    this.canvasData.drawClicked = true;
    this.canvasData.drawn = false;
    this.showEditSymbol.emit({tab: this.annotationMode, annotation: this.canvasData.drawn});
  }

   /**
   * clear all data.
   */
  onClear() {
    this.onShapeChange();
    this.canvasData.shape = 'rectangle';
    this.canvasData.lineColor = '#0412fb';
    this.canvasData.lineThickness = 3;
    this.canvasData.comments = '';
    this.canvasData.drawn = false;
    this.showEditSymbol.emit({tab: this.annotationMode, annotation: this.canvasData.drawn});
    $('#collapseAddNewCommentDiv').animate({
      scrollTop: 0
    }, 'slow');
  }

  initializeCanvas() {
    let canvas = document.getElementById('canvas');
    canvas.setAttribute('height', this.canvasData.height);
    canvas.setAttribute('width', this.canvasData.width);
    this.canvasData.canvas = canvas;
    this.canvasData.context = this.canvasData.canvas.getContext('2d');
    this.canvasData.index = this.canvasData.boundingBoxes.length + this.canvasData.circles.length + 1;
    this.canvasData.canvasOffset = $('#canvas').offset();
    this.resetCanvas();
    this.removeEventListeners();
  }

  addEventListeners() {
    this.canvasData.canvas.addEventListener('mousedown', this.mouseDown, false);
    this.canvasData.canvas.addEventListener('mousemove', this.mouseMove, false);
    this.canvasData.canvas.addEventListener('mouseup', this.mouseUp, false);
  }

  removeEventListeners() {
    this.canvasData.canvas.removeEventListener('mousedown', this.mouseDown, false);
    this.canvasData.canvas.removeEventListener('mousemove', this.mouseMove, false);
    this.canvasData.canvas.removeEventListener('mouseup', this.mouseUp, false);
  }

  resetCanvasData() {
    this.canvasData.shape = 'rectangle';
    this.canvasData.lineColor = '#0412fb';
    this.canvasData.lineThickness = 3;
    this.canvasData.comments = '';
    this.canvasData.drawClicked = false;
    this.canvasData.drawLine = false;
  }


  returnDataStatus() {
    return (this.imageModalData.annotations.filter(item => item.createdIn != 'system').length === 0) ? true : false;
  }

  ngOnDestroy() {
    this.removeEventListeners();
  }

}
