import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonService } from '../../services/common.service';
import { DataService } from '../../services/data.service';
import { ManpowerCountingDataService } from '../../shared/services/data.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  msg: string = '';
  helpModule: string = '';
  userManualFound: boolean = false;
  subscription: Subscription = new Subscription();
  userManuals: any;
  safeUserManuals: SafeResourceUrl;


  constructor(private sanitizer: DomSanitizer,private commonService: CommonService, private manpowerCountingDataService: ManpowerCountingDataService, private dataService: DataService) {
      this.getUserManual();
   }

  ngOnInit(): void {
    this.commonService.readModuleConfigurationsData('manpower-counting').subscribe(data => {
      this.userManualFound = data['page_configurations']['help_page']['page_features']['user_manual_found'];
      this.subscription.add(this.manpowerCountingDataService.getHelpModule.subscribe(helpModule => {
        if (helpModule.validFlag) {
          this.helpModule = helpModule.helpModule;
        }
      }));
    });
    this.dataService.passSpinnerFlag(false, true);
  }
  getUserManual(){
    this.commonService.getUserManual().subscribe(
      (data) =>{
      this.userManuals = data['resp'][0].file;

    const encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
    let decryptedUrl= JSON.parse(this.decryptData(this.userManuals,encryptionKey))
    this.safeUserManuals = this.cleanUrl(decryptedUrl)
     
      
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

  ngOnDestroy() {
    this.manpowerCountingDataService.passHelpModule('', false);
    this.subscription.unsubscribe();
  }

}
