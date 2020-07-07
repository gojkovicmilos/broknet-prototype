import { Component, OnInit } from '@angular/core';
import { NewsApiService } from '../news-api.service';
import { FirebaseService } from '../firebase.service';
import { Observable } from 'rxjs';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {

  constructor(private ns:NewsApiService, private fbs: FirebaseService, private themeService: ThemeService) { }

  isDarkTheme: Observable<boolean>;
  articles:any[] = [];
  sortedArticles:any[] = [];

  ngOnInit() {
    
    this.isDarkTheme = this.themeService.isDarkTheme;

    this.fbs.getNews().subscribe(actionArray =>{

      this.articles = actionArray.map(item =>{
        return{
          id: item.payload.doc.id,
          ...item.payload.doc.data() as {}}
          
      });

      let newHeadlines:any[] = [];
      this.ns.getTopHeadlines().subscribe(res => {
        
        
        newHeadlines = res['articles'];
        
        newHeadlines.forEach(item => {

        this.articles.forEach(article =>{
          if(item.title == article.title)
          newHeadlines.splice(newHeadlines.indexOf(item));
        });

        

      });

      newHeadlines.forEach(item => this.fbs.createArticle(item));
      this.sortedArticles = this.articles.sort((a: any, b:any ) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    });
    });
    console.log(this.isDarkTheme._isScalar)
    
  }
  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
  }
  

}
