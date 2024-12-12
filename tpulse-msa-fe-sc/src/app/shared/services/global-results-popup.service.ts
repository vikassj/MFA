import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalResultsPopupService {

  private isPopupVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isPopupVisible$: Observable<boolean> = this.isPopupVisibleSubject.asObservable();

  showPopup() {
    this.isPopupVisibleSubject.next(true);
  }

  closePopup() {
    this.isPopupVisibleSubject.next(false);
  }

  getPopupState(): boolean {
    return this.isPopupVisibleSubject.value;
  }

}
