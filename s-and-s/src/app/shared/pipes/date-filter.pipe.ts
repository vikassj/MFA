import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFilter'
})
export class DateFilterPipe implements PipeTransform {

  transform(masterRecords: any[], selectedDate: string): any {
    if (selectedDate === '') {
      return masterRecords;
    }
    else {
      return masterRecords.filter(item => item.date === selectedDate);
    }
  }

}
