import { Component, Input,EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
@Component({
  selector: 'app-view-attachments',
  templateUrl: './view-attachments.component.html',
  styleUrls: ['./view-attachments.component.scss']
})
export class ViewAttachmentsComponent implements OnInit,OnChanges {
  toggle_pop_up: boolean = false
  @Input() booleanDataTrue: any;
  @Input() totalImages:any;
  @Output() booleanDataFalse = new EventEmitter()
  selectedImage:any;
  constructor() {}
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.toggle_pop_up = this.booleanDataTrue; 
    this.selectedImage = this.totalImages[0]
  }
  getSelectedImage(image){
    this.selectedImage = image
  }
  toggle() {
    this.toggle_pop_up = !this.toggle_pop_up
    if(this.toggle_pop_up == false){
      this.booleanDataFalse.emit(false)
    }
  }
}
