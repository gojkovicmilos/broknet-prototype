import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class FinancialApiService {

reqURL(fun:string, symbol:string)
{
  return("https://www.alphavantage.co/query?function=" + fun + "&symbol=" + symbol + "&apikey=0NCCP7Q9F1OD5W8E");
}

constructor(private http: HttpClient) { }

getData()
{
  this.http.get(this.reqURL("TIME_SERIES_DAILY", "msft")).subscribe(res =>{
    console.log(res);
  })
}




  
  
}
