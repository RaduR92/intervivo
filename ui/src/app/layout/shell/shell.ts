import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar, type NavItem } from '../sidebar/sidebar';
import { Main } from '../main/main';
import { Footer } from '../footer/footer';

const HR_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
  { label: 'Candidates', icon: 'pi pi-id-card', route: '/candidates' },
  { label: 'Interviews', icon: 'pi pi-users', route: '/interviews' },
  { label: 'Reports', icon: 'pi pi-chart-bar', route: '/reports' },
  { label: 'My Profile', icon: 'pi pi-user', route: '/profile' },
];

@Component({
  selector: 'app-shell',
  imports: [Header, Sidebar, Main, Footer],
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly navItems = HR_NAV_ITEMS;
}
