import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Main } from '../main/main';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-shell',
  imports: [Header, Sidebar, Main, Footer],
  templateUrl: './shell.html',
})
export class Shell {}
