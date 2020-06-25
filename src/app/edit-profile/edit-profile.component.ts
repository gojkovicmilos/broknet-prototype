import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {






  // import { Component, OnInit } from '@angular/core';
  // import { ActivatedRoute, Router } from '@angular/router';
  // import { FormGroup,  FormBuilder,  Validators } from '@angular/forms';
  // import { ProfileService } from '../student.service';



  user: any = {};
  angForm: FormGroup;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private fbs: FirebaseService,
    private fb: FormBuilder) {
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

    
  }
  ngOnInit() {

    this.userData = JSON.parse(localStorage.getItem('user'));
  }
}