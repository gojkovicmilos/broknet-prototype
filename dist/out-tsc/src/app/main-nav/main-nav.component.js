import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
let MainNavComponent = class MainNavComponent {
    constructor(breakpointObserver) {
        this.breakpointObserver = breakpointObserver;
        this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
            .pipe(map(result => result.matches), shareReplay());
    }
};
MainNavComponent = tslib_1.__decorate([
    Component({
        selector: 'app-main-nav',
        templateUrl: './main-nav.component.html',
        styleUrls: ['./main-nav.component.css']
    })
], MainNavComponent);
export { MainNavComponent };
//# sourceMappingURL=main-nav.component.js.map