import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { ThemeService } from '../theme.service';
@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {

  

  @ViewChild('drawer', {static: false}) drawer: any;
  drawerClosed: boolean = true;
  cred:string = "";
  isDarkTheme;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, public authService: AuthService, public fb: AngularFireModule, private themeService: ThemeService) {}

  ngOnInit() {

      if(localStorage.getItem('user')){
      this.cred = JSON.parse(localStorage.getItem('user')).id;
      this.isDarkTheme = JSON.parse(localStorage.getItem('user')).isDarkTheme;
      this.toggleDarkTheme(this.isDarkTheme);
      }
  }

  toggleDarkTheme(isDarkTheme) {
    this.themeService.setDarkTheme(isDarkTheme);
  }


  toggle(): void {
    this.drawerClosed = !this.drawerClosed;
  }


}
