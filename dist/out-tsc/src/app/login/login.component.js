import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
let LoginComponent = class LoginComponent {
    constructor(formBuilder, us, _router, _snackBar) {
        this.formBuilder = formBuilder;
        this.us = us;
        this._router = _router;
        this._snackBar = _snackBar;
    }
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
};
LoginComponent = tslib_1.__decorate([
    Component({
        selector: 'app-login',
        templateUrl: './login.component.html',
        styleUrls: ['./login.component.css']
    })
], LoginComponent);
export { LoginComponent };
//# sourceMappingURL=login.component.js.map