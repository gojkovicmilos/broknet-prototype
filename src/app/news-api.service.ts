import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Article } from 'src/article';

@Injectable({
  providedIn: 'root'
})
export class NewsApiService {

  constructor(private http:HttpClient) { }

  articles:Article[] = [];

  getTopHeadlines()
  {
    this.http.get("https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=0ddacba682974e2eb952e80e315bb170").subscribe(res =>{
      this.articles = res['articles'];
      localStorage.setItem('articles', JSON.stringify(this.articles));
      
    });

    
  }
}