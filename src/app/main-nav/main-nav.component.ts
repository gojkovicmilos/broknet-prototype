import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { ThemeService } from '../theme.service';
import { FirebaseService } from '../firebase.service';
@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {

  

  @ViewChild('drawer', {static: false}) drawer: any;
  drawerClosed: boolean = true;
  cred:string = "";
  isDarkTheme:boolean = false;
  id:string= '';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, public authService: AuthService, public fb: AngularFireAuth, private themeService: ThemeService, private fbs:FirebaseService) {}

  ngOnInit() {

    

      if(localStorage.getItem('user')){
        this.id = JSON.parse(localStorage.getItem('user')).id;
        this.fbs.getUser(JSON.parse(localStorage.getItem('user')).id).subscribe(res => {

          const user = res.payload.data();
          this.cred = JSON.parse(localStorage.getItem('user')).email;
          this.isDarkTheme = user['isDarkTheme'];
          this.toggleDarkTheme(this.isDarkTheme, JSON.parse(localStorage.getItem('user')).id);
        })
      
      }
  }

  toggleDarkTheme(isDarkTheme: boolean, uid:string='') {
    console.log(isDarkTheme, uid);
    if(uid!=''){
      this.fbs.updateUser(uid, {isDarkTheme: isDarkTheme});
    }
    this.themeService.setDarkTheme(isDarkTheme);
  };

  // toggleDarkTheme(isDarkTheme: boolean){
  //   this.fbs.updateUser()
  // }


  toggle(): void {
    this.drawerClosed = !this.drawerClosed;
  }


}
