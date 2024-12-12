import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { GlobalResultsPopupService } from '../../services/global-results-popup.service';

@Component({
  selector: 'app-global-results-popup',
  templateUrl: './global-results-popup.component.html',
  styleUrls: ['./global-results-popup.component.scss']
})
export class GlobalResultsPopupComponent implements OnInit {

  popupVisible = false;
  @Input() popupData: any[] = [];
  @Input() showKeys: any[] = [];
  @Output() selectedOption: EventEmitter<any> = new EventEmitter();


  constructor(private globalResultsPopupService: GlobalResultsPopupService) { }


  ngOnInit() {
    this.globalResultsPopupService.isPopupVisible$.subscribe((isVisible) => {
      this.popupVisible = isVisible;
    });
  }

  onOptionSelect(selectedOption) {
    this.selectedOption.emit(selectedOption);
    this.globalResultsPopupService.closePopup();
  }

  returnClasses(element) {
    if (Object.keys(element).indexOf('results') > -1) {
      return 'cursorDisabled greyFont';
    }
    else {
      return 'cursorPointer';
    }
  }

  closePopup(){
    setTimeout(()=>{
      this.globalResultsPopupService.closePopup();
    }, 1000)
  }

}
