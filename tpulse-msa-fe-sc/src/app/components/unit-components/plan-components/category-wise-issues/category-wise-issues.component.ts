import { Component, OnInit } from '@angular/core';
import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';
@Component({
  selector: 'app-category-wise-issues',
  templateUrl: './category-wise-issues.component.html',
  styleUrls: ['./category-wise-issues.component.scss']
})
export class CategoryWiseIssuesComponent implements OnInit {

  issues: any[] = [];
  constructor(private activityService: ActivityMonitorService) { }

  ngOnInit(): void {
    this.getCategoryIssueData();
  }

  getCategoryIssueData() {
    this.activityService.categoryWiseIssue('DHDS').subscribe((res: any) => {
      if (res) {
        this.issues = [];
        Object.keys(res).forEach(element => {
          this.issues.push({
            'name': element,
            'count': res[element]
          })
        });
      }

    })
  }
}
