import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  formGroup: FormGroup;
  constructor(private formBuilder: FormBuilder, private us:UserService, private _router: Router, private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
    });
  }


  getError(el) {
    switch (el) {
      case 'user':
        if (this.formGroup.get('username').hasError('required')) {
          return 'Username required';
        }
        break;
      case 'pass':
        if (this.formGroup.get('password').hasError('required')) {
          return 'Password required';
        }
        break;
      default:
        return '';
    }
  }

  onSubmit(post) {
    this.us.logIn(post.username, post.password); 
    this._router.navigate(['']);
    this.formGroup.reset();
    
  
  }


}
