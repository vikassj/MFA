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

import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
declare var $: any;

import { CommonService } from 'src/shared/services/common.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { TaskService } from 'src/app/services/task.service';
import { DataService } from 'src/shared/services/data.service';

@Component({
  selector: 'app-activity-monitor-annotations',
  templateUrl: './activity-monitor-annotations.component.html',
  styleUrls: ['./activity-monitor-annotations.component.scss']
})
export class ActivityMonitorAnnotationsComponent implements OnInit {
  @ViewChild('annotation', { static: true }) annotation: ElementRef;
  msg: string = '';
  @Input() canvasHeight: number = 0;
  @Input() canvasWidth: number = 0;
  @Input() canvasRatio: number = 0;
  @Input() imageModalData: any;
  @Input() trigger: number = 0;
  @Input() selectAnnotation: any;
  @Input() show: boolean;
  @Output() selectedAnnotation = new EventEmitter();
  @Output() refresh = new EventEmitter();
  annotationMode: boolean = false;
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
    line_color: '#0412fb',
    thickness: 3,
    comments: '',
    annotation: {
      xcoordi: 0,
      ycoordi: 0,
      width: 0,
      height: 0,
      shape: '',
      line_color: '',
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
      line_color: '',
      thickness: null,
      createdIn: '',
      comments: '',
      index: null
    },
    radius: null
  };
  newComment: string = '';
  currentComment: number = null;
  newReply: string = '';
  lineLength: number = null;
  mouseDown: any = this.handleMouseDown.bind(this);
  mouseMove: any = this.handleMouseMove.bind(this);
  mouseUp: any = this.handleMouseUp.bind(this);

  constructor(private snackbarService: SnackbarService, private activityMonitorDataService: DataService, private taskService: TaskService, public commonService: CommonService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.newComment === '' && this.newReply === '') {
      this.canvasData.height = this.canvasHeight;
      this.canvasData.width = this.canvasWidth;
      this.canvasData.ratio = this.canvasRatio;
      console.log('this.imageModalData', this.imageModalData)
      this.canvasData.boundingBoxes = this.scaleAspectRatio(this.imageModalData.annotations.filter(item => item.shape === 'rectangle'));
      this.canvasData.circles = this.scaleAspectRatio(this.imageModalData.annotations.filter(item => item.shape === 'circle'));
      this.initializeCanvas();
    }
    else {
      this.newComment = '';
      this.newReply = '';
      setTimeout(() => {
        $('#annotationMatrix').animate({
          scrollTop: $('#annotation' + this.selectAnnotation.index).position().top
        }, 'slow');
      }, 500);
    }
    if (!$.isEmptyObject(this.selectAnnotation)) {
      $('#annotationMatrix').animate({
        scrollTop: $('#annotation' + this.selectAnnotation.index).position().top
      }, 'slow');
    }
    if (this.show) {
      setTimeout(() => {
        this.annotation.nativeElement.scrollIntoView({ behavior: 'smooth' })
      }, 100);

    }
  }

  scaleAspectRatio(annotations) {
    let boundingBoxes = [];
    annotations.forEach(annotation => {
      if (annotation.shape === 'rectangle') {
        let coords = annotation.coordinates.map(point => Math.round(point / this.canvasData.ratio));
        boundingBoxes.push({ ...annotation, x: coords[0], y: coords[1], w: coords[2], h: coords[3] });
      }
      else if (annotation.shape === 'circle') {
        let coords = annotation.coordinates.map(point => Math.round(point / this.canvasData.ratio));
        boundingBoxes.push({ ...annotation, startX: coords[0], startY: coords[1], radius: coords[2] });
      }
    });
    return boundingBoxes;
  }

  initiateDrawing() {
    this.initializeCanvas();
    this.newComment = '';
    this.newReply = '';
    document.getElementById('canvas').style.zIndex = '9';
    this.annotationMode = true;
    this.canvasData.drawClicked = true;
    this.addEventListeners();
  }

  handleMouseDown(e) {
    if (this.canvasData.shape === 'rectangle') {
      this.drawRectangleMouseDown(e);
    }
    else if (this.canvasData.shape === 'circle') {
      this.drawCircleMouseDown(e);
    }
  }

  handleMouseMove(e) {
    if (this.canvasData.shape === 'rectangle') {
      this.drawRectangleMouseMove(e);
    }
    else if (this.canvasData.shape === 'circle') {
      this.drawCircleMouseMove(e);
    }
  }

  handleMouseUp(e) {
    if (this.canvasData.shape === 'rectangle') {
      this.drawRectangleMouseUp(e);
    }
    else if (this.canvasData.shape === 'circle') {
      this.drawCircleMouseUp(e);
    }
  }

  drawRectangleMouseDown(e) {
    if (this.canvasData.drawClicked) {
      this.canvasData.start = this.oMousePos(this.canvasData.canvas, e);
      this.canvasData.isDrawing = true;
      this.canvasData.canvas.style.cursor = 'crosshair';
    }
  }

  drawRectangleMouseMove(e) {
    if (this.canvasData.isDrawing && this.canvasData.drawClicked) {
      this.canvasData.m = this.oMousePos(this.canvasData.canvas, e);
      this.draw();
    }
  }

  drawRectangleMouseUp(e) {
    if (this.canvasData.drawClicked) {
      this.canvasData.canvas.style.cursor = 'default';
      this.canvasData.isDrawing = false;
      const box = Object.create(this.canvasData.annotation);
      box.x = this.canvasData.o.x;
      box.y = this.canvasData.o.y;
      box.w = this.canvasData.o.w;
      box.h = this.canvasData.o.h;
      box.line_color = this.canvasData.line_color;
      box.thickness = this.canvasData.thickness;
      box.createdIn = 'system';
      box.comments = this.canvasData.comments;
      box.shape = this.canvasData.shape;
      box.index = this.canvasData.index;
      if (box.x) {
        this.canvasData.boundingBoxes.push(box);
        this.draw();
        this.canvasData.drawClicked = false;
        this.canvasData.drawn = true;
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
    this.canvasData.context.strokeStyle = (o.line_color && o.createdIn != 'system') ? o.line_color : this.canvasData.line_color;
    this.canvasData.context.lineWidth = (o.thickness && o.createdIn != 'system') ? o.thickness : this.canvasData.thickness;
    let a = { x: o.x, y: o.y, w: o.w, h: o.h };
    this.canvasData.context.beginPath(a);
    this.canvasData.context.rect(a.x, a.y, a.w, a.h);
    this.canvasData.context.stroke();
    // this.canvasData.context.beginPath();
    // this.canvasData.context.arc(a.x, a.y, 14, 0, Math.PI * 2, true);
    // this.canvasData.context.closePath();
    // this.canvasData.context.fillStyle = 'white';
    // this.canvasData.context.fill();
    // var text = (o.index) ? o.index : this.canvasData.index;
    // this.canvasData.context.fillStyle = 'black';
    // var font = 'bold ' + 14 + 'px arial';
    // this.canvasData.context.font = font;
    // var width = this.canvasData.context.measureText(text).width;
    // var height = this.canvasData.context.measureText('w').width;
    // this.canvasData.context.fillText(text, a.x - (width / 2), a.y + (height / 2));
  }

  drawCircleMouseDown(e) {
    if (this.canvasData.drawClicked) {
      this.canvasData.startX = this.oMousePos(this.canvasData.canvas, e).x;
      this.canvasData.startY = this.oMousePos(this.canvasData.canvas, e).y;
      this.canvasData.isMouseDown = true;
      this.canvasData.circle = {
        startX: this.canvasData.startX,
        startY: this.canvasData.startY,
        radius: this.canvasData.radius,
        line_color: this.canvasData.line_color,
        thickness: this.canvasData.thickness,
        createdIn: 'system',
        comments: this.canvasData.comments,
        shape: this.canvasData.shape,
        index: this.canvasData.index
      };
      this.drawCircle(this.canvasData.circle);
      this.canvasData.circles.push(this.canvasData.circle);
    }
  }

  drawCircleMouseUp(e) {
    this.canvasData.isMouseDown = false;
    this.canvasData.circle = null;
    if (this.getDistance(this.canvasData.startX, this.canvasData.startY, this.oMousePos(this.canvasData.canvas, e).x, this.oMousePos(this.canvasData.canvas, e).y) > 0) {
      if (this.canvasData.drawClicked) {
        this.canvasData.drawClicked = false;
        this.canvasData.drawn = true;
        $('#collapseAddNewCommentDiv').animate({
          scrollTop: $('#actions').position().top
        }, 'slow');
      }
    }
  }

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
    this.canvasData.context.strokeStyle = (c.line_color && c.createdIn != 'system') ? c.line_color : this.canvasData.line_color;
    this.canvasData.context.lineWidth = (c.thickness && c.createdIn != 'system') ? c.thickness : this.canvasData.thickness;
    this.canvasData.context.stroke();
    // this.canvasData.context.beginPath();
    // this.canvasData.context.arc(c.startX, c.startY - c.radius, 14, 0, Math.PI * 2, true);
    // this.canvasData.context.closePath();
    // this.canvasData.context.fillStyle = 'white';
    // this.canvasData.context.fill();
    // var text = (c.index) ? c.index : this.canvasData.index;
    // this.canvasData.context.fillStyle = 'black';
    // var font = 'bold ' + 14 + 'px arial';
    // this.canvasData.context.font = font;
    // var width = this.canvasData.context.measureText(text).width;
    // var height = this.canvasData.context.measureText('w').width;
    // this.canvasData.context.fillText(text, c.startX - (width / 2), c.startY - c.radius + (height / 2));
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
    this.newReply = '';
    this.resetCanvas();
    this.resetCanvasData();
    this.annotationMode = false;
    this.canvasData.drawn = false;
    this.removeEventListeners();
    document.getElementById('canvas').style.zIndex = '2';
  }

  onSave() {
    let annotation = (this.canvasData.shape === 'rectangle') ? this.canvasData.boundingBoxes.find(item => item.createdIn === 'system') : this.canvasData.circles.find(item => item.createdIn === 'system');
    let coordinates = (annotation.shape === 'rectangle') ? [annotation.x, annotation.y, annotation.w, annotation.h].map(point => point * this.canvasData.ratio).join(',') : [annotation.startX, annotation.startY, annotation.radius].map(point => point * this.canvasData.ratio).join(',');
    this.taskService.addAnnotation(this.imageModalData.id, coordinates, this.canvasData.line_color, this.canvasData.thickness, annotation.shape, this.canvasData.comments).subscribe(
      addStatus => {
        this.msg = 'Annotation added successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.changeDrawMode();
        this.refresh.emit();
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  onDeleteAnnotation(annotationId) {
    this.annotationId = annotationId;
    $('#confirmationModal').modal('show');
  }

  closeConfirmationModal() {
    $('#confirmationModal').modal('hide');
  }

  deleteAnnotation() {
    this.taskService.deleteAnnotation(this.annotationId).subscribe(
      addStatus => {
        $('#confirmationModal').modal('hide');
        this.msg = 'Annotation deleted successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.refresh.emit();
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
    this.selectAnnotation = { ...annotation };
    this.selectedAnnotation.emit(this.selectAnnotation);
    this.newComment = '';
    this.newReply = '';
  }

  addComment(annotation) {
    this.taskService.addComment(annotation.id, this.newComment).subscribe(
      addStatus => {
        this.msg = 'Comment added successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.refresh.emit();
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  toggleReply(commentId) {
    this.currentComment = commentId;
    this.newReply = '';
  }

  addReply(comment) {
    this.taskService.addReply(comment.id, this.newReply).subscribe(
      addStatus => {
        this.msg = 'Reply added successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.refresh.emit();
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
  }

  onClear() {
    this.onShapeChange();
    this.canvasData.shape = 'rectangle';
    this.canvasData.line_color = '#0412fb';
    this.canvasData.thickness = 3;
    this.canvasData.comments = '';
    this.canvasData.drawn = false;
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
    this.canvasData.line_color = '#0412fb';
    this.canvasData.thickness = 3;
    this.canvasData.comments = '';
    this.canvasData.drawClicked = false;
    this.canvasData.drawLine = false;
  }

  returnDataStatus() {
    if (!$.isEmptyObject(this.imageModalData)) {
      return (this.imageModalData.annotations.filter(item => item.createdIn != 'system').length === 0) ? true : false;
    }
    else {
      return true;
    }

  }
  deleteTaskAnnotation(obj){
    this.taskService.deleteTaskAnnotation(obj.id).subscribe(
      addStatus => {
        this.msg = 'Annotation deleted successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.refresh.emit();
        // this.changeDrawMode();
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )

  }

  ngOnDestroy() {
    this.removeEventListeners();
  }

}
