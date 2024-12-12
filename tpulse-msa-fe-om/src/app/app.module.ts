import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { NgxMatomoRouterModule } from '@ngx-matomo/router';
import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { ManpowerCountingSharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReportsComponent } from './components/reports/reports.component';
import { HelpComponent } from './components/help/help.component';
import { LiveDataComponent } from './components/live-data/live-data.component';
import { MpcLineChartComponent } from './components/mpc-line-chart/mpc-line-chart.component';
import { ModalPdfViewerComponent } from './shared/components/modal-pdf-viewer/modal-pdf-viewer.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { ContactUsComponent } from './shared/components/contact-us/contact-us.component';

import { AuthService } from './shared/services/auth.service';
import { ModalPdfViewerService } from './services/modal-pdf-viewer.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ReportsComponent,
    HelpComponent,
    LiveDataComponent,
    SpinnerComponent,
    ContactUsComponent,
    MpcLineChartComponent,
    ModalPdfViewerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    CommonModule,
    ManpowerCountingSharedModule,
    NgxExtendedPdfViewerModule,
    AngularMyDatePickerModule,
    FormsModule,
    NgxEchartsModule.forRoot({
      echarts,
    }),
    NgxDatatableModule.forRoot({
      messages: {
        emptyMessage: 'No data to display', // Message to show when array is presented, but contains no values
        totalMessage: 'total', // Footer total message
        selectedMessage: 'selected' // Footer selected message
      }
    }),
    NgxMatomoTrackerModule.forRoot({
      siteId: sessionStorage.getItem('matomoSiteId'),
      trackerUrl: sessionStorage.getItem('matomoTrackerUrl')
    }),
    NgxMatomoRouterModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthService,
      multi: true,
    },
    ModalPdfViewerService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
