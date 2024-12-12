///////////////////////////////////////////////////////////////////////////////
// Filename : modal-image-viewer.service.ts
// Description : Services that is use to open image viewer in a modal
// Revision History: 
// Version  | Date        |  Change Description
// ---------------------------------------------
// 1.0      | 01-Jul-2019 |  Single Unit First Production Release
// 2.0      | 31-Jul-2019 |  Single Unit Second Production Release
// 3.0      | 01-Nov-2019 |  Multi Unit Production Release
// 4.0      | 06-Jan-2020 |  Release for Copyright
// Copyright : Detect Technologies Pvt Ltd.
///////////////////////////////////////////////////////////////////////////////

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class ModalImageViewerService {

  private eventSource: Subject<Message> = new Subject<Message>();
  public events: Observable<Message> = this.eventSource.asObservable();
  public message: Message = new Message();

  constructor() { }

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
  name: string;
  url: string;
}
