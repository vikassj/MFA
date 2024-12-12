import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(value: string): string {
    const words = value.split(' ');

    // Iterate through the words and wrap the ones starting with '@' in <span> with blue color style
    const highlightedText = words.map((word) => {
      if (word.startsWith('@')) {
        return `<span class='primary-color'>${word}</span>`;
      } else {
        return word;
      }
    })
      .join(' ');

    return highlightedText;
  }

}
