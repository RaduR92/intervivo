import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styles: ':host { display: contents; }',
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
