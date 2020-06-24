import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {

  @ViewChild('drawer', {static: false}) drawer: any;
  drawerClosed: boolean = true;

  cred:string = "";

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, public authService: AuthService, public fb: AngularFireModule) {}

  ngOnInit() {


    try {
      
      this.cred = localStorage.getItem('cred');
      console.log(this.cred);
      
    } catch (error) {
      
    }
    

    
  }


  toggle(): void {
    this.drawerClosed = !this.drawerClosed;
  }


}
