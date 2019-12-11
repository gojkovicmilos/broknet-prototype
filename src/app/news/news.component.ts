import { Component, OnInit } from '@angular/core';
import { NewsApiService } from '../news-api.service';
import { Article } from 'src/article';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {

  constructor(private ns:NewsApiService) { }

  articles:Article[] = [];

  ngOnInit() {

    this.articles = JSON.parse(localStorage.getItem('articles'));
    console.log(this.articles);
  }

}
