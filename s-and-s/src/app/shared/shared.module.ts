import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BirdsEyeViewComponent } from './components/birds-eye-view/birds-eye-view.component';
import { IogpPillsComponent } from './components/iogp-pills/iogp-pills.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';

import { RiskFilterPipe } from './pipes/risk-filter.pipe';
import { FilterPipe } from '../shared/pipes/filter.pipe';
import { StatusFilterPipe } from './pipes/status-filter.pipe';
import { IogpNamePipe } from './pipes/iogp-name.pipe';
import { DateFilterPipe } from './pipes/date-filter.pipe';
import { ObsStatusFilterPipe } from './pipes/obs-status-filter.pipe';
import { CategoryPillsComponent } from './components/category-pills/category-pills.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { StackBarChartComponent } from './components/stack-bar-chart/stack-bar-chart.component';
import { AnalyticsLineChartComponent } from './components/analytics-line-chart/analytics-line-chart.component';
import { AnalyticsRiskRatingChartComponent } from './components/analytics-risk-rating-chart/analytics-risk-rating-chart.component';
import { AnalyticsBarChartComponent } from './components/analytics-bar-chart/analytics-bar-chart.component';
import { AnalyticsFunnelChartComponent } from './components/analytics-funnel-chart/analytics-funnel-chart.component';
import { ManualObservationAnnotationComponent } from './components/manual-observation-annotation/manual-observation-annotation.component';
import { HorizontalBarComponent } from './components/horizontal-bar/horizontal-bar.component';
import { CriticalObservationBarComponent } from './components/critical-observation-bar/critical-observation-bar.component';
import { AnalyticsTrendBarComponent } from './components/analytics-trend-bar/analytics-trend-bar.component';
import { AnalyticsSifBarComponent } from './components/analytics-sif-bar/analytics-sif-bar.component';
import { AnalyticsRatingBarComponent } from './components/analytics-rating-bar/analytics-rating-bar.component';
import { AnalyticsStatusBarComponent } from './components/analytics-status-bar/analytics-status-bar.component';
import { AnalyticsModeBarComponent } from './components/analytics-mode-bar/analytics-mode-bar.component';
import { HideInfoPipeTransform, TextHideInfoPipeTransform } from './pipes/hide.pipe';
import { ChatboxComponent, ImageNameHideInfoPipe } from './components/chatbox/chatbox.component';
import { HomeNavbarComponent } from './components/home-navbar/home-navbar.component';
import { DateHeaderComponent } from './components/date-header/date-header.component';
import { DaysDropdownComponent } from './components/days-dropdown/days-dropdown.component';
import { UnitsFilterComponent } from './components/units-filter/units-filter.component';
import { ObservationsNavbarComponent } from './components/observations-navbar/observations-navbar.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { UnitsDropdownComponent } from './components/units-dropdown/units-dropdown.component';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
// import { PaginationComponent } from './components/pagination/pagination.component';
// import { NgxTributeModule } from 'ngx-tribute';
import { CategoryDatePickerComponent } from './components/category-date-picker/category-date-picker.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { InsightsTabComponent } from './components/insights-tab/insights-tab.component';






import { PaginationComponent } from './components/pagination/pagination.component';
import { NgxTributeModule } from 'ngx-tribute';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { IncidentViewComponent } from './components/incident-view/incident-view.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IncidetChatboxComponent } from './components/incidet-chatbox/incidet-chatbox.component';
import { IncidentActionsComponent } from './components/incident-actions/incident-actions.component';
import { IncidentCreateComponent } from './components/incident-create/incident-create.component';
import { IncidentStatusPipe } from './pipes/incident-status';
import { DateFormatPipe } from './pipes/date-format.pipe';

import { MatTooltipModule } from '@angular/material/tooltip';
import { PermitFilterComponent } from './components/permit-filter/permit-filter.component';
import { AuditNavbarComponent } from './components/audit-navbar/audit-navbar.component';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';

