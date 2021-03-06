import { Injectable, NgZone } from '@angular/core';
import { User } from './user';
import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userData: any;
  users:any[];

  constructor(public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,  
    public ngZone: NgZone)
    {
      this.afAuth.authState.subscribe(user => {
        if (user) {

          
          this.afs.collection("users").snapshotChanges().subscribe(actionArray =>{
            

            this.users = actionArray.map(item => {

              return{
                id: item.payload.doc.id,
                ... item.payload.doc.data() as {}
              }
              
            });

            this.users.forEach(res =>{
              if(res.uid == user.uid)
              this.userData = res;
            });

            localStorage.setItem('user', JSON.stringify(this.userData));

          });
          
        } else {
          localStorage.setItem('user', null);
          JSON.parse(localStorage.getItem('user'));
        }
      })

    }

    // Sign in with email/password
    SignIn(email, password) {
      return this.afAuth.auth.signInWithEmailAndPassword(email, password)
        .then((result) => {
          this.ngZone.run(() => {
            this.router.navigate(['/']);
          });
          this.SetUserData(result.user, JSON.stringify(result.credential));
        }).catch((error) => {
          window.alert(error.message)
        })
    }
  
    // Sign up with email/password
    SignUp(email, password) {
      return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
        .then((result) => {
          /* Call the SendVerificaitonMail() function when new user sign 
          up and returns promise */
          this.SendVerificationMail();
          this.SetUserData(result.user, JSON.stringify(result.credential));
        }).catch((error) => {
          window.alert(error.message)
        })
    }
  
    // Send email verfificaiton when new user sign up
    SendVerificationMail() {
      return this.afAuth.auth.currentUser.sendEmailVerification()
      .then(() => {
        this.router.navigate(['verify-email-address']);
      })
    }
  
    // Reset Forggot password
    ForgotPassword(passwordResetEmail) {
      return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      }).catch((error) => {
        window.alert(error)
      })
    }
  
    // Returns true when user is looged in and email is verified
    isLoggedIn(): boolean {
      if(!this.afAuth.auth.currentUser || localStorage.getItem('user')==='undefined'){
        return false;
      }
      else{
        // console.log(localStorage.getItem('user'))
        // return true;
          const user = JSON.parse(localStorage.getItem('user'));
          return (user !== null && user.emailVerified !== false) ? true : false;
          
        }
      
      }
  
    // Sign in with Google
    GoogleAuth() {
      return this.AuthLogin(new auth.GoogleAuthProvider());
    }
  
    // Auth logic to run auth providers
    AuthLogin(provider) {
      return this.afAuth.auth.signInWithPopup(provider)
      .then((result) => {
         this.ngZone.run(() => {
            this.router.navigate(['/']);
          })
        this.SetUserData(result.user, JSON.stringify(result.credential));
      }).catch((error) => {
        window.alert(error)
      })
    }
  
    /* Setting up user data when sign in with username/password, 
    sign up with username/password and sign in with social auth  
    provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
    SetUserData(user, cred='') {
      const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
      userRef.get().subscribe(res => {

        const userDbData = res.data();

        const userData: User = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          private: userDbData && userDbData.private ? userDbData.private : false,
          followRequests: userDbData && userDbData.followRequests ? userDbData.followRequests : [],
          followers: userDbData && userDbData.followers ? userDbData.followers : [],
          following:userDbData && userDbData.following ? userDbData.following : [],
          isDarkTheme: userDbData && userDbData.isDarkTheme ? userDbData.isDarkTheme : false,
          credential: cred
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return userRef.set(userData, {
          merge: true
        })


      });
      
    }
  
    // Sign out 
    SignOut() {
      return this.afAuth.auth.signOut().then(() => {
        localStorage.removeItem('user');
        this.router.navigate(['login']);
      })
    }



}
