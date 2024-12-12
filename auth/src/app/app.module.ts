import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgxMatomoRouterModule } from '@ngx-matomo/router';
import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmptyRouteComponent } from './empty-route/empty-route.component';
// import { ButtonModule } from "bootstrap-card-nexus/button";
// import { StockUpdateModule } from "bootstrap-card-nexus/stock-update";
import { LoginModule } from "custom-login-component";
// import { SignUpComponent } from './sign-up/sign-up.component';
// import { SignInComponent } from './sign-in/sign-in.component';
// import { ProfileComponent } from './profile/profile.component';
// import { LoginComponent } from './pages/login/login.component';

import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { Amplify, Auth } from 'aws-amplify';

import { AmplifyService } from "aws-amplify-angular";
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { AuthPanelComponent } from './auth-panel/auth-panel.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SpinnerComponent } from './spinner/spinner.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ForceChangePasswordComponent } from './force-change-password/force-change-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { NotificationComponent } from './notification/notification.component';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';

import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    SnackbarComponent,
    EmptyRouteComponent,
    SignUpComponent,
    SignInComponent,
    ProfileComponent,
    LoginComponent,
    AuthPanelComponent,
    ForgotPasswordComponent,
    ForceChangePasswordComponent,
    ChangePasswordComponent,
    NotificationComponent,
    TwoFactorAuthComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    QRCodeModule,
    NgxMatomoTrackerModule.forRoot({
      siteId: sessionStorage.getItem('matomoSiteId'),
      trackerUrl: sessionStorage.getItem('matomoTrackerUrl')
    }),
    NgxMatomoRouterModule
  ],
  providers: [AppRoutingModule, AmplifyService],
  bootstrap: [AppComponent],
  schemas: []
})
export class AppModule { }
