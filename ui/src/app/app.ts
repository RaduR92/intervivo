import { Component } from '@angular/core';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { Main } from './layout/main/main';
import { Footer } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [Header, Sidebar, Main, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
