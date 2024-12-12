import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ApmModule, ApmService } from '@elastic/apm-rum-angular'
import { NgxMatomoRouterModule } from '@ngx-matomo/router';
import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from '../app/components/dashboard/dashboard.component';
import { HelpComponent } from './components/help/help.component';
import { ObservationsComponent } from './components/observations/observations.component';
import { ReportsComponent } from './components/reports/reports.component';
import { HideInfoPipe, SidebarObservationComponent } from './components/sidebar-observation/sidebar-observation.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { InputsModule } from '@progress/kendo-angular-inputs';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SafetyAndSurveillanceCommonService } from './shared/service/common.service';
import { SafetyAndSurveillanceDataService } from './shared/service/data.service';
import { PlantService } from './shared/service/plant.service';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
import { AuthService } from './shared/service/auth.service';
import { HighlightsComponent } from './components/highlights/highlights.component';
// import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


import * as echarts from 'echarts';
import { ModalImageViewerService } from 'src/shared/components/modal-image-viewer/services/modal-image-viewer.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ActionsComponent } from './components/actions/actions.component';
import { FindTodayAndYesterdayPipe, NotificationComponent } from './components/notification/notification.component';
import { IncidentComponent } from './components/incident/incident.component';

import { HomeComponent } from './components/home/home.component';
import { ObservationsNavContainerComponent } from './components/observations-nav-container/observations-nav-container.component';
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ClickOutsideDirective } from './click-outside.directive'
import { SafetyAndSurveillanceSharedModule } from './shared/shared.module';
import { SharedModule } from 'src/shared/shared.module';
import { AuditComponent } from './components/audit/audit.component';
import { StartAuditComponent } from './components/start-audit/start-audit.component';
import {MatExpansionModule} from '@angular/material/expansion';

import {MatCheckboxModule} from '@angular/material/checkbox';
import { ConfigureChecklistComponent } from './components/configure-checklist/configure-checklist.component';




@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ObservationsComponent,
    ReportsComponent,
    HelpComponent,
    HighlightsComponent,
    SidebarObservationComponent,
    AnalyticsComponent,
    HideInfoPipe,
    ActionsComponent,
    HomeComponent,
    ObservationsNavContainerComponent,
    ClickOutsideDirective,
    NotificationComponent,
    FindTodayAndYesterdayPipe,
    IncidentComponent,
    AuditComponent,
    StartAuditComponent,
    ConfigureChecklistComponent
  ],
  imports: [
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    SafetyAndSurveillanceSharedModule,
    CommonModule,
    ApmModule,
    InputsModule,
    DateInputsModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    AngularMyDatePickerModule,
    NgxExtendedPdfViewerModule,
    NgIdleKeepaliveModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    MatExpansionModule,
    MatCheckboxModule,
    NgxEchartsModule.forRoot({
      echarts,
    }),
    NgxDatatableModule.forRoot({
      messages: {
        emptyMessage: 'No data to display', // Message to show when array is presented, but contains no values
        totalMessage: 'total', // Footer total message
        selectedMessage: 'selected', // Footer selected message
      },
    }),
    NgxMatomoTrackerModule.forRoot({
      siteId: sessionStorage.getItem('matomoSiteId'),
      trackerUrl: sessionStorage.getItem('matomoTrackerUrl')
    }),
    NgxMatomoRouterModule

  ],
  providers: [
    PlantService,
    SafetyAndSurveillanceDataService,
    SafetyAndSurveillanceCommonService,
    ModalPdfViewerService,
    ModalImageViewerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthService,
      multi: true,
    },
    ApmService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  constructor(service: ApmService) {
    // let userId = sessionStorage.getItem('user-email');
    // // Agent API is exposed through this apm instance
    // const apm = service.init({
    //   serviceName: 'tpulse-hsse',
    //   serverUrl: 'http://43.205.192.21:8200'
    // })
    // apm.setUserContext({
    //   'email': userId
    // })
  }
}
