import { Component, OnInit } from '@angular/core';
import { assetUrl } from "../../single-spa/asset-url";
import { CommonService } from '../common.service';


@Component({
  selector: 'app-auth-panel',
  templateUrl: './auth-panel.component.html',
  styleUrls: ['./auth-panel.component.scss']
})
export class AuthPanelComponent implements OnInit {

  panelLogoUrl: string = '';
  productLogoUrl: string = '';
  productName: string = '';
  productSubName: string = '';
  softwareVersion: string = '';
  currentYear: number = null!;

  detectLogo: string = ""
  productLogo: string = ""

  constructor(private commonService: CommonService) { }

  ngOnInit(): void {

    //Dynamic logo and software version, configuration from sessionStorage.
    this.detectLogo = JSON.parse(sessionStorage.getItem('site-config')).login_page_logo
    this.softwareVersion = JSON.parse(sessionStorage.getItem('site-config')).software_version
    this.productLogoUrl = JSON.parse(sessionStorage.getItem('site-config')).product_logo_path;
    this.productName = JSON.parse(sessionStorage.getItem('site-config')).product_name
    this.productSubName = JSON.parse(sessionStorage.getItem('site-config')).product_subname
    
    //Static Values, likely to remain same across all the clients.
    this.commonService.readModuleConfigurationsData('auth').subscribe((data: any) => {
      this.panelLogoUrl = data['loginLogoPath'];
      this.currentYear = new Date().getFullYear();
    });
}
}
