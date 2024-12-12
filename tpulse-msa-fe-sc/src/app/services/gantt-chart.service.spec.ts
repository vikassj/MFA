import { TestBed } from '@angular/core/testing';

import { GanttChartService } from './gantt-chart.service';

describe('GanttChartService', () => {
  let service: GanttChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GanttChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
