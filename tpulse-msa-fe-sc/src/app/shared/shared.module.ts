import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { HideInfoPipe } from './pipes/hide-info.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { NgxTributeModule } from 'ngx-tribute';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MentionModule } from 'angular-mentions';
import { BrowserModule } from '@angular/platform-browser';
import { GlobalResultsPopupComponent } from './components/global-results-popup/global-results-popup.component';
import { EquipmentChecklistComponent } from './components/equipment-checklist/equipment-checklist.component';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { PaginationComponent } from './components/pagination/pagination.component';
import { InspectionAnnotationsComponent } from './components/inspection-annotations/inspection-annotations.component';
import { InspectionChatboxComponent } from './components/inspection-chatbox/inspection-chatbox.component';
@NgModule({
  declarations: [
    HideInfoPipe,
    HighlightPipe,
    DateAgoPipe,
    PaginationComponent,
    ChatboxComponent,
    GlobalResultsPopupComponent,
    EquipmentChecklistComponent,
    SafeUrlPipe,
    InspectionAnnotationsComponent,
    InspectionChatboxComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    MentionModule,
    ReactiveFormsModule,
    NgxTributeModule,
    NgxDatatableModule.forRoot({
      messages: {
        emptyMessage: 'No data to display', // Message to show when array is presented, but contains no values
        totalMessage: 'total', // Footer total message
        selectedMessage: 'selected', // Footer selected message
      },
    })
  ],
  exports: [
    HideInfoPipe,
    HighlightPipe,
    DateAgoPipe,
    PaginationComponent,
    ChatboxComponent,
    GlobalResultsPopupComponent,
    EquipmentChecklistComponent,
    SafeUrlPipe,
    InspectionAnnotationsComponent,
    InspectionChatboxComponent
  ],
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: ChatboxComponent, }]
})
export class SharedModule { }
