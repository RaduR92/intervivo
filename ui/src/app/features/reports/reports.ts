import { Component } from '@angular/core';
import { UIChart } from '@openng/optimus-ui/chart';
import type { ChartData, ChartOptions } from 'chart.js';

interface StatTile {
  label: string;
  value: string;
  colorClass: string;
}

interface OutcomeSlice {
  label: string;
  value: number;
  dotClass: string;
  textClass: string;
  hex: string;
}

interface CandidateScore {
  rank: number;
  name: string;
  score: number;
  sessions: number;
}

const TICK_COLOR = '#94a3b8';
const GRID_COLOR = 'rgba(148, 163, 184, 0.2)';

const BLUE = '#3b82f6';
const EMERALD = '#059669';
const ORANGE = '#ea580c';
const BLUE_STRONG = '#2563eb';

@Component({
  selector: 'app-reports',
  imports: [UIChart],
  templateUrl: './reports.html',
})
export class Reports {
  protected readonly stats: StatTile[] = [
    { label: 'Total Sessions', value: '15', colorClass: 'text-color' },
    {
      label: 'Completed',
      value: '10',
      colorClass: 'text-emerald-600',
    },
    { label: 'Avg Score', value: '8.0', colorClass: 'text-blue-600' },
    { label: 'Hire Rate', value: '90%', colorClass: 'text-emerald-600' },
  ];

  protected readonly outcomes: OutcomeSlice[] = [
    {
      label: 'Strong Hire',
      value: 3,
      dotClass: 'bg-blue-600',
      textClass: 'text-blue-600',
      hex: BLUE_STRONG,
    },
    {
      label: 'Hire',
      value: 6,
      dotClass: 'bg-emerald-600',
      textClass: 'text-emerald-600',
      hex: EMERALD,
    },
    {
      label: 'Hold',
      value: 1,
      dotClass: 'bg-orange-600',
      textClass: 'text-orange-600',
      hex: ORANGE,
    },
  ];

  protected readonly candidateScores: CandidateScore[] = [
    { rank: 1, name: 'Jordan', score: 9, sessions: 1 },
    { rank: 2, name: 'Sarah', score: 8.5, sessions: 2 },
    { rank: 3, name: 'David', score: 8.5, sessions: 2 },
    { rank: 4, name: 'Priya', score: 8, sessions: 2 },
    { rank: 5, name: 'Emma', score: 8, sessions: 2 },
    { rank: 6, name: 'Alex', score: 7.5, sessions: 3 },
    { rank: 7, name: 'Marcus', score: 6, sessions: 2 },
  ];

  protected readonly publishedFeedback = 8;
  protected readonly totalFeedback = 10;

  protected readonly sessionVolumeData: ChartData<'bar'> = {
    labels: ['Behavioral', 'Technical', 'Sys Design', 'Case Study', 'Culture'],
    datasets: [
      {
        label: 'Scheduled',
        data: [4, 6, 1, 2, 2],
        backgroundColor: EMERALD,
        borderRadius: 4,
        maxBarThickness: 20,
      },
      {
        label: 'Completed',
        data: [2, 4, 1, 2, 1],
        backgroundColor: BLUE,
        borderRadius: 4,
        maxBarThickness: 20,
      },
    ],
  };

  protected readonly sessionVolumeOptions: ChartOptions<'bar'> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: TICK_COLOR },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: TICK_COLOR, stepSize: 2 },
        grid: { color: GRID_COLOR },
      },
    },
  };

  protected readonly outcomeData: ChartData<'doughnut'> = {
    labels: this.outcomes.map((o) => o.label),
    datasets: [
      {
        data: this.outcomes.map((o) => o.value),
        backgroundColor: this.outcomes.map((o) => o.hex),
        borderWidth: 0,
      },
    ],
  };

  protected readonly outcomeOptions: ChartOptions<'doughnut'> = {
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
    },
  };

  protected readonly monthlyVolumeData: ChartData<'line'> = {
    labels: ['Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Sessions',
        data: [4, 2, 5, 5],
        borderColor: BLUE,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        pointBackgroundColor: BLUE,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  protected readonly monthlyVolumeOptions: ChartOptions<'line'> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: TICK_COLOR },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: TICK_COLOR, stepSize: 2 },
        grid: { color: GRID_COLOR },
      },
    },
  };

  protected scoreColorClass(score: number): string {
    return score >= 8 ? 'bg-emerald-600' : 'bg-orange-600';
  }

  protected scoreTextClass(score: number): string {
    return score >= 8 ? 'text-emerald-600' : 'text-orange-600';
  }
}
