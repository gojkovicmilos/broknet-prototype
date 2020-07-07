import { Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FirebaseService } from './firebase.service';
import { Stock } from './stock';
import { StockData } from './stock-data';
import { element } from 'protractor';
import { elementAt } from 'rxjs/operators';
import { query } from '@angular/animations';
import { async } from '@angular/core/testing';


@Injectable({
  providedIn: 'root'
})
export class FinancialApiService 
{

  stocks:any = [];

  headerDict = {
    'Authorization': 'Bearer iFX1eNAyOxWMW9DKhNwguHF3wPnX'
  }
  
  requestOptions = {                                                                                                                                                                                 
    headers: new HttpHeaders(this.headerDict), 
  };

  daily:any = {};
  stockData:any = {};
  stockDaily:StockData[] = [];
  ids:string[] = [];
  listings:[] = [];

  fbStock:Stock = {id:"", low:0, high:0, symbol:"", open:0, price:0, 
  volume:0, changePercent:"", latestDay:"", prevClose:0, change:0, daily:[], weekly:[], monthly:[]  };

  newStock:any = {};

  

  reqNewApi(symbol:string)
  {
    //return("https://api.worldtradingdata.com/api/v1/stock?symbol=" + symbol + "&api_token=sySzGtkx78DcEf17uY7ACXz1Er97WaAHDPeSIbUjcgnmyUVa42puP5mD9OGU");
    return("https://sandbox.tradier.com/v1/markets/quotes?symbols=" + symbol);
  }

  reqNewApiHist(symbol:string)
  {
    // return("https://api.worldtradingdata.com/api/v1/history?symbol=" + symbol + "&date_from=2019-01-01&sort=newest&api_token=sySzGtkx78DcEf17uY7ACXz1Er97WaAHDPeSIbUjcgnmyUVa42puP5mD9OGU&date_from=2019-01-01");
    return("https://sandbox.tradier.com/v1/markets/history?symbol=" + symbol)
  }

  reqSymbols = (query:string) => `https://sandbox.tradier.com/v1/markets/lookup?q=${query}&types=stock`;

  


  
  

  constructor(private http: HttpClient, private fbs:FirebaseService) {

    this.fbs.getStocks().subscribe(actionArray =>{

      this.stocks = actionArray.map(item =>{
        return{
            id: item.payload.doc.id,
            ...item.payload.doc.data() as {} };
          
      });
      
   });



  }
  

  getNewApi(symbol:string)
  {
    this.http.get(this.reqNewApi(symbol), this.requestOptions).subscribe(res => {

      let stock:any;

      stock = res["quotes"]["quote"];

      this.http.get(this.reqNewApiHist(symbol), this.requestOptions).subscribe( res =>{

        
        let historyo:any = res["history"]["day"];
        stock.history = historyo;

        let matching = this.stocks.filter(item => item.symbol == stock.symbol);

        if(matching.length == 0)
        {
        console.log(stock);
        this.fbs.createStock(stock);
        }
        else
        {
          this.fbs.updateStock(matching[0].id, stock);
        }

      });

      
    });
  }

  getSymbols = async (query:string) => {

    return this.http.get(this.reqSymbols(query), this.requestOptions).toPromise()
  }

  getPrediction = async (symbol:string) => {
    const response = await this.http.get(`https://188.246.38.20:4444/single/${symbol}`).toPromise();

    console.log(response);

    return(response);
  }

  
  
}
