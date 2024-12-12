import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(dateString: string): string {
    if (!dateString) {
      return ''; // Return an empty string for empty or invalid date strings
    }

    const date = moment(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };

    return date.format('MMM DD, YYYY');
  }

}
