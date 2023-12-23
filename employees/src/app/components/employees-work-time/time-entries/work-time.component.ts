import { Component, signal } from '@angular/core';
import { EmployeeService } from '../../../services/employee.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IWorkTime } from '../../../models/work-time.model';
import {
  BehaviorSubject,
  Observable,
  from,
  groupBy,
  mergeMap,
  reduce,
} from 'rxjs';
import { ISummedWorkTime } from '../../../models/summed-work-time.model';
import { MilisecondsToHoursPipe } from '../../../pipes/miliseconds-to-hours.pipe';

@Component({
  selector: 'app-work-time',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MilisecondsToHoursPipe],
  providers: [EmployeeService],
  templateUrl: './work-time.component.html',
})
export class WorkTimeComponent {
  private workTimesSubject: BehaviorSubject<IWorkTime[]>;

  workTimes$: Observable<IWorkTime[]>;

  summedWorkTimes: ISummedWorkTime[];

  constructor(private employeeService: EmployeeService) {
    this.workTimesSubject = new BehaviorSubject<IWorkTime[]>([]);
    this.workTimes$ = this.workTimesSubject.asObservable();
    this.summedWorkTimes = [];
  }

  ngOnInit(): void {
    this.initWorkTimes();
    this.groupWorkTimes();
  }

  initWorkTimes(): void {
    try {
      this.employeeService.getTimeEntries().subscribe((data: any) => {
        if (data && data.length > 0) {
          this.workTimesSubject.next(
            data.map((item: any) => {
              let workDurationCalculated: number =
                new Date(item.EndTimeUtc).getTime() -
                new Date(item.StarTimeUtc).getTime();
              return {
                id: item.Id,
                employeeName: item.EmployeeName,
                workDuration:
                  workDurationCalculated > 0 ? workDurationCalculated : 0,
              };
            })
          );
        }
      });
    } catch (err) {}
  }

  groupWorkTimes(): void {
    this.workTimes$.subscribe((timeEntriesResult) => {
      from(timeEntriesResult)
        .pipe(
          groupBy((item) => item.employeeName),
          mergeMap((group) => {
            return group.pipe(
              reduce(
                (acc, currentValue) => {
                  acc.employeeName = currentValue.employeeName;
                  acc.workDurationSummed =
                    acc.workDurationSummed + currentValue.workDuration;
                  return acc;
                },
                { employeeName: '', workDurationSummed: 0 }
              )
            );
          })
        )
        .subscribe((result) => {
          this.summedWorkTimes.push(result);
        });
    });
  }
}
