import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taggedHideInfo',
  pure: true,
})
export class TaggedHideInfoPipe implements PipeTransform {
  locale: string = '';
  transform(value: any, ...args: any) {
    let val: string = value + '';
    if (val && val.length >= 10) {
      val = val.slice(0, 9) + "...";
    }
    return val;
  }
}

@Pipe({
  name: 'hideInfo',
  pure: true,
})
export class HideInfoPipe implements PipeTransform {
  locale: string = '';
  transform(value: any, ...args: any) {
    let val: string = value + '';
    if (val && val.length >= 20) {
      val = val.slice(0, 19) + "...";
    }
    return val;
  }
}
@Pipe({
  name: 'dropdownFideInfo',
  pure: true,
})
export class DropdownHideInfoPipe implements PipeTransform {
  locale: string = '';
  transform(value: any, ...args: any) {
    let val: string = value + '';
    if (val && val.length >= 15) {
      val = val.slice(0, 14) + "...";
    }
    return val;
  }
}


@Pipe({
  name: 'numberHideInfo',
  pure: true,
})
export class hideInfoPipe implements PipeTransform {
  locale: string = '';
  transform(value: any, ...args: any) {
    let val: string = value + '';
    if (val && val.length >= 4) {
      val = val.slice(0, 3) + "+";
    }
    return val;
  }
}

@Pipe({ name: 'replaceNegativeSymbol' })
export class ReplaceUnderscorePipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.replace(/-/g, " ") : value;
  }
}
