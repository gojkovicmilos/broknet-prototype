import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'broknet-prototype';

  private _darkTheme: Subject<boolean> = new Subject<boolean>();
  isDarkTheme = this._darkTheme.asObservable();

  constructor(private themeService: ThemeService) { }

  ngOnInit() {
    this.isDarkTheme = this.themeService.isDarkTheme;
  }
}
