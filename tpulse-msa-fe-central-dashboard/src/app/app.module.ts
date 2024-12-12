import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxMatomoRouterModule } from '@ngx-matomo/router';
import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
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
  bootstrap: [AppComponent]
})
export class AppModule { }
