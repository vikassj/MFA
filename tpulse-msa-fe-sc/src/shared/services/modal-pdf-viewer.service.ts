import { Injectable } from '@angular/core';
import { Subject, Observable ,BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalPdfViewerService {

  //private eventSource: Subject<Message> = new Subject<Message>();
  //public events: Observable<Message> = this.eventSource.asObservable();
  private eventSource = new BehaviorSubject<any>('');
  public events = this.eventSource.asObservable();
  public message: Message = new Message();

  constructor() {
    
   }

  show(name: string, url: string) {
    console.log('url',url)
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
