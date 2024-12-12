import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SnackbarComponent } from './components/snackbar/snackbar.component';

@NgModule({
  declarations: [
    SnackbarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SnackbarComponent
  ],
  providers: [
  ]
})
export class ManpowerCountingSharedModule { }
