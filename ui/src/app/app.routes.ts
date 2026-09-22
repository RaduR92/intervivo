import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'interviews',
    loadComponent: () =>
      import('./features/interviews/interviews-list/interviews-list').then(
        (m) => m.InterviewsList,
      ),
    children: [
      {
        path: 'new',
        loadComponent: () =>
          import('./features/interviews/interview-add/interview-add').then(
            (m) => m.InterviewAdd,
          ),
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
];
