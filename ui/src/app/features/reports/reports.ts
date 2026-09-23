import { Component, OnInit, inject, signal } from '@angular/core';
import { UIChart } from '@openng/optimus-ui/chart';
import type { ChartData, ChartOptions } from 'chart.js';
import { MessageService } from '@openng/optimus-ui/api';
import { HrStatsService } from '@core/services/hr-stats.service';
import {
  InterviewType,
  InterviewStatus,
  INTERVIEW_TYPE_LABELS,
} from '@core/services/interviews.service';
import { Recommendation, RECOMMENDATION_LABELS } from '@core/services/feedback.service';
import { getApiErrorMessage } from '@core/utils/api-error.util';

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
const HIRE_GREEN = '#16a34a';
const MAYBE_AMBER = '#d97706';
const NO_HIRE_RED = '#dc2626';

const RECOMMENDATION_HEX: Record<Recommendation, string> = {
  HIRE: HIRE_GREEN,
  MAYBE: MAYBE_AMBER,
  NO_HIRE: NO_HIRE_RED,
};
const RECOMMENDATION_DOT_CLASS: Record<Recommendation, string> = {
  HIRE: 'bg-green-600',
  MAYBE: 'bg-amber-600',
  NO_HIRE: 'bg-red-600',
};
const RECOMMENDATION_TEXT_CLASS: Record<Recommendation, string> = {
  HIRE: 'text-green-600',
  MAYBE: 'text-amber-600',
  NO_HIRE: 'text-red-600',
};

@Component({
  selector: 'app-reports',
  imports: [UIChart],
  templateUrl: './reports.html',
})
export class Reports implements OnInit {
  private readonly hrStatsService = inject(HrStatsService);
  private readonly messageService = inject(MessageService);

  protected readonly loading = signal(true);

  protected readonly stats = signal<StatTile[]>([]);
  protected readonly outcomes = signal<OutcomeSlice[]>([]);
  protected readonly candidateScores = signal<CandidateScore[]>([]);
  protected readonly publishedFeedback = signal(0);
  protected readonly totalFeedback = signal(0);

  protected readonly sessionVolumeData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  protected readonly outcomeData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });
  protected readonly monthlyVolumeData = signal<ChartData<'line'>>({ labels: [], datasets: [] });

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

  protected readonly outcomeOptions: ChartOptions<'doughnut'> = {
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
    },
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

  ngOnInit(): void {
    this.hrStatsService.load().subscribe({
      next: (hr) => {
        this.stats.set([
          { label: 'Total Sessions', value: String(hr.sessionsTotal), colorClass: 'text-color' },
          { label: 'Completed', value: String(hr.completedCount), colorClass: 'text-emerald-600' },
          {
            label: 'Avg Score',
            value: hr.avgScore !== null ? hr.avgScore.toFixed(1) : '—',
            colorClass: 'text-blue-600',
          },
          {
            label: 'Hire Rate',
            value: hr.hireRate !== null ? `${hr.hireRate}%` : '—',
            colorClass: 'text-emerald-600',
          },
        ]);

        const typeValues = Object.values(InterviewType);
        this.sessionVolumeData.set({
          labels: typeValues.map((t) => INTERVIEW_TYPE_LABELS[t]),
          datasets: [
            {
              label: 'Scheduled',
              data: typeValues.map(
                (t) =>
                  hr.sessions.filter((s) => s.type === t && s.status === InterviewStatus.SCHEDULED)
                    .length,
              ),
              backgroundColor: BLUE,
              borderRadius: 4,
              maxBarThickness: 20,
            },
            {
              label: 'Completed',
              data: typeValues.map(
                (t) =>
                  hr.sessions.filter((s) => s.type === t && s.status === InterviewStatus.COMPLETED)
                    .length,
              ),
              backgroundColor: EMERALD,
              borderRadius: 4,
              maxBarThickness: 20,
            },
          ],
        });

        const outcomeSlices: OutcomeSlice[] = Object.values(Recommendation).map((r) => ({
          label: RECOMMENDATION_LABELS[r],
          value: hr.feedback.filter((f) => f.recommendation === r).length,
          dotClass: RECOMMENDATION_DOT_CLASS[r],
          textClass: RECOMMENDATION_TEXT_CLASS[r],
          hex: RECOMMENDATION_HEX[r],
        }));
        this.outcomes.set(outcomeSlices);
        this.outcomeData.set({
          labels: outcomeSlices.map((o) => o.label),
          datasets: [
            {
              data: outcomeSlices.map((o) => o.value),
              backgroundColor: outcomeSlices.map((o) => o.hex),
              borderWidth: 0,
            },
          ],
        });

        const monthCounts = new Map<string, number>();
        for (const session of hr.sessions) {
          const date = new Date(session.scheduledAt);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
        }
        const sortedMonthKeys = [...monthCounts.keys()].sort();
        this.monthlyVolumeData.set({
          labels: sortedMonthKeys.map((key) => {
            const [year, month] = key.split('-').map(Number);
            return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'short' });
          }),
          datasets: [
            {
              label: 'Sessions',
              data: sortedMonthKeys.map((key) => monthCounts.get(key) ?? 0),
              borderColor: BLUE,
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              pointBackgroundColor: BLUE,
              tension: 0.4,
              fill: true,
            },
          ],
        });

        const ratingsByCandidate = new Map<string, { name: string; ratings: number[] }>();
        for (const item of hr.feedback) {
          if (item.rating === null) continue;
          const entry = ratingsByCandidate.get(item.candidate.id) ?? {
            name: item.candidate.firstName,
            ratings: [],
          };
          entry.ratings.push(item.rating);
          ratingsByCandidate.set(item.candidate.id, entry);
        }
        const sessionCountByCandidate = new Map<string, number>();
        for (const session of hr.sessions) {
          sessionCountByCandidate.set(
            session.candidate.id,
            (sessionCountByCandidate.get(session.candidate.id) ?? 0) + 1,
          );
        }
        this.candidateScores.set(
          [...ratingsByCandidate.entries()]
            .map(([candidateId, { name, ratings }]) => ({
              candidateId,
              name,
              score: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
              sessions: sessionCountByCandidate.get(candidateId) ?? 0,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((c, index) => ({
              rank: index + 1,
              name: c.name,
              score: c.score,
              sessions: c.sessions,
            })),
        );

        this.publishedFeedback.set(hr.feedback.filter((f) => f.isPublished).length);
        this.totalFeedback.set(hr.feedback.length);

        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load reports',
          detail: getApiErrorMessage(error),
        });
      },
    });
  }

  protected scoreColorClass(score: number): string {
    return score >= 8 ? 'bg-emerald-600' : 'bg-orange-600';
  }

  protected scoreTextClass(score: number): string {
    return score >= 8 ? 'text-emerald-600' : 'text-orange-600';
  }
}
