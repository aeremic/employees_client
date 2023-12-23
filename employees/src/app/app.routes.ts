import { Routes } from '@angular/router';
import { EmployeesWorkTimeComponent } from './components/employees-work-time/employees-work-time.component';

export const routes: Routes = [
  { path: 'employeesworktime', component: EmployeesWorkTimeComponent },

  { path: '**', redirectTo: 'employeesworktime', pathMatch: 'full' },
];
