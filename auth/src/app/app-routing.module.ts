import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmptyRouteComponent } from './empty-route/empty-route.component';
import { APP_BASE_HREF } from '@angular/common';
import { SignInComponent } from './sign-in/sign-in.component';
import { NotificationComponent } from './notification/notification.component';
// import { SignInComponent } from './sign-in/sign-in.component';
// import { SignUpComponent } from './sign-up/sign-up.component';
// import { ProfileComponent } from './profile/profile.component';


const routes: Routes = [

  {
    path: "cognito-auth/sign-in",
    component: SignInComponent
  },
  {
    path: "cognito-auth/notification",
    component: NotificationComponent
  },  
  {
    path: "**",
    redirectTo: "cognito-auth/sign-in",
    pathMatch: "full",
  }
  // {
  //   path: 'profile',
  //   component: ProfileComponent,
  // },
  // {
  //   path: 'signIn',
  //   component: SignInComponent,
  // },
  // {
  //   path: 'signUp',
  //   component: SignUpComponent,
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  // providers: [
  //   { provide: APP_BASE_HREF, useValue: '/' }
  // ],
})
export class AppRoutingModule { }
