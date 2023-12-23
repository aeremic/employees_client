import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'milisecondsToHours',
  standalone: true,
})
export class MilisecondsToHoursPipe implements PipeTransform {
  transform(value: number): string {
    let result: string = '';

    const msInHour = 1000 * 60 * 60;
    const hours = Math.trunc(value / msInHour);

    return hours >= 0 ? `${hours} hours` : '';
  }
}
