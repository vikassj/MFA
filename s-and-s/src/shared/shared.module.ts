import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgSelectModule } from '@ng-select/ng-select';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { WelcomeUserComponent } from './components/welcome-user/welcome-user.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { ModalPdfViewerComponent } from './components/modal-pdf-viewer/modal-pdf-viewer.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { RiskRatingComponent } from './components/risk-rating/risk-rating.component';
import { SafetyAndSurveillanceAnnotationComponent } from './components/annotation/annotation.component';
// import { SnackbarService } from './services/snackbar.service';
import { ActivateLoginService } from './services/activate-login.service';
import { AuthService } from './services/auth.service';
import { CommonService } from './services/common.service';
import { DataService } from './services/data.service';
import { ModalPdfViewerService } from './services/modal-pdf-viewer.service';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { ComparisonBarChartComponent } from './components/comparison-bar-chart/comparison-bar-chart.component';
import { UnitSsDashboardComponent } from './components/unit-ss-dashboard/unit-ss-dashboard.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { ModalImageViewerComponent } from './components/modal-image-viewer/modal-image-viewer.component';

import { FilterPipe } from './pipes/filter.pipe';
import { DropdownComponent, DropdownHideInfoPipe } from './components/dropdown/dropdown.component';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { hideInfoPipe } from './pipes/numberHideInfo.pipe';
import { StackBarChartComponent } from './components/stack-bar-chart/stack-bar-chart.component';
import { RiskwiseHorizontalChartComponent } from './components/riskwise-horizontal-chart/riskwise-horizontal-chart.component';
import { OpenCloseGraphComponent } from './components/open-close-graph/open-close-graph.component';
import { RiskRatingBarComponent } from './components/risk-rating-bar/risk-rating-bar.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { SupportDocPdfViewerService } from './services/support-doc-pdf-viewer.service';
import { SupportDocPdfComponent } from './components/support-doc-pdf/support-doc-pdf.component';

import { MatTooltipModule } from '@angular/material/tooltip';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { ZoomableVideoComponent } from './components/zoomable-video/zoomable-video.component';
import { VideoDecryptDirective } from 'src/app/video-decrypt.directive';
import { TextHide } from 'src/app/shared/components/manual-observation-annotation/manual-observation-annotation.component';
@NgModule({
  declarations: [
    SnackbarComponent,
    SpinnerComponent,
    WelcomeUserComponent,
    ContactUsComponent,
    ModalPdfViewerComponent,
    BarChartComponent,
    ComparisonBarChartComponent,
    StackBarChartComponent,
    UnitSsDashboardComponent,
    RiskRatingComponent,
    SafetyAndSurveillanceAnnotationComponent,
    ModalImageViewerComponent,
    DropdownComponent,
    DropdownHideInfoPipe,
    FilterPipe,
    hideInfoPipe,
    TextHide,
    // TimeOutComponent,
    RiskwiseHorizontalChartComponent,
    OpenCloseGraphComponent,
    RiskRatingBarComponent,
    SupportDocPdfComponent,
    DateFormatPipe,
    ZoomableVideoComponent,
    // HomeDropdownComponent,
    DateFormatPipe,
    VideoDecryptDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxDatatableModule,
    AngularMyDatePickerModule,
    NgSelectModule,
    NgxEchartsModule,
    QRCodeModule,
    NgxExtendedPdfViewerModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    NgApexchartsModule,
    MatTooltipModule
  ],
  exports: [
    DateFormatPipe,
    SnackbarComponent,
    SpinnerComponent,
    WelcomeUserComponent,
    ContactUsComponent,
    ModalPdfViewerComponent,
    BarChartComponent,
    ComparisonBarChartComponent,
    StackBarChartComponent,
    UnitSsDashboardComponent,
    SafetyAndSurveillanceAnnotationComponent,
    RiskRatingComponent,
    ModalImageViewerComponent,
    DropdownComponent,
    FilterPipe,
    hideInfoPipe,
    RiskwiseHorizontalChartComponent,
    RiskRatingBarComponent,
    SupportDocPdfComponent,
    ZoomableVideoComponent,
    TextHide,
    // TimeOutComponent,
    RiskwiseHorizontalChartComponent,
    RiskRatingBarComponent,
    SupportDocPdfComponent,
    // HomeDropdownComponent,
    VideoDecryptDirective
  ],
  providers: [
    ActivateLoginService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthService,
      multi: true
    },
    CommonService,
    DataService,
    ModalPdfViewerService,
    SupportDocPdfViewerService
  ]
})
export class SharedModule { }
