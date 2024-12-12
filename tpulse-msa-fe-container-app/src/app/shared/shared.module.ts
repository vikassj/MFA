import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { WelcomeUserComponent } from './components/welcome-user/welcome-user.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { ModuleSwitcherComponent } from './components/module-switcher/module-switcher.component';
import { TimeoutComponent } from './components/timeout/timeout.component';
import { HeaderComponent } from './components/header/header.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { InAppNotificationsComponent } from './components/in-app-notifications/in-app-notifications.component';
import { RiskRatingComponent } from './components/risk-rating/risk-rating.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CameraTypePipe } from './pipes/camera-type.pipe';

@NgModule({
  declarations: [
    SpinnerComponent,
    WelcomeUserComponent,
    ContactUsComponent,
    ModuleSwitcherComponent,
    SnackbarComponent,
    HeaderComponent,
    FeedbackComponent,
    InAppNotificationsComponent,
    RiskRatingComponent,
    CameraTypePipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    BrowserAnimationsModule
  ],
  exports: [
    SpinnerComponent,
    WelcomeUserComponent,
    ContactUsComponent,
    ModuleSwitcherComponent,
    SnackbarComponent,
    HeaderComponent,
    FeedbackComponent,
    InAppNotificationsComponent,
    RiskRatingComponent,
    CameraTypePipe
  ]
})
export class SharedModule { }
