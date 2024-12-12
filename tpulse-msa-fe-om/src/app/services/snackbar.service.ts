import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SnackbarService {

  private eventSource: Subject<Message> = new Subject<Message>();
  public events: Observable<Message> = this.eventSource.asObservable();
  public message: Message = new Message();

  constructor() { }

  show(message: string, error: boolean, warning: boolean, confirmation: boolean, information: boolean) {
    this.message = new Message();
    this.message.msg = message;
    this.message.error = error;
    this.message.warning = warning;
    this.message.confirmation = confirmation;
    this.message.information = information;
    if (this.message.msg != undefined)
      this.emitEvent(this.message);
    var list = document.getElementsByTagName('bs-modal-backdrop');
    for (var i = 0; i < list.length - 1; i++) {
      list[i].removeAttribute('class');
    }
  }

  hide() {
    this.message = new Message();
    this.message.msg = '';
    this.message.error = false;
    this.message.warning = false;
    this.message.confirmation = false;
    this.message.information = false;
    this.emitEvent(this.message);
  }

  private emitEvent(event: Message) {
    if (this.eventSource) {
      this.eventSource.next(event);
    }
  }

}

export class Message {
  msg?: string;
  error?: boolean;
  warning?: boolean;
  confirmation?: boolean;
  information?: boolean;
}
