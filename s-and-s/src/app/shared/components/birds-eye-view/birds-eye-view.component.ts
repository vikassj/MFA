import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import * as L from 'leaflet';
declare var $: any;
import "fabric";
declare const fabric: any;

import { CommonService } from 'src/shared/services/common.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SafetyAndSurveillanceDataService } from '../../service/data.service';
import { SafetyAndSurveillanceCommonService } from '../../service/common.service';
import { UnitService } from 'src/shared/components/unit-ss-dashboard/services/unit.service';

@Component({
  selector: 'app-birds-eye-view',
  templateUrl: './birds-eye-view.component.html',
  styleUrls: ['./birds-eye-view.component.css']
})
export class BirdsEyeViewComponent implements OnInit, OnChanges {

  msg: string = '';
  @Input() isModal: boolean = false;
  @Input() img: string;
  @Input() locations: any[];
  @Input() modalHeading: string;
  @Input() modalType: string;
  @Output() emitSelectedLocation = new EventEmitter<any>();
  height: any;
  width: any;
  scaledPolygons: any[] = [];
  noDataMsg: string = '';
  birdsEyeViewClicked: boolean = true;
  hasModifyAccess: boolean = false;
  modifyBev: boolean = false;

  bevData: any = {};
  selectedBevData: any = {};
  bevImageFile: any;
  bevTemplate: any = {
    "unitName": "",
    "moduleType": "",
    "imageUrl": "",
    "locationMap": []
  };
  hoveredLocationDetails: any;
  selectedLocationDetails: any;
  newLocation: string = '';
  isCanvasDrawn: boolean = true;
  canvas: any;
  lines: any[] = [];
  drawingObject: any = {
    type: '',
    background: '',
    border: '',
  };
  startPoint: any;
  isDrawing: boolean = false;
  polygonPoints: any[] = [];
  duplPoints: any[] = [];
  mouseDown: any = this.handleMouseDown.bind(this);
  mouseMove: any = this.handleMouseMove.bind(this);
  mouseOver: any = this.handleMouseOver.bind(this);
  mouseOut: any = this.handleMouseOut.bind(this);
  selectionCreated: any = this.handleSelectionCreated.bind(this);
  selectionUpdated: any = this.handleSelectionUpdated.bind(this);

  constructor(private commonService: CommonService, private snackbarService: SnackbarService, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, private safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService, private unitService: UnitService) { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.unitService.fetchBirdsEyeViewData().subscribe(data => {
      this.bevData = data;
      this.hasModifyAccess = (sessionStorage.getItem('userGroup').indexOf('BEV') > -1) ? true : false;

      if (this.img) {
        this.selectedBevData = JSON.parse(JSON.stringify(this.bevData[this.modalHeading]));
        this.fetchImage(false);
        if (!this.isModal || this.birdsEyeViewClicked) {
          this.initializeMaps();
        }
      }
      else {
        this.selectedBevData = this.bevTemplate;
        this.selectedBevData.unitName = this.modalHeading;
        this.selectedBevData.moduleType = this.modalType;
        this.noDataMsg = "Bird's Eye View not available for the selected Plant.";
      }
    });
  }

