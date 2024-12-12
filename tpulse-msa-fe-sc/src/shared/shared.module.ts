import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPdfViewerComponent } from './components/modal-pdf-viewer/modal-pdf-viewer.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { CommonService } from './services/common.service';
import { DataService } from './services/data.service';
import { ModalPdfViewerService } from './services/modal-pdf-viewer.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgxExtendedPdfViewerModule,
  ],
  exports: [
  ],
  providers: [
    CommonService,
    DataService,
    ModalPdfViewerService
  ]
})
export class SharedModule { }
