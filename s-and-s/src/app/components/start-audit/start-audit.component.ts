import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { SafetyAndSurveillanceCommonService } from 'src/app/shared/service/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import * as html2canvas from 'html2canvas';
import { CommonService } from 'src/shared/services/common.service';
import { PermitDetails } from '../observations/observations.component';
import { UnitService } from 'src/shared/components/unit-ss-dashboard/services/unit.service';
import { PlantService } from 'src/app/shared/service/plant.service';
import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { IogpService } from 'src/shared/components/unit-ss-dashboard/services/iogp.service';
declare var $: any;
@Component({
  selector: 'app-start-audit',
  templateUrl: './start-audit.component.html',
  styleUrls: ['./start-audit.component.css'],
})
export class StartAuditComponent implements OnInit {
  panelOpenState: boolean = false;
  actionCommentImage: any = [];
  actionCommentImage1: any;
  observationImage: any = '';
  markedImageUrl: any = '';
  unitsList: any[] = [
    { id: 1, name: 'unit-1' },
    { id: 2, name: 'unit-2' },
    { id: 3, name: 'unit-3' },
    { id: 4, name: 'unit-4' },
    { id: 5, name: 'unit-5' },
    { id: 6, name: 'unit-6' },
    { id: 7, name: 'unit-7' },
    { id: 8, name: 'unit-8' },
    { id: 9, name: 'unit-9' },
    { id: 10, name: 'unit-10' },
    { id: 11, name: 'unit-12' },
    { id: 12, name: 'unit-12' },
    { id: 13, name: 'unit-13' },
    { id: 14, name: 'unit-14' },
    { id: 15, name: 'unit-15' },
    { id: 16, name: 'unit-16' },
    { id: 17, name: 'unit-17' },
    { id: 18, name: 'unit-18' },
  ];
  selectedRiskRating = {};
  actionPoints: any[] = [];
  msg: string;
  sendObservationData: any = {
    showAnimation: true,
    imageData: null,
    emailID: '',
    emailIDList: [],
  };
  isSurprise: boolean = false;
  obs: any;
  selectedSideBarItem: string = '';
  permitNumberDropdown: boolean = false;
  selectedSubActivityId: string;
  activitiesandSubActivites: any;
  selectedActivityId: any;
  selectedPermitDetails: PermitDetails = {
    permit_number: '',
    type_of_permit: '',
    nature_of_work: '',
    vendor_name: '',
    issuer_name: '',
    permit_mode: 'ptz',
    permit_id: '',
    camera_id: '',
  };

  isPermitEnabled: boolean;
  unitList: any[];
  selectedActivity: any;
  checklistData: any;
  observationImgHeight: number;
  observationImgWidth: number;
  observationImgRatio: number;
  manulaObservationSelectedDetails:any={};
  selectedMode: any;
  filterDates: any[] = [];
  units: any[] = [];
  zoom: any;
  trigger: number = 0;
  unmarkedImage = '';
  imageName = '';
  imagePath: any[] = [];
  imageModalData: any = {};
  annotation = false;
  editIndex = -1;
  canvasHeight: number = 0;
  canvasWidth: number = 0;
  canvasRatio: number = 0;
  evidenceMode: boolean;
  shareShows: boolean;
  confirmMailShow: boolean;
  permitList: any;
  newPermitList: any;
  custom_start_date: any;
  openCloseCount = {
    open: 0,
    close: 0,
    snooze: 0,
    archive: 0,
  };
  selectedZones: any;

  selectedUnitItems: any;
  selectedZone: any;
  custom_end_date: any;
  manualActionPoints: any[] = [];
  multiObservations = [];
  selectedFilterDate: string = '';
  obsData: any[] = [];
  totalSubactivites: any;
  completedSubactivites: any;
  selectedPlantDetails: any;
  selectedUnit: string = '';
  userGroup: any[] = [];
  manualObservationRawImagePath = '';
  manualObservationRawImageName = '';
  base64Image: any[] = [];
  selectedItems: any;
  observationCategoryList: any = [];
  manualObservationImagePath = '';
  manualObservationImageName = '';
  riskRatingLevels: any[] = [];

  selectedManualMarkedImage = '';

  selectedAnnotation = {};

  subscription: Subscription = new Subscription();
  selectedChecklistindex: any;
  selectedSubActivity: any;
  selectedActivities: any;
  completedCount: any = 0;
  status: any;
  valid: boolean = false;
  validSave: boolean = false;
  constructor(
    private iogpService: IogpService,
    private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService,
    private plantService: PlantService,
    private unitService: UnitService,
    private commonService: CommonService,
    private snackbarService: SnackbarService,
    private dataService: DataService,
    public safetyService: SafetyAndSurveillanceCommonService,
    private activatedRoute: ActivatedRoute
  ) {
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'));
    let accessiblePlants = JSON.parse(
      sessionStorage.getItem('accessible-plants')
    );
    this.selectedPlantDetails = accessiblePlants.filter(
      (val, ind) => val?.id == plantDetails.id
    );
    if (sessionStorage.getItem('activityId')) {
      this.selectedActivityId = sessionStorage.getItem('activityId');
      this.activitiessubactivities();
    } else {
      this.isSurprise = true;
      this.activitiessubactivities();
    }

    // if(this.selectedSubActivityId)
    // this.getChecklistbySubactivityId();
  }

