import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { CovidSolutionsDataService } from 'src/app/services/data.service';
import { CommonService } from 'src/app/services/common.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { LiveStreamingDataService } from '../../shared/services/data.service'
@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  selectedSideBarItem = "User Manual";
  ColumnMode = ColumnMode;
  msg: string = '';

  categoryRows: any[] = [];
  mappingRows: any[] = [];
  zoneMappingRows: any[] = [];
  releaseNotesData: any[] = [];
  userManualFound: boolean = true;
  constructor(private spinnerDataService:LiveStreamingDataService, public commonService: CommonService, private covidSolutionsDataService: CovidSolutionsDataService, private snackbarService: SnackbarService) {
  }

  ngOnInit(): void {
  }

  sideBarSelectedItem(data: any) {
    this.selectedSideBarItem = data;
    if(data == 'Release Notes'){
      this.getReleaseNotes();
    }
  }

  getReleaseNotes() {
    this.spinnerDataService.passSpinnerFlag(true, true);
    this.commonService.getReleaseNotes().subscribe(
      data => {
        this.releaseNotesData = [];
        let releaseNotesData: any = data;
        releaseNotesData.forEach(release => {
          if (release.new_feature) {
            release.new_feature_text = Object.values(release.new_feature_text);
          }
          if (release.enhancement) {
            release.enhancement_text = Object.values(release.enhancement_text);
          }
          if (release.bug_fix) {
            release.bug_fix_text = Object.values(release.bug_fix_text);
          }
          this.releaseNotesData.push(release);
        });
      },
      error => {
        this.spinnerDataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.spinnerDataService.passSpinnerFlag(false, true);
      }
    )
  }
}
