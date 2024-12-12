import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ActivateLoginService implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    let url = window.location.href;
    let isLoggedIn: any = sessionStorage.getItem('loggedIn');
    if (sessionStorage.getItem('token') && JSON.parse(isLoggedIn)) {  //&& !url.includes('two-fact-auth')
      return true;
    }
    else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }

}
