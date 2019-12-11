import { Component, OnInit } from '@angular/core';
import { FinancialApiService } from '../financial-api.service';
import { NewsApiService } from '../news-api.service';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.css']
})
export class TestPageComponent implements OnInit {

  typed:string = "";

  constructor(private fs: FinancialApiService, private ns:NewsApiService) { }

  ngOnInit() {
  }

  getTopHeadlines()
  {
    return this.ns.getTopHeadlines();
  }

  getSector()
  {
    return this.fs.getSector();
  }

  getStockQuote(symbol:string)
  {
    return this.fs.getStockQuote(symbol);
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
    return this.fs.getStockDaily(symbol);
  }

  getStockMonthly(symbol:string)
  {
    return this.fs.getStockDaily(symbol);
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
