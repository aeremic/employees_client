import { Component } from '@angular/core';
import { WorkTimeComponent } from './time-entries/work-time.component';

@Component({
  selector: 'app-employees-work-time',
  standalone: true,
  imports: [WorkTimeComponent],
  templateUrl: './employees-work-time.component.html',
})
export class EmployeesWorkTimeComponent {}
