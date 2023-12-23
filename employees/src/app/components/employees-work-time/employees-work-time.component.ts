import { Component } from '@angular/core';
import { WorkTimeComponent } from './time-entries/work-time.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-employees-work-time',
  standalone: true,
  imports: [WorkTimeComponent],
  templateUrl: './employees-work-time.component.html',
})
export class EmployeesWorkTimeComponent {
  public chart: any;

  createChart() {
    this.chart = new Chart('MyChart', {
      type: 'doughnut', //this denotes tha type of chart
      data: {
        labels: ['VueJs', 'EmberJs', 'ReactJs', 'Angular'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            data: [40, 20, 80, 10],
          },
        ],
      },
    });
  }

  ngOnInit(): void {
    this.createChart();
  }
}
