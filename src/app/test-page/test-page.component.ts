import { Component, OnInit } from '@angular/core';
import { NewsApiService } from '../news-api.service';
import { FirebaseService } from '../firebase.service';
import * as CanvasJS from '../../assets/canvasjs.min.js'
import {FormControl} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import { FinancialApiService } from '../financial-api.service';
import { ThemeService } from '../theme.service';

//import { setInterval } from 'timers';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.css']
})
export class TestPageComponent implements OnInit {
  myControl = new FormControl();
  links = ['All', 'Stock', 'Crypto', 'Forex'];
  activeLink = this.links[0];
  stockAmount:number = 0;

  isWaiting = {};

  isDarkTheme:boolean;



  filteredListings = [];

  parameter:string = 'Change Percentage';
  ort:string = 'desc';

  users = [];
  user = JSON.parse(localStorage.getItem('user'));
  stocks:any[] = [];

  onKey(event: any) { // without type info
    this.fs.getSymbols(this.typed).then(res => this.filteredListings = res['securities']['security'].map(listing => {return {symbol: listing.symbol, description: listing.description}}));
    // console.log(this.typed);
  }


  symbols = ["msft", "aapl"];

  typed:string = "";

  constructor(private ns:NewsApiService,private ts:ThemeService, private fs: FinancialApiService, private fbs:FirebaseService, private _snackBar: MatSnackBar) { }

  ngOnInit() {
    
    this.fbs.getStocks().subscribe(actionArray =>{

      this.stocks = actionArray.map(item =>{
        return{
            id: item.payload.doc.id,
            ...item.payload.doc.data() as {} };
          
      });
      this.fbs.getUsers().subscribe(actionArray => {
        this.users = actionArray.map(item => {
          return{
            id: item.payload.doc.id,
            ...item.payload.doc.data() as {}
          };
        });
        localStorage.setItem('users', JSON.stringify(this.users));
        this.users.forEach(user => this.isWaiting[user] = false);
      });
    });

    setTimeout(()=>
        this.stocks.forEach(element => {
          this.drawChart(this.stocks.indexOf(element));
      })
      , 2000);
      this.stocks.sort((a, b) => b.change_percentage - a.change_percentage);
    if(this.user){
      this.isDarkTheme = this.user.isDarkTheme;
      console.log(this.isDarkTheme);
    }

      

  }

 
  predictSymbol(symbol:string){


    this.isWaiting[symbol] = true;
    this.fs.getPrediction(symbol).then(res => {

      this.isWaiting[symbol] = false;
  
      this._snackBar.open(res['message'], "Got It", {
        duration: 2000,
      });
    });
    
  }

  sortStocks(parameter:string, ort:string)
  {
    if(parameter == "Change Percentage" && ort == "Descending")
    this.stocks.sort((a, b) => b.change_percentage - a.change_percentage);
    else 
    if(parameter == "Change Percentage" && ort == "Ascending")
    this.stocks.sort((a, b) => a.change_percentage - b.change_percentage);
    else 
    if(parameter == "Price" && ort == "Ascending")
    this.stocks.sort((a, b) => a.last - b.last);
    else 
    if(parameter == "Price" && ort == "Descending")
    this.stocks.sort((a, b) => b.last - a.last);
    else 
    if(parameter == "Name" && ort == "Descending")
    this.stocks.sort((a, b) => b.description - a.description);
    else 
    if(parameter == "Name" && ort == "Ascending")
    this.stocks.sort((a, b) => a.description - b.description);
    

  }

  getNewApi(symbol:string, description:string = symbol){
    this.fs.getNewApi(symbol);
    this._snackBar.open(`You just added ${description} to the watchlist!`, "Got It", {
      duration: 2000,
    });
  }

  getTopHeadlines()
  {
    return this.ns.getTopHeadlines();
  }


