import { Routes } from '@angular/router';
import { candidateGuard, hrGuard } from '@core/guards/role.guard';

export const routes: Routes = [
  // TODO: remove this once auth logic decides where to land the user
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  {
    path: 'auth',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password').then(
            (m) => m.ForgotPassword,
          ),
      },
    ],
  },
  {
    path: 'candidate',
    canActivate: [candidateGuard],
    loadComponent: () =>
      import('./layout/candidate-shell/candidate-shell').then(
        (m) => m.CandidateShell,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/candidate/dashboard/dashboard').then(
            (m) => m.CandidateDashboard,
          ),
      },
      {
        path: 'interviews',
        loadComponent: () =>
          import('./features/candidate/interviews/interviews').then(
            (m) => m.CandidateInterviews,
          ),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./features/candidate/feedback/feedback').then(
            (m) => m.CandidateFeedback,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  {
    path: '',
    canActivate: [hrGuard],
    loadComponent: () =>
      import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'candidates',
        loadComponent: () =>
          import(
            './features/candidates/candidates-list/candidates-list'
          ).then((m) => m.CandidatesList),
        children: [
          {
            path: 'new',
            loadComponent: () =>
              import(
                './features/candidates/candidate-add/candidate-add'
              ).then((m) => m.CandidateAdd),
          },
        ],
      },
      {
        path: 'candidates/:id',
        loadComponent: () =>
          import(
            './features/candidates/candidate-detail/candidate-detail'
          ).then((m) => m.CandidateDetail),
      },
      {
        path: 'interviews',
        loadComponent: () =>
          import(
            './features/interviews/interviews-list/interviews-list'
          ).then((m) => m.InterviewsList),
        children: [
          {
            path: 'new',
            loadComponent: () =>
              import(
                './features/interviews/interview-add/interview-add'
              ).then((m) => m.InterviewAdd),
          },
        ],
      },
      {
        path: 'interviews/:id',
        loadComponent: () =>
          import(
            './features/interviews/interview-detail/interview-detail'
          ).then((m) => m.InterviewDetail),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile').then((m) => m.Profile),
      },
    ],
  },
];
