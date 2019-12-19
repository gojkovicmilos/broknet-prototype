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


    this.fbs.getStocks().subscribe(actionArray =>{

      this.stocks = actionArray.map(item =>{

          return{
            id: item.payload.doc.id,
            ...item.payload.doc.data()}



          
          
      });

    this.user.portfolio.forEach(element => {

      this.stocks.forEach(stock =>{
        if(stock.id == element.id)
        console.log(stock);
        this.filteredStocks.push(stock);
      });
      
    });

    //this.stocks = this.filteredStocks;

    console.log(this.filteredStocks);

      setTimeout(()=>
        this.stocks.forEach(element => {

          this.drawChart(this.stocks.indexOf(element));
          
        

      })
      ), 2000;
      


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

}
