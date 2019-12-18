import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
let NewsApiService = class NewsApiService {
    constructor(http) {
        this.http = http;
        this.articles = [];
    }
    getTopHeadlines() {
        this.http.get("https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=0ddacba682974e2eb952e80e315bb170").subscribe(res => {
            this.articles = res['articles'];
            localStorage.setItem('articles', JSON.stringify(this.articles));
        });
    }
};
NewsApiService = tslib_1.__decorate([
    Injectable({
        providedIn: 'root'
    })
], NewsApiService);
export { NewsApiService };
//# sourceMappingURL=news-api.service.js.map