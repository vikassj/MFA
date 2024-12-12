import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'incidentStatus'
})
export class IncidentStatusPipe implements PipeTransform {
  locale: string;
  transform(value: any, ...args: any) {
    let val = value;
    val = val.split('_').join(' ')
    val = this.toUpper(val)
    return val;
  }
  toUpper(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function(word) {
            if(word=="capa"){
              return word.toUpperCase()
            }else{
              return word[0].toUpperCase() + word.substr(1);

            }
        })
        .join(' ');
     }

}
