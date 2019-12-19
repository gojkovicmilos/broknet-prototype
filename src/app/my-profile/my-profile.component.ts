import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  constructor(private as: AuthService) { }

  userData = {};

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
  }

}
