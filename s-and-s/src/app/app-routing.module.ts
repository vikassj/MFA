import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ActionsComponent } from './components/actions/actions.component';
import { HelpComponent } from './components/help/help.component';
import { HighlightsComponent } from './components/highlights/highlights.component';
import { ReportsComponent } from './components/reports/reports.component';
import { EmptyRouteComponent } from './empty-route/empty-route.component';
import { HomeComponent } from './components/home/home.component';
import { ObservationsNavContainerComponent } from './components/observations-nav-container/observations-nav-container.component';
import { NotificationComponent } from './components/notification/notification.component';
import { IncidentComponent } from './components/incident/incident.component';
import { AuditComponent } from './components/audit/audit.component';
import { StartAuditComponent } from './components/start-audit/start-audit.component';
import { ConfigureChecklistComponent } from './components/configure-checklist/configure-checklist.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: 'safety-and-surveillance',
        redirectTo: 'safety-and-surveillance/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'safety-and-surveillance/analytics',
        component: AnalyticsComponent,
      },
      {
        path: 'safety-and-surveillance/dashboard',
        component: HomeComponent,
      },
      {
        path: 'safety-and-surveillance/observations',
        component: ObservationsNavContainerComponent,
      },
      {
        path: 'safety-and-surveillance/reports',
        component: ReportsComponent,
      },
      {
        path: 'safety-and-surveillance/notification',
        component: NotificationComponent,
      },
      {
        path: 'safety-and-surveillance/help',
        component: HelpComponent,
      },
      {
        path: 'safety-and-surveillance/highlights',
        component: HighlightsComponent,
      },
      {
        path: 'safety-and-surveillance/actions',
        component: ActionsComponent,
      },
      {
        path: 'safety-and-surveillance/incidents',
        component: IncidentComponent,
      },  
      {
        path: 'safety-and-surveillance/audit',
        component: AuditComponent,
      },
      {
        path: 'safety-and-surveillance/start-audit',
        component: StartAuditComponent,
      },
      {
        path: 'safety-and-surveillance/configure-checklist',
        component: ConfigureChecklistComponent,
      },
      { path: '**', component: EmptyRouteComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
})
export class AppRoutingModule { }
