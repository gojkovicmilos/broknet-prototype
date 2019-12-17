import { Injectable } from '@angular/core';
import { AngularFireAuth} from "@angular/fire/auth";
import { Observable } from 'rxjs';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private fs: AngularFireAuth) {}


signUp(email: string, password: string) {
  this.fs
    .auth
    .createUserWithEmailAndPassword(email, password)
    .then(value => {
      console.log('Success!', value);
    })
    .catch(err => {
      console.log('Something went wrong:',err.message);
    });    
  } 

logIn(email: string, password: string) {
  this.fs
    .auth
    .signInWithEmailAndPassword(email, password)
    .then(value => {
      console.log('Nice, it worked!');
      console.log(value.user.email);
    })
    .catch(err => {
      console.log('Something went wrong:',err.message);
    });
  }

  logOut() {
    this.fs.auth.signOut();
  }

  isLoggedIn() {
    let user = this.fs.auth.currentUser;
    if(user) {
      return true;
    }
    return false;
  }

}