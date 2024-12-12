import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-release-notes',
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss']
})
export class ReleaseNotesComponent implements OnInit {
  @Input() releaseNotesData: any[] = [];
  constructor(public commonService: CommonService) { }


  ngOnInit(): void {
  }

}
