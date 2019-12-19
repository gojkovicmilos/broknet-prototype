import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import * as CanvasJS from '../../assets/canvasjs.min.js'

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {


  stocks:any[] = [];
  filteredStocks:any[] = [];
  user = JSON.parse(localStorage.getItem('user'));

  constructor(private fbs: FirebaseService) { }

  ngOnInit() {

    this.filteredStocks = [];

    this.fbs.getStocks().subscribe(actionArray =>{

      this.stocks = actionArray.map(item =>{

          return{
            id: item.payload.doc.id,
            ...item.payload.doc.data() as {}}



          
          
      });

    let ids = this.user.portfolio.map(item => item.id);
    
    this.filteredStocks = this.stocks.filter(item => ids.includes(item.id))
    
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

  drawChart(i:number)
  {
    let dataPointsClose = [];
    let dataPointsOpen = [];
    let dataPointsHigh = [];
    let dataPointsLow = [];
    let dataPointsVolume = [];
    this.stocks[i].history.forEach(element => {

      dataPointsClose.push({y: Math.round(element.close)});
      dataPointsOpen.push({y: Math.round(element.open)});
      dataPointsHigh.push({y: Math.round(element.high)});
      dataPointsLow.push({y: Math.round(element.low)});
      dataPointsVolume.push({y: Math.round(element.volume)});
      
    });

    let chart = new CanvasJS.Chart("chartContainer" + i, {
      zoomEnabled: true,
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Daily Chart"
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

    let obj = {id: stock.id, amount:amount};
    let arr = [];
    arr.push(obj);
    let portfolio = JSON.parse(localStorage.getItem('user')).portfolio;
    if(portfolio != {})
    portfolio.forEach(element => {
      if(element.id == stock.id)
      arr[0].amount+=element.amount;
      else arr.push(element);
    });
    //console.log(JSON.parse(localStorage.getItem('user')));

    this.fbs.updatePortfolio(JSON.parse(localStorage.getItem('user')).uid, arr);
  }

}
