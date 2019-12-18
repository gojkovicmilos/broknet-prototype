import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
let UserService = class UserService {
    constructor(fs) {
        this.fs = fs;
    }
    signUp(email, password) {
        this.fs
            .auth
            .createUserWithEmailAndPassword(email, password)
            .then(value => {
            console.log('Success!', value);
        })
            .catch(err => {
            console.log('Something went wrong:', err.message);
        });
    }
    logIn(email, password) {
        this.fs
            .auth
            .signInWithEmailAndPassword(email, password)
            .then(value => {
            console.log('Nice, it worked!');
            console.log(value.user.email);
        })
            .catch(err => {
            console.log('Something went wrong:', err.message);
        });
    }
    logOut() {
        this.fs.auth.signOut();
    }
    isLoggedIn() {
        let user = this.fs.auth.currentUser;
        if (user) {
            return true;
        }
        return false;
    }
};
UserService = tslib_1.__decorate([
    Injectable({
        providedIn: 'root'
    })
], UserService);
export { UserService };
//# sourceMappingURL=user.service.js.map