import { Component, OnInit } from '@angular/core';
import { AuthService } from "../auth.service";


@Component({
  selector: 'app-verify-email-address',
  templateUrl: './verify-email-address.component.html',
  styleUrls: ['./verify-email-address.component.css']
})
export class VerifyEmailAddressComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

}
