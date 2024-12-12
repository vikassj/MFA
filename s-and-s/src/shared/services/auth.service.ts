import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';

import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements HttpInterceptor {

  constructor(private router: Router, private commonService: CommonService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.includes('.enc')) {
      if (sessionStorage.getItem('token')) {
        req = req.clone({
          setHeaders: {
            Authorization: 'Token ' + sessionStorage.getItem('token'),
          }
        });
      }
    }
    return next.handle(req).pipe(
      tap((ev: HttpEvent<any>) => {
        if (ev instanceof HttpResponse) {
          //Do whatever you want to with the response
        }
      }),
      catchError((response: any) => {
        if (response instanceof HttpErrorResponse) {
          // Console messages to see the response error can be logged here
          if (response.status == 401 || response.status == 403 || response.status == 404) {
            // let url: any = sessionStorage.getItem('url');
            // let apiUrl: any = sessionStorage.getItem('apiUrl');
            // let wsUrl: any = sessionStorage.getItem('websocketUrl');
            // localStorage.clear();
            // sessionStorage.clear();
            // sessionStorage.setItem('url', url);
            // sessionStorage.setItem('apiUrl', apiUrl);
            // sessionStorage.setItem('wsUrl', wsUrl);
            // this.router.navigate(['auth/logout']);
            if((sessionStorage.getItem('userLoggedIn') == 'false') || !sessionStorage.getItem('userLoggedIn')) {
              window.dispatchEvent(new CustomEvent('userNotAuthenticated'))
              sessionStorage.clear();
            } 
          }
        //   else {
        //     // Generic errors like poor connection can be logged here
        //   }
        }
        return throwError(response);
      }));
  }

}
