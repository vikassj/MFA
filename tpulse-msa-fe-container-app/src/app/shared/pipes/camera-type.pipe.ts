import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cameraType'
})
export class CameraTypePipe implements PipeTransform {

  transform(value: string): string {
    // Split the string by underscores and capitalize the first word and uppercase the second word
    if(value.includes("_")) {
      const words = value.split('_');
      return words[0].toUpperCase() + ' ' + words[1].charAt(0).toUpperCase() + words[1].slice(1);
    } else {
      return value.toUpperCase();
    } 
    
  }

}
