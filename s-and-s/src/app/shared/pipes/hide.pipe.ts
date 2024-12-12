import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'numberHideInfoPipe',
  pure: true,
})
export class HideInfoPipeTransform implements PipeTransform {
  locale: string;
  transform(value: any, ...args: any) {
    let val = value;
    if (val && val > 9999) {
      val = 9999 + "+";
    }
    return val;
  }
}

@Pipe({
  name: 'textHideInfoPipe',
  pure: true,
})
export class TextHideInfoPipeTransform implements PipeTransform {
  locale: string;
  transform(value: any, ...args: any) {
    let val:string = value + '';
    if (val && val.length > 4) {
      val = val.slice(0, 4) + "...";
    }
    return val;
  }
}
