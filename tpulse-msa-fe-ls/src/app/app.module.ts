import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxMatomoRouterModule } from '@ngx-matomo/router';
import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { VgStreamingModule } from '@videogular/ngx-videogular/streaming';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ListViewComponent } from './components/dashboard/list-view/list-view.component';
import { GalleryViewComponent } from './components/dashboard/gallery-view/gallery-view.component';
import { ZoomableVideoComponent } from './shared/components/zoomable-video/zoomable-video.component';
import { LiveVideoComponent } from './shared/components/live-video/live-video.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { AppComponent } from './app.component';
import { HelpComponent } from './components/help/help.component';
import { ReleaseNotesComponent } from './shared/components/release-notes/release-notes.component';
import { ContactUsComponent } from './shared/components/contact-us/contact-us.component';

import { AppRoutingModule } from './app-routing.module';
import { LiveStreamingSharedModule } from '../app/shared/shared.module';

import { AuthService } from './shared/services/auth.service';

import { SafePipe } from './shared/pipes/safe.pipe';
import { SearchPipe } from './shared/pipes/search.pipe';
import { DropdownHideInfoPipe } from './shared/pipes/cameraHideInfo.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ListViewComponent,
    GalleryViewComponent,
    ZoomableVideoComponent,
    LiveVideoComponent,
    SpinnerComponent,
    ContactUsComponent,
    SearchPipe,
    DropdownHideInfoPipe,
    HelpComponent,
    ReleaseNotesComponent,
    SafePipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CommonModule,
    LiveStreamingSharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    AngularMyDatePickerModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    VgStreamingModule,
    NgSelectModule,
    FormsModule,
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
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
