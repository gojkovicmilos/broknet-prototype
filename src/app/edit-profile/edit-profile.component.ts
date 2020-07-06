import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  user: any = {};
  angForm: FormGroup;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private fbs: FirebaseService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar) {
    this.createForm();
  }
  userData = { displayName: "",  email:"" , uid:""};

  createForm() {
    this.angForm = this.fb.group({
      email: ['', Validators.required],
      displayName: ['', Validators.required]
    });
  }

  updateUser(email, displayName) {

    const user = {email: email, displayName: displayName}
    this.fbs.updateUser(JSON.parse(localStorage.getItem('user'))['id'], user);
    this.openSnackBar();
    setTimeout(() => {
      this.router.navigate(["users"]);
  }, 500);
  }
  ngOnInit() {

    this.userData = JSON.parse(localStorage.getItem('user'));
  }

  openSnackBar() {
    this._snackBar.open("You have successfully changed your credentials", "", {
      duration: 2000,
    });
  }
}