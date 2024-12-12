import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusFilter'
})
export class StatusFilterPipe implements PipeTransform {

  transform(masterRecords: any[], statusOptions: any[]): any {
    if (statusOptions?.length === 0) {
      return masterRecords;
    }
    else {
      return masterRecords.filter(item => statusOptions?.indexOf(item.isOpen) > -1);
    }
  }

}
