import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: false
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date, format: string = 'short'): string {
    if (!value) return '';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (format === 'short') {
      return date.toLocaleDateString();
    } else if (format === 'full') {
      return date.toLocaleString();
    }
    
    return date.toISOString();
  }
}
