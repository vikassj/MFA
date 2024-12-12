import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-timeout',
  templateUrl: './timeout.component.html',
  styleUrls: ['./timeout.component.scss']
})
export class TimeoutComponent implements OnInit {

  @Input() countdown: number = null;

  constructor() { }

  ngOnInit() {
  }

}
