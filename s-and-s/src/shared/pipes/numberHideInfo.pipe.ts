import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'numberHideInfo',
  pure: true,
})
export class hideInfoPipe implements PipeTransform {
  locale: string;
  transform(value: any, ...args: any) {
    let val: string = value + '';
    if (val && val.length >= 3) {
      val = val.slice(0, 2) + "+";
    }
    // return val;
    return value;
  }
}
