import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar, type NavItem } from '../sidebar/sidebar';
import { Main } from '../main/main';
import { Footer } from '../footer/footer';

const CANDIDATE_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'pi pi-home', route: '/candidate/dashboard' },
  { label: 'Interviews', icon: 'pi pi-users', route: '/candidate/interviews' },
  { label: 'Feedback', icon: 'pi pi-comments', route: '/candidate/feedback' },
  { label: 'My Profile', icon: 'pi pi-user', route: '/candidate/profile' },
];

@Component({
  selector: 'app-candidate-shell',
  imports: [Header, Sidebar, Main, Footer],
  templateUrl: '../shell/shell.html',
})
export class CandidateShell {
  protected readonly navItems = CANDIDATE_NAV_ITEMS;
}