@NgModule({
  declarations: [
    BirdsEyeViewComponent,
    RiskFilterPipe,
    StatusFilterPipe,
    IogpNamePipe,
    DateFilterPipe,
    ObsStatusFilterPipe,
    IncidentStatusPipe,
    FilterPipe,
    HideInfoPipeTransform,
    TextHideInfoPipeTransform,
    ImageNameHideInfoPipe,
    IogpPillsComponent,
    CategoryPillsComponent,
    LineChartComponent,
    StackBarChartComponent,
    AnalyticsLineChartComponent,
    AnalyticsRiskRatingChartComponent,
    AnalyticsBarChartComponent,
    AnalyticsFunnelChartComponent,
    ManualObservationAnnotationComponent,
    HorizontalBarComponent,
    CriticalObservationBarComponent,
    AnalyticsTrendBarComponent,
    AnalyticsSifBarComponent,
    AnalyticsRatingBarComponent,
    AnalyticsStatusBarComponent,
    AnalyticsModeBarComponent,
    ChatboxComponent,
    HomeNavbarComponent,
    DateHeaderComponent,
    DaysDropdownComponent,
    UnitsFilterComponent,
    ObservationsNavbarComponent,
    UnitsDropdownComponent,
    PaginationComponent,
    CategoryDatePickerComponent,
    PaginationComponent,
    DateAgoPipe,
    IncidentViewComponent,
    IncidetChatboxComponent,
    IncidentActionsComponent,
    IncidentCreateComponent,
    DateFormatPipe,
    InsightsTabComponent,
    PermitFilterComponent,
    AuditNavbarComponent,
    MultiSelectComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgSelectModule,
    NgxEchartsModule,
    ReactiveFormsModule,
    FormsModule,
    DateInputsModule,
    InputsModule,
    LabelModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxTributeModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTooltipModule,
    NgxTributeModule,
    NgxDatatableModule.forRoot({
      messages: {
        emptyMessage: 'No data to display', // Message to show when array is presented, but contains no values
        totalMessage: 'total', // Footer total message
        selectedMessage: 'selected', // Footer selected message
      },
    }),
  ],
  exports: [
    BirdsEyeViewComponent,
    IogpPillsComponent,
    RiskFilterPipe,
    StatusFilterPipe,
    IogpNamePipe,
    DateFilterPipe,
    DateAgoPipe,
    ObsStatusFilterPipe,
    IncidentStatusPipe,
    FilterPipe,
    HideInfoPipeTransform,
    TextHideInfoPipeTransform,
    CategoryPillsComponent,
    LineChartComponent,
    StackBarChartComponent,
    AnalyticsLineChartComponent,
    AnalyticsRiskRatingChartComponent,
    AnalyticsBarChartComponent,
    AnalyticsFunnelChartComponent,
    ManualObservationAnnotationComponent,
    HorizontalBarComponent,
    CriticalObservationBarComponent,
    AnalyticsTrendBarComponent,
    AnalyticsSifBarComponent,
    AnalyticsRatingBarComponent,
    AnalyticsStatusBarComponent,
    AnalyticsModeBarComponent,
    ImageNameHideInfoPipe,
    CategoryPillsComponent,
    LineChartComponent,
    StackBarChartComponent,
    ChatboxComponent,
    HomeNavbarComponent,
    DateHeaderComponent,
    UnitsFilterComponent,
    ObservationsNavbarComponent,
    PaginationComponent,
    CategoryDatePickerComponent,
    IncidentViewComponent,
    IncidetChatboxComponent,
    IncidentActionsComponent,
    IncidentCreateComponent,
    InsightsTabComponent,
    PermitFilterComponent,
    AuditNavbarComponent,
    MultiSelectComponent
  ],
  providers: [
    PaginationComponent,
    DateAgoPipe,
    IncidentViewComponent,
    IncidetChatboxComponent,
    IncidentActionsComponent,
    IncidentCreateComponent
  ]
})
export class SafetyAndSurveillanceSharedModule { }

