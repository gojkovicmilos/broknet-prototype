import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
let FinancialApiService = class FinancialApiService {
    constructor(http, fbs) {
        this.http = http;
        this.fbs = fbs;
        this.stocks = [];
        this.daily = {};
        this.stockData = {};
        this.stockDaily = [];
        this.ids = [];
        this.fbStock = { id: "", low: 0, high: 0, symbol: "", open: 0, price: 0,
            volume: 0, changePercent: "", latestDay: "", prevClose: 0, change: 0, daily: [], weekly: [], monthly: [] };
        this.newStock = {};
    }
    reqNewApi(symbol) {
        return ("https://api.worldtradingdata.com/api/v1/stock?symbol=" + symbol + "&api_token=sySzGtkx78DcEf17uY7ACXz1Er97WaAHDPeSIbUjcgnmyUVa42puP5mD9OGU");
    }
    reqNewApiHist(symbol) {
        return ("https://api.worldtradingdata.com/api/v1/history?symbol=" + symbol + "&date_from=2019-01-01&sort=newest&api_token=sySzGtkx78DcEf17uY7ACXz1Er97WaAHDPeSIbUjcgnmyUVa42puP5mD9OGU&date_from=2019-01-01");
    }
    reqSymbol(fun, symbol) {
        return ("https://www.alphavantage.co/query?function=" + fun +
            "&symbol=" + symbol + "&apikey=0NCCP7Q9F1OD5W8E");
    }
    reqCompare(fun, fromSymbol, toSymbol) {
        return ("https://www.alphavantage.co/query?function=" + fun +
            "&from_symbol=" + fromSymbol + "&to_symbol=" + toSymbol + "&apikey=0NCCP7Q9F1OD5W8E");
    }
    reqCurrency(cur1, cur2) {
        return ("https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency="
            + cur1 + "&to_currency=" + cur2 + "&apikey=0NCCP7Q9F1OD5W8E");
    }
    reqCrypto(fun, symbol, market) {
        return ("https://www.alphavantage.co/query?function=" + fun +
            "&symbol=" + symbol + "&market=" + market + "&apikey=0NCCP7Q9F1OD5W8E");
    }
    refresh(list) {
        list.forEach(element => {
            this.getStockQuote(element.symbol);
        });
    }
    addStockToFirebase(symbol) {
        this.http.get(this.reqSymbol("GLOBAL_QUOTE", symbol)).subscribe(res => {
            this.newStock.symbol = res['Global Quote'][['01. symbol']];
            this.newStock.open = res['Global Quote'][['02. open']];
            this.newStock.high = res['Global Quote'][['03. high']];
            this.newStock.low = res['Global Quote'][['04. low']];
            this.newStock.price = res['Global Quote'][['05. price']];
            this.newStock.volume = res['Global Quote'][['06. volume']];
            this.newStock.latestDay = res['Global Quote'][['07. latest trading day']];
            this.newStock.prevClose = res['Global Quote'][['08. previous close']];
            this.newStock.change = res['Global Quote'][['09. change']];
            this.newStock.changePercent = res['Global Quote'][['10. change percent']];
            this.newStock.daily = [];
            this.fbStock = this.newStock;
            this.newStock = {};
            this.http.get(this.reqSymbol("TIME_SERIES_DAILY", symbol)).subscribe(res => {
                this.stockData = res["Time Series (Daily)"];
                Object.keys(this.stockData).forEach(element => {
                    this.ids.push(element);
                });
                let i = 0;
                Object.values(this.stockData).forEach(element => {
                    this.daily.id = this.ids[i];
                    this.daily.open = element["1. open"];
                    this.daily.high = element["2. high"];
                    this.daily.low = element["3. low"];
                    this.daily.close = element["4. close"];
                    this.daily.volume = element["5. volume"];
                    this.fbStock.daily.push(this.daily);
                    this.daily = {};
                    i++;
                });
                console.log(this.fbStock);
                this.fbs.createStock(this.fbStock);
                this.fbStock = { id: "", low: 0, high: 0, symbol: "", open: 0, price: 0,
                    volume: 0, changePercent: "", latestDay: "", prevClose: 0, change: 0, daily: [], weekly: [], monthly: [] };
            });
        });
    }
    getStockDaily(symbol) {
        this.http.get(this.reqSymbol("TIME_SERIES_DAILY", symbol)).subscribe(res => {
            this.stockData = res["Time Series (Daily)"];
            Object.keys(this.stockData).forEach(element => {
                this.ids.push(element);
            });
            let j = -1;
            this.stocks.forEach(element => {
                if (element.symbol.toLowerCase() == symbol.toLowerCase()) {
                    j = this.stocks.indexOf(element);
                }
            });
            let i = 0;
            Object.values(this.stockData).forEach(element => {
                this.daily.id = this.ids[i];
                this.daily.open = element["1. open"];
                this.daily.high = element["2. high"];
                this.daily.low = element["3. low"];
                this.daily.close = element["4. close"];
                this.daily.volume = element["5. volume"];
                this.stockDaily.push(this.daily);
                this.stocks[j].daily.push(this.daily);
                this.daily = {};
                i++;
            });
            this.stockDaily = [];
            localStorage.setItem("stocks", JSON.stringify(this.stocks));
        });
    }
    getStockDailyAdjusted(symbol) {
        this.http.get(this.reqSymbol("TIME_SERIES_DAILY_ADJUSTED", symbol)).subscribe(res => {
            console.log(res);
        });
    }
    getStockWeekly(symbol) {
        this.http.get(this.reqSymbol("TIME_SERIES_WEEKLY", symbol)).subscribe(res => {
            console.log(res);
        });
    }
    getStockWeeklyAdjusted(symbol) {
        this.http.get(this.reqSymbol("TIME_SERIES_WEEKLY_ADJUSTED", symbol)).subscribe(res => {
            console.log(res);
        });
    }
    getStockMonthly(symbol) {
        this.http.get(this.reqSymbol("TIME_SERIES_MONTHLY", symbol)).subscribe(res => {
            console.log(res);
        });
    }
    getStockMonthlyAdjusted(symbol) {
        this.http.get(this.reqSymbol("TIME_SERIES_MONTHLY_ADJUSTED", symbol)).subscribe(res => {
            console.log(res);
        });
    }
    getStockQuote(symbol) {
        this.http.get(this.reqSymbol("GLOBAL_QUOTE", symbol)).subscribe(res => {
            this.newStock.symbol = res['Global Quote'][['01. symbol']];
            this.newStock.open = res['Global Quote'][['02. open']];
            this.newStock.high = res['Global Quote'][['03. high']];
            this.newStock.low = res['Global Quote'][['04. low']];
            this.newStock.price = res['Global Quote'][['05. price']];
            this.newStock.volume = res['Global Quote'][['06. volume']];
            this.newStock.latestDay = res['Global Quote'][['07. latest trading day']];
            this.newStock.prevClose = res['Global Quote'][['08. previous close']];
            this.newStock.change = res['Global Quote'][['09. change']];
            this.newStock.changePercent = res['Global Quote'][['10. change percent']];
            this.newStock.daily = [];
            this.stocks.push(this.newStock);
            this.newStock = {};
        });
    }
    searchSymbol(query) {
        this.http.get("https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + query + "&apikey=0NCCP7Q9F1OD5W8E").subscribe(res => {
            console.log(res);
        });
    }
    getSector() {
        this.http.get("https://www.alphavantage.co/query?function=SECTOR&apikey=0NCCP7Q9F1OD5W8E").subscribe(res => {
            console.log(res);
        });
    }
    getCryptoDaily(symbol, market) {
        this.http.get(this.reqCrypto("DIGITAL_CURRENCY_DAILY", symbol, market)).subscribe(res => {
            console.log(res);
        });
    }
    getCryptoWeekly(symbol, market) {
        this.http.get(this.reqCrypto("DIGITAL_CURRENCY_WEEKLY", symbol, market)).subscribe(res => {
            console.log(res);
        });
    }
    getCryptoMonthly(symbol, market) {
        this.http.get(this.reqCrypto("DIGITAL_CURRENCY_MONTHLY", symbol, market)).subscribe(res => {
            console.log(res);
        });
    }
    getExchangeRate(cur1, cur2) {
        this.http.get(this.reqCurrency(cur1, cur2)).subscribe(res => {
            console.log(res);
        });
    }
    getForexDaily(fromSymbol, toSymbol) {
        this.http.get(this.reqCompare("FX_DAILY", fromSymbol, toSymbol)).subscribe(res => {
            console.log(res);
        });
    }
    getForexWeekly(fromSymbol, toSymbol) {
        this.http.get(this.reqCompare("FX_WEEKLY", fromSymbol, toSymbol)).subscribe(res => {
            console.log(res);
        });
    }
    getForexMonthly(fromSymbol, toSymbol) {
        this.http.get(this.reqCompare("FX_MONTHLY", fromSymbol, toSymbol)).subscribe(res => {
            console.log(res);
        });
    }
    getNewApi(symbol) {
        this.http.get(this.reqNewApi(symbol)).subscribe(res => {
            let stock;
            stock = res["data"];
            stock = stock[0];
            this.http.get(this.reqNewApiHist(symbol)).subscribe(res => {
                stock.history = res["history"];
                console.log(stock);
                this.fbs.createStock(stock);
            });
        });
    }
};
FinancialApiService = tslib_1.__decorate([
    Injectable({
        providedIn: 'root'
    })
], FinancialApiService);
export { FinancialApiService };
//# sourceMappingURL=financial-api.service.js.map