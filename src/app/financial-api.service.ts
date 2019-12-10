import { Injectable } from '@angular/core';

const alpha = require('alphavantage')({ key: '0NCCP7Q9F1OD5W8E' });

@Injectable({
  providedIn: 'root'
})
export class FinancialApiService {

  constructor() { }

  getIntraDay()
  {
    alpha.data.intraday(`msft`).then(data => {
      console.log(data);
    });
  }

  getBatch()
  {
    alpha.data.batch([`msft`, `aapl`]).then(data => {
      console.log(data);
    });
  }

  getForex()
  {
    alpha.forex.rate('btc', 'usd').then(data => {
      console.log(data);
    });
  }

  getCrypto()
  {
    alpha.crypto.daily('btc', 'usd').then(data => {
      console.log(data);
    });
  }

  getTechnical()
  {
    alpha.technical.sma(`msft`, `daily`, 60, `close`).then(data => {
      console.log(data);
    });
  }

  getPerformance()
  {
    alpha.performance.sector().then(data => {
      console.log(data);
    });
  }
  
}
