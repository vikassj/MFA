import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit {
  messages: string[] = [];
  newMessageText: string = '';
  file: any;
  @Output() dataChange = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }
  closeChat() {
    this.dataChange.emit(false);
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    // Handle the file upload logic here
  }

  sendMessage() {
    if (this.newMessageText.trim() !== '') {
      this.messages.push(this.newMessageText);
      this.newMessageText = '';
    }
  }
  onChange(event: any) {
    this.file = (event.target.files[0])
  }
  removeSelectedFile() {
    this.file = null;
  }

}
