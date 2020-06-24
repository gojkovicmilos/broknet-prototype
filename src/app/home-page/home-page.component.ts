import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import * as CanvasJS from '../../assets/canvasjs.min.js'
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {




  @ViewChild('drawer', { static: false }) drawer: any;
  stocks: any[] = [];
  filteredStocks: any[] = [];
  user = JSON.parse(localStorage.getItem('user'));
  users :any [] = [];
  totalUserInvestment: number = 0;
  totalShareValue: number = 0;
  profit: number = 0;
  stockAmount: number = 0;


  amountMin: number = 0;
  amountMax: number = 0;
  maxInvestment: number = 0;

  drawerClosed: boolean = true;

  intervalId = null;
  constructor(private fbs: FirebaseService, private router: Router, private _snackBar: MatSnackBar) { }

  ngOnInit() {



    this.filteredStocks = [];

    this.fbs.getStocks().subscribe(actionArray => {

      this.stocks = actionArray.map(item => {

        return {
          id: item.payload.doc.id,
          ...item.payload.doc.data() as {}
        }





      });

      this.fbs.getUser(this.user.id).subscribe(res => {

        this.user = res.payload.data();
      });

      this.fbs.getUsers().subscribe(actionArray => {

        this.users = actionArray.map(item => {
  
          return {
            id: item.payload.doc.id,
            displayName : item.payload.doc.get('displayName'),
            ...item.payload.doc.data() as {}
          }

         
  
  
  
  
  
        });
        console.table(this.users);
      });
  


      this.user.portfolio.forEach(item => this.totalUserInvestment += item.investment);
      this.user.portfolio.forEach(item => this.totalShareValue += item.amount * ((this.findStockByID(item.id)).last));
      this.profit = this.totalShareValue - this.totalUserInvestment;

      this.user.portfolio.forEach(item => { if (item.amount == 0) this.user.portfolio.splice(this.user.portfolio.indexOf(item)) });


      let ids = this.user.portfolio.map(item => item.id);

      this.filteredStocks = this.stocks.filter(item => ids.includes(item.id));





      setTimeout(() =>
        this.filteredStocks.forEach(element => {

          this.drawChart(this.filteredStocks.indexOf(element));



        })
      
      this.fbs.getUser(this.user.id).subscribe(res => {
        
        this.user = res.payload.data();
      });
      
      
      this.user.portfolio.forEach(item => this.totalUserInvestment+=item.investment);
      this.user.portfolio.forEach(item => this.totalShareValue+=item.amount*((this.findStockByID(item.id)).last));
      this.profit = this.totalShareValue-this.totalUserInvestment;
      
      
      this.user.portfolio.forEach(item => {if(item.amount == 0) this.user.portfolio.splice(this.user.portfolio.indexOf(item))});
      
      
      let ids = this.user.portfolio.map(item => item.id);
      
      this.filteredStocks = this.stocks.filter(item => ids.includes(item.id));
      
      
      
      
      
      setTimeout(()=>
      this.filteredStocks.forEach(element => {
        
        this.drawChart(this.filteredStocks.indexOf(element));
        
        
        
      })
      ), 2000;



      
      
      
    });

    

    
  }

  toggle(): void {
    this.drawerClosed = !this.drawerClosed;
  }

  findByID(id) {
  
  findByID(id)
  {
    return this.user.portfolio.filter(item => item.id == id)[0];
  }

  findStockByID(id) {
    return this.stocks.filter(item => item.id == id)[0];
  }


  autoTrade(stock, min: number, max: number, maxInvestment: number, amount: number) {
  
  autoTrade(stock, min: number, max: number, maxInvestment: number, amount: number)
  {
    this.intervalId = setInterval(() => {

      if (stock.last < min && ((this.findInvestment(stock) + amount * stock.last) < maxInvestment)) {
        this.addToPortfolio(stock.symbol, amount);
        console.log("Bought " + amount + " shares of" + stock.symbol);
      }
      else if (stock.last > max && ((this.findInvestment(stock) - amount * stock.last) > 0)) {
        this.sellStocks(stock.symbol, amount);
        console.log("Sold " + amount + " shares of" + stock.symbol);
      }

    }, 1000);
  }

  stopAutoTrade() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  findInvestment(stock): number {
    let investment: number = 0;
    this.user.portfolio.forEach(item => { if (item.id == stock.id) investment = item.investment });

    return investment;
  }



  drawChart(i: number) {
    let dataPointsClose = [];
    let dataPointsOpen = [];
    let dataPointsHigh = [];
    let dataPointsLow = [];
    let dataPointsVolume = [];
    this.filteredStocks[i].history.forEach(element => {

      dataPointsClose.push({ x: new Date(element.date), y: Math.round(element.close) });
      dataPointsOpen.push({ x: new Date(element.date), y: Math.round(element.open) });
      dataPointsHigh.push({ x: new Date(element.date), y: Math.round(element.high) });
      dataPointsLow.push({ x: new Date(element.date), y: Math.round(element.low) });
      dataPointsVolume.push({ x: new Date(element.date), y: Math.round(element.volume) });

    });

    let chart = new CanvasJS.Chart("chartContainer" + i, {
      zoomEnabled: true,
      animationEnabled: true,
      exportEnabled: true,
      theme: "dark2",
      title: {
        text: "Daily Chart"
      },
      axisX: {
        valueFormatString: "DD-MM-YYYY",
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

  isLoggedIn() {
    return (!(localStorage.getItem('user') == "null"))

  }
  addToPortfolio(symbol: string, amount: number) {


    let stock;
    this.stocks.forEach(x => {
      if (x.symbol == symbol)
        stock = x;
    })

    let obj = { id: stock.id, amount: +amount, investment: +stock.last * amount };
    let arr = [];
    arr.push(obj);
    let portfolio = JSON.parse(localStorage.getItem('user')).portfolio;
    if (portfolio != undefined && portfolio != {})
      portfolio.forEach(element => {
        if (element.id == stock.id) {
          arr[0].amount += +element.amount;
          arr[0].investment += +element.investment;
          this._snackBar.open("You just bought " + amount + " shares of " + symbol, "Got It", {
            duration: 2000,
          });

        }
        else {
          arr.push(element);
          this._snackBar.open("You just bought " + amount + " shares of " + symbol, "Got It", {
            duration: 2000,
          });
        }
      });
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
      else
      { 
        arr.push(element);
        this._snackBar.open("You just bought " + amount + " shares of " + symbol, "Got It", {
          duration: 2000,
        });
        this.fbs.addStockNotification(`User ${JSON.parse(localStorage.getItem('user')).displayName} just bought ${amount} shares of ${symbol}!`);

      }
    });
    //console.log(JSON.parse(localStorage.getItem('user')));

    this.fbs.updatePortfolio(JSON.parse(localStorage.getItem('user')).uid, arr);
    this.totalUserInvestment += obj.investment;
    this.totalShareValue += obj.investment;
    this.user.portfolio.forEach(item => this.totalUserInvestment += item.investment);
    this.user.portfolio.forEach(item => this.totalShareValue += item.amount * ((this.findStockByID(item.id)).price));
    this.profit = this.totalShareValue - this.totalUserInvestment;
  }

  sellStocks(symbol: string, amount: number) {


    let stock;
    this.stocks.forEach(x => {
      if (x.symbol == symbol)
        stock = x;
    })

    let obj = { id: stock.id, amount: +amount * -1, investment: +stock.last * amount * -1 };
    let arr = [];
    arr.push(obj);
    let portfolio = JSON.parse(localStorage.getItem('user')).portfolio;
    if (portfolio != {})
      portfolio.forEach(element => {
        if (element.id == stock.id) {
          arr[0].amount += +element.amount;
          arr[0].investment += +element.investment;
          this._snackBar.open("You just sold " + amount + " shares of " + symbol, "Got It", {
            duration: 2000,
          });
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
        else {
          arr.push(element);
          this._snackBar.open("You just sold " + amount + " shares of " + symbol, "Got It", {
            duration: 2000,
          });
        }
      });
      }
      else
      { 
        arr.push(element);
        this._snackBar.open("You just sold " + amount + " shares of " + symbol, "Got It", {
          duration: 2000,
        });
        this.fbs.addStockNotification(`User ${JSON.parse(localStorage.getItem('user')).displayName} just sold ${amount} shares of ${symbol}!`);
      } 
    });

    this.fbs.updatePortfolio(JSON.parse(localStorage.getItem('user')).uid, arr);
    this.totalUserInvestment = 0;
    this.totalShareValue = 0;
    this.user.portfolio.forEach(item => this.totalUserInvestment += item.investment);
    this.user.portfolio.forEach(item => this.totalShareValue += item.amount * ((this.findStockByID(item.id)).price));
    this.profit = this.totalShareValue - this.totalUserInvestment;
  }








}
