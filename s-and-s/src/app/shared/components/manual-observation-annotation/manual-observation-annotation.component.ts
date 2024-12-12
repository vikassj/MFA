import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  Pipe,
  PipeTransform,
} from '@angular/core';
declare var $: any;

import { SafetyAndSurveillanceDataService } from '../../service/data.service';
import { SafetyAndSurveillanceCommonService } from '../../service/common.service';
import { IogpService } from 'src/shared/components/unit-ss-dashboard/services/iogp.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { CommonService } from 'src/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { PlantService } from '../../service/plant.service';

@Component({
  selector: 'app-manual-observation-annotation',
  templateUrl: './manual-observation-annotation.component.html',
  styleUrls: ['./manual-observation-annotation.component.scss'],
})
export class ManualObservationAnnotationComponent implements OnInit {
  msg: string = '';
  userGroup: any[] = [];
  @Input() canvasHeight: number = 0;
  @Input() canvasWidth: number = 0;
  @Input() canvasRatio: number = 0;
  @Input() imageModalData: any;
  @Input() trigger: number = 0;
  @Input() unitList: any;
  @Input() manulaObservationSelectedDetails = {};
  @Input() selectedManualAnnotation = {};
  @Input() observationCategoryList = [];
  @Input() annotate: any;
  @Output() selectedAnnotation = new EventEmitter();
  @Output() selectUnits = new EventEmitter();
  @Output() selectRiskRating = new EventEmitter();
  @Output() backToAddObservationData = new EventEmitter();
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
      index: null,
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
      index: null,
    },
    radius: null,
  };
  newComment: string = '';
  lineLength: number = null;
  mouseDown: any = this.handleMouseDown.bind(this);
  mouseMove: any = this.handleMouseMove.bind(this);
  mouseUp: any = this.handleMouseUp.bind(this);

  obsData: any;
  zonesList = [];
  selectedObservationCategory = '';
  selectedObservationDescription = '';
  selectedObservationUnit = '';
  selectedObservationZone = '';
  selectedRiskRating = {};
  selectAnnotation = {};
  riskLevels = JSON.parse(
    sessionStorage.getItem('safety-and-surveillance-configurations')
  )['module_configurations']['risk_rating_levels'];
  unitDropdown = false;
  zoneDropdown = false;
  categoryDropdown = false;
  unitData: any;
  unfilteredZones: any = [];
  selectedPlantDetails: any;
  disableUnit: boolean = false;
  constructor(
    private iogpService: IogpService,
    private snackbarService: SnackbarService,
    private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService,
    private commonService: CommonService,
    private SafetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,
    private dataService: DataService,
    private plantService: PlantService
  ) {
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'));
    let accessiblePlants = JSON.parse(
      sessionStorage.getItem('accessible-plants')
    );
    this.selectedPlantDetails = accessiblePlants.filter(
      (val, ind) => val?.id == plantDetails.id
    );
  }

  ngOnInit() {}

  ngOnChanges() {
    this.annotate = !this.annotate;

    this.plantService.getAvailableUnits().subscribe(
      (availableUnits) => {
        if (availableUnits['IOGP_Category']) {
          let units: any = availableUnits;
          let unitList: any = [];
          this.unitList.forEach((unit) => {
            let today = new Date();
            let endDay = new Date(units.IOGP_Category[unit].end_date);
            let validateDate = endDay.getTime() - today.getTime();
            if (validateDate >= 0) {
              unitList.push(unit);
            }
          });
          this.unitList = unitList;
        }
      },
      (error) => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    );

    setTimeout(() => {
      this.annotate = !this.annotate;
      this.userGroup = JSON.parse(
        sessionStorage.getItem('selectedUnitDetails')
      ).userGroup;
      if (this.newComment === '') {
        this.canvasData.height = this.canvasHeight;
        this.canvasData.width = this.canvasWidth;
        this.canvasData.ratio = this.canvasRatio;
        if (this.annotate) {
          this.canvasData.boundingBoxes = this.scaleAspectRatio(
            this.imageModalData.filter((item) => item.shape === 'rectangle')
          );
          this.canvasData.circles = this.scaleAspectRatio(
            this.imageModalData.filter((item) => item.shape === 'circle')
          );
        } else {
          this.canvasData.boundingBoxes = this.scaleAspectRatio([{}]);
          this.canvasData.circles = this.scaleAspectRatio([{}]);
        }
        this.initializeCanvas();
      } else {
        this.newComment = '';
        setTimeout(() => {
          $('#collapse' + this.annotationIndex).collapse('show');
          $('#collapse' + this.annotationIndex).animate(
            {
              scrollTop: 0,
            },
            'slow'
          );
        }, 500);
      }
      this.initiateDrawing();
      this.selectedObservationUnit = this.manulaObservationSelectedDetails[
        'unit'
      ]
        ? this.manulaObservationSelectedDetails['unit']
        : '';
      this.selectedObservationZone = this.manulaObservationSelectedDetails[
        'zone'
      ]
        ? this.manulaObservationSelectedDetails['zone']
        : '';
      let unit;
      let zone;
      if (sessionStorage.getItem('selectedUnitStartAudit')) {
        unit = sessionStorage.getItem('selectedUnitStartAudit');
        zone = sessionStorage.getItem('selectedZoneStartAudit');
        this.selectedObservationUnit = unit ? unit : '';
        this.selectedObservationZone = zone ? zone : '';
        this.disableUnit = true
      }
      else{
        this.disableUnit = false
      }
      if (this.manulaObservationSelectedDetails['unit']) {
        this.fetchObservationData();
      }
      this.selectedObservationDescription = this
        .manulaObservationSelectedDetails['observation']
        ? this.manulaObservationSelectedDetails['observation']
        : '';
      this.selectedRiskRating = '';
      if (this.manulaObservationSelectedDetails['rating'] > 0) {
        this.riskLevels.forEach((risk) => {
          if (
            risk['rating'] == this.manulaObservationSelectedDetails['rating']
          ) {
            this.selectedRiskRating = risk;
          }
        });
      }
      this.selectedObservationCategory = this.manulaObservationSelectedDetails[
        'job'
      ]
        ? this.manulaObservationSelectedDetails['job']
        : '';
      this.selectedManualAnnotation = this.manulaObservationSelectedDetails[
        'annotation'
      ]
        ? this.manulaObservationSelectedDetails['annotation']
        : {};
      this.canvasData.shape = this.manulaObservationSelectedDetails['shape']
        ? this.manulaObservationSelectedDetails['shape']
        : 'rectangle';
      if (this.canvasData.shape === 'rectangle') {
        if (this.selectedManualAnnotation && !this.annotate) {
          this.canvasData.lineColor = this.manulaObservationSelectedDetails[
            'lineColor'
          ]
            ? this.manulaObservationSelectedDetails['lineColor']
            : '#0412fb';
          this.canvasData.lineThickness = this.manulaObservationSelectedDetails[
            'lineThickness'
          ]
            ? this.manulaObservationSelectedDetails['lineThickness']
            : 3;
          this.drawRect(this.selectedManualAnnotation);
        } else {
          this.drawRect({});
        }
      } else {
        if (this.selectedManualAnnotation && !this.annotate) {
          this.canvasData.lineColor = this.manulaObservationSelectedDetails[
            'lineColor'
          ]
            ? this.manulaObservationSelectedDetails['lineColor']
            : '#0412fb';
          this.canvasData.lineThickness = this.manulaObservationSelectedDetails[
            'lineThickness'
          ]
            ? this.manulaObservationSelectedDetails['lineThickness']
            : 3;
          this.drawCircle(this.selectedManualAnnotation);
        } else {
          this.drawCircle({});
        }
      }
      if (this.manulaObservationSelectedDetails['coords']?.[0]) {
        this.canvasData.drawn = true;
      } else {
        this.canvasData.drawn = false;
      }
    }, 10);
  }

  /**
   * return the bounding box sizes.
   */
  scaleAspectRatio(annotations) {
    let boundingBoxes = [];
    annotations.forEach((annotation) => {
      if (annotation.shape === 'rectangle') {
        let coords = annotation.coords.map((point) =>
          Math.round(point / this.canvasData.ratio)
        );
        boundingBoxes.push({
          ...annotation,
          x: coords[0],
          y: coords[1],
          w: coords[2],
          h: coords[3],
        });
      } else if (annotation.shape === 'circle') {
        let coords = annotation.coords.map((point) =>
          Math.round(point / this.canvasData.ratio)
        );
        boundingBoxes.push({
          ...annotation,
          startX: coords[0],
          startY: coords[1],
          radius: coords[2],
        });
      }
    });
    return boundingBoxes;
  }

  initiateDrawing() {
    this.initializeCanvas();
    this.newComment = '';
    document.getElementById('observationCanvas').style.zIndex = '9';
    this.annotationMode = true;
    this.newComment = '';
    this.canvasData.drawClicked = true;
    this.addEventListeners();
  }

  /**
   * handle the mouse down event.
   */
  handleMouseDown(e) {
    if (this.canvasData.shape === 'rectangle' && !this.annotate) {
      this.drawRectangleMouseDown(e);
    } else if (this.canvasData.shape === 'circle' && !this.annotate) {
      this.drawCircleMouseDown(e);
    }
  }

  /**
   * handle the mouse move event.
   */
  handleMouseMove(e) {
    if (this.canvasData.shape === 'rectangle' && !this.annotate) {
      this.drawRectangleMouseMove(e);
    } else if (this.canvasData.shape === 'circle' && !this.annotate) {
      if (
        this.canvasData.radius <= this.canvasData.startY &&
        this.canvasData.radius <= this.canvasData.startX &&
        this.canvasData.width >=
          this.canvasData.radius + this.canvasData.startX &&
        this.canvasData.height >=
          this.canvasData.radius + this.canvasData.startY
      ) {
        this.drawCircleMouseMove(e);
      } else {
        this.canvasData.mouseX = this.oMousePos(this.canvasData.canvas, e).x;
        this.canvasData.mouseY = this.oMousePos(this.canvasData.canvas, e).y;
        this.canvasData.radius = this.getDistance(
          this.canvasData.startX,
          this.canvasData.startY,
          this.canvasData.mouseX,
          this.canvasData.mouseY
        );
      }
    }
  }

  /**
   * handle the mouse up event.
   */
  handleMouseUp(e) {
    if (this.canvasData.shape === 'rectangle' && !this.annotate) {
      this.drawRectangleMouseUp(e);
    } else if (this.canvasData.shape === 'circle' && !this.annotate) {
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
        $('#collapseAddNewCommentDiv').animate(
          {
            scrollTop: $('#actions').position()?.top,
          },
          'slow'
        );
      }
    }
  }

  draw() {
    this.canvasData.o.x = this.canvasData.start.x;
    this.canvasData.o.y = this.canvasData.start.y;
    this.canvasData.o.w = this.canvasData.m.x - this.canvasData.start.x;
    this.canvasData.o.h = this.canvasData.m.y - this.canvasData.start.y;
    this.canvasData.context.clearRect(
      0,
      0,
      this.canvasData.canvas.width,
      this.canvasData.canvas.height
    );
    this.canvasData.boundingBoxes.map((r) => {
      this.drawRect(r);
    });
    this.canvasData.circles.map((c) => this.drawCircle(c));
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
    this.canvasData.context.clearRect(
      0,
      0,
      this.canvasData.canvas.width,
      this.canvasData.canvas.height
    );
    this.canvasData.boundingBoxes = this.canvasData.boundingBoxes.filter(
      (item) => item.createdIn != 'system'
    );
    this.canvasData.circles = this.canvasData.circles.filter(
      (item) => item.createdIn != 'system'
    );
    this.canvasData.boundingBoxes.map((r) => {
      this.drawRect(r);
    });
    this.canvasData.circles.map((c) => this.drawCircle(c));
  }

  drawRect(o) {
    this.selectAnnotation = o;
    this.canvasData.context.strokeStyle =
      o.lineColor && o.createdIn != 'system'
        ? o.lineColor
        : this.canvasData.lineColor;
    this.canvasData.context.lineWidth =
      o.lineThickness && o.createdIn != 'system'
        ? o.lineThickness
        : this.canvasData.lineThickness;
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
        index: this.canvasData.index,
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
    if (
      this.getDistance(
        this.canvasData.startX,
        this.canvasData.startY,
        this.oMousePos(this.canvasData.canvas, e).x,
        this.oMousePos(this.canvasData.canvas, e).y
      ) > 0
    ) {
      if (this.canvasData.drawClicked) {
        this.canvasData.drawClicked = false;
        this.canvasData.drawn = true;
        $('#collapseAddNewCommentDiv').animate(
          {
            scrollTop: $('#actions').position().top,
          },
          'slow'
        );
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
      this.canvasData.circle.radius = this.getDistance(
        this.canvasData.startX,
        this.canvasData.startY,
        this.canvasData.mouseX,
        this.canvasData.mouseY
      );
      this.canvasData.radius = this.getDistance(
        this.canvasData.startX,
        this.canvasData.startY,
        this.canvasData.mouseX,
        this.canvasData.mouseY
      );
      this.canvasData.context.clearRect(
        0,
        0,
        this.canvasData.canvas.width,
        this.canvasData.canvas.height
      );
      this.canvasData.circles.map((c) => this.drawCircle(c));
      this.canvasData.boundingBoxes.map((r) => {
        this.drawRect(r);
      });
    }
  }

  drawCircle(c) {
    this.canvasData.context.beginPath();
    this.canvasData.context.arc(c.startX, c.startY, c.radius, 0, 2 * Math.PI);
    this.canvasData.context.strokeStyle =
      c.lineColor && c.createdIn != 'system'
        ? c.lineColor
        : this.canvasData.lineColor;
    this.canvasData.context.lineWidth =
      c.lineThickness && c.createdIn != 'system'
        ? c.lineThickness
        : this.canvasData.lineThickness;
    this.canvasData.context.stroke();
  }

  getDistance(p1X, p1Y, p2X, p2Y) {
    return Math.sqrt(Math.pow(p1X - p2X, 2) + Math.pow(p1Y - p2Y, 2));
  }

  oMousePos(canvas, evt) {
    let ClientRect = canvas.getBoundingClientRect();
    return {
      x: Math.round(evt.clientX - ClientRect.left),
      y: Math.round(evt.clientY - ClientRect.top),
    };
  }

  onParametersChange() {
    this.canvasData.context.clearRect(
      0,
      0,
      this.canvasData.canvas.width,
      this.canvasData.canvas.height
    );
    this.canvasData.boundingBoxes.map((r) => {
      this.drawRect(r);
    });
    this.canvasData.circles.map((c) => this.drawCircle(c));
  }

  changeDrawMode() {
    this.newComment = '';
    this.resetCanvas();
    this.resetCanvasData();
    this.annotationMode = false;
    this.canvasData.drawn = false;
    this.removeEventListeners();
    document.getElementById('observationCanvas').style.zIndex = '2';
  }

  /**
   * confirmation popup for delete the annotation.
   */
  onDeleteAnnotation(annotationId) {
    this.annotationId = annotationId;
    $('#confirmationModal').modal('show');
  }

  /**
   * close the confirmation popup.
   */
  closeConfirmationModal() {
    $('#confirmationModal').modal('hide');
  }

  sendSelectedAnnotation(annotation) {
    this.selectedAnnotation.emit(annotation);
  }

  annotationSelect(index) {
    this.annotationNumber = index;
    this.newComment = '';
  }

  onShapeChange() {
    this.resetCanvas();
    this.canvasData.drawClicked = true;
    this.canvasData.drawn = false;
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
    $('#collapseAddNewCommentDiv').animate(
      {
        scrollTop: 0,
      },
      'slow'
    );
  }

  initializeCanvas() {
    let canvas = document.getElementById('observationCanvas');
    canvas.setAttribute('height', this.canvasData.height);
    canvas.setAttribute('width', this.canvasData.width);
    this.canvasData.canvas = canvas;
    this.canvasData.context = this.canvasData.canvas.getContext('2d');
    this.canvasData.index =
      this.canvasData.boundingBoxes.length + this.canvasData.circles.length + 1;
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
    this.canvasData.canvas.removeEventListener(
      'mousedown',
      this.mouseDown,
      false
    );
    this.canvasData.canvas.removeEventListener(
      'mousemove',
      this.mouseMove,
      false
    );
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
    return this.imageModalData.annotations.filter(
      (item) => item.createdIn != 'system'
    ).length === 0
      ? true
      : false;
  }

  /**
   * select unit from units dropdown.
   */
  selectObservationUnit(selectItem) {
    console.log(selectItem);
    this.manulaObservationSelectedDetails['unit'] =
      this.selectedObservationUnit;
    this.selectedObservationZone = '';
    this.zonesList = [];
    this.fetchObservationData();
  }

  /**
   * get the observation data.
   */
  fetchObservationData() {
    if (this.selectedObservationUnit) {
      this.dataService.passSpinnerFlag(true, true);
      this.SafetyAndSurveillanceCommonService.fetchUnitData(
        this.selectedObservationUnit
      ).subscribe(
        (unitData) => {
          this.unitData = unitData;
          this.zonesList = [];
          // this.zonesList = Object.keys(this.obsData);
          this.unfilteredZones = [];
          this.unitData.forEach((ele) => {
            ele.zones.forEach((ele1) => {
              this.zonesList.push(ele1.zone_name);
              this.unfilteredZones.push({
                zone_name: ele1.zone_name,
                zone_id: ele1.zone_id,
              });
            });
          });

          var zoneIds = this.unfilteredZones.map((item) => item.zone_id);
          sessionStorage.setItem('zoneIds', JSON.stringify(zoneIds));
          // for (var i = 0; i < this.zonesList.length; i++) {
          //   if (this.zonesList[i].indexOf('All') > -1) {
          //     this.zonesList.splice(i, 1)
          //   }
          // }
          // this.selectedObservationZone = this.zonesList[0];
          // this.selectObservationZone();
          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          this.dataService.passSpinnerFlag(false, true);
        }
      );
    }
  }
  selectObservationZone() {}

  selectObservationCategory() {}

  /**
   * return the color code based on rating.
   */
  setRiskRatingBackGroundColor(risk) {
    if (this.selectedRiskRating['rating'] == risk.rating) {
      return risk.colorCode;
    }
  }
  /**
   * return the color code based on rating.
   */
  setRiskRatingColor(risk) {
    if (this.selectedRiskRating['rating'] == risk.rating) {
      return 'white';
    } else {
      return risk.colorCode;
    }
  }
  /**
   * select rating.
   */
  selectRiskRatingObservation(rating) {
    this.selectedRiskRating = rating;
  }

  selectObservationDescription() {}
  backToAddObservation() {
    this.backToAddObservationData.emit(Math.random);
  }

  /**
   * submit the observation and annotation details.
   */
  submitObservationDetails() {
    let annotation =
      this.canvasData.shape === 'rectangle'
        ? this.canvasData.boundingBoxes.find(
            (item) => item.createdIn === 'system'
          )
        : this.canvasData.circles.find((item) => item.createdIn === 'system');

    let coordinates: any =
      annotation?.shape === 'rectangle'
        ? [annotation?.x, annotation?.y, annotation?.w, annotation?.h]
            .map((point) => point * this.canvasData?.ratio)
            .join(',')
        : [annotation?.startX, annotation?.startY, annotation?.radius]
            .map((point) => point * this.canvasData?.ratio)
            .join(',');
    coordinates = coordinates.split(',');
    if (coordinates[0] == 'NaN') {
      coordinates = this.manulaObservationSelectedDetails['coords'];
    }
    if (this.canvasData.shape != 'rectangle') {
      this.selectAnnotation = annotation;
    }
    let data = {
      rating: this.selectedRiskRating,
      unit: this.selectedObservationUnit,
      zone: this.selectedObservationZone,
      category: this.selectedObservationCategory,
      description: this.selectedObservationDescription,
      annotation: this.selectAnnotation,
      coordinates: coordinates,
      shape: this.canvasData.shape,
      lineColor: this.canvasData.lineColor,
      lineThickness: this.canvasData.lineThickness,
      unFilteredZones: this.unfilteredZones,
    };
    this.selectUnits.emit();
    this.selectRiskRating.emit(data);
  }

  /**
   * show and hide the unit dropdown.
   */
  unitDropdownShow() {
    this.unitDropdown = !this.unitDropdown;
    this.zoneDropdown = false;
    this.categoryDropdown = false;
  }
  /**
   * show and hide the zone dropdown.
   */
  zoneDropdownShow() {
    this.zoneDropdown = !this.zoneDropdown;
    this.unitDropdown = false;
    this.categoryDropdown = false;
  }
  /**
   * show and hide the category dropdown.
   */
  categoryDropdownShow() {
    this.categoryDropdown = !this.categoryDropdown;
    this.zoneDropdown = false;
    this.unitDropdown = false;
  }
  ngOnDestroy() {
    this.removeEventListeners();
  }
}

@Pipe({
  name: 'textHide',
  pure: true,
})
export class TextHide implements PipeTransform {
  locale: string;
  transform(value: any, ...args: any) {
    let val: string = value + '';
    if (val && val.length > 12) {
      val = val.slice(0, 12) + '...';
    }
    return val;
  }
}
