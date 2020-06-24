import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../profileService';

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
    private ps: ProfileService,
    private fb: FormBuilder) {
    this.createForm();
  }
  userData = { displayName: "", photoURL: "", email:"" , uid:""};

  createForm() {
    this.angForm = this.fb.group({
      email: ['', Validators.required],
      displayName: ['', Validators.required],
      photoURL: ['', Validators.required]
    });
  }

  updateUser(email, displayName, photoURL) {
    this.route.params.subscribe(params => {
      this.ps.updateUser(email, displayName, photoURL, params.id);
      alert('You have succesfully changed profile information');
      this.router.navigate(['/profile']).then(() => window.location.reload());



    });
  }
  ngOnInit() {

    this.userData = JSON.parse(localStorage.getItem('user'));
    this.route.params.subscribe(params => {
      this.ps.editUser(params.id).subscribe(res => {
        this.user = res;
      });
    });
  }
}