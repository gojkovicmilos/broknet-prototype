import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseService } from './firebase.service';
import { Stock } from './stock';
import { StockData } from './stock-data';
import { element } from 'protractor';
import { elementAt } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class FinancialApiService 
{

  stocks:Stock[] = [];

  

  daily:any = {};
  stockData:any = {};
  stockDaily:StockData[] = [];
  ids:string[] = [];

  newStock:any = {};

  reqSymbol(fun:string, symbol:string)
  {
    return("https://www.alphavantage.co/query?function=" + fun + 
      
          "&symbol=" + symbol + "&apikey=0NCCP7Q9F1OD5W8E");
  }

  reqCompare(fun:string, fromSymbol:string, toSymbol: string)
  {
    return("https://www.alphavantage.co/query?function=" + fun + 
      
          "&from_symbol=" + fromSymbol + "&to_symbol=" + toSymbol + "&apikey=0NCCP7Q9F1OD5W8E");
  }

  reqCurrency(cur1:string, cur2:string)
  {
    return("https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency="
    
          + cur1 + "&to_currency=" + cur2 + "&apikey=0NCCP7Q9F1OD5W8E");
  }

  reqCrypto(fun:string, symbol:string, market:string)
  {
    return("https://www.alphavantage.co/query?function=" + fun + 
      
          "&symbol=" + symbol + "&market=" + market + "&apikey=0NCCP7Q9F1OD5W8E");
  }



  constructor(private http: HttpClient, private fbs:FirebaseService) { }

  getStockDaily(symbol:string)
  {
    this.http.get(this.reqSymbol("TIME_SERIES_DAILY", symbol)).subscribe(res =>{

      this.stockData = res["Time Series (Daily)"];

      Object.keys(this.stockData).forEach(element => {
        this.ids.push(element);
        
      });

      let j = -1;

      this.stocks.forEach(element => {

        if(element.symbol.toLowerCase() == symbol.toLowerCase())
        {
          j = this.stocks.indexOf(element);
        }
        
      });

      let i = 0;
      
      Object.values(this.stockData).forEach(element => {
        
        this.daily.id = this.ids[i];
        this.daily.open = element["1. open"] as number;
        this.daily.high = element["2. high"] as number;
        this.daily.low = element["3. low"] as number;
        this.daily.close = element["4. close"] as number;
        this.daily.volume = element["5. volume"] as number;
        
        
        this.stockDaily.push(this.daily as StockData);

        this.stocks[j].daily.push(this.daily as StockData);

        this.daily = {};
        i++;
        
      });

      
      this.stockDaily = [];
      console.log(this.stocks);
    });

    
    
  }


  getStockDailyAdjusted(symbol:string)
  {
    this.http.get(this.reqSymbol("TIME_SERIES_DAILY_ADJUSTED", symbol)).subscribe(res =>{
      console.log(res);
    })
  }

  getStockWeekly(symbol:string)
  {
    this.http.get(this.reqSymbol("TIME_SERIES_WEEKLY", symbol)).subscribe(res =>{
      console.log(res);
    })
  }

  getStockWeeklyAdjusted(symbol:string)
  {
    this.http.get(this.reqSymbol("TIME_SERIES_WEEKLY_ADJUSTED", symbol)).subscribe(res =>{
      console.log(res);
    })
  }

  getStockMonthly(symbol:string)
  {
    this.http.get(this.reqSymbol("TIME_SERIES_MONTHLY", symbol)).subscribe(res =>{
      console.log(res);
    })
  }

  getStockMonthlyAdjusted(symbol:string)
  {
    this.http.get(this.reqSymbol("TIME_SERIES_MONTHLY_ADJUSTED", symbol)).subscribe(res =>{
      console.log(res);
    })
  }

  getStockQuote(symbol:string)
  {
    this.http.get(this.reqSymbol("GLOBAL_QUOTE", symbol)).subscribe(res =>{
      this.newStock.symbol = res['Global Quote'][['01. symbol']];
      this.newStock.open = res['Global Quote'][['02. open']] as number;
      this.newStock.high = res['Global Quote'][['03. high']]as number;
      this.newStock.low = res['Global Quote'][['04. low']]as number;
      this.newStock.price = res['Global Quote'][['05. price']]as number;
      this.newStock.volume = res['Global Quote'][['06. volume']]as number;
      this.newStock.latestDay = res['Global Quote'][['07. latest trading day']];
      this.newStock.prevClose = res['Global Quote'][['08. previous close']]as number;
      this.newStock.change = res['Global Quote'][['09. change']]as number;
      this.newStock.changePercent = res['Global Quote'][['10. change percent']];
      this.newStock.daily = [];
      this.stocks.push(this.newStock as Stock);
      this.newStock = {};
      console.log(this.stocks);


      
    });
    
  }

  searchSymbol(query:string)
  {
    this.http.get("https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + query + "&apikey=0NCCP7Q9F1OD5W8E").subscribe(res =>{
      console.log(res);
    })
  }

  getSector()
  {
    this.http.get("https://www.alphavantage.co/query?function=SECTOR&apikey=0NCCP7Q9F1OD5W8E").subscribe(res =>{
      console.log(res);
    })
  }

  getCryptoDaily(symbol:string, market:string)
  {
    this.http.get(this.reqCrypto("DIGITAL_CURRENCY_DAILY", symbol, market)).subscribe(res =>{
      console.log(res);
    })
  }

  getCryptoWeekly(symbol:string, market:string)
  {
    this.http.get(this.reqCrypto("DIGITAL_CURRENCY_WEEKLY", symbol, market)).subscribe(res =>{
      console.log(res);
    })
  }

  getCryptoMonthly(symbol:string, market:string)
  {
    this.http.get(this.reqCrypto("DIGITAL_CURRENCY_MONTHLY", symbol, market)).subscribe(res =>{
      console.log(res);
    })
  }

  getExchangeRate(cur1:string, cur2:string)
  {
    this.http.get(this.reqCurrency(cur1, cur2)).subscribe(res =>{
      console.log(res);
    })
  }

  getForexDaily(fromSymbol:string, toSymbol:string)
  {
    this.http.get(this.reqCompare("FX_DAILY", fromSymbol, toSymbol)).subscribe(res =>{
      console.log(res);
    })
  }

  getForexWeekly(fromSymbol:string, toSymbol:string)
  {
    this.http.get(this.reqCompare("FX_WEEKLY", fromSymbol, toSymbol)).subscribe(res =>{
      console.log(res);
    })
  }

  getForexMonthly(fromSymbol:string, toSymbol:string)
  {
    this.http.get(this.reqCompare("FX_MONTHLY", fromSymbol, toSymbol)).subscribe(res =>{
      console.log(res);
    })
  }



  
  
}
