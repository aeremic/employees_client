import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  from,
  groupBy,
  map,
  mergeMap,
  reduce,
} from 'rxjs';
import { ISummedWorkTime } from '../../models/summed-work-time.model';
import { IWorkTime } from '../../models/work-time.model';
import { MilisecondsToHoursPipe } from '../../pipes/miliseconds-to-hours.pipe';
import { EmployeeService } from '../../services/employee.service';
import { ISharedWorkTime } from '../../models/shared-work-time.model';

@Component({
  selector: 'app-employees-work-time',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MilisecondsToHoursPipe],
  providers: [EmployeeService],
  templateUrl: './employees-work-time.component.html',
})
export class EmployeesWorkTimeComponent {
  private workTimesSubject: BehaviorSubject<IWorkTime[]>;
  private summedWorkTimesSubject: BehaviorSubject<ISummedWorkTime[]>;

  workTimes$: Observable<IWorkTime[]>;
  summedWorkTimes$: Observable<ISummedWorkTime[]>;

  sharedWorkTime: ISharedWorkTime[];
  chart: any;

  constructor(private employeeService: EmployeeService) {
    this.workTimesSubject = new BehaviorSubject<IWorkTime[]>([]);
    this.summedWorkTimesSubject = new BehaviorSubject<ISummedWorkTime[]>([]);

    this.workTimes$ = this.workTimesSubject.asObservable();
    this.summedWorkTimes$ = this.summedWorkTimesSubject.asObservable();

    this.sharedWorkTime = [];
  }

  ngOnInit(): void {
    this.initWorkTimes();

    this.calculateSummedWorkTimes();
    this.calculateChartData();
  }

  initWorkTimes(): void {
    this.employeeService.getTimeEntries().subscribe((data: any) => {
      if (data && data.length > 0) {
        this.workTimesSubject.next(
          data
            .filter((item: any) => item && item.Id && item.EmployeeName)
            .map((item: any) => {
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
  }

  calculateSummedWorkTimes(): void {
    this.workTimes$.subscribe((timeEntriesResult) => {
      let summedWorkTimes: ISummedWorkTime[] = [];
      from(timeEntriesResult)
        .pipe(
          groupBy((item) => item.employeeName),
          mergeMap((group) => {
            return group.pipe(
              reduce(
                (acc, currentValue) => {
                  acc.employeeName = currentValue.employeeName;
                  acc.workDurationSum =
                    acc.workDurationSum + currentValue.workDuration;
                  return acc;
                },
                {
                  employeeName: '',
                  workDurationSum: 0,
                }
              )
            );
          })
        )
        .subscribe((result) => {
          summedWorkTimes.push(result);
        });

      this.summedWorkTimesSubject.next(summedWorkTimes);
    });
  }

  calculateChartData(): void {
    this.summedWorkTimes$.subscribe((summedWorkTimesResult) => {
      const calculatedChartData: any[] = [];
      const workDurationsSum = summedWorkTimesResult.reduce(
        (acc, currentValue) => {
          return acc + currentValue.workDurationSum;
        },
        0
      );

      from(summedWorkTimesResult)
        .pipe(
          map((item) => {
            return {
              employeeName: item.employeeName,
              workDurationShared:
                (item.workDurationSum / workDurationsSum) * 100,
            };
          })
        )
        .subscribe((result) => {
          calculatedChartData.push(result);
        });

      this.sharedWorkTime = calculatedChartData;
      if (this.sharedWorkTime.length > 0) {
        this.createChart();
      }
    });
  }

  createChart() {
    this.chart = new Chart('workTimeSharedChart', {
      type: 'doughnut',
      data: {
        labels: this.sharedWorkTime.map((item: ISharedWorkTime) => {
          return item.employeeName;
        }),
        datasets: [
          {
            data: this.sharedWorkTime.map((item: ISharedWorkTime) => {
              return item.workDurationShared;
            }),
            backgroundColor: this.sharedWorkTime.map(
              (_: ISharedWorkTime, index: number) => {
                return `rgb(${155 + index * 20}, ${55 + index * 5}, ${
                  100 + index * 5
                })`;
              }
            ),
          },
        ],
      },
    });
  }
}
