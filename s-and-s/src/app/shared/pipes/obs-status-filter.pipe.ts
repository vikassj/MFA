import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'obsStatusFilter'
})
export class ObsStatusFilterPipe implements PipeTransform {

  transform(masterRecords: any[], status: string): any {
    if (status.length === 0) {
      return masterRecords;
    }
    else {
      return (status === 'openClose') ? masterRecords.filter(item => item.is_open.toLowerCase().includes('open') || item.is_open.toLowerCase().includes('close')) : masterRecords.filter(item => item.is_open.toLowerCase().includes(status));
    }
  }

}
