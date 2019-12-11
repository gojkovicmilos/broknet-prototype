import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NewsApiService {

  constructor(private http:HttpClient) { }

  getTopHeadlines()
  {
    this.http.get("https://newsapi.org/v2/top-headlines?category=business&apiKey=0ddacba682974e2eb952e80e315bb170").subscribe(res =>{
      console.log(res);
    });
  }
}
