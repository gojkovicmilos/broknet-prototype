import { Component, OnInit } from '@angular/core';
import { NewsApiService } from '../news-api.service';
import { Article } from 'src/article';
import { element } from 'protractor';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {

  constructor(private ns:NewsApiService, private fbs: FirebaseService) { }

  articles:Article[] = [];

  ngOnInit() {

    this.fbs.getNews().subscribe(actionArray =>{

      this.articles = actionArray.map(item =>{
        return{
          id: item.payload.doc.id,
          ...item.payload.doc.data() as Article}
          
      });
    });
    
  }

  fillDb()
  {
    this.ns.getTopHeadlines();
    let newArticles:Article[] = JSON.parse(localStorage.getItem('articles'));
    newArticles.forEach(element =>{
      this.articles.forEach(elementOld => {

        if(elementOld.url == element.url)
        newArticles.splice(newArticles.indexOf(elementOld));
        
      });
    });

    newArticles.forEach(element => {
      
      this.fbs.createArticle(element);
    });
  }

}