  ngOnInit(): void {
    let selectedPlantId = JSON.parse(sessionStorage.getItem('selectedPlant'));
    // To add the isPermitEnabled Access from the permitPlantMap
    if (selectedPlantId) {
      let plantPermit = JSON.parse(sessionStorage.getItem('permitPlantMap'));
      let selectedPlant = plantPermit.filter((key) => {
        return key.plant_id == selectedPlantId;
      });
      this.isPermitEnabled = selectedPlant[0].isPermitEnabled;
    }
    this.getObservations();
    this.getAvailableUnits();
    let categories = JSON.parse(
      sessionStorage.getItem('safety-and-surveillance-configurations')
    );
    let riskRatingLevels = JSON.parse(
      sessionStorage.getItem('safety-and-surveillance-configurations')
    )['module_configurations']['risk_rating_levels'];
    this.riskRatingLevels = riskRatingLevels;
    categories['module_configurations']['iogp_categories']?.forEach((ele) => {
      if (ele?.show_hide) {
        this.observationCategoryList.push([ele?.acronym, ele?.name]);
      }
    });
    this.subscription.add(
      this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(
        (data) => {
          let searchObservation = JSON.parse(
            sessionStorage.getItem('searchObservation')
          );
          let selectedUnitItems = JSON.parse(
            sessionStorage.getItem('manually-selected-units')
          );
          if (searchObservation) {
            this.custom_start_date = searchObservation['date'];
            this.custom_end_date = data?.['data']?.['endDate'];
            this.selectedUnitItems = selectedUnitItems;
          } else {
            // this.custom_start_date = data['data']['startDate']
            // this.custom_end_date = data?.['data']?.['endDate']
            this.selectedUnitItems = data?.['data']?.['units'];
          }
          // this.custom_start_date = data?.['data']?.['startDate']
          // this.activePage = sessionStorage.getItem('selectedActivePage') ? JSON.parse(sessionStorage.getItem('selectedActivePage')) :JSON.parse(sessionStorage.getItem('selectedActivePage'));
          // if (this.selectedUnitItems?.length > 0) {
          //   if (this.obsFilters.displayType != null && this.obsFilters.displayType != "") {
          //     if (this.obsFilters.displayType === 'Images' || !this.obsFilters.displayType) {
          //       this.fetchZonewiseFaultCount(true, 'Images');
          //     }
          //     else {
          //       this.fetchZonewiseFaultCount(false, 'Videos');
          //     }
          //   }
          // } else {
          //   this.obsData = [];
          //   this.dataService.passSpinnerFlag(false, true)
          // }
        }
      )
    );
  }
  selectRiskRating($event) {
    this.dataService.passSpinnerFlag(true, true);
    this.selectedRiskRating = $event.rating;
    if ($event.unfilteredZones) {
      this.selectedZone = $event.unfilteredZones.filter(
        (item) => item.zone_name != $event.zone
      );

      this.selectedZones = [this.selectedZone.zone_id];
    }
    let dataurl;
    setTimeout(() => {
      const h2c: any = html2canvas;
      h2c($('#observationMarked')[0]).then((canvas) => {
        this.markedImageUrl = canvas.toDataURL('image/jpg');
        let data = this.imageName.split('.');
        let row_pathName =
          Math.floor(Math.random() * 99 * 7) + '' + data[0] + '.' + data[1];

        var file = this.dataURLtoFile(this.markedImageUrl, row_pathName);
        this.base64Image = [file];
        this.getImageUrl($event);
      });
    }, 100);
  }

  /**
   * post manual obs upload after annotation are added.
   * @param $event
   */
  async postManualObservation($event) {
    this.selectedAnnotation = $event.annotation;
    this.annotation = true;
    let current_datetime = new Date();
    let year: any = current_datetime.getFullYear();
    if (year < 10) {
      year = '0' + year;
    } else {
      year = year;
    }
    let month: any = current_datetime.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    } else {
      month = month;
    }
    let date: any = current_datetime.getDate();
    if (date < 10) {
      date = '0' + date;
    } else {
      date = date;
    }
    let hr: any = current_datetime.getHours();
    if (hr < 10) {
      hr = '0' + hr;
    } else {
      hr = hr;
    }
    let min: any = current_datetime.getMinutes();
    if (min < 10) {
      min = '0' + min;
    } else {
      min = min;
    }
    let sec: any = current_datetime.getSeconds();
    if (sec < 10) {
      sec = '0' + sec;
    } else {
      sec = sec;
    }
    let current_date = date + '/' + month + '/' + year;
    let current_time = hr + ':' + min + ':' + sec;
    let time_zone = JSON.parse(
      sessionStorage.getItem('site-config')
    )?.time_zone;

