import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Day } from '../components/date-header/date.model'

@Injectable({
  providedIn: 'root'
})
export class DatesService {
  currentYear: number;
  currentMonthIndex: number;

  constructor() {
    let date = new Date()
    this.currentYear = date.getFullYear();
    this.currentMonthIndex = date.getMonth();
   }

   public getCurrentMonth(): Day[] {
    return this.getMonth(this.currentMonthIndex, this.currentYear);
   }

   public getMonth(monthIndex: number, year: number): Day[] {
    let days = [];

    let firstday = this.createDay(1, monthIndex, year);

    //create empty days
    for (let index = 1; index < firstday.weekdayNumber; index++) {
      days.push({
        weekdayNumber: index,
        monthIndex: monthIndex,
        year: year,
      });
    }
    days.push(firstday);
    //

    let countDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    for(let i = 2; i < countDaysInMonth + 1; i++ ) {
      days.push(this.createDay(i, monthIndex, year))
    }

    return days;
   }

   public getMonthName(monthIndex: number): string {
    switch(monthIndex) {
      case 0:
        return "January";
      case 1:
        return "February";
      case 2:
        return "March";
      case 3:
        return "April";
      case 4:
        return "May";
      case 5:
        return "June";
      case 6:
        return "July";
      case 7:
        return "August";
      case 8:
        return "September";
      case 9:
        return "October";
      case 10:
        return "November";
      case 11:
        return "December";
      default:
        return "";
    }
   }

   public getWeekdayName(weekday: number): string {
    switch(weekday) {
    case 0:
      return "Sun";
    case 1:
      return "Mon";
    case 2:
      return "Tue";
    case 3:
      return "Wed";
    case 4:
      return "Thu";
    case 5:
      return "Fri";
    case 6:
      return "Sat";
    default:
      return "";
    }
   }

   public createDay(dayNumber: number, monthIndex: number, year: number) {
    let day = new Day();

    day.monthIndex = monthIndex;
    day.month = this.getMonthName(monthIndex)

    day.number = dayNumber;
    day.year = year;

    day.weekdayNumber = new Date(year, monthIndex, dayNumber).getDay();
    day.weekdayName = this.getWeekdayName(day.weekdayNumber)

    return day;
   }


}
