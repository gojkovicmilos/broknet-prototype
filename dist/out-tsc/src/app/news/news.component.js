import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
let NewsComponent = class NewsComponent {
    constructor(ns, fbs) {
        this.ns = ns;
        this.fbs = fbs;
        this.articles = [];
    }
    ngOnInit() {
        this.fbs.getNews().subscribe(actionArray => {
            this.articles = actionArray.map(item => {
                return Object.assign({ id: item.payload.doc.id }, item.payload.doc.data());
            });
        });
    }
    fillDb() {
        this.articles.forEach(element => {
            this.fbs.createArticle(element);
        });
    }
};
NewsComponent = tslib_1.__decorate([
    Component({
        selector: 'app-news',
        templateUrl: './news.component.html',
        styleUrls: ['./news.component.css']
    })
], NewsComponent);
export { NewsComponent };
//# sourceMappingURL=news.component.js.map