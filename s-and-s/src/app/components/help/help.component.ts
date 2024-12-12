import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
declare var $: any;

import { CommonService } from 'src/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SafetyAndSurveillanceCommonService } from '../../shared/service/common.service';

import { assetUrl } from 'src/single-spa/asset-url';

import * as CryptoJS from 'crypto-js';
import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';
@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
})
export class HelpComponent implements OnInit {
  selectedSideBarItem = '';
  ColumnMode = ColumnMode;
  msg: string = '';

  categoryRows: any[] = [];
  mappingRows: any[] = [];
  zoneMappingRows: any[] = [];
  userManualFound: boolean = false;
  gettingStartedDetails: any = [];
  videoTutorialFound: any;
  selectedChildSideBarItem: boolean = true;
  setIntervalId: any;
  videoHelpFeature: boolean;
  userManuals: any = [];
  safeUserManuals: any;
  selectedPlantDetails:any;
  constructor(
    private dataService: DataService,
    public commonService: CommonService,
    public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,
    private snackbarService: SnackbarService,
    private sanitizer: DomSanitizer,
    private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService
  ) {
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
    window.addEventListener('router-event', (ev) => {
      this.onVideoPause();
    });

    window.addEventListener('in-page-obs-nav', (evt: CustomEvent) => {
      this.safetyAndSurveillanceDataService.passGlobalSearch(evt.detail)   
    })
  }

  ngOnInit(): void {
    this.getUserManual()
    this.commonService
      .readJsonData('safety-and-surveillance-configurations-prod.json')
      .subscribe((data: any) => {
        this.videoHelpFeature = data['videoHelpFeature'];
        if (this.videoHelpFeature) {
          this.selectedSideBarItem = 'Getting Started';
          $('.collapse').collapse('show');
          this.videoTutorialFound = data['videoTutorialFound'];
          this.getHelpDetails();
        } else {
          this.selectedSideBarItem = 'Categorization';
        }
      });
    this.commonService
      .readModuleConfigurationsData('safety-and-surveillance')
      .subscribe((data) => {
        // TO Be uncommented when support is added in cofig portal.
        // this.videoHelpFeature = data['videoHelpFeature'];
        // if (this.videoHelpFeature) {
        //   this.selectedSideBarItem = 'Getting Started';
        //   $('.collapse').collapse('show');
        //   this.videoTutorialFound = data['videoTutorialFound'];
        //   this.getHelpDetails();
        // } else {
        //   this.selectedSideBarItem = 'Categorization';
        // }
        this.userManualFound =
          data['page_configurations']['help_page']['page_features'][
          'user_manual_found'
          ];
        this.categoryRows = data['module_configurations'][
          'iogp_categories'
        ].filter((cat) => cat.show_hide);
        this.mappingRows =
          data['page_configurations']['help_page']['category_mapping_details'];
        this.mappingRows = this.mappingRows.filter((row) => row.show_hide);
        this.zoneMappingRows = data['page_configurations']['help_page']['zone_mapping_details'];
        this.dataService.passSpinnerFlag(false, true);
      });
     
  }

decryptData(encryptedData: string, key: any){
    // Decrypt the value
   const keyhex = CryptoJS.enc.Hex.parse(key);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, keyhex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    console.log('decrypted', decrypted.toString(CryptoJS.enc.Utf8) );
    
    // Convert the decrypted data to a UTF-8 string and return it
    //return decrypted.toString(CryptoJS.enc.Utf8)
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    const urlStartIndex = decryptedString.indexOf('https');
    const urlEndIndex = decryptedString.search(/\.(jpg|jpeg)/i) + 4; // including 'jpg' or 'jpeg'
    const extractedURL = decryptedString.substring(urlStartIndex, urlEndIndex);
    
 
    return decryptedString;
}
  onVideoPlay(): void {
    //Fire event every 3 seconds to listen in container app and keep calling the idle.stop()
    this.setIntervalId = setInterval(() => {
      window.dispatchEvent(new CustomEvent('on-video-play'));
    }, 3000);
  }

  onVideoPause(): void {
    //Clear the previously set interval on video pause so that the user can be logged out when idle.
    clearInterval(this.setIntervalId);
  }

  sideBarSelectedItem(data: any) {
    if (this.videoHelpFeature) {
      var i, tabcontent;
      tabcontent = document.getElementsByClassName('videoContent');
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].querySelector('video').pause();
      }
      this.selectedSideBarItem = data;
      if (
        data != 'Getting Started' &&
        data != 'Home Page' &&
        data != 'Analytics Page' &&
        data != 'Observation, SIF & action' &&
        data != 'Reports & Help Page'
      ) {
        this.selectedChildSideBarItem = false;
        $('.collapse').collapse('hide');
      } else {
        this.selectedChildSideBarItem = true;
      }
    } else {
      this.selectedSideBarItem = data;
    }
  }
  getUserManual(){
    this.commonService.getUserManual().subscribe(
      (data) =>{
        console.log(data,"data");
        
      this.userManuals = data['resp'][0].file;

    const encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
    let decryptedUrl= JSON.parse(this.decryptData(this.userManuals,encryptionKey))
    console.log(decryptedUrl,"decryptedUrl");
    
    this.safeUserManuals = decryptedUrl;
    
      },
      (error) =>
        { 
          console.error("Error fetching PDF:", error);
        },
      () => { }
    )
  }

  cleanUrl(oldURL){
    return this.sanitizer.bypassSecurityTrustResourceUrl(oldURL);
  }
  getSafeUrl() {
    var filename = 'Safety and Surveillance - User Manual.pdf';
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      assetUrl('/pdf/' + filename)
    );
  }

  /**
   * get the help page data.
   */
  getHelpDetails() {
    this.gettingStartedDetails = [];
    this.commonService.getHelpDetails().subscribe((data) => {
      this.gettingStartedDetails = data[0].subsections
        ? data[0].subsections
        : 'No data Available';
    });
  }

  videoPause() {
    var i, tabcontent;
    tabcontent = document.getElementsByClassName('videoContent');
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].querySelector('video').pause();
    }
  }
}
