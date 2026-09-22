import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.html',
  styles: `
    .dot-grid {
      background-image: radial-gradient(
        rgba(255, 255, 255, 0.15) 1px,
        transparent 1px
      );
      background-size: 22px 22px;
    }
  `,
})
export class AuthLayout {}
