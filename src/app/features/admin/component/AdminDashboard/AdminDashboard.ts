import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AdminDashboardService } from '../../Service/adminDashboard.service';
import { DashboardSummaryDTO } from '../../../../core/DTOs/AdminDashboard/DashboardSummary.dto';

Chart.register(...registerables);

@Component({
  selector: 'app-AdminDashboard',
  standalone: false,
  templateUrl: './AdminDashboard.html',
  styleUrls: ['./AdminDashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  dashboardData!: DashboardSummaryDTO;
  selectedYear = new Date().getFullYear();
  selectedMonth = 0;
  totalCourses?: number;
  totalStudents?: number;
  totalPayments?: number;
  pendingPayments?: number;
  totalEarning?: number;

  constructor(private dashboardService: AdminDashboardService) { }

 ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Only attempt to render charts once data is ready
    if (this.dashboardData) {
      this.renderCharts();
    }
  }

  private renderCharts() {
    this.loadEnrollmentTrendChart();
    this.loadPaymentOverviewChart();
    this.loadKPI();
  }
loadDashboard(): void {
    const year = new Date().getFullYear();
    const month = 0;
    this.dashboardService.getDashboardSummary(year, month).subscribe({
      next: (data) => {
        this.dashboardData = data;
        setTimeout(() => this.renderCharts(), 0);
      },
      error: (err) => console.error('Dashboard load error:', err)
    });
  }


loadKPI(): void {
  if (!this.dashboardData?.summary) return;

  const summary = this.dashboardData.summary;

  this.totalCourses = summary.totalCourses;
  this.totalStudents = summary.totalStudents;
  this.totalPayments = summary.totalPayments;
  this.pendingPayments = summary.pendingPayments;
  this.totalEarning = summary.totalEarning;
}

  loadEnrollmentTrendChart(): void {
    if (!this.dashboardData?.charts?.enrollmentTrend) return;

    const trend = this.dashboardData.charts.enrollmentTrend;
    const ctx = document.getElementById('enrollmentTrendChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: trend.labels,
        datasets: [{
          label: 'Enrollments',
          data: trend.data,
          borderColor: '#4B6CB7',
          backgroundColor: 'rgba(75,108,183,0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

loadPaymentOverviewChart(): void {
  if (!this.dashboardData?.charts?.paymentOverview) return;

  const payment = this.dashboardData.charts.paymentOverview;
  const ctx = document.getElementById('paymentOverviewChart') as HTMLCanvasElement;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: payment.labels,
      datasets: [
        {
          label: 'Received',
          data: payment.received,
          backgroundColor: '#4B6CB7'
        },
        {
          label: 'Pending',
          data: payment.pending,
          backgroundColor: '#FFD93D'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}


  onYearChange(year: number): void {
    this.selectedYear = year;
    this.loadDashboard();
  }

  onMonthChange(month: number): void {
    this.selectedMonth = month;
    this.loadDashboard();
  }
}
