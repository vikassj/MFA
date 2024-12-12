import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { OverviewComponent } from './components/overview/overview.component';
import { UnitComponent } from './components/unit/unit.component';
import { IssuesComponent } from './components/issues/issues.component';
import { KnowledgementComponent } from './components/knowledgement/knowledgement.component';
import { FindTodayAndYesterdayPipe, NotificationComponent } from './components/notification/notification.component';
import { ReportsComponent } from './components/reports/reports.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalPdfViewerService } from './shared/services/modal-pdf-viewer.service';
import { CreateNewIssueComponent } from './components/create-new-issue/create-new-issue.component';
import { SCurveComponent } from './components/unit-components/plan-components/s-curve/s-curve.component';
import { CategoryWiseIssuesComponent } from './components/unit-components/plan-components/category-wise-issues/category-wise-issues.component';
import { DelayTasksComponent } from './components/unit-components/plan-components/delay-tasks/delay-tasks.component';
import { CreateSurpriseTaskComponent } from './components/unit-components/plan-components/create-surprise-task/create-surprise-task.component';

import { DropdownHideInfoPipe, hideInfoPipe, ReplaceUnderscorePipe, TaggedHideInfoPipe } from './shared/pipes/hide-info.pipe';
import { HighlightPipe } from './shared/pipes/highlight.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ChatMessageComponent } from './components/chat-box/chat-message/chat-message.component';
import { IssuePopupBoxComponent } from './components/issue-popup-box/issue-popup-box.component';
import { CommonService } from './shared/services/common.service';
import { DataService } from './shared/services/data.service';
import { SharedModule } from './shared/shared.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ModalPdfViewerComponent } from 'src/shared/components/modal-pdf-viewer/modal-pdf-viewer.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { GanttChartService } from './services/gantt-chart.service';
import { PlanComponent } from './components/unit-components/plan/plan.component';
import { DashboardComponent } from './components/unit-components/dashboard/dashboard.component';
import { EquipmentComponent } from './components/unit-components/equipment/equipment.component';
import { EquipmentPageComponent } from './components/unit-components/equipment-components/equipment-page/equipment-page.component';
import { TaskComponent } from './components/unit-components/task/task.component';
import { OverallUnitDataComponent } from './components/overall-unit-data/overall-unit-data.component';
import { StatisticComponent } from './components/unit-components/plan-components/statistic/statistic.component';
import { StatsComponent } from './components/unit-components/plan-components/stats/stats.component';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import * as echarts from 'echarts';
import { GanttComponent } from './components/unit-components/plan-components/gantt/gantt.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BulkEquipmentComponent } from './components/unit-components/equipment-components/bulk-equipment/bulk-equipment.component';
import { OverViewChartComponent } from './components/over-view-chart/over-view-chart.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SpinnerComponent } from 'src/shared/components/spinner/spinner.component';
import { SnackbarComponent } from 'src/shared/components/snackbar/snackbar.component';
import { ActivityMonitorAnnotationsComponent } from './components/unit-components/task-components/activity-monitor-annotations/activity-monitor-annotations.component';
import { CommentComponent } from './components/comment/comment.component';
import { ViewAttachmentsComponent } from './components/view-attachments/view-attachments.component';
import { MentionModule } from 'angular-mentions';
import { TaskSummaryComponent } from './components/unit-components/task-components/task-summary/task-summary.component';
import { AuthService } from 'src/shared/services/auth.service';
import { InspectionComponent } from './components/inspection/inspection.component';
import { FileDragNDropDirective } from './components/file-drag-n-drop.directive';
import { OWL_DATE_TIME_LOCALE, OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ZoomableVideoComponent } from './components/unit-components/task-components/zoomable-video/zoomable-video.component';
import { VgControlsModule, VgCoreModule } from 'ngx-videogular';
@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    UnitComponent,
    IssuesComponent,
    KnowledgementComponent,
    NotificationComponent,
    ReportsComponent,
    CreateNewIssueComponent,
    ChatBoxComponent,
    ChatMessageComponent,
    IssuePopupBoxComponent,
    ModalPdfViewerComponent,
    SCurveComponent,
    CategoryWiseIssuesComponent,
    DelayTasksComponent,
    CreateSurpriseTaskComponent,
    hideInfoPipe,
    DropdownHideInfoPipe,
    ReplaceUnderscorePipe,
    TaggedHideInfoPipe,
    FindTodayAndYesterdayPipe,
    PlanComponent,
    DashboardComponent,
    EquipmentComponent,
    TaskComponent,
    OverallUnitDataComponent,
    StatisticComponent,
    StatsComponent,
    GanttComponent,
    BulkEquipmentComponent,
    EquipmentPageComponent,
    OverViewChartComponent,
    SpinnerComponent,
    SnackbarComponent,
    ActivityMonitorAnnotationsComponent,
    CommentComponent,
    ViewAttachmentsComponent,
    TaskSummaryComponent,
    InspectionComponent,
    FileDragNDropDirective,
    ZoomableVideoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    NgxExtendedPdfViewerModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgbModule,
    NgSelectModule,
    MentionModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    DateInputsModule,
    AngularMyDatePickerModule,
    NgxEchartsModule.forRoot({
      echarts
    }),
    NgxDatatableModule.forRoot({
      messages: {
        emptyMessage: 'No data to display', // Message to show when array is presented, but contains no values
        totalMessage: 'total', // Footer total message
        selectedMessage: 'selected', // Footer selected message
      },
    }),
    VgCoreModule,
    VgControlsModule
  ],
  providers: [
    CommonService,
    DataService,
    ModalPdfViewerService,
    GanttChartService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthService,
      multi: true,
    },
    {provide: OWL_DATE_TIME_LOCALE, useValue: 'en-SG'}
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule { }
