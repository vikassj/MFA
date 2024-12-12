import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'dropdownFideInfo',
  pure: true,
})
export class DropdownHideInfoPipe implements PipeTransform {
  locale!: string;
  transform(value: any, ...args: any) {
    let val: string = value + '';
    if (val && val.length >= 16) {
      val = val.slice(0, 15) + "...";
    }
    return val;
  }
}
