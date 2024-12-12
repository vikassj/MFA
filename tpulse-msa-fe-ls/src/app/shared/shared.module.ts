import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { DateHeaderComponent } from './components/date-header/date-header.component';
import { FilterComponent, HideInfoPipe } from './components/filter/filter.component';

import { AppRoutingModule } from '../app-routing.module';
import { PaginationComponent } from './components/pagination/pagination.component';
import { VideoDecryptDirective } from '../video-decrypt.directive';
import { DateFormatPipe } from './pipes/date-format.pipe';

@NgModule({
  declarations: [
    SnackbarComponent,
    DateHeaderComponent,
    FilterComponent,
    HideInfoPipe,
    PaginationComponent,
    VideoDecryptDirective,
    DateFormatPipe
  ],
  imports: [
    CommonModule,
    DateInputsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NgSelectModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
  ],
  exports:[
    SnackbarComponent,
    DateHeaderComponent,
    FilterComponent,
    PaginationComponent,
    VideoDecryptDirective,
    DateFormatPipe
  ],
  providers: [
    FilterComponent
  ]

})
export class LiveStreamingSharedModule { }
