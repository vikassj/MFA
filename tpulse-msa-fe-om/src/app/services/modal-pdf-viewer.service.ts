import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ModalPdfViewerService {

  private eventSource = new BehaviorSubject<any>('');
  public events = this.eventSource.asObservable();
  public message: Message = new Message();

  constructor() {
  }

  show(name: string, url: string) {
    this.message = new Message();
    this.message.name = name;
    this.message.url = url;
    this.emitEvent(this.message);
  }

  private emitEvent(event: Message) {
    if (this.eventSource) {
      this.eventSource.next(event);
    }
  }

}

export class Message {
  name?: string;
  url?: string;
}
