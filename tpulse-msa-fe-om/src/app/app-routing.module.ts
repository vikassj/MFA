import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HelpComponent } from './components/help/help.component';
import { ReportsComponent } from './components/reports/reports.component';
import { EmptyRouteComponent } from './empty-route/empty-route.component';

const routes: Routes = [
  {
    path: 'manpower-counting',
    redirectTo: 'manpower-counting/dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AppComponent,
    children: [
    
      {
        path: 'manpower-counting/dashboard',
        component: DashboardComponent
      },
      {
        path: 'manpower-counting/reports',
        component: ReportsComponent
      },
      {
        path: 'manpower-counting/help',
        component: HelpComponent
      },
      {
        path: '**',
        component: EmptyRouteComponent
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
