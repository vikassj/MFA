import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(date: string, ...args: string[]): unknown {
    let [pastFormat] =args
    let year = date?.slice(0, 4)
    let day = date?.slice(8, 10)
    let month = date?.slice(5, 7)
    let monthName;
    if (month == '01') {
      monthName = 'Jan';
    } else if (month == '02') {
      monthName = 'Feb';
    } else if (month == '03') {
      monthName = 'Mar';
    } else if (month == '04') {
      monthName = 'Apr';
    } else if (month == '05') {
      monthName = 'May';
    } else if (month == '06') {
      monthName = 'Jun';
    } else if (month == '07') {
      monthName = 'Jul';
    } else if (month == '08') {
      monthName = 'Aug';
    } else if (month == '09') {
      monthName = 'Sep';
    } else if (month == '10') {
      monthName = 'Oct';
    } else if (month == '11') {
      monthName = 'Nov';
    } else if (month == '12') {
      monthName = 'Dec';
    }

    return day+'-'+monthName+'-'+year
  }

}