  addToPortfolio(symbol:string, amount: number)
  {


    let stock;
    this.stocks.forEach(x =>{
      if(x.symbol == symbol)
      stock = x;
    })

    let obj = {id: stock.id, amount:+amount, investment: +stock.last*amount};
    let arr = [];
    arr.push(obj);
    let portfolio = JSON.parse(localStorage.getItem('user')).portfolio;
    if(portfolio!= undefined && portfolio!={})
    portfolio.forEach(element => {
      if(element.id == stock.id)
      {
        arr[0].amount+=+element.amount;
        arr[0].investment+=+element.investment;
        this._snackBar.open("You just bought " + amount + " shares of " + symbol, "Got It", {
          duration: 2000,
        });
        this.fbs.addStockNotification(`User ${JSON.parse(localStorage.getItem('user')).displayName} just bought ${amount} shares of ${symbol}!`);


      }
      else {arr.push(element);
      this._snackBar.open("You just bought " + amount + " shares of " + symbol, "Got It", {
        duration: 2000,
      });
      this.fbs.addStockNotification(`User ${JSON.parse(localStorage.getItem('user')).displayName} just bought ${amount} shares of ${symbol}!`);
    };
    });

    this.fbs.updatePortfolio(JSON.parse(localStorage.getItem('user')).uid, arr);
  }

  sellStocks(symbol:string, amount: number)
  {


    let stock;
    this.stocks.forEach(x =>{
      if(x.symbol == symbol)
      stock = x;
    })

    let obj = {id: stock.id, amount:+amount*-1, investment: +stock.last*amount*-1};
    let arr = [];
    arr.push(obj);
    let portfolio = JSON.parse(localStorage.getItem('user')).portfolio;
    if(portfolio != {})
    portfolio.forEach(element => {
      if(element.id == stock.id)
      {
        arr[0].amount+=+element.amount;
        arr[0].investment+=+element.investment;
        this._snackBar.open("You just sold " + amount + " shares of " + symbol, "Got It", {
          duration: 2000,
        });
        this.fbs.addStockNotification(`User ${JSON.parse(localStorage.getItem('user')).displayName} just sold ${amount} shares of ${symbol}!`);

      }
      else{
      arr.push(element);
      this._snackBar.open("You just sold " + amount + " shares of " + symbol, "Got It", {
        duration: 2000,
      });
      this.fbs.addStockNotification(`User ${JSON.parse(localStorage.getItem('user')).displayName} just sold ${amount} shares of ${symbol}!`);
    };
        
    });

    this.fbs.updatePortfolio(JSON.parse(localStorage.getItem('user')).uid, arr);
  }

  fillDb()
  {
    this.stocks.forEach(element => {

      this.fbs.createStock(element);
      
    });
  }

 
  drawChart(i:number)
  {
    let dataPointsClose = [];
    let dataPointsOpen = [];
    let dataPointsHigh = [];
    let dataPointsLow = [];
    let dataPointsVolume = [];
    this.stocks[i].history.forEach(element => {

      dataPointsClose.push({x: new Date(element.date),y: Math.round(element.close)});
      dataPointsOpen.push({x: new Date(element.date),y: Math.round(element.open)});
      dataPointsHigh.push({x: new Date(element.date),y: Math.round(element.high)});
      dataPointsLow.push({x: new Date(element.date),y: Math.round(element.low)});
      dataPointsVolume.push({y: Math.round(element.volume)});
      
    });

    let chart = new CanvasJS.Chart("chartContainer" + i, {
      zoomEnabled: true,
      animationEnabled: true,
      exportEnabled: true,
      theme: this.isDarkTheme ? "dark1" : 'light1',
      title: {
        text: "Daily Chart"
      },
      axisX:{      
        valueFormatString: "DD-MM-YYYY" ,
        labelAngle: -50
      },
      data: [
      {
        type: "line",                
        dataPoints: dataPointsClose,
        name: "Close",
        showInLegend: true
      },
      {
        type: "line",                
        dataPoints: dataPointsOpen,
        name: "Open",
        showInLegend: true
      },
      {
        type: "line",                
        dataPoints: dataPointsHigh,
        name: "High",
        showInLegend: true
      },
      {
        type: "line",                
        dataPoints: dataPointsLow,
        name: "Low",
        showInLegend: true
      }]
    });
      
    chart.render();

  }



  isLoggedIn()
  {
    return(!(localStorage.getItem('user') == "null"))
    
  }


}
