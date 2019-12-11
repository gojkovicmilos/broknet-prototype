import { Component, OnInit } from '@angular/core';
import { FinancialApiService } from '../financial-api.service';
import { NewsApiService } from '../news-api.service';
import { element } from 'protractor';
import { Stock } from '../stock';
import { FirebaseService } from '../firebase.service';
import * as CanvasJS from '../../assets/canvasjs.min.js'

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.css']
})
export class TestPageComponent implements OnInit {
  links = ['All', 'Stock', 'Crypto', 'Forex'];
  activeLink = this.links[0];
  showStock = true;
  showCrypto = true;
  showForex = true;

  stocks:Stock[] = [];


  symbols = ["msft", "aapl"];

  typed:string = "";

  constructor(private fs: FinancialApiService, private ns:NewsApiService, private fbs:FirebaseService) { }

  ngOnInit() {

    this.fbs.getStocks().subscribe(actionArray =>{

      this.stocks = actionArray.map(item =>{
        return{
          id: item.payload.doc.id,
          ...item.payload.doc.data() as Stock}
          
      });

      setTimeout(()=>
        this.stocks.forEach(element => {

          this.drawChart(this.stocks.indexOf(element));
          
        

      })
      ), 2000;
      


    });

    

    


    
  }

  getTopHeadlines()
  {
    return this.ns.getTopHeadlines();
  }
  show(link: String): void {
    switch(link) {
      case "Stock":
        this.showStock = true;
        this.showCrypto = false;
        this.showForex = false;
      case "Forex":
        this.showStock = false;
        this.showCrypto = false;
        this.showForex = true;
      case "Crypto":
        this.showStock = false;
        this.showCrypto = true;
        this.showForex = false;
      case "All":
        this.showStock = true;
        this.showCrypto = true;
        this.showForex = true;
    }
    console.log(link);
      
  }

  fillDb()
  {
    this.stocks.forEach(element => {

      this.fbs.createStock(element);
      
    });
  }

  drawChart(i:number)
  {
    let dataPoints = [];
    this.stocks[i].daily.forEach(element => {

      console.log(element.close+0.0001);
      dataPoints.push({y: Math.round(element.close)});
      
    });

    let chart = new CanvasJS.Chart("chartContainer" + i, {
      zoomEnabled: true,
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Daily Close"
      },
      data: [
      {
        type: "line",                
        dataPoints: dataPoints
      }]
    });
      
    chart.render();

  }

  getSector()
  {
    return this.fs.getSector();
  }

  getStockQuote(symbol:string)
  {
    console.log(this.stocks[0].daily);
  }

  searchSymbol(query:string)
  {
    return this.fs.searchSymbol(query);
  }

  
  getStockDaily(symbol:string)
  {
    return this.fs.getStockDaily(symbol);
  }

  getStockWeekly(symbol:string)
  {
    return this.fs.getStockWeekly(symbol);
  }

  getStockMonthly(symbol:string)
  {
    return this.fs.getStockMonthly(symbol);
  }

  
  getCryptoDaily(symbol:string, market:string)
  {
    return this.fs.getCryptoDaily(symbol, market);
  }

  getCryptoWeekly(symbol:string, market:string)
  {
    return this.fs.getCryptoWeekly(symbol, market);
  }

  getCryptoMonthly(symbol:string, market:string)
  {
    return this.fs.getCryptoMonthly(symbol, market);
  }
  
  
  getForexDaily(fromSymbol:string, toSymbol:string)
  {
    return this.fs.getForexDaily(fromSymbol, toSymbol);
  }

  getForexWeekly(fromSymbol:string, toSymbol:string)
  {
    return this.fs.getForexWeekly(fromSymbol, toSymbol);
  }

  getForexMonthly(fromSymbol:string, toSymbol:string)
  {
    return this.fs.getForexMonthly(fromSymbol, toSymbol);
  }
 

}
