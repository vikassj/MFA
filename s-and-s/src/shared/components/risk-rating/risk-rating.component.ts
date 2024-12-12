import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-risk-rating',
  templateUrl: './risk-rating.component.html',
  styleUrls: ['./risk-rating.component.css']
})
export class RiskRatingComponent implements OnInit {

  @Input() riskRatingLevels: any[] = [];
  @Input() selectedRating: number = 0;
  @Input() disabled: boolean = true;
  @Output() emitSelectedRating = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  onRatingSelect(selectedRating) {
    if (!this.disabled) {
      this.selectedRating = selectedRating;
      this.emitSelectedRating.emit(selectedRating);
    }
  }

}
