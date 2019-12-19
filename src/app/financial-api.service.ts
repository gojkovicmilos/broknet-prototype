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

  stocks:any = [];

  

  daily:any = {};
  stockData:any = {};
  stockDaily:StockData[] = [];
  ids:string[] = [];

  fbStock:Stock = {id:"", low:0, high:0, symbol:"", open:0, price:0, 
  volume:0, changePercent:"", latestDay:"", prevClose:0, change:0, daily:[], weekly:[], monthly:[]  };

  newStock:any = {};

  

  reqNewApi(symbol:string)
  {
    return("https://api.worldtradingdata.com/api/v1/stock?symbol=" + symbol + "&api_token=sySzGtkx78DcEf17uY7ACXz1Er97WaAHDPeSIbUjcgnmyUVa42puP5mD9OGU");
  }

  reqNewApiHist(symbol:string)
  {
    return("https://api.worldtradingdata.com/api/v1/history?symbol=" + symbol + "&date_from=2019-01-01&sort=newest&api_token=sySzGtkx78DcEf17uY7ACXz1Er97WaAHDPeSIbUjcgnmyUVa42puP5mD9OGU&date_from=2019-01-01");
  }

  


  
  

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
    this.http.get(this.reqNewApi(symbol)).subscribe(res => {

      let stock:any;

      stock = res["data"];


      stock = stock[0];

      this.http.get(this.reqNewApiHist(symbol)).subscribe( res =>{

        
        let historyo:any = res["history"];
        let history:any[] = [];

        let keys = Object.keys(historyo);

        keys.forEach(element =>{

          let obj = historyo[element];
          obj.date = element;
          history.push(obj);
        })
        stock.history = history;

        let matching = this.stocks.filter(item => item.symbol == stock.symbol);

        if(matching.length == 0)
        this.fbs.createStock(stock);
        else
        {
          this.fbs.updateStock(matching[0].id, stock);
        }

      });

      
    });
  }

  
  
}
