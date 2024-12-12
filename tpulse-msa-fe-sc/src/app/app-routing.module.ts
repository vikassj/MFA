import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { OverviewComponent } from './components/overview/overview.component';
import { UnitComponent } from './components/unit/unit.component';
import { IssuesComponent } from './components/issues/issues.component';
import { KnowledgementComponent } from './components/knowledgement/knowledgement.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ReportsComponent } from './components/reports/reports.component';
import { InspectionComponent } from './components/inspection/inspection.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: 'schedule-control',
        redirectTo: 'schedule-control/unit',
        pathMatch: 'full'
      },
      {
        path: 'schedule-control/overview',
        component: OverviewComponent
      },
      {
        path: 'schedule-control/unit',
        component: UnitComponent
      },
      {
        path: 'schedule-control/inspection',
        component: InspectionComponent
      },
      {
        path: 'schedule-control/issues',
        component: IssuesComponent
      },
      {
        path: 'schedule-control/knowledgement',
        component: KnowledgementComponent
      },
      {
        path: 'schedule-control/notification',
        component: NotificationComponent
      },
      {
        path: 'schedule-control/reports',
        component: ReportsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
})
export class AppRoutingModule { }
