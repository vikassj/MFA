import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { ErrorComponent } from './shared/components/error/error.component';
import { HelpComponent } from './components/help/help.component';
import { APP_BASE_HREF } from '@angular/common';
import { EmptyRouteComponent } from './empty-route/empty-route.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: 'live-streaming',
        redirectTo: 'live-streaming/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'live-streaming/dashboard',
        component: DashboardComponent
      },
      {
        path: 'live-streaming/help',
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