  fetchImage(loadCanvas) {
    this.commonService.fetchImageData(sessionStorage.getItem('url') + this.selectedBevData.imageUrl).subscribe(
      (imageData: any) => {
        let reader = new FileReader();
        reader.readAsDataURL(imageData);
        reader.onload = (event: any) => {
          this.bevImageFile = event.target.result;
          if (loadCanvas) {
            setTimeout(() => {
              this.onModifyBev();
            }, 100);
          }
        };
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  initializeMaps() {
    this.modifyBev = false;
    setTimeout(() => {
      let img = new Image();
      img.src = this.img;
      img.onload = () => {
        this.height = img.height;
        this.width = img.width;
        this.modifyPolygon();
        this.initMap();
        this.birdsEyeViewClicked = true;
      }
    }, 500);
  }

  onModifyBev() {
    this.selectedBevData = JSON.parse(JSON.stringify(this.bevData[this.modalHeading]));
    this.newLocation = '';
    this.modifyBev = true;
    if (this.bevImageFile) {
      setTimeout(() => {
        this.initializeCanvas();
      }, 100);
    }
  }

  initializeCanvas() {
    $('#bevCanvasImage').css('display', 'block');
    setTimeout(() => {
      let image: any = <HTMLImageElement>document.getElementById('bevCanvasImage');
      image.src = this.bevImageFile;
      setTimeout(() => {
        let imageWidth = $('#bevCanvasImage').width();
        let imageHeight = $('#bevCanvasImage').height();
        this.canvas = new fabric.Canvas('bevCanvas', {
          selection: false,
          width: imageWidth,
          height: imageHeight
        });
        this.removeEventListeners();
        let imgInstance = new fabric.Image(image, {
          selectable: false
        });
        imgInstance.scaleToWidth(imageWidth);
        imgInstance.scaleToHeight(imageHeight);
        this.canvas.add(imgInstance);
        $('#bevCanvasImage').css('display', 'none');
        this.startPoint = new fabric.Point(0, 0);
        let windowContext: any = window;
        fabric.util.addListener(windowContext, 'dblclick', () => {
          if (this.isDrawing) {
            this.finalize();
          }
        });
        fabric.util.addListener(windowContext, 'keyup', (evt) => {
          if (evt.which === 13 && this.isDrawing) {
            this.finalize();
          }
        });
        this.renderExistingPolygons();
        this.addEventListeners();
      }, 500);
    }, 100);
  }

  handleMouseDown(evt) {
    let self = this;
    if (this.isDrawing) {
      let _mouse = self.canvas.getPointer(evt.e);
      let _x = _mouse.x;
      let _y = _mouse.y;
      let line = new fabric.Line([_x, _y, _x, _y], {
        strokeWidth: 1,
        selectable: false,
        stroke: 'red',
      });
      this.polygonPoints.push(new fabric.Point(_x, _y));
      this.lines.push(line);
      this.canvas.add(line);
      this.canvas.selection = false;
    }
  }

  handleMouseMove(evt) {
    let self = this;
    if (this.lines.length && this.isDrawing) {
      let _mouse = self.canvas.getPointer(evt.e);
      this.lines[this.lines.length - 1]
        .set({
          x2: _mouse.x,
          y2: _mouse.y,
        })
        .setCoords();
      this.canvas.renderAll();
    }
  }

  handleMouseOver(evt) {
    evt.target.set('fill', 'rgba(255,250,205,.5');
    this.canvas.renderAll();
    this.hoveredLocationDetails = this.selectedBevData.locationMap.find(location => location.id === evt.target.id);
  }

  handleMouseOut(evt) {
    evt.target.set('fill', 'rgba(0,0,0,0)');
    this.canvas.renderAll();
    this.hoveredLocationDetails = {};
  }

  handleSelectionCreated(evt) {
    this.selectedLocationDetails = this.selectedBevData.locationMap.find(location => location.id === evt.target.id);
    this.newLocation = this.selectedLocationDetails.name;
  }

  handleSelectionUpdated(evt) {
    this.selectedLocationDetails = this.selectedBevData.locationMap.find(location => location.id === evt.target.id);
    this.newLocation = this.selectedLocationDetails.name;
  }

  selectFile(event: any): void {
    if (event.target.files) {
      let reader = new FileReader();
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        this.bevImageFile = event.target.result;
        setTimeout(() => {
          this.initializeCanvas();
        }, 100);
      };
    }
  }

  finalize() {
    this.isDrawing = false;
    this.lines.forEach((line) => {
      this.canvas.remove(line);
    });
    this.canvas.add(this.makePolygon()).renderAll();
    this.duplPoints = [...this.polygonPoints];
    this.canvas.selection = true;
    this.lines.length = 0;
    this.polygonPoints.length = 0;
    this.isCanvasDrawn = false;
    this.copyCoords();
  }

  makePolygon() {
    let left = fabric.util.array.min(this.polygonPoints, 'x');
    let top = fabric.util.array.min(this.polygonPoints, 'y');
    this.polygonPoints.push(
      new fabric.Point(this.polygonPoints[0].x, this.polygonPoints[0].y)
    );
    return new fabric.Polyline(this.polygonPoints.slice(), {
      left: left,
      top: top,
      fill: 'rgba(255,0,0,.5)',
      stroke: 'blue',
      hasControls: false,
      hasRotatingPoint: false,
      lockMovementX: true,
      lockMovementY: true,
      id: 'new' + (this.selectedBevData.locationMap.length + 1)
    });
  }

  renderExistingPolygons() {
    this.selectedBevData.locationMap.forEach((polygon, index) => {
      let coordinates = [];
      for (let i = 0; i < polygon.mapCoords.length; i += 2) {
        coordinates.push({ x: polygon.mapCoords[i], y: polygon.mapCoords[i + 1] });
      }
      coordinates.push(coordinates[0]);
      let polyline = new fabric.Polyline(coordinates, {
        fill: 'rgba(0,0,0,0)',
        stroke: 'yellow',
        strokeWidth: 3,
        hasControls: false,
        hasRotatingPoint: false,
        lockMovementX: true,
        lockMovementY: true,
        id: polygon.id
      });
      this.canvas.add(polyline);
    });
  }

  createPolygon() {
    this.newLocation = '';
    this.isCanvasDrawn = true;
    if (this.isDrawing) {
      this.finalize();
    } else {
      this.isDrawing = true;
    }
  }

  reuploadBev() {
    this.duplPoints = [];
    this.bevImageFile = null;
    this.newLocation = '';
    this.removeEventListeners();
    this.canvas = null;
    this.selectedBevData = this.bevTemplate;
    this.selectedBevData.unitName = this.modalHeading;
    this.selectedBevData.moduleType = this.modalType;
  }

  resetCanvas() {
    let objects = this.canvas.getObjects('polyline');
    for (let i in objects) {
      this.canvas.remove(objects[i]);
    }
    this.duplPoints = [];
    this.selectedLocationDetails = {};
    this.newLocation = '';
    this.selectedBevData.locationMap = [];
  }

  copyCoords() {
    let mapCoords = [];
    this.duplPoints.pop();
    this.duplPoints.forEach(coord => {
      mapCoords.push(coord.x);
      mapCoords.push(coord.y);
    });
    this.selectedLocationDetails = {
      "id": "new" + (this.selectedBevData.locationMap.length + 1),
      "name": "",
      "color": "#00ff5e",
      "label": "",
      "mapCoords": mapCoords,
      "openCount": 0,
      "closeCount": 0
    };
    this.selectedBevData.locationMap.push(this.selectedLocationDetails);
    this.selectedBevData = { ...this.selectedBevData };
  }

  modifyPolygon() {
    this.locations.forEach((element, polyIndex) => {
      let newpoly = []
      element['mapCoords'].forEach((coords, coordIndex) => {
        if (coordIndex % 2 == 0) {
          newpoly.push(this.xy(element['mapCoords'][coordIndex], element['mapCoords'][coordIndex + 1]));
        }
      });
      this.locations[polyIndex]['coords'] = newpoly;
    });
  }

  xy(x, y) {
    y = this.height - y;
    let yx = L.latLng;
    return yx(y, x);
  }

  initMap() {
    let element = document.getElementsByClassName('mapContainer') as any | null;
    if (element) {
      element[0].innerHTML = '<div id="map" style="width: 100%; height: 100%;"></div>';
      let polygonLayers = [];
      let imageLayer = L.imageOverlay(this.img, [[0, 0], [this.height, this.width]]);

      //adding polygon here
      this.locations.forEach((element, index) => {
        let optionsLabel = {
          permanent: true,
          interactive: true
        }
        let optionPoly = {
          color: element['color'],
          weight: 2,
          interactive: false
        }
        let polygonLayer = L.polygon(element['coords'], optionPoly).bindTooltip('<div style="width: 100%;height:100%"><div style="text-align: center;font-weight: bold;">' + element['name'] + '</div><div style="display: flex;width:100%;height:100%;justify-content: center;align-items: center;"><h4 style="color: #dc3545; margin: 0;">' + element['openCount'] + '</h4><h4 style="margin: 0;"> / </h4><h4 style="color: #28a745; margin: 0;">' + element['closeCount'] + '</h4></div></div>', optionsLabel);
        polygonLayer.on('click', (e) => {
          if (element['openCount'] >= 0 || element['closeCount'] >= 0) {
            e['location'] = element['name'];
            this.emitSelectedLocation.emit(e);
            this.safetyAndSurveillanceCommonService.sendMatomoEvent('Interacting plant unit BEV', 'BEV');
          }
        })
        polygonLayers.push(polygonLayer);
      });

      // adding polygon layer in group
      let polygonOverlays = L.layerGroup(polygonLayers);
      let baseMaps = {
        'Image': imageLayer
      };
      let overlayMaps = {
        'Polygons': polygonOverlays
      };
      let map = L.map('map', {
        crs: L.CRS.Simple,
        layers: [imageLayer, polygonOverlays],
        attributionControl: false
      });
      map.setMaxBounds([[0, 0], [this.height, this.width]])
      map.fitBounds([[0, 0], [this.height, this.width]]);


      setInterval(() => {
        this.commonService.resizeDatatable();
      }, 1000);
    }

  }

  onLocationChange() {
    this.duplPoints = [];
    if (this.selectedBevData.locationMap.filter(location => location.id === this.selectedLocationDetails.id).length > 0) {
      this.selectedBevData.locationMap.forEach(location => {
        if (location.id === this.selectedLocationDetails.id) {
          location.name = this.newLocation;
        }
      });
    }
    else {
      this.selectedLocationDetails.name = this.newLocation;
      this.selectedBevData.locationMap.push(this.selectedLocationDetails);
    }
  }

  deleteLocation() {
    let obj = this.canvas.getObjects().find(i => i.id === this.selectedLocationDetails.id);
    this.canvas.remove(obj);
    let index = this.selectedBevData.locationMap.findIndex(item => item.id === this.selectedLocationDetails.id);
    this.selectedBevData.locationMap.splice(index, 1);
    this.selectedLocationDetails = {};
    this.newLocation = '';
    this.duplPoints = [];
  }

  uploadImage() {
    let arr = this.bevImageFile.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    let file = new File([u8arr], this.modalHeading + '.' + mime.split('/')[1], { type: mime });
    this.commonService.uploadFile(file, 'assets/images/Units/').subscribe(
      uploadData => {
        this.selectedBevData['imageUrl'] = 'assets/images/Units/' + file.name;
        this.updateBevJSON();
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  updateBevJSON() {
    this.selectedBevData.locationMap.forEach((location, index) => {
      if (location.id.includes('new')) {
        location.id = 'location' + (index + 1);
      }
    });
    this.bevData[this.modalHeading] = this.selectedBevData;
    let data = { filename: 'image-map.json', data: this.bevData };
    this.commonService.updateJSONData(data).subscribe(
      updateData => {
        this.modifyBev = false;
        this.msg = 'Bird\'s Eye View updated successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.safetyAndSurveillanceDataService.passBevData(Math.random(), true);
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  resetBev() {
    this.duplPoints = [];
    this.bevImageFile = null;
    this.newLocation = '';
    this.removeEventListeners();
    this.canvas = null;
    this.selectedBevData = JSON.parse(JSON.stringify(this.bevData[this.modalHeading]));
    if (!this.selectedBevData) {
      this.selectedBevData = this.bevTemplate;
      this.selectedBevData.unitName = this.modalHeading;
      this.selectedBevData.moduleType = this.modalType;
    }
    else {
      this.fetchImage(true);
    }
  }

  addEventListeners() {
    this.canvas.on('mouse:down', this.mouseDown, false);
    this.canvas.on('mouse:move', this.mouseMove, false);
    this.canvas.on('mouse:over', this.mouseOver, false);
    this.canvas.on('mouse:out', this.mouseOut, false);
    this.canvas.on('selection:created', this.selectionCreated, false);
    this.canvas.on('selection:updated', this.selectionUpdated, false);
  }

  removeEventListeners() {
    this.canvas.off('mouse:down', this.mouseDown, false);
    this.canvas.off('mouse:move', this.mouseMove, false);
    this.canvas.off('mouse:over', this.mouseOver, false);
    this.canvas.off('mouse:out', this.mouseOut, false);
    this.canvas.off('selection:created', this.selectionCreated, false);
    this.canvas.off('selection:updated', this.selectionUpdated, false);
  }

  disableBevLocation(location) {
    return (this.selectedBevData.locationMap.findIndex(loc => loc.name === location) > -1) ? true : false;
  }

  ngOnDestroy() {
    $('#birdsEyeViewModal').modal('hide');
  }

}
