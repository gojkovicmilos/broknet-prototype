import { Component, OnInit } from '@angular/core';
import { FinancialApiService } from '../financial-api.service';

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

  typed:string = "";

  constructor(private fs: FinancialApiService) { }

  ngOnInit() {
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
