import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import * as CanvasJS from '../../assets/canvasjs.min.js'
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {


  stocks:any[] = [];
  filteredStocks:any[] = [];
  user = JSON.parse(localStorage.getItem('user'));
  totalUserInvestment:number = 0;
  totalShareValue:number = 0;
  profit:number = 0;

  constructor(private fbs: FirebaseService, private router:Router) { }

  ngOnInit() {

    this.filteredStocks = [];

    this.fbs.getStocks().subscribe(actionArray =>{

      this.stocks = actionArray.map(item =>{

          return{
            id: item.payload.doc.id,
            ...item.payload.doc.data() as {}}



          
          
      });

    this.fbs.getUser(this.user.id).subscribe(res => {

      this.user = res.payload.data();
    });

    let ids = this.user.portfolio.map(item => item.id);
    
    this.filteredStocks = this.stocks.filter(item => ids.includes(item.id));
    this.user.portfolio.forEach(item => this.totalUserInvestment+=item.investment);
    this.user.portfolio.forEach(item => this.totalShareValue+=item.amount*((this.findStockByID(item.id)).price));
    this.profit = this.totalShareValue-this.totalUserInvestment;
    //console.log(this.filteredStocks);
    

      setTimeout(()=>
        this.filteredStocks.forEach(element => {

          this.drawChart(this.filteredStocks.indexOf(element));
          
        

      })
      ), 2000;
      


    });

  }

  findByID(id)
  {
    return this.user.portfolio.filter(item => item.id == id)[0];
  }

  findStockByID(id)
  {
    return this.stocks.filter(item => item.id == id)[0];
  }

  

  drawChart(i:number)
  {
    let dataPointsClose = [];
    let dataPointsOpen = [];
    let dataPointsHigh = [];
    let dataPointsLow = [];
    let dataPointsVolume = [];
    this.filteredStocks[i].history.forEach(element => {

      dataPointsClose.push({x: new Date(element.date), y: Math.round(element.close)});
      dataPointsOpen.push({x: new Date(element.date), y: Math.round(element.open)});
      dataPointsHigh.push({x: new Date(element.date), y: Math.round(element.high)});
      dataPointsLow.push({x: new Date(element.date), y: Math.round(element.low)});
      dataPointsVolume.push({x: new Date(element.date), y: Math.round(element.volume)});
      
    });

    let chart = new CanvasJS.Chart("chartContainer" + i, {
      zoomEnabled: true,
      animationEnabled: true,
      exportEnabled: true,
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

  addToPortfolio(symbol:string, amount: number)
  {


    let stock;
    this.stocks.forEach(x =>{
      if(x.symbol == symbol)
      stock = x;
    })

    let obj = {id: stock.id, amount:amount, investment: +stock.price*amount};
    let arr = [];
    arr.push(obj);
    let portfolio = JSON.parse(localStorage.getItem('user')).portfolio;
    if(portfolio != {})
    portfolio.forEach(element => {
      if(element.id == stock.id)
      {
        arr[0].amount+=element.amount;
        arr[0].investment+=element.investment;

      }
      else arr.push(element);
    });
    //console.log(JSON.parse(localStorage.getItem('user')));

    this.fbs.updatePortfolio(JSON.parse(localStorage.getItem('user')).uid, arr);
    this.user.portfolio.forEach(item => this.totalUserInvestment+=item.investment);
    this.user.portfolio.forEach(item => this.totalShareValue+=item.amount*((this.findStockByID(item.id)).price));
  }

}