    let obj = {
      unit: $event.unit,
      zone: $event.zone,
      image_path: this.manualObservationImagePath,
      image_name: this.manualObservationImageName,
      date: moment().tz(time_zone).format('YYYY-MM-DD'),
      time: moment().tz(time_zone).format('HH:mm:ss'),
      observation: $event.description,
      recommendation: 'NA',
      job: $event.category,
      rating: $event.rating.rating,
      cloud: 'aws',
      raw_path: this.manualObservationRawImagePath,
      raw_image_name: this.manualObservationRawImageName,
      thumbnail: this.manualObservationImagePath,
      mode: 'camera',
      marked_video_path: null,
      marked_video_name: null,
      unmarked_video_path: null,
      unmarked_video_name: null,
      manual_upload: 'True',
      annotation: $event.annotation,
      coords: $event.coordinates,
      shape: $event.shape,
      manualPath: this.markedImageUrl,
      is_verified: 'true',
      lineColor: $event.lineColor,
      lineThickness: $event.lineThickness,
    };
    this.manualActionPoints = [];
    if (this.editIndex >= 0) {
      this.multiObservations.splice(this.editIndex, 1, obj);
      this.editIndex = -1;
    } else {
      this.multiObservations.push(obj);
      this.editIndex = -1;
    }
    this;
    this.selectedManualMarkedImage = this.multiObservations[0].manualPath;
    this.manualScaleAspectRatio();
  }

  /**
   * submit bulk update.
   */
  submitMultiObservation() {
    this.dataService.passSpinnerFlag(true, true);

    this.multiObservations.forEach((data, index) => {
      delete data.annotation;
      delete data.coords;
      delete data.shape;
      delete data.manualPath;
      delete data.lineColor;
      delete data.lineThickness;
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const timeString = `${hours}:${minutes}:${seconds}`;

      if (this.isPermitEnabled) {
        let permit_details = {
          permit_id: this.selectedPermitDetails.permit_id,
          permit_mode: this.selectedPermitDetails.permit_mode,
          camera_id: this.selectedPermitDetails.camera_id,
        };

        data = { ...data, ...permit_details, time: timeString };
      }
      this.safetyService.postManualObservation(data).subscribe({
        next: (response: any) => {
          console.log(response.created_data, 'post observation done');
          this.getObservationsByFaultId(
            [Number(response.created_data)],
            this.selectedUnit,
            this.selectedZone
          );
          this.checklistData[this.selectedChecklistindex].observation = Number(
            response.created_data
          );
          this.observationImage = '';
          this.markedImageUrl = '';
          this.selectedPermitDetails = {
            permit_number: '',
            type_of_permit: '',
            nature_of_work: '',
            vendor_name: '',
            issuer_name: '',
            permit_mode: 'ptz',
            permit_id: '',
            camera_id: '',
          };
          this.selectedAnnotation = {};
          this.msg = 'Successfully completed.';
          this.multiObservations = [];
          $('#addObservationAnnotate').modal('hide');
          // if ((this.multiObservations?.length - 1) == index) {
          // let allDates = [];
          // let array = JSON.stringify(this.selectedUnitItems)
          // this.unitService.fetchSidebarData(array).subscribe(data => {
          //   for (const [zoneKey, zoneValue] of Object.entries(data)) {
          //     if (zoneKey == 'All Zones') {
          //       for (const [categoriesKey, categoriesValue] of Object.entries(data[zoneKey])) {
          //         if (categoriesKey == 'All Categories') {
          //           for (const [dateKey, dateValue] of Object.entries(data[zoneKey][categoriesKey])) {
          //             if (dateKey == 'date') {
          //               for (const [dates, datesValue] of Object.entries(data[zoneKey][categoriesKey][dateKey])) {
          //                 allDates.push(dates)
          //               }
          //             }
          //           }
          //         }
          //       }
          //     }
          //   }
          //   allDates.forEach((date, i) => {
          //     let removeAllDate = RegExp('\\b' + 'all' + '\\b').test(date.toLowerCase())
          //     if (removeAllDate) {
          //       allDates.splice(i, 1);
          //     }
          //   })
          //   this.filterDates = allDates;
          //   this.filterDates.sort((a, b) => {
          //     return new Date(b).getTime() - new Date(a).getTime();
          //   });
          //   sessionStorage.setItem("obsData", JSON.stringify(data))
          //   let selectedObj = this.imageModalData;
          //   this.selectedFilterDate = this.imageModalData.date
          //   this.annotation = false;
          //   let currentDate = new Date().toJSON().slice(0, 10);
          //   this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedUnitItems, this.custom_start_date, this.custom_end_date);
          //   // if (this.selectedFilterDate == currentDate) {
          //   //   this.safetyAndSurveillanceDataService.passSelectedDate(this.selectedFilterDate, true);
          //   //   this.imageModalData = selectedObj
          //   // }
          //   this.multiObservations = [];
          //   $("#addObservationAnnotate").modal("hide");
          // })
          // }
          this.snackbarService.show(this.msg, false, false, false, false);
          this.dataService.passSpinnerFlag(false, true);
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            if (error.status == 400) {
              this.dataService.passSpinnerFlag(false, true);
              if (!error.error.error) {
                this.dataService.passSpinnerFlag(false, true);
                this.msg = 'Error occured. Please try again.';
                this.snackbarService.show(this.msg, true, false, false, false);
              } else {
                this.msg = error.error.error;
                this.snackbarService.show(this.msg, true, false, false, false);
              }
            } else {
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            }
          }
        },
        complete: () => {
          this.imageModalData = [];
          setTimeout(() => {
            this.ngOnInit();
          }, 100);
        },
      });
    });
    this.safetyService.sendMatomoEvent(
      'Successful manual observation creation',
      'Manual observation'
    );
  }

  getObservationsByFaultId(faultIds, unit, zone) {
    this.iogpService.fetchObsDatabyFaultId(faultIds, unit, zone).subscribe(
      (res: any) => {
        console.log(res, 'get observations');
        this.checklistData[this.selectedChecklistindex].observationObj =
          res['images'][0];
      },
      (err: any) => {}
    );
  }

  /**
   * get image url of manual observation image upload from base64path.
   * @param $event
   */
  getRawImageUrl($event) {
    this.safetyService
      .manualObservationImageUpload($event.unit, this.base64Image)
      .subscribe(
        (responce) => {
          this.manualObservationImagePath = responce[0];
          let imagePathName = responce[0].split('/');
          this.manualObservationImageName =
            imagePathName[imagePathName?.length - 1];
          this.postManualObservation($event);
          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = error.error;
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
  }

  /**
   * get image url of manual observation image upload from image path.
   * @param $event
   */
  getImageUrl($event) {
    this.safetyService
      .manualObservationImageUpload($event.unit, this.imagePath)
      .subscribe(
        (responce) => {
          this.manualObservationRawImagePath = responce[0];
          let imagePathName = responce[0].split('/');
          this.manualObservationRawImageName =
            imagePathName[imagePathName?.length - 1];
          this.getRawImageUrl($event);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = error.error;
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
  }
  getObservations() {
    // this.dataService.passSpinnerFlag(true, true);
    this.unitService.getObservations().subscribe(
      (observations: any) => {
        let unitNames = [];
        let selectedUnits = JSON.parse(sessionStorage.getItem('selectedUnits'));
        let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
        selectedUnits.forEach((ele) => {
          let index = unitDetails.findIndex((data) => {
            return data.id == ele;
          });
          if (index >= 0) {
            unitNames.push(unitDetails[index].unitName);
          }
        });

        var unitsDetails = JSON.parse(
          sessionStorage.getItem('unitDetails')
        ).filter((item) => item.userGroup.includes('close'));

        observations = observations.filter((obs) => {
          return unitsDetails.some((unit) => {
            return obs.unit == unit.unitName;
          });
        });
        this.safetyService
          .getActions('', '', '', '', '', '', '', '')
          .subscribe({
            next: (actionData: any) => {
              actionData?.actions?.forEach((val, ind) => {
                if (val?.object_type == 'fault_id' && val?.status == 'Open') {
                  let findIndex: any = observations.findIndex((val1) => {
                    return val1.id == val.object_type_id;
                  });
                  if (findIndex >= 0) {
                    observations.splice(findIndex, 1);
                  }
                }
              });
              // if (this.selectedTab == "observations") {
              //   this.bulkObs = observations.filter(obs => unitNames.indexOf(obs.unit) > -1 && !(['close', 'archive'].some(status => obs.fault_status.toLowerCase().includes(status)))).map(obs =>
              //      { return { faultId: obs.id, date: obs.date, riskLevel: obs.category, unit: obs.unit }
              //   });
              // } else {
              //   this.bulkObs = observations.filter(obs => unitNames.indexOf(obs.unit) > -1 && !(['close', 'archive'].some(status => obs.fault_status.toLowerCase().includes(status))) && (obs.is_highlight == true)).map(obs => { return { faultId: obs.id, date: obs.date, riskLevel: obs.category, unit: obs.unit } });
              // }

              // let dateList = this.bulkObs.map(date => date.date);
              // this.uniqueDates = dateList.filter((v, i, a) => a.indexOf(v) === i);
              // this.uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
              // this.vendorList();
              // this.dataService.passSpinnerFlag(false, true);
            },
            error: () => {
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            },
            complete: () => {},
          });
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }

  fetchEncryptedImageData(imageId, imageUrl) {
    var decryptionKey = 'su5k#_vyQ$_G[SPX';
    // var decryptionKey = JSON.parse(sessionStorage.getItem('site-config'))?.image_decryption_key
    if (imageUrl && imageId && imageUrl.includes('.enc')) {
      this.commonService
        .fetchEncryptedImageData(imageId, imageUrl, decryptionKey)
        .subscribe(
          (imageData) => {},
          (error) => {
            this.msg = 'Error occured. Please try again.';
            this.snackbarService.show(this.msg, true, false, false, false);
          },
          () => {}
        );
    }
  }
  resetZoom() {
    this.zoom.reset();
  }
  clearObservationCanvas() {
    let canvas: any = document.getElementById('observationCanvas');
    canvas
      .getContext('2d')
      .clearRect(0, 0, this.observationImgWidth, this.observationImgHeight);
  }

  /**
   *after upload of image for manual observation.
   */
  observationPicSelected() {
    this.dataService.passSpinnerFlag(true, true);
    this.manulaObservationSelectedDetails = {};

    let image: any = document.getElementById('observationImage');
    this.observationImgHeight = 250;
    this.observationImgWidth = 400;
    this.observationImgRatio = 2160 / this.observationImgHeight;
    this.zoom?.reset();
    if (!this.selectedMode) {
      this.zoom?.resume();
    } else {
      this.zoom?.pause();
    }
    this.clearObservationCanvas();
    this.trigger = Date.now();
    setTimeout(() => {
      const h2c: any = html2canvas;
      h2c($('#rawImagePath')[0]).then((canvas) => {
        this.unmarkedImage = canvas.toDataURL('image/jpg');
        let data = this.imageName.split('.');
        let row_pathName = '' + data[0] + '_Raw.' + data[1];

        var file = this.dataURLtoFile(this.unmarkedImage, row_pathName);
        this.imagePath = [file];
        $('#addObservation').modal('hide');
        $('#addObservationAnnotate').modal('show');
        this.dataService.passSpinnerFlag(false, true);
      });
    }, 100);
  }

  openObservationSelectedAnnotation($event) {
    let annotation = this.actionPoints.find(
      (item) => item.index === $event.index
    );
    this.openObservationAnnotationModal(annotation);
  }

  /**
   * open observation annotation modal by annotation
   * @param annotation
   */
  openObservationAnnotationModal(annotation) {
    $("[id^='observationContent']").hide();
    var top =
      annotation.left > this.observationImgWidth - 360
        ? top + 50
        : annotation.top;
    top = annotation.top < 20 ? annotation.top + 50 : top;
    top =
      annotation.top > this.observationImgHeight - 80
        ? annotation.top - 30
        : annotation.top;
    var left =
      annotation.left > this.observationImgWidth - 360
        ? this.observationImgWidth - 450
        : annotation.left;

    $('#observationContent' + annotation.index).css('left', left + 'px');
    $('#observationContent' + annotation.index).css('top', top + 'px');
    $('#observationContent' + annotation.index).show();
    this.showViewAll();
  }
  showViewAll() {
    if (!this.selectedMode) {
      this.changeMode();
    }
  }
  /**
   * change image or video mode of evidence.
   */
  changeMode() {
    this.evidenceMode = false;
    if (this.shareShows) {
      this.shareShows = false;
    }
    this.selectedMode = !this.selectedMode;
    this.evidenceMode = false;
    this.confirmMailShow = false;
    let image: any = document.getElementById('modalImage');

    this.canvasHeight = image.height;
    this.canvasWidth = image.width;
    this.canvasRatio = 2160 / this.canvasHeight;
    this.zoom.reset();
    if (!this.selectedMode) {
      this.clearCanvas();
      this.zoom.resume();
    } else {
      this.safetyService.sendMatomoEvent(
        'View annotations',
        'Annotate observation'
      );
      this.zoom.pause();
    }
    this.scaleAspectRatio();
    this.trigger = Date.now();
  }
  unitsSelectedManualObs($event) {
    this.permitNumberDropdown = false;
    this.selectedPermitDetails = {
      permit_number: '',
      type_of_permit: '',
      nature_of_work: '',
      vendor_name: '',
      issuer_name: '',
      permit_mode: 'ptz',
      permit_id: '',
      camera_id: '',
    };
    this.fetchPermitDetails();
  }
  /**
   * clears annotation canvas.
   */
  clearCanvas() {
    let canvas: any = document.getElementById('canvas');
    canvas
      .getContext('2d')
      .clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  fetchPermitDetails() {
    this.dataService.passSpinnerFlag(true, true);
    var zoneIds = JSON.parse(sessionStorage.getItem('zoneIds'));
    this.safetyService
      .fetchAllPermitDetails(
        this.custom_start_date,
        this.custom_end_date,
        zoneIds,
        true
      )
      .subscribe(
        (data: any) => {
          this.permitList = data.filter((item) => item.permit_number != null);

          this.newPermitList = this.permitList.map(
            (item) => item.permit_number
          );
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

  scaleAspectRatio() {
    this.actionPoints = [];
    this.imageModalData?.annotations?.forEach((item) => {
      if (item.shape === 'rectangle') {
        let top = item.coords[1] / this.canvasRatio - 15;
        let left = item.coords[0] / this.canvasRatio - 15;
        this.actionPoints.push({
          index: item.index,
          top: top,
          left: left,
          comment: item.comments[0].comment,
          coords: item.coords,
        });
      } else if (item.shape === 'circle') {
        let top =
          item.coords[1] / this.canvasRatio -
          item.coords[2] / this.canvasRatio -
          15;
        let left = item.coords[0] / this.canvasRatio - 15;
        this.actionPoints.push({
          index: item.index,
          top: top,
          left: left,
          comment: item.comments[0].comment,
          coords: item.coords,
        });
      }
    });
  }

  /**
   * get all available units.
   */
  getAvailableUnits() {
    this.dataService.passSpinnerFlag(true, true);
    this.plantService.getAvailableUnits().subscribe(
      (availableUnits) => {
        if (availableUnits['IOGP_Category']) {
          let units: any = availableUnits;
          let unitList: any = [];
          this.units = [];
          Object.keys(units.IOGP_Category).forEach((unit) => {
            if (
              units.IOGP_Category[unit].access_permissions[0].indexOf('view') >
              -1
            ) {
              let unitDetails = {};
              unitDetails['obsData'] = {};
              unitDetails['unitName'] = unit;
              unitDetails['startDate'] = units.IOGP_Category[unit].start_date;
              unitDetails['endDate'] = units.IOGP_Category[unit].end_date;
              unitDetails['totalObsFlights'] =
                units.IOGP_Category[unit].flights_count;
              unitDetails['userGroup'] =
                units.IOGP_Category[unit].access_permissions[0];
              unitDetails['obsData']['openCount'] = Object.keys(
                units.IOGP_Category[unit].faults_count
              )
                .map((item) => {
                  return units.IOGP_Category[unit].faults_count[item].open;
                })
                .reduce((a, b) => a + b, 0);
              unitDetails['obsData']['closeCount'] = Object.keys(
                units.IOGP_Category[unit].faults_count
              )
                .map((item) => {
                  return units.IOGP_Category[unit].faults_count[item].close;
                })
                .reduce((a, b) => a + b, 0);
              unitDetails['order'] = units.IOGP_Category[unit].order;
              unitDetails['id'] = units.IOGP_Category[unit].id;
              unitList.push(unitDetails);
            }
          });
          unitList.sort((a, b) => (a.order < b.order ? -1 : 1));
          this.units = unitList.map((unit) => unit.unitName);
          sessionStorage.setItem('unitDetails', JSON.stringify(unitList));
          sessionStorage.setItem('unitCount', unitList?.length.toString());

          if (!this.selectedSideBarItem || this.selectedSideBarItem == 'null') {
            let selectedUnitDetails: any = unitList[0];
            sessionStorage.setItem(
              'selectedUnit',
              selectedUnitDetails.unitName
            );
            sessionStorage.setItem(
              'selectedUnitDetails',
              JSON.stringify(selectedUnitDetails)
            );
          }
        }
      },
      (error) => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
        this.dataService.passSpinnerFlag(false, true);
      },
      () => {
        if (this.units?.length == 0) {
          this.obsData = [];
          this.openCloseCount = {
            open: 0,
            close: 0,
            snooze: 0,
            archive: 0,
          };
          var msg = 'No data available.';
          this.snackbarService.show(msg, false, false, false, true);
          this.dataService.passSpinnerFlag(false, true);
        } else {
          if (sessionStorage.getItem('selectedUnitDetails') != null) {
            // this.selectedUnit = sessionStorage.getItem('selectedUnit');
            this.userGroup = JSON.parse(
              sessionStorage.getItem('selectedUnitDetails')
            ).userGroup;
            // this.getBirdEyeView();
          }
        }
      }
    );
  }

  /**
   * get units based on the selected page.
   */
  getUnitsData(selectedPage) {
    if (sessionStorage.getItem('availableUnits')) {
      var availableUnits: any = JSON.parse(
        sessionStorage.getItem('availableUnits')
      );
      this.setAvailableUnits(availableUnits);
    } else {
      this.plantService.getUnitsData(selectedPage).subscribe(
        (availableUnits: any) => {
          this.setAvailableUnits(availableUnits);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    }
  }

  /**
   * setting available units in the dropdown.
   */
  setAvailableUnits(availableUnits: any) {
    this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(
      (units) => {
        this.selectedItems = units;
      }
    );
    if (Object.keys(availableUnits).length > 0 || availableUnits.length > 0) {
      if (availableUnits['IOGP_Category']) {
        this.units = [];
        this.unitList = [];
        let units: any = availableUnits;
        this.units = Object.keys(units.IOGP_Category);
        sessionStorage.setItem(
          'availableUnits',
          JSON.stringify(availableUnits)
        );
        this.units.forEach((unit) => {
          if (
            units.IOGP_Category[unit].access_permissions[0].indexOf('view') > -1
          ) {
            let unitDetails = {};
            unitDetails['obsData'] = {};
            unitDetails['name'] = unit;
            unitDetails['startDate'] = units.IOGP_Category[unit].start_date;
            unitDetails['endDate'] = units.IOGP_Category[unit].end_date;
            unitDetails['id'] = units.IOGP_Category[unit].id;
            unitDetails['order'] = units.IOGP_Category[unit].order;
            this.unitList.push(unitDetails);
          }
        });
        this.unitList.sort((a, b) => {
          return b.order - a.order;
        });
        sessionStorage.setItem('allUnits', JSON.stringify(this.unitList));
        this.safetyAndSurveillanceDataService.passAllUnits(this.unitList);
        if (this.selectedItems.length < 1) {
          this.selectedItems = this.unitList.map((key) => {
            return key.id;
          });
          sessionStorage.setItem(
            'selectedUnits',
            JSON.stringify(this.selectedItems)
          );
        } else {
          let selectedItems = [];
          this.selectedItems.forEach((ele) => {
            let index = this.unitList.findIndex((key) => {
              return key.id == ele;
            });
            if (index >= 0) {
              selectedItems.push(ele);
            }
          });
          this.selectedItems = selectedItems;
          sessionStorage.setItem(
            'selectedUnits',
            JSON.stringify(this.selectedItems)
          );
        }
      } else if (availableUnits?.length > 0) {
        this.units = [];
        this.unitList = [];
        let units: any = availableUnits;
        this.units = availableUnits;
        this.units.forEach((unit) => {
          let unitDetails = {};
          unitDetails['obsData'] = {};
          unitDetails['name'] = unit.name;
          unitDetails['startDate'] = unit.start_date;
          unitDetails['endDate'] = unit.end_date;
          unitDetails['id'] = unit.id;
          unitDetails['order'] = unit.order;
          this.unitList.push(unitDetails);
        });
        this.unitList.sort((a, b) => {
          return b.order - a.order;
        });
        sessionStorage.setItem('allUnits', JSON.stringify(this.unitList));
        this.safetyAndSurveillanceDataService.passAllUnits(this.unitList);
        if (this.selectedItems?.length < 1) {
          this.selectedItems = this.unitList.map((key) => {
            return key.id;
          });
          sessionStorage.setItem(
            'selectedUnits',
            JSON.stringify(this.selectedItems)
          );
        } else {
          let selectedItems = [];
          this.selectedItems.forEach((ele) => {
            let index = this.unitList.findIndex((key) => {
              return key.id == ele;
            });
            if (index >= 0) {
              selectedItems.push(ele);
            }
          });
          this.selectedItems = selectedItems;
          sessionStorage.setItem(
            'selectedUnits',
            JSON.stringify(this.selectedItems)
          );
        }
      }
      this.unitList.reverse();
      sessionStorage.setItem('allUnits', JSON.stringify(this.unitList));
    } else {
      this.selectedItems = [];
      this.dataService.passSpinnerFlag(false, true);
    }

    if (
      JSON.parse(sessionStorage.getItem('selectedUnits')).length > 0 &&
      this.selectedItems.length > 0
    ) {
      var dates = [];
      this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(
        (data) => {
          dates = data;
        }
      );
      this.safetyAndSurveillanceDataService.passDatesAndUnits(
        this.selectedItems,
        dates['startDate'],
        dates['endDate']
      );
      this.safetyAndSurveillanceDataService.passSelectedUnits(
        this.selectedItems
      );
    } else {
      this.obsData = [];
      this.openCloseCount = {
        open: 0,
        close: 0,
        snooze: 0,
        archive: 0,
      };
      var msg = 'No data available.';
      this.snackbarService.show(msg, false, false, false, true);
      this.dataService.passSpinnerFlag(false, true);
    }
  }

  /**
   * edit manul observation annotation.
   * @param item
   * @param i
   */
  editManualObservation(item, i) {
    debugger
    this.manulaObservationSelectedDetails = item;
    this.editIndex = i;
    this.annotation = false;
    let manualActionPoints = [];
    this.manualActionPoints = [];
    this.observationImgHeight = 250;
    this.observationImgWidth = 400;
    this.observationImgRatio = 2160 / this.observationImgHeight;
    if (this.multiObservations[i].shape === 'rectangle') {
      let top =
        this.multiObservations[i].coords[1] / this.observationImgRatio - 15;
      let left =
        this.multiObservations[i].coords[0] / this.observationImgRatio - 15;
      manualActionPoints.push({
        index: i,
        top: top,
        left: left,
        coords: this.multiObservations[i].coords,
        shape: this.multiObservations[i].shape,
        lineColor: this.multiObservations[i].lineColor,
        lineThickness: this.multiObservations[i].lineThickness,
      });
    } else if (this.multiObservations[i].shape === 'circle') {
      let top =
        this.multiObservations[i].coords[1] / this.observationImgRatio -
        this.multiObservations[i].coords[2] / this.observationImgRatio -
        15;
      let left =
        this.multiObservations[i].coords[0] / this.observationImgRatio - 15;
      manualActionPoints.push({
        index: i,
        top: top,
        left: left,
        coords: this.multiObservations[i].coords,
        shape: this.multiObservations[i].shape,
        lineColor: this.multiObservations[i].lineColor,
        lineThickness: this.multiObservations[i].lineThickness,
      });
    }
    this.manualActionPoints = manualActionPoints;
  }

  deleteSlectedCommentImg(i, item) {
    item.image = null;
  }
  getChecklistbySubactivityId() {
    this.dataService.passSpinnerFlag(true, true);
    let params = this.selectedSubActivityId;
    this.safetyService.getAuditChecklistBySubId(params).subscribe(
      (data: any) => {
        // debugger
        this.checklistData = data.checklist_with_responses;
        this.status = data.status;
        for (let i = 0; i < this.checklistData.length; i++) {
          if (this.checklistData[i].selected_option) {
            this.checklistData[i].selected_option_id =
              this.checklistData[i].selected_option.id;

            this.checklistData[i].selected_option_key =
              this.checklistData[i].selected_option.option_key;
          }
          for (let j = 0; j < this.checklistData[i].options.length; j++) {}
          if (this.checklistData[i].observation) {
            this.selectedChecklistindex = i;
            this.getObservationsByFaultId(
              [this.checklistData[i].observation],
              this.selectedUnit,
              this.selectedZone
            );
          }
        }
        //   this.checklistData = this.checklistData.map((item)=>{

        //     for(let i =0;i<item.options?.length;i++){
        //       if(item.selected_option_id == item.options[i].id)
        //         item.checked = item.options[i].option_key
        //   }
        // });
        console.log(this.checklistData, 'checklist data');
        this.checkCompletedMeasures();
        this.checkValid();
        // this.activitiessubactivities();activitiessubactivities
        // this.disableAllControls(this.PreventiveMeasures())

        // for(let i=0;i<data.checklist.length-1;i++)
        // this.disableAllControls(this.optionsArray(i))

        // for(let i=0;i<this.PreventiveMeasures().value.length;i++)
        // this.PreventiveMeasures().removeAt(i);
        //     this.patchData(data.checklist);

        // this.PreventiveMeasuresForm.patchValue({PreventiveMeasures:data.checklist})

        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }
  omit_special_char(event) {
    var k;
    k = event.charCode; //         k = event.keyCode;  (Both can be used)
    return (
      (k > 64 && k < 91) ||
      (k > 96 && k < 123) ||
      k == 8 ||
      k == 32 ||
      (k >= 48 && k <= 57)|| // Digits 0-9
      k == 44 || // Comma ,
      k == 46 || // Period .
      k == 33 || // Exclamation mark !
      k == 63 || // Question mark ?
      k == 45 || // Hyphen -
      k == 95 || // Underscore _
      k == 39 || // Single quote '
      k == 64 // At symbol @
    );
  }

  imageUpload(base64Image, item) {
    this.safetyService.uploadImage(base64Image).subscribe(
      (data: any) => {
        this.dataService.passSpinnerFlag(false, true);
        console.log(data, 'image data');

        item.image = data.image_path;
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
  selectSubActivity(subActivity, Activity) {
    console.log(subActivity, Activity);
    this.selectedSubActivityId = subActivity.id;
    this.selectedSubActivity = subActivity;
    this.selectedActivityId = Activity.id;
    this.selectedActivities = Activity;
    this.selectedActivity = Activity.name;
    this.totalSubactivites = this.selectedActivities.sub_activities.length
      .toString()
      .padStart(2, '0');
    this.completedSubactivites = this.selectedActivities.sub_activities
      .filter((item) => item.audit_status == 'Completed')
      .length.toString()
      .padStart(2, '0');
      sessionStorage.setItem('selectedUnitStartAudit',this.selectedActivities.unit_name)
      sessionStorage.setItem('selectedZoneStartAudit',this.selectedActivities.zone_name)
    this.getChecklistbySubactivityId();
  }
  checkCompletedMeasures() {
    this.completedCount = 0;
    for (let i = 0; i < this.checklistData.length; i++) {
      if (
        this.checklistData[i].selected_option_id ||
        this.checklistData[i].selected_option
      ) {
        this.completedCount++;
      }
    }
    this.completedCount = this.completedCount.toString().padStart(2, '0');
  }
  checkSelectedOption(options, selected) {
    let filter = options.filter((item) => item.id == selected);
    console.log(filter, 'filter');
    if (filter[0].option_key == 'no') return false;
    else return true;
  }
  activitiessubactivities() {
    this.dataService.passSpinnerFlag(true, true);
    let params = '';
    if (!this.isSurprise) params = 'activity_id=' + this.selectedActivityId;

    this.safetyService.activitiessubactivities(params).subscribe(
      (data: any) => {
        if (data.activities?.length > 0)
          this.activitiesandSubActivites = data.activities;
        else {
          this.activitiesandSubActivites = [data.activity];
        }
        console.log(
          this.activitiesandSubActivites,
          'activitiesandSubActivites'
        );
        if (
          this.activitiesandSubActivites &&
          this.activitiesandSubActivites.length > 0
        )
          this.selectedActivity = this.activitiesandSubActivites[0].name;
        this.selectedActivities = this.activitiesandSubActivites[0];
        this.selectedSubActivityId =
          this.selectedActivities.sub_activities[0].id;
        this.selectedSubActivity = this.selectedActivities.sub_activities[0];
        this.totalSubactivites = this.selectedActivities.sub_activities.length
          .toString()
          .padStart(2, '0');
        this.completedSubactivites = this.selectedActivities.sub_activities
          .filter((item) => item.audit_status == 'Completed')
          .length.toString()
          .padStart(2, '0');
        // this.selectedActivityId = this.activitiesandSubActivites[0].id
        // this.getChecklistbySubactivityId();
        // this.activitiesandSubActivites.map((v) => ({ ...v, open: false }));
        this.getChecklistbySubactivityId();
        this.openActivity(0);
        this.selectedUnit = this.selectedActivities.unit;
      sessionStorage.setItem('selectedUnitStartAudit',this.selectedActivities.unit_name)
      sessionStorage.setItem('selectedZoneStartAudit',this.selectedActivities.zone_name)
        
        this.selectedZone = this.selectedActivities.zone;
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }
  openActivity(index) {
    this.activitiesandSubActivites.map((v) => ({ ...v, open: false }));
    this.activitiesandSubActivites[index].open =
      !this.activitiesandSubActivites[index].open;
    this.selectedActivity = this.activitiesandSubActivites[index].name;
  }
  selectImage(event: any) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }
    const file = event.target.files[0];
    const fileType = file.type;
    const fileName = file.name;
    if (
      !fileType.startsWith('image/') ||
      (!fileName.toLowerCase().endsWith('.jpg') &&
        !fileName.toLowerCase().endsWith('.jpeg') &&
        !fileName.toLowerCase().endsWith('.png'))
    ) {
      // Clear the input field to prevent the selected non-image file from being shown
      event.target.value = '';
      this.snackbarService.show(
        'Please select a valid image file.',
        false,
        false,
        false,
        true
      );
      return;
    }

    if (
      !fileType.startsWith('image/') ||
      (!fileName.toLowerCase().endsWith('.jpg') &&
        !fileName.toLowerCase().endsWith('.jpeg') &&
        !fileName.toLowerCase().endsWith('.png'))
    ) {
      // Clear the input field to prevent the selected non-image file from being shown
      event.target.value = '';
      this.snackbarService.show(
        'Please select a valid image file.',
        false,
        false,
        false,
        true
      );
      return;
    }

    if (file.size / 1024 / 1024 >= 5) {
      // Clear the input field to prevent the selected large image from being shown
      event.target.value = '';
      this.snackbarService.show('Max. size is 5MB.', false, false, false, true);
      return;
    }

    // Image is valid, proceed with displaying it
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.observationImage = reader.result;
    };

    // Clear any existing canvas and set the image name
    this.clearObservationCanvas();
    this.imageName = fileName;
  }
  /**
   * Manual observation upload cancelled in between.
   */
  backToAddObservation() {
    if (this.multiObservations?.length >= 1) {
      this.annotation = true;
      this.editIndex = -1;
      this.manualScaleAspectRatio();
    } else {
      $('#addObservationAnnotate').modal('hide');
      $('#addObservation').modal('show');
      this.observationImage = '';
    }
    this.safetyService.sendMatomoEvent(
      'Incomplete manual observation creation',
      'Manual observation'
    );
  }

  /**
   * adding manual action points for each annotation.
   */
  manualScaleAspectRatio() {
    let manualActionPoints = [];
    this.manualActionPoints = [];
    this.multiObservations.forEach((item, index) => {
      if (item.shape === 'rectangle') {
        let top = item.coords[1] / this.observationImgRatio - 15;
        let left = item.coords[0] / this.observationImgRatio - 15;
        manualActionPoints.push({
          index: index,
          top: top,
          left: left,
          coords: item.coords,
          shape: item.shape,
          lineColor: item.lineColor,
          lineThickness: item.lineThickness,
        });
      } else if (item.shape === 'circle') {
        let top =
          item.coords[1] / this.observationImgRatio -
          item.coords[2] / this.observationImgRatio -
          15;
        let left = item.coords[0] / this.observationImgRatio - 15;
        manualActionPoints.push({
          index: index,
          top: top,
          left: left,
          coords: item.coords,
          shape: item.shape,
          lineColor: item.lineColor,
          lineThickness: item.lineThickness,
        });
      }
    });
    this.manualActionPoints = manualActionPoints;
    this.sendObservationData.showAnimation = true;
  }

  selectImageSingle(event: any, item) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }
    let allImages = [];
    event.target.files.forEach((ele, i) => {
      let actionImage: any;
      this.actionCommentImage1 = '';
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
          let actionImageName = ele.name;

          let data = actionImageName.split('.');
          let row_pathName =
            Math.floor(Math.random() * 99 * 7) + '' + data[0] + '.' + data[1];

          var file = this.dataURLtoFile(this.actionCommentImage1, row_pathName);
          let base64Image = [file];
          // this.dataService.passSpinnerFlag(true, true);
          allImages.push({
            actionImage: this.actionCommentImage1,
            base64Image,
            actionImageName,
          });
          this.imageUpload(file, item);
        };
      } else {
        this.snackbarService.show(
          'Max. size is 5MB',
          false,
          false,
          false,
          true
        );
      }
      if (event.target.files.length == i + 1) {
        this.actionCommentImage = allImages;
        console.log(this.actionCommentImage, 'actionCommentImage');

        // item.image = allImages
        this.dataService.passSpinnerFlag(false, true);
        // setTimeout(()=>{
        //   allImages.forEach(ele1 =>{
        //     this.safetyAndSurveillanceCommonService.actionImageUpload(this.selectedUnit, ele1.base64Image).subscribe(data => {
        //       this.actionCommentImage.push({ actionImage: ele1.actionImage, actionImageName: ele1.actionImageName, imagePath: data })
        //       this.dataService.passSpinnerFlag(false, true);
        //     },
        //       error => {
        //         this.dataService.passSpinnerFlag(false, true);
        //         this.msg = 'Error occured. Please try again.';
        //         this.snackbarService.show(this.msg, true, false, false, false);
        //       },
        //       () => {
        //         this.dataService.passSpinnerFlag(false, true);
        //       }
        //     )
        //   })
        // }, 500)
      }
    });
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
  OptionValueChange(index, option) {
    console.log(option);

    this.checklistData[index].selected_option_id = option.id;
    this.checklistData[index].selected_option = null;
    this.checklistData[index].selected_option_key = option.option_key;
    this.checkCompletedMeasures();
    this.checkValid();
  }
  checkValid() {
    this.valid = false;
    this.valid = this.checklistData.some(
      (obj) =>
        obj['selected_option_id'] === null || !('selected_option_id' in obj)
    );
    this.validSave = false;
    this.validSave = this.checklistData.some(
      (obj) =>
        obj['selected_option_id'] != null || ('selected_option_id' in obj)
    );
    console.log(this.valid);
  }
  submitChecklist(action) {
      this.checklistData.map((item) => {
        if (!item.selected_option_id) {
          return this.snackbarService.show(
            'Fill option in each Preventive Measures to continue',
            true,
            false,
            false,
            false
          );
        }
      })
   
    const checklistNewData = this.checklistData.map(
      ({
        id,
        options,
        order,
        selected_option,
        description,
        observationObj,
        ...rest
      }) => ({
        checklist_item_id: id,
        ...rest,
      })
    );
    // let  = this.checklistData.map((item)=> item.checklist_item_id = item.id)
    let payload = {
      sub_activity_id: this.selectedSubActivityId,
      auditor_id: sessionStorage.getItem('logged_in_user'),
      checklist_responses: checklistNewData,
      is_surprise: this.isSurprise,
      action: action,
    };
    console.log(payload);
    this.safetyService.submitStartAudit(payload).subscribe(
      (res: any) => {
        console.log(res, 'res save checklist');
        this.getChecklistbySubactivityId();
        this.snackbarService.show(res.message, false, false, false, false);
        this.dataService.passSpinnerFlag(false, true);
      },
      (err: any) => {}
    );
  }
}
