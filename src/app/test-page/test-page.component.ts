import { Component, OnInit } from '@angular/core';
import { FinancialApiService } from '../financial-api.service';
import { NewsApiService } from '../news-api.service';
import { Stock } from '../stock';
import { FirebaseService } from '../firebase.service';
import * as CanvasJS from '../../assets/canvasjs.min.js'
import { Listing } from '../listing';
import {FormControl} from '@angular/forms';
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
 


  listings:Listing[] = this.convertToListings();

  filteredListings:Listing[] = [];

  stocks:any[] = [];

  onKey(event: any) { // without type info
    this.filterListings();
    console.log(this.typed);
  }


  symbols = ["msft", "aapl"];

  typed:string = "";

  constructor(private fs: FinancialApiService, private ns:NewsApiService, private fbs:FirebaseService) { }

  ngOnInit() {
    
    this.fbs.getStocks().subscribe(actionArray =>{

      this.stocks = actionArray.map(item =>{
        return{
            id: item.payload.doc.id,
            ...item.payload.doc.data() as {} };
          
      });

      setTimeout(()=>
        this.stocks.forEach(element => {
          this.drawChart(this.stocks.indexOf(element));
          //console.log(this.stocks[0].history);  
      })
      ), 2000;

      setInterval(() => this.stocks.forEach(item => {this.fs.getNewApi(item.symbol); console.log(item.symbol)}), 600000);
    });

    

  }



  filterListings()
  {
    this.filteredListings = []
    this.listings.forEach(element => {

      if(element.companyName.toLowerCase().includes(this.typed) || element.symbol.toLowerCase().includes(this.typed) )
        this.filteredListings.push(element);
      
    });

    
  }

  getNewApi(symbol:string)
  {
    return this.fs.getNewApi(symbol);
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

    let obj = {id: stock.id, amount:+amount, investment: +stock.price*amount};
    let arr = [];
    arr.push(obj);
    let portfolio = JSON.parse(localStorage.getItem('user')).portfolio;
    if(portfolio!= undefined && portfolio!={})
    portfolio.forEach(element => {
      if(element.id == stock.id)
      {
        arr[0].amount+=+element.amount;
        arr[0].investment+=+element.investment;

      }
      else arr.push(element);
    });
    //console.log(JSON.parse(localStorage.getItem('user')));

    this.fbs.updatePortfolio(JSON.parse(localStorage.getItem('user')).uid, arr);
  }

  sellStocks(symbol:string, amount: number)
  {


    let stock;
    this.stocks.forEach(x =>{
      if(x.symbol == symbol)
      stock = x;
    })

    let obj = {id: stock.id, amount:+amount*-1, investment: +stock.price*amount*-1};
    let arr = [];
    arr.push(obj);
    let portfolio = JSON.parse(localStorage.getItem('user')).portfolio;
    if(portfolio != {})
    portfolio.forEach(element => {
      if(element.id == stock.id)
      {
        arr[0].amount+=+element.amount;
        arr[0].investment+=+element.investment;

      }
      else arr.push(element);
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
      theme: "dark1",
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

  
 

    convertToListings():Listing[]
    {

      let csv = `ACT Symbol,Company Name
      A,"Agilent Technologies, Inc. Common Stock"
      AA,Alcoa Inc. Common Stock
      AA$B,Alcoa Inc. Depository Shares Representing 1/10th Preferred Convertilble Class B Series 1
      AAC,"AAC Holdings, Inc. Common Stock"
      AAN,"Aaron's, Inc. Common Stock"
      AAP,Advance Auto Parts Inc Advance Auto Parts Inc W/I
      AAT,"American Assets Trust, Inc. Common Stock"
      AAV,Advantage Oil & Gas Ltd  Ordinary Shares
      AB,Allianceberstein Holding L.P.  Units
      ABB,ABB Ltd Common Stock
      ABBV,AbbVie Inc. Common Stock
      ABC,AmerisourceBergen Corporation (Holding Co) Common Stock
      ABEV,Ambev S.A. American Depositary Shares (Each representing 1 Common Share)
      ABG,Asbury Automotive Group Inc Common Stock
      ABM,ABM Industries Incorporated Common Stock
      ABR,Arbor Realty Trust Common Stock
      ABR$A,Arbor Realty Trust Preferred Series A
      ABR$B,Arbor Realty Trust Cumulative Redeemable Preferred Series B
      ABR$C,Arbor Realty Trust Cumulative Redeemable Preferred Series C
      ABRN,Arbor Realty Trust 7.375% Senior Notes due 2021
      ABT,Abbott Laboratories Common Stock
      ABX,Barrick Gold Corporation Common Stock
      ACC,American Campus Communities Inc Common Stock
      ACCO,Acco Brands Corporation Common Stock
      ACE,Ace Limited Common Stock
      ACG,Alliancebernstein Income Fund
      ACH,Aluminum Corporation of China Limited American Depositary Shares
      ACI,"Arch Coal, Inc. Common Stock"
      ACM,AECOM Common Stock
      ACMP,"Access Midstream Partners, L.P. Common Units Representing Limited Partner Interests"
      ACN,Accenture plc. Class A Ordinary Shares (Ireland)
      ACP,Avenue Income Credit Strategies Fund Common Shares
      ACRE,Ares Commercial Real Estate Corporation Common Stock
      ACT,Actavis plc Ordinary Shares
      ACW,Accuride Corporation Common Stock
      ADC,Agree Realty Corporation Common Stock
      ADM,Archer
      ADPT,Adeptus Health Inc. Common Stock
      ADS,Alliance Data Systems Corporation Common Stock
      ADT,ADT Corporation Common Stock
      ADX,Adams Express Company (The)
      AEB,AEGON N.V. Perp. Cap. Secs. Floating Rate (Netherlands)
      AEC,Associated Estates Realty Corporation Common Stock
      AED,AEGON N.V. Perp. Cap. Securities (Netherlands)
      AEE,Ameren Corporation Common Stock
      AEG,AEGON N.V. Common Stock
      AEH,AEGON N.V. Perp. Cap Secs.
      AEK,Aegon NV 8.00% Non
      AEL,American Equity Investment Life Holding Company Common Stock
      AEM,Agnico Eagle Mines Limited Common Stock
      AEO,"American Eagle Outfitters, Inc. Common Stock"
      AEP,"American Electric Power Company, Inc. Common Stock"
      AER,Aercap Holdings N.V. Ordinary Shares
      AES,The AES Corporation Common Stock
      AES$C,AES Corporation (The) Class C Preferred Stock
      AET,Aetna Inc. Common Stock
      AF,Astoria Financial Corporation Common Stock
      AF$C,Astoria Financial Corporation Depositary Shs Repstg 1/40th Int Perp Pfd Ser C 6.5%
      AFA,"American Financial Group, Inc. 5.75% Senior Notes due 2042"
      AFB,AllianceBernstein National Municipal Income Fund Inc
      AFC,"Allied Capital Corporation Allied Capital Corporation 6.875% Notes due April 15, 2047"
      AFG,"American Financial Group, Inc. Common Stock"
      AFGE,"American Financial Group, Inc. 6.25% Subordinated Debentures due 2054"
      AFL,AFLAC Incorporated Common Stock
      AFM,"Affiliated Managers Group, Inc. 5.250% Senior Notes due 2022"
      AFQ,"American Financial Group, Inc. 7% Senior Notes due 2050"
      AFSD,"Aflac Incorporated 5.50% Subordinated Debentures due September 15, 2052"
      AFSI$A,"AmTrust Financial Services, Inc. Preferred Series A"
      AFSI$B,"AmTrust Financial Services, Inc. Depository Shares Representing 1/40th Preferred Series B"
      AFSI$C,"AmTrust Financial Services, Inc. Depository Shares Representing 1/40th Preferred Series C"
      AFT,Apollo Senior Floating Rate Fund Inc. Common Stock
      AFW,"American Financial Group, Inc. 6 3/8% Senior Notes due 2042"
      AG,First Majestic Silver Corp. Ordinary Shares (Canada)
      AGC,Advent Claymore Convertible Securities and Income Fund Common Shares of Beneficial Interest
      AGCO,AGCO Corporation Common Stock
      AGD,Alpine Global Dynamic Dividend Fund Shares of Beneficial Interest
      AGI,Alamos Gold Inc Ordinary Shares
      AGM,Federal Agricultural Mortgage Corporation Common Stock
      AGM$A,Federal Agricultural Mortgage Corporation 5.875% Non
      AGM$B,Federal Agricultural Mortgage Corporation Non Cumulative Preferred Stock Series B
      AGM$C,Federal Agricultural Mortgage Corporation Preferred Series C Fixed to Fltg
      AGM.A,Federal Agricultural Mortgage Corporation Common Stock
      AGN,"Allergan, Inc. Common Stock"
      AGO,Assured Guaranty Ltd. Common Stock
      AGO$B,Assured Guaranty Ltd.
      AGO$E,Assured Guaranty Ltd.
      AGO$F,Assured Guaranty Ltd.
      AGRO,Adecoagro S.A. Common Shares
      AGU,Agrium Inc. Common Stock
      AGX,"Argan, Inc. Common Stock"
      AHC,A.H. Belo Corporation Common Stock
      AHH,"Armada Hoffler Properties, Inc. Common Stock"
      AHL,Aspen Insurance Holdings Limited Ordinary Shares
      AHL$A,Aspen Insurance Holdings Limited Perp Pfd Shares (Bermuda)
      AHL$B,Aspen Insurance Holdings Limited Perp Pref Shs (Bermuda)
      AHL$C,Aspen Insurance Holdings Limited 5.95% Fixed
      AHP,"Ashford Hospitality Prime, Inc. Common Stock"
      AHS,AMN Healthcare Services Inc AMN Healthcare Services Inc
      AHT,Ashford Hospitality Trust Inc Common Stock
      AHT$A,Ashford Hospitality Trust Inc 8.55% Cum Preferred Series A
      AHT$D,Ashford Hospitality Trust Inc 8.45% Series D Cumulative Preferred Stock
      AHT$E,Ashford Hospitality Trust Inc 9.00% Series E Cumulative Preferred Stock
      AI,Arlington Asset Investment Corp Class A (new)
      AIB,Apollo Investment Corporation 6.625% Senior Notes due 2042
      AIF,Apollo Tactical Income Fund Inc. Common Stock
      AIG,"American International Group, Inc. New Common Stock"
      AIG.W,"American International Group, Inc. Warrant expiring January 19, 2021"
      AIN,Albany International Corporation Common Stock
      AIR,AAR Corp. Common Stock
      AIT,"Applied Industrial Technologies, Inc. Common Stock"
      AIV,Apartment Investment and Management Company Common Stock
      AIV$A,Apartment Investment and Management Company Preferred Series Class A
      AIV$Z,Apartment Investment and Management Company Class Z Cumulative Preferred Stock
      AIW,Arlington Asset Investment Corp 6.625% Notes due 2023
      AIY,Apollo Investment Corporation 6.875% Senior Notes due 2043
      AIZ,"Assurant, Inc. Common Stock"
      AJG,Arthur J. Gallagher & Co. Common Stock
      AKO.A,Embotelladora Andina S.A. Common Stock
      AKO.B,Embotelladora Andina S.A. Common Stock
      AKP,Alliance California Municipal Income Fund Inc
      AKR,Acadia Realty Trust Common Stock
      AKS,AK Steel Holding Corporation Common Stock
      AL,Air Lease Corporation Class A Common Stock
      ALB,Albemarle Corporation Common Stock
      ALDW,"Alon USA Partners, LP Common Units representing Limited Partner Interests"
      ALE,"Allete, Inc."
      ALEX,"Alexander & Baldwin, Inc. Common Stock"
      ALG,"Alamo Group, Inc. Common Stock"
      ALJ,"Alon USA Energy, Inc. common stick"
      ALK,"Alaska Air Group, Inc. Common Stock"
      ALL,Allstate Corporation (The) Common Stock
      ALL$A,Allstate Corporation (The) Dep Shs Repstg 1/1000th Perp Pfd Ser A
      ALL$B,Allstate Corporation (The) 5.100% Fixed
      ALL$C,Allstate Corporation (The) Dep Shs Repstg 1/1000th Int Shs Pfd Stk Ser C
      ALL$D,The Allstate Corporation Leopards Each Representing A 1/1000th Interest In A Share Of Fixed Rate Noncumulative Perpetual Preferred Stock Series D
      ALL$E,Allstate Corporation Depositary Shares Representing 1/1000th Perpetual Preferred Series E
      ALL$F,Allstate Corporation (The) Leopards Dep Shares Representing 1/1000th Perp Pfd
      ALLE,Allegion plc Ordinary Shares
      ALLY,Ally Financial Inc. Common Stock
      ALLY$A,"GMAC Capital Trust I Fixed Rate Floating Rate Trust Preferred Securities, Series 2"
      ALLY$B,"Ally Financial Inc Fixed Rate Floating Rate Perpetual Preferred Stock, Series A"
      ALP$N,Alabama Power Company Preferred Stock
      ALP$O,Alabama Power Company Preferred Stock
      ALP$P,Alabama Power Company 5.30% Cl A Pfd Stk
      ALR,Alere Inc. Common Stock
      ALR$B,"Alere Inc. Inverness Medical Innovations, Inc. Series B Convertible Perpetual Preferred Stock"
      ALSN,"Allison Transmission Holdings, Inc. Common Stock"
      ALU,Alcatel
      ALV,"Autoliv, Inc. Common Stock"
      ALX,"Alexander's, Inc. Common Stock"
      AM,Antero Midstream Partners LP Common Units representing limited partner interests
      AMBR,"Amber Road, Inc. Common Stock"
      AMC,"AMC Entertainment Holdings, Inc. Class A Common Stock"
      AME,"AMETEK, Inc."
      AMFW,AMEC Foster Wheeler plc American Depositary Shares
      AMG,"Affiliated Managers Group, Inc. Common Stock"
      AMH,American Homes 4 Rent Common Shares of Beneficial Interest
      AMH$A,American Homes 4 Rent Participating Preferred Shares Series A
      AMH$B,American Homes 4 Rent 5% Series B Participating Preferred Shares of Beneficial Interest
      AMH$C,American Homes 4 Rent Participating Pfd Ser C
      AMID,"American Midstream Partners, LP Common Units representing Limited Partner Interests"
      AMP,"Ameriprise Financial, Inc. Common Stock"
      AMRC,"Ameresco, Inc. Class A Common Stock"
      AMRE,"AmREIT, Inc. Common stock"
      AMT,American Tower Corporation (REIT) Common Stock
      AMT$A,American Tower Corporation (REIT) Pfd Conv Ser A
      AMTD,TD Ameritrade Holding Corporation Common Stock
      AMTG,"Apollo Residential Mortgage, Inc. Common Stock"
      AMTG$A,"Apollo Residential Mortgage, Inc. Pfd Shs Series A  (US)"
      AMX,"America Movil, S.A.B. de C.V. American Depository Receipt Series L"
      AN,"AutoNation, Inc. Common Stock"
      ANET,"Arista Networks, Inc. Common Stock"
      ANF,Abercrombie & Fitch Company Common Stock
      ANFI,Amira Nature Foods Ltd Ordinary Shares
      ANH,Anworth Mortgage Asset Corporation Common Stock
      ANH$A,Anworth Mortgage Asset Corporation Series A Preferred Stock
      ANH$B,Anworth Mortgage Asset  Corporation Preferred Stock Series B 6.25%
      ANN,ANN INC. Common Stock
      ANR,"Alpha Natural Resources, inc. comm stock"
      ANTM,"Anthem, Inc. Common Stock"
      ANW,Aegean Marine Petroleum Network Inc. Common Stock
      AOD,Alpine Total Dynamic Dividend Fund Common Stock
      AOI,"Alliance One International, Inc. Common Stock"
      AOL,AOL Inc. AOL Inc. Common Stock
      AON,Aon plc Class A Ordinary Shares (UK)
      AOS,A.O. Smith Corporation Common Stock
      AP,Ampco
      APA,Apache Corporation Common Stock
      APAM,Artisan Partners Asset Management Inc. Class A Common Stock
      APB,"Asia Pacific Fund, Inc. (The)"
      APC,Anadarko Petroleum Corporation Common Stock
      APD,"Air Products and Chemicals, Inc. Common Stock"
      APF,Morgan Stanley Asia
      APH,Amphenol Corporation Common Stock
      APL,"Atlas Pipeline Partners, L.P. Common Units, No Par Value"
      APL$E,"Atlas Pipeline Partners, L.P. Cumulative Redeemable Perpetual Preferred Units Class E"
      APO,"Apollo Global Management, LLC Class A Common Shares Representing Class A Limitied Liability Company Interests"
      APU,"AmeriGas Partners, L.P. Common Stock"
      AR,Antero Resources Corporation Common Stock
      ARC,"ARC Document Solutions, Inc. Common Stock"
      ARCO,Arcos Dorados Holdings Inc. Class A Shares
      ARCX,Arc Logistic Partners LP Common Units representing limited partner interest
      ARDC,"Ares Dynamic Credit Allocation Fund, Inc. Common Shares"
      ARE,"Alexandria Real Estate Equities, Inc. Common Stock"
      ARE$E,"Alexandria Real Estate Equities, Inc. Pfd Ser E"
      ARES,Ares Management L.P. Common Units representing Limited Partner Interests
      ARG,"Airgas, Inc. Common Stock"
      ARH$C,Arch Capital Group Ltd. 6.75% PFD sh S C
      ARI,"Apollo Commercial Real Estate Finance, Inc"
      ARI$A,Apollo Commercial Real Estate Finance Cumulative Redeemable Perpetual Preferred Stock Series A
      ARL,"American Realty Investors, Inc. Common Stock"
      ARMF,Ares Multi
      ARMK,Aramark Common Stock
      ARN,Ares Capital Corporation 7.00% Senior Notes due 2022
      ARO,Aeropostale Inc Common Stock
      ARP,"Atlas Resource Partners, L.P. Common Units representing Limited Partner Interests"
      ARP$D,"Atlas Resource Partners, L.P. CUM RED PERP PDF UNIT CL D %"
      ARPI,"American Residential Properties, Inc. Common Stock"
      ARR,"ARMOUR Residential REIT, Inc."
      ARR$A,Armour Residential REIT INC Preferred Series A
      ARR$B,"ARMOUR Residential REIT, Inc. Preferred Series B"
      ARU,Ares Capital Corporation 5.875% Senior Notes due 2022
      ARW,"Arrow Electronics, Inc. Common Stock"
      ARY,Ares Capital Corporation 7.75% Senior Notes due 2040
      ASA,ASA  Gold and Precious Metals Limited
      ASB,Associated Banc
      ASB$B,Associated Banc
      ASC,Ardmore Shipping Corporation Common Stock
      ASG,Liberty All
      ASGN,"On Assignment, Inc. Common Stock"
      ASH,Ashland Inc. (NEW) Common Stock
      ASPN,"Aspen Aerogels, Inc. Common Stock"
      ASR,"Grupo Aeroportuario del Sureste, S.A. de C.V. Common Stock"
      ASX,"Advanced Semiconductor Engineering, Inc. Common Stock"
      AT,Atlantic Power Corporation Ordinary Shares (Canada)
      ATE,Advantest Corporation (Kabushiki Kaisha Advantest) ADS American Depositary Shares
      ATEN,"A10 Networks, Inc. Common Stock"
      ATHM,"Autohome Inc. American Depositary Shares, each representing one class A ordinary share."
      ATI,Allegheny Technologies Incorporated Common Stock
      ATK,Alliant Techsystems Inc. Common Stock
      ATLS,"Atlas Energy, L.P. Common Units"
      ATO,Atmos Energy Corporation Common Stock
      ATR,"AptarGroup, Inc. Common Stock"
      ATTO,Atento S.A. Ordinary Shares
      ATU,Actuant Corporation Common Stock
      ATV,"Acorn International, Inc. ADS"
      ATW,"Atwood Oceanics, Inc. Common Stock"
      AU,AngloGold Ashanti Limited Common Stock
      AUO,AU Optronics Corp American Depositary Shares
      AUQ,AuRico Gold Inc. Ordinary Shares
      AUY,Yamana Gold Inc. Ordinary Shares (Canada)
      AV,Aviva plc Unsponsored ADR (UK)
      AVA,Avista Corporation Common Stock
      AVAL,Grupo Aval Acciones y Valores S.A. ADR (Each representing 20 preferred shares)
      AVB,"AvalonBay Communities, Inc. Common Stock"
      AVD,American Vanguard Corporation Common Stock ($0.10 Par Value)
      AVG,AVG Technologies N.V. Ordinary Shares
      AVH,Avianca Holdings S.A. American Depositary Shares (Each representing 8 preferred Shares)
      AVIV,"Aviv REIT, Inc. Common Stock"
      AVK,Advent Claymore Convertible Securities and Income Fund
      AVOL,Avolon Holdings Limited Common Shares
      AVP,"Avon Products, Inc. Common Stock"
      AVT,"Avnet, Inc. Common Stock"
      AVV,Aviva plc Subordinated Capital Securities due 2041
      AVX,AVX Corporation Common Stock
      AVY,Avery Dennison Corporation Common Stock
      AWF,Alliancebernstein Global High Income Fund
      AWH,"Allied World Assurance Company Holdings, AG (Switzerland)"
      AWI,Armstrong World Industries Inc Common Stock
      AWK,"American Water Works Company, Inc. Common Stock"
      AWP,Alpine Global Premier Properties Fund Alpine Global Premier Properties Fund Common Shares of Beneficial Interest
      AWR,American States Water Company Common Stock
      AXE,Anixter International Inc. Common Stock
      AXL,"American Axle & Manufacturing Holdings, Inc. Common Stock"
      AXLL,Axiall Corporation Common Stock
      AXP,American Express Company Common Stock
      AXR,AMREP Corporation Common Stock
      AXS,Axis Capital Holdings Limited Common Stock
      AXS$C,Axis Capital Holdings Limited Preferred Series C (Bermuda)
      AXS$D,Axis Capital Holdings Limited Preferred Series D (Bermuda)
      AXTA,Axalta Coating Systems Ltd. Common Shares
      AYI,Acuity Brands Inc (Holding Company)
      AYN,Alliance New York Municipal Income Fund Inc
      AYR,Aircastle Limited Common Stock
      AZN,Astrazeneca PLC Common Stock
      AZO,"AutoZone, Inc. Common Stock"
      AZZ,AZZ Incorporated Common Stock
      B,"Barnes Group, Inc. Common Stock"
      BA,Boeing Company (The) Common Stock
      BABA,Alibaba Group Holding Limited American Depositary Shares each representing one Ordinary share
      BAC,Bank of America Corporation Common Stock
      BAC$D,Bank of America Corporation Depositary Shares Rpstg 1/1000th Interest in Sh of Non Cum Pfd Stk Ser D
      BAC$E,Bank of America Corporation Depositary Sh repstg 1/1000th Perp Pfd Ser E
      BAC$I,Bank Amer Corp Dep Sh Repstg 1/1000th Pfd Ser I
      BAC$L,Bank of America Corporation Non Cumulative Perpetual Conv Pfd Ser L
      BAC$W,Bank of America Corporation Depository Shares Representing 1/1000th Preferred Series W
      BAC$Z,Bank of America Corporation BAC Capital Trust VIII 6% Capital Securities
      BAC.A,"Bank of America Corporation Class A Warrant expiring January 16, 2019"
      BAC.B,Bank of America Corporation Class B Warrants expiring 10/28/2018
      BAF,BlackRock Municipal Income Investment Quality Trust
      BAH,Booz Allen Hamilton Holding Corporation Common Stock
      BAK,Braskem SA ADR
      BALT,Baltic Trading Limited Common Stock
      BAM,Brookfield Asset Management Inc. Common Stock
      BANC,"Banc of California, Inc. Common Stock"
      BANC$C,"Banc of California, Inc. Depositary Shares"
      BAP,Credicorp Ltd. Common Stock
      BAS,"Basic Energy Services, Inc. Common Stock"
      BAX,Baxter International Inc. Common Stock
      BBD,Banco Bradesco Sa American Depositary Shares
      BBDO,Banco Bradesco Sa American Depositary Shares (each representing one Common Share)
      BBF,BlackRock Municipal Income Investment Trust
      BBG,Bill Barrett Corporation Common Stock
      BBK,Blackrock Municipal Bond Trust
      BBL,BHP Billiton plc Sponsored ADR
      BBN,BlackRock Build America Bond Trust Common Shares of Beneficial Interest
      BBT,BB&T Corporation Common Stock
      BBT$D,BB&T Corporation Depositary Shares Representing 1/1000th Perpetual Preferred Series D
      BBT$E,BB&T Corporation Depositary Shares Representing 1/1000th Perpetual Preferred Series E
      BBT$F,BB&T Corporation Depositary Shares Representing 1/1000th Interest Series F Perpetual Preferred
      BBT$G,BB&T Corporation Depositary Shares Representing 1/1000th Perpetual Preferred Series G
      BBVA,Banco Bilbao Vizcaya Argentaria S.A. Common Stock
      BBW,Build
      BBX,BBX Capital Corporation Common Stock
      BBY,"Best Buy Co., Inc. Common Stock"
      BC,Brunswick Corporation Common Stock
      BCA,Corpbanca Sponsored Reg S GDR representing Common (Chile)
      BCC,"Boise Cascade, L.L.C. Common Stock"
      BCE,"BCE, Inc. Common Stock"
      BCEI,"Bonanza Creek Energy, Inc. Common Stock"
      BCH,Banco De Chile Banco De Chile ADS
      BCO,Brinks Company (The) Common Stock
      BCR,"C.R. Bard, Inc. Common Stock"
      BCRH,Blue Capital Reinsurance Holdings Ltd. Common Shares
      BCS,Barclays PLC Common Stock
      BCS$,Barclays Bank PLC ADR Ser 2 repstg Pref Shs Ser 2 (United Kingdom)
      BCS$A,Barclays PLC ADS
      BCS$C,Barclays PLC American Depositary Shares Series 4
      BCS$D,Barclays PLC American Depositary Shares (Each representing Non
      BCX,BlackRock Resources Common Shares of Beneficial Interest
      BDC,Belden Inc Common Stock
      BDJ,Blackrock Enhanced Equity Dividend Trust
      BDN,Brandywine Realty Trust Common Stock
      BDN$E,Brandywine Realty Tr Pfd Shs Ben Int Ser E
      BDX,"Becton, Dickinson and Company Common Stock"
      BEE,Strategic Hotels & Resorts  Inc Common Stock
      BEL,Belmond Ltd. Class A Common Stock
      BEN,"Franklin Resources, Inc. Common Stock"
      BEP,Brookfield Renewable Energy Partners LP Partnership Units (Bermuda)
      BERY,"Berry Plastics Group, Inc. Common Stock"
      BF.A,Brown Forman Inc Class A Common Stock
      BF.B,Brown Forman Inc Class B Common Stock
      BFAM,Bright Horizons Family Solutions Inc. Common Stock
      BFK,BlackRock Municipal Income Trust
      BFO,Blackrock Florida Municipal 2020 Term Trust
      BFR,BBVA Banco Frances S.A. Common Stock
      BFS,"Saul Centers, Inc. Common Stock"
      BFS$C,"Saul Centers, Inc. Depositary Shares, each representing 1/100th of a share of 6.875% Series C Cumulative Redeemable Preferred Stock, $0.01 par value"
      BFZ,BlackRock California Municipal Income Trust
      BG,Bunge Limited Bunge Limited
      BGB,Blackstone / GSO Strategic Credit Fund Common Shares
      BGC,General Cable Corporation Common Stock
      BGCA,"BGC Partners, Inc. 8.125% Senior Notes due 2042"
      BGE$B,Bge Cap Trust II 6.20% Trust Preferred Securities
      BGG,Briggs & Stratton Corporation Common Stock
      BGH,Babson Capital Global Short Duration High Yield Fund Common Shares of Beneficial Interests
      BGR,BlackRock Energy and Resources Trust
      BGS,"B&G Foods, Inc. B&G Foods, Inc. Common Stock"
      BGT,BlackRock Floating Rate Income Trust
      BGX,Blackstone GSO Long Short Credit Income Fund Common Shares
      BGY,"BLACKROCK INTERNATIONAL, LTD. Blackrock International Real Estate Fund, Inc."
      BH,Biglari Holdings Inc.
      BHE,"Benchmark Electronics, Inc. Common Stock"
      BHI,Baker Hughes Incorporated Common Stock
      BHK,Blackrock Core Bond Trust Blackrock Core Bond Trust
      BHL,Blackrock Defined Opportunity Credit Trust Blackrock Defined Opportunity Credit Trust
      BHLB,"Berkshire Hills Bancorp, Inc. Common Stock"
      BHP,BHP Billiton Limited Common Stock
      BID,Sotheby's Common Stock
      BIE,BlackRock Municipal Bond Investment Trust
      BIF,"Boulder Growth & Income Fund, Inc."
      BIG,"Big Lots, Inc. Common Stock"
      BIN,Progressive Waste Solutions Ltd. Common Shares
      BIO,Bio
      BIO.B,Bio
      BIOA,BioAmber Inc. Common Stock
      BIOA.W,"BioAmber Inc. Warrant, expiring May 9, 2017"
      BIP,Brookfield Infrastructure Partners LP Limited Partnership Units
      BIT,BlackRock Multi
      BITA,Bitauto Holdings Limited American Depositary Shares (each representing one ordinary share)
      BJZ,Blackrock California Municipal 2018 Term Trust Blackrock California Municipal 2018 Term Trust
      BK,Bank of New York Mellon Corporation (The) Common Stock
      BK$C,Bank Of New York Mellon Corporation (The) Dep Shs Repstg 1/4000th Perp Pfd Ser C
      BKD,Brookdale Senior Living Inc. Common Stock
      BKE,"Buckle, Inc. (The) Common Stock"
      BKH,Black Hills Corporation Common Stock
      BKK,Blackrock Municipal 2020 Term Trust
      BKN,BlackRock Investment Quality Municipal Trust Inc. (The)
      BKS,"Barnes & Noble, Inc. Common Stock"
      BKT,BlackRock Income Trust Inc. (The)
      BKU,"BankUnited, Inc. Common Stock"
      BLH,Blackrock New York Municipal 2018 Term Trust
      BLK,"BlackRock, Inc. Common Stock"
      BLL,Ball Corporation Common Stock
      BLOX,Infoblox Inc. Common Stock
      BLT,"Blount International, Inc. Common Stock"
      BLW,Blackrock Limited Duration Income Trust
      BLX,"Banco Latinoamericano de Comercio Exterior, S.A."
      BMA,Banco Macro S.A.  ADR (representing Ten Class B Common Shares)
      BME,Blackrock Health Sciences Trust
      BMI,"Badger Meter, Inc. Common Stock"
      BML$G,Bank of America Corporation Bank of America Corporation Depositary Shares (Each representing a 1/1200th interest in a share of Floating Rate Non
      BML$H,Bank of America Corporation Bank of America Corporation Depositary Shares (Each representing a 1/1200th interest in a Share of Floating Rate Non
      BML$I,Bank of America Corporation Bank of America Corporation Depositary Shares (Each representing a 1/1200th interest in a Share of 6.375% Non
      BML$J,Bank of America Corporation Bank of America Corporation Depositary Shares (Each representing a 1/1200th interest in a Share of Floating Rate Non
      BML$L,Bank of America Corporation Bank of America Corporation Depositary Shares (Each representing a 1/1200th Interest in a Share of Floating Rate Non
      BMO,Bank Of Montreal Common Stock
      BMR,Biomed Realty Trust Common Stock
      BMS,"Bemis Company, Inc. Common Stock"
      BMY,Bristol
      BNJ,BlackRock New Jersey Municipal Income Trust
      BNK,"C1 Financial, Inc. Common Stock"
      BNS,Bank Nova Scotia Halifax Pfd 3 Ordinary Shares
      BNY,BlackRock New York Municipal Income Trust
      BOCA,"Banc of California, Inc. Senior Note due 4/15/2020"
      BOE,Blackrock Global Blackrock Global Opportunities Equity Trust Common Shares of Beneficial Interest
      BOH,Bank of Hawaii Corporation Common Stock
      BOI,Brookfield Mortgage Opportunity Income Fund Inc. Common Stock
      BOOT,"Boot Barn Holdings, Inc. Common Stock"
      BORN,China New Borun Corporation American Depositary Shares
      BOXC,Brookfield Canada Office Properties
      BP,BP p.l.c. Common Stock
      BPI,"Bridgepoint Education, Inc."
      BPK,Blackrock Municipal 2018 Term Trust Blackrock Municipal 2018 Term Trust
      BPL,Buckeye Partners L.P. Common Stock
      BPT,BP Prudhoe Bay Royalty Trust Common Stock
      BPY,Brookfield Property Partners L.P. Limited Partnership Units
      BPZ,"BPZ Resources, Inc Common Stock"
      BQH,Blackrock New York Municipal Bond Trust Common Shares of Beneficial Interest
      BR,"Broadridge Financial Solutions, Inc.Common Stock"
      BRC,Brady Corporation Common Stock
      BRFS,BRF S.A.
      BRK.A,Berkshire Hathaway Inc. Common Stock
      BRK.B,Berkshire Hathaway Inc. New Common Stock
      BRO,"Brown & Brown, Inc. Common Stock"
      BRP,Brookfield Residential Properties Inc. Common Stock
      BRS,Bristow Group Inc. Common Stock
      BRSS,"Global Brass and Copper Holdings, Inc. Common Stock"
      BRT,BRT Realty Trust Common Stock
      BRX,Brixmor Property Group Inc. Common Stock
      BSAC,Banco Santander
      BSBR,"Banco Santander Brasil SA American Depositary Shares, each representing one unit"
      BSD,BlackRock Strategic Municipal Trust Inc. (The) Common Stock
      BSE,Blackrock New York Municipal Income Quality Trust Common Shares of Beneficial Interest
      BSI,Alon Blue Square Israel Ltd.
      BSL,Blackstone GSO Senior Floating Rate Term Fund Common Shares of Beneficial Interest
      BSMX,"Grupo Financiero Santander Mexico S.A. B. de C.V. American Depositary Shares, each representing five Series B shares"
      BST,BlackRock Science and Technology Trust Common Shares of Beneficial Interest
      BSX,Boston Scientific Corporation Common Stock
      BT,BT Group plc Common Stock
      BTA,BlackRock Long
      BTE,Baytex Energy Corp
      BTF,"Boulder Total Return Fund, Inc. Common Stock"
      BTH,"Blyth, Inc. New Common Stock"
      BTO,John Hancock Financial Opportunities Fund Common Stock
      BTT,BlackRock Municipal Target Term Trust Inc. (The) Common Shares of Beneficial Interest
      BTU,Peabody Energy Corporation Common Stock
      BTZ,BlackRock Credit Allocation Income Trust
      BUD,Anheuser
      BUI,BlackRock Utility and Infrastructure Trust Common Shares of Beneficial Interest
      BURL,"Burlington Stores, Inc. Common Stock"
      BVN,Buenaventura Mining Company Inc.
      BWA,BorgWarner Inc. Common Stock
      BWC,Babcock Common Stock
      BWG,Legg Mason BW Global Income Opportunities Fund Inc. Common Stock
      BWP,Boardwalk Pipeline Partners LP Common Units
      BWS,"Brown Shoe Company, Inc. Common Stock"
      BX,The Blackstone Group L.P. Common Units Representing Limited Partnership Interests
      BXC,Bluelinx Holdings Inc. Common Stock
      BXE,Bellatrix Exploration Ltd Ordinary Shares (Canada)
      BXMT,"Blackstone Mortgage Trust, Inc. Common Stock"
      BXMX,Nuveen S&P 500 Buy
      BXP,"Boston Properties, Inc. Common Stock"
      BXP$B,"Boston Properties, Inc. Depositary Shares, each representing 1/100th of a share of the Issuer's 5.25% Sockeries B Cumulative Redeemable Preferred St"
      BXS,"BancorpSouth, Inc. Common Stock"
      BYD,Boyd Gaming Corporation Common Stock
      BYM,Blackrock Municipal Income Quality Trust Common Shares of Beneficial Interest
      BZH,"Beazer Homes USA, Inc. Common Stock"
      BZT,"Beazer Homes USA, Inc. Tangible Equity Unit"
      C,"Citigroup, Inc. Common Stock"
      C$C,Citigroup Inc. Depositary Shares representing 1/1000 Series C Noncumulative Preferred Stock (United States)
      C$J,Citigroup Inc. Dep Shs Repstg 1/1000 Pfd Ser J Fixed/Fltg
      C$K,Citigroup Inc. Dep Shs Repstg 1/1000th Pfd Ser K
      C$L,Citigroup Inc. Depositary Share representing 1/1000 interest in a share of noncumulative series L
      C$N,Citigroup Capital VIII 7.875% Fixed rate Floating Rate trust Preferred Securities (TruPS)
      C$P,Citigroup Inc. Dep Shs Repstg 1/1000th Pfd Ser AA
      C.A,"Citigroup Inc. Warrants Class A expiring January 4, 2019"
      C.B,"Citigroup Inc. Class B Warant expiring October 28, 2018"
      CAB,Cabela's Inc Class A Common Stock
      CACI,"CACI International, Inc. Class A Common Stock"
      CAE,CAE Inc. Ordinary Shares
      CAF,Morgan Stanley China A Share Fund Inc. Common Stock
      CAG,"ConAgra Foods, Inc. Common Stock"
      CAH,"Cardinal Health, Inc. Common Stock"
      CAJ,"Canon, Inc. American Depositary Shares"
      CALX,"Calix, Inc Common Stock"
      CAM,Cameron International Corporation Common Stock
      CAP,"Cai International, Inc. Common Stock"
      CAPL,CrossAmerica Partners LP Common Units representing limited partner interests
      CAS,Castle (A.M.) & Co. Common Stock
      CAT,"Caterpillar, Inc. Common Stock"
      CATO,Cato Corporation (The) Class A Common Stock
      CB,Chubb Corporation (The) Common Stock
      CBA,ClearBridge American Energy MLP Fund Inc. Common Stock
      CBB,Cincinnati Bell Inc. Common Stock
      CBB$B,Cincinnati Bell Inc. Preferred Stock
      CBD,Companhia Brasileira de Distribuicao ADS
      CBG,CBRE Group Inc Common Stock Class A
      CBI,Chicago Bridge & Iron Company N.V. Common Stock
      CBK,Christopher & Banks Corporation Common Stock
      CBL,"CBL & Associates Properties, Inc. Common Stock"
      CBL$D,"CBL & Associates Properties, Inc. Dep Shares Repstg 1/10th Preferred Series D"
      CBL$E,"CBL & Associates Properties, Inc. Depositary Shs Repstg 1/10 6.625% Ser E Cum Redeemable (Pfd Stk)"
      CBM,Cambrex Corporation Common Stock
      CBPX,"Continental Building Products, Inc. Common Stock"
      CBR,"Ciber, Inc. Common Stock"
      CBS,CBS Corporation Class B Common Stock
      CBS.A,CBS Corporation CBS Corporation Class A Common Stock
      CBT,Cabot Corporation Common Stock
      CBU,"Community Bank System, Inc. Common Stock"
      CBZ,"CBIZ, Inc. Common Stock"
      CCC,Calgon Carbon Corporation Common Stock
      CCE,Coca
      CCG,"Campus Crest Communities, Inc. Common Stock"
      CCG$A,"Campus Crest Communities, Inc. 8.00% Series A Cumulative Redeemable Preferred Stock"
      CCI,Crown Castle International Corp. (REIT) Common Stock
      CCI$A,Crown Castle International Corp. (REIT) Mandatory Conv Pfd Stk Series A
      CCJ,Cameco Corporation Common Stock
      CCK,"Crown Holdings, Inc."
      CCL,Carnival Corporation Common Stock
      CCM,Concord Medical Services Holdings Limited ADS (Each represents three ordinary shares)
      CCO,"Clear Channel Outdoor Holdings, Inc. Clear Channel Outdoor Holdings, Inc. Class A Common Stock"
      CCS,"Century Communities, Inc. Common Stock"
      CCSC,"Country Style Cooking Restaurant Chain Co., Ltd American Depositary Shares, each representing four ordinary shares"
      CCU,"Compania Cervecerias Unidas, S.A. Common Stock"
      CCV,Comcast Corporation 5.00% Notes due 2061
      CCZ,Comcast Holdings ZONES
      CDE,"Coeur Mining, Inc. Common Stock"
      CDE.W,"Coeur Mining, Inc. Warrant expiring April 16, 2017"
      CDI,CDI Corporation Common Stock
      CDR,"Cedar Realty Trust, Inc. Common Stock"
      CDR$B,"Cedar Realty Trust, Inc. 7.25% Series B Cumulative Redeemable Preferred Stock"
      CE,Celanese Corporation Celanese Corporation Series A Common Stock
      CEA,China Eastern Airlines Corporation Ltd. Common Stock
      CEB,Corporate Executive Board Company (The) Common Stock
      CEE,"Central Europe, Russia and Turkey Fund, Inc. (The) Common Stock"
      CEL,"Cellcom Israel, Ltd. Ordinary Shares"
      CELP,"Cypress Energy Partners, L.P. Common Units representing limited partner interests"
      CEM,ClearBridge Energy MLP Fund Inc. Common Stock
      CEN,Center Coast MLP & Infrastructure Fund Common Shares of Beneficial Interest
      CEO,CNOOC Limited Common Stock
      CEQP,Crestwood Equity Partners LP
      CF,"CF Industries Holdings, Inc. Common Stock"
      CFC$A,Countrywide Capital IV (New) 6.75% Trust Pfd Securities
      CFC$B,Countrywide Capital V (New) 7.00% Capital Securities
      CFG,"Citizens Financial Group, Inc. Common Stock"
      CFI,"Culp, Inc. Common Stock"
      CFN,CareFusion Corporation Common Stock
      CFR,"Cullen/Frost Bankers, Inc. Common Stock"
      CFR$A,"Cullen/Frost Bankers, Inc. Perpetual Preferred Series A"
      CFX,Colfax Corporation Common Stock
      CGA,"China Green Agriculture, Inc. Common Stock"
      CGG,CGG
      CGI,"Celadon Group, Inc. Common Stock"
      CHA,China Telecom Corp Ltd ADS
      CHD,"Church & Dwight Company, Inc. Common Stock"
      CHE,Chemed Corp
      CHGG,"Chegg, Inc. Common Stock"
      CHH,"Choice Hotels International, Inc. Common Stock"
      CHK,Chesapeake Energy Corporation Common Stock
      CHK$D,Chesapeake Energy Corporation Convertible Preferred
      CHKR,Chesapeake Granite Wash Trust Common Units representing beneficial interests in the Trust
      CHL,China Mobile Limited Common Stock
      CHMI,Cherry Hill Mortgage Investment Corporation Common Stock
      CHMT,Chemtura Corp. Common Stock
      CHN,"China Fund, Inc. (The) Common Stock"
      CHS,"Chico's FAS, Inc. Common Stock"
      CHSP,Chesapeake Lodging Trust Common Shares of Beneficial Interest
      CHSP$A,Chesapeake Lodging Trust 7.75% Series A Cumulative Redeemable Preferred Shares
      CHT,"Chunghwa Telecom Co., Ltd."
      CHU,China Unicom (Hong Kong) Ltd Common Stock
      CI,Cigna Corporation Common Stock
      CIA,"Citizens, Inc. Class A Common Stock ($1.00 Par)"
      CIB,BanColombia S.A. Common Stock
      CIE,"Cobalt International Energy, Inc. COBALT INTERNATIONAL ENERGY, INC."
      CIEN,Ciena Corporation Common Stock
      CIF,MFS Intermediate High Income Fund Common Stock
      CIG,Comp En De Mn Cemig ADS American Depositary Shares
      CIG.C,Comp En De Mn Cemig ADS American Depositary Receipts
      CII,"Blackrock Capital and Income Fund, Inc."
      CIM,Chimera Investment Corporation Common Stock
      CIO,"City Office REIT, Inc. Common Stock"
      CIR,"CIRCOR International, Inc. Common Stock"
      CIT,CIT Group Inc (DEL) Common Stock
      CIVI,"Civitas Solutions, Inc. Common Stock"
      CJES,"C&J Energy Services, Inc. Common Stock"
      CKH,SEACOR Holdings Inc. Common Stock
      CKP,"Checkpoint Systms, Inc. Common Stock"
      CL,Colgate
      CLA,Capitala Finance Corp. 7.125% Notes due 2021
      CLB,Core Laboratories N.V. Common Stock
      CLC,CLARCOR Inc. Common Stock
      CLD,Cloud Peak Energy Inc Common Stock
      CLDT,Chatham Lodging Trust (REIT) Common Shares of Beneficial Interest
      CLF,Cliffs Natural Resources Inc Common Stock
      CLGX,"CoreLogic, Inc. Common Stock"
      CLH,"Clean Harbors, Inc. Common Stock"
      CLI,Mack
      CLNY,"Colony Financial, Inc Common Stock"
      CLNY$A,Colony Finl Inc Cum Red Perp Pfd Ser A %
      CLNY$B,"Colony Financial, Inc Perp Pfd Ser B %"
      CLR,"Continental Resources, Inc. Common Stock"
      CLS,"Celestica, Inc. Common Stock"
      CLV,Cliffs Natural Resources Inc. Depositary Shares Representing 1/40th Preferred Convertible Series A
      CLW,Clearwater Paper Corporation Common Stock
      CLX,Clorox Company (The) Common Stock
      CM,Canadian Imperial Bank of Commerce Common Stock
      CMA,Comerica Incorporated Common Stock
      CMA.W,"Comerica Incorporated Warrant expiring November 14, 2018"
      CMC,Commercial Metals Company Common Stock
      CMCM,"Cheetah Mobile Inc. American Depositary Shares, each representing 10 Class Ordinary Shares"
      CMG,"Chipotle Mexican Grill, Inc. Common Stock"
      CMI,Cummins Inc. Common Stock
      CMK,MFS Intermarket Income Trust I Common Stock
      CMLP,Crestwood Midstream Partners LP
      CMN,Cantel Medical Corp. Common Stock
      CMO,Capstead Mortgage Corporation Common Stock
      CMO$E,Capstead Mortgage Corporation Pfd Ser E
      CMP,Compass Minerals Intl Inc Common Stock
      CMRE,Costamare Inc. Common Stock $0.0001 par value
      CMRE$B,Costamare Inc. Perpetual Preferred Stock Series B (Marshall Islands)
      CMRE$C,Costamare Inc. Perpetual Preferred Series C (Marshall Islands)
      CMS,CMS Energy Corporation Common Stock
      CMS$B,CMS Energy Corporation Preferred Stock
      CMU,MFS Municipal Income Trust Common Stock
      CNA,CNA Financial Corporation Common Stock
      CNC,Centene Corporation Common Stock
      CNCO,Cencosud S.A. American Depositary Shares (Each representing three Common Shares)
      CNHI,CNH Industrial N.V. Common Shares
      CNI,Canadian National Railway Company Common Stock
      CNK,"Cinemark Holdings Inc Cinemark Holdings, Inc. Common Stock"
      CNL,Cleco Corporation Common Stock
      CNNX,Cone Midstream Partners LP Common Units representing limited partner interests
      CNO,"CNO Financial Group, Inc. Common Stock"
      CNP,"CenterPoint Energy, Inc (Holding Co) Common Stock"
      CNQ,Canadian Natural Resources Limited Common Stock
      CNS,Cohn & Steers Inc Common Stock
      CNW,Con
      CNX,CONSOL Energy Inc. Common Stock
      CO,China Cord Blood Corporation Common Stock
      CODE,Spansion Inc Common Stock Class A New
      CODI,Compass Diversified Holdings Shares of Beneficial Interest
      COF,Capital One Financial Corporation Common Stock
      COF$C,Capital One Financial Corp Depository Shares Representing 1/40th Int Perp Pfd Ser C%
      COF$D,Capital One Financial Corp Depository Shares Representing 1/40th Interest Perpetual Preferred Series D
      COF$P,Capital One Financial Corp Pfd Ser B
      COF.W,"Capital One Financial Corporation Warrants expiring November 14, 2018"
      COG,Cabot Oil & Gas Corporation Common Stock
      COH,"Coach, Inc. Common Stock"
      COL,"Rockwell Collins, Inc. Common Stock"
      COO,"Cooper Companies, Inc. (The) Common Stock"
      COP,ConocoPhillips Common Stock
      COR,CoreSite Realty Corporation Common Stock
      COR$A,CoreSite Realty Corporation Pfd Ser A
      CORR,"CorEnergy Infrastructure Trust, Inc. Common Stock"
      COT,Cott Corporation Common Stock
      COTY,Coty Inc. Class A Common Stock
      COUP,Coupons.com Incorporated Common Stock
      COV,Covidien plc. Ordinary Shares (Ireland)
      CP,Canadian Pacific Railway Limited Common Stock
      CPA,"Copa Holdings, S.A. Copa Holdings, S.A. Class A Common Stock"
      CPAC,"Cementos Pacasmayo S.A.A. American Depositary Shares, each representing five Common Shares"
      CPB,Campbell Soup Company Common Stock
      CPE,Callon Petroleum Company Common Stock
      CPE$A,Callon Petroleum Company Preferred Shares Series A 10%
      CPF,Central Pacific Financial Corp New
      CPG,Crescent Point Energy Corporation Ordinary Shares (Canada)
      CPK,Chesapeake Utilities Corporation Common Stock
      CPL,CPFL Energia S.A. CPFL Energia S.A. American Depositary Shares
      CPN,Calpine Corporation Common Stock
      CPS,Cooper
      CPT,Camden Property Trust Common Stock
      CR,Crane Company Common Stock
      CRC,California Resources Corporation Common Stock
      CRCM,"Care.com, Inc. Common Stock"
      CRD.A,Crawford & Company Common Stock
      CRD.B,Crawford & Company Common Stock
      CRH,CRH PLC American Depositary Shares
      CRI,"Carter's, Inc. Common Stock"
      CRK,"Comstock Resources, Inc. Common Stock"
      CRL,"Charles River Laboratories International, Inc. Common Stock"
      CRM,Salesforce.com Inc Common Stock
      CRR,"Carbo Ceramics, Inc. Common Stock"
      CRS,Carpenter Technology Corporation Common Stock
      CRT,Cross Timbers Royalty Trust Common Stock
      CRY,"CryoLife, Inc. Common Stock"
      CS,Credit Suisse Group American Depositary Shares
      CSC,Computer Sciences Corporation Common Stock
      CSG,Chambers Street Properties Common Shares of Beneficial Interest
      CSH,"Cash America International, Inc. Common Stock"
      CSI,Cutwater Select Income Fund
      CSL,Carlisle Companies Incorporated Common Stock
      CSLT,"Castlight Health, Inc. Class B Common Stock"
      CSS,"CSS Industries, Inc. Common Stock"
      CST,"CST Brands, Inc. Common Stock"
      CSTM,Constellium N.V. Ordinary Shares
      CSU,Capital Senior Living Corporation Common Stock
      CSV,"Carriage Services, Inc. Common Stock"
      CSX,CSX Corporation Common Stock
      CTB,Cooper Tire & Rubber Company Common Stock
      CTL,"CenturyLink, Inc. Common Stock"
      CTLT,"Catalent, Inc. Common Stock"
      CTQ,Qwest Corporation 7.375% Notes due 2051
      CTR,ClearBridge Energy MLP Total Return Fund Inc. Common Stock
      CTS,CTS Corporation Common Stock
      CTT,"CatchMark Timber Trust, Inc. Class A Common Stock"
      CTU,Qwest Corporation 7.00% Notes due 2025
      CTV,Qwest Corporation 6.875% Notes due 2054
      CTW,Qwest Corporation 7.50% Notes due 2051
      CTX,Qwest Corporation 7.00% Notes due 2052
      CTY,Qwest Corporation 6.125% Notes due 2053
      CUB,Cubic Corporation Common Stock
      CUBE,CubeSmart Common Shares
      CUBE$A,CubeSmart 7.75% Series A Cumulative Redeemable Preferred Shares of Beneficial Interest
      CUBI,"Customers Bancorp, Inc Common Stock"
      CUBS,"Customers Bancorp, Inc 6.375% Senior Notes due 2018"
      CUDA,"Barracuda Networks, Inc. Common Stock"
      CUK,Carnival Plc ADS ADS
      CUZ,Cousins Properties Incorporated Common Stock
      CVA,Covanta Holding Corporation Common Stock
      CVB,"Lehman ABS Corporation 7.75% Corp Backed Tr Ctfs, Kinder Morgan Debenture"
      CVC,Cablevision Systems Corporation Class A Common Stock
      CVD,Covance Inc. Common Stock
      CVE,Cenovus Energy Inc Common Stock
      CVEO,Civeo Corporation Common Stock
      CVG,Convergys Corporation Common Stock
      CVI,CVR Energy Inc. Common Stock
      CVO,Cenveo Inc
      CVRR,"CVR Refining, LP Common Units Representing Limited Partner Interests"
      CVS,CVS Health Corporation Common Stock
      CVT,"CVENT, INC. Common Stock"
      CVX,Chevron Corporation Common Stock
      CW,Curtiss
      CWEI,"Clayton Williams Energy, Inc. Common Stock"
      CWT,California Water Service Group Common Stock
      CX,"Cemex, S.A.B. de C.V. Sponsored ADR"
      CXE,MFS High Income Municipal Trust Common Stock
      CXH,MFS Investment Grade Municipal Trust Common Stock
      CXO,Concho Resources Inc. Common Stock
      CXP,"Columbia Property Trust, Inc. Common Stock"
      CXW,Corrections Corporation of America Common Stock
      CYD,China Yuchai International Limited Common Stock
      CYH,"Community Health Systems, Inc. Common Stock"
      CYN,City National Corporation Common Stock
      CYN$C,City National Corporation Depositary Shares Representing 1/40th Perpetual Preferred Series Series C
      CYN$D,City National Corporation Depositary Shares Representing 1/40th Preferred Series D Fixed/Floating
      CYNI,"Cyan, Inc. Common Stock"
      CYS,"CYS Investments, Inc. Common Stock"
      CYS$A,CYS Investments Inc Cumulative Redeemable Preferred Series A
      CYS$B,"CYS Investments, Inc. Preferred Series B"
      CYT,Cytec Industries Inc. Common Stock
      CZZ,Cosan Limited Class A Common Stock
      D,"Dominion Resources, Inc. Common Stock"
      DAC,Danaos Corporation Common Stock
      DAL,"Delta Air Lines, Inc. Common Stock"
      DAN,Dana Holding Corporation Common Stock When
      DANG,E
      DAR,Darling Ingredients Inc. Common Stock
      DATA,"Tableau Software, Inc. Class A Common Stock"
      DB,Deutsche Bank AG Common Stock
      DBD,"Diebold, Incorporated Common Stock"
      DBL,DoubleLine Opportunistic Credit Fund Common Shares of Beneficial Interest
      DCA,Virtus Total Return Fund
      DCI,"Donaldson Company, Inc. Common Stock"
      DCM,"NTT DOCOMO, Inc American Depositary Shares"
      DCO,Ducommun Incorporated Common Stock
      DCT,DCT Industrial Trust Inc Common Stock
      DCUA,"Dominion Resources, Inc. Corporate Unit 2013 Series A"
      DCUB,"Dominion Resources, Inc. Corporate Unit 2013 Series B"
      DCUC,"Dominion Resources, Inc. VA New 2014 Series A Corp Unit"
      DD,E.I. du Pont de Nemours and Company Common Stock
      DD$A,E.I. du Pont de Nemours and Company Preferred Stock
      DD$B,E.I. du Pont de Nemours and Company Preferred Stock
      DDC,Dominion Diamond Corporation Common Stock
      DDD,3D Systems Corporation Common Stock
      DDE,Dover Downs Gaming & Entertainment Inc Common Stock
      DDF,"Delaware Investments Dividend & Income Fund, Inc. Common Stock"
      DDR,DDR Corp. Common Stock
      DDR$J,DDR Corporation Dep Shs Repstg 1/20th Pfd Cl J
      DDR$K,DDR Corp. DEPOSITARY SH REPSTG 1/20TH PDF CL K % (United States)
      DDS,"Dillard's, Inc. Common Stock"
      DDT,Dillard's Capital Trust I
      DE,Deere & Company Common Stock
      DECK,Deckers Outdoor Corporation Common Stock
      DEG,"Etablissements Delhaize Freres et Cie ""Le Lion"" S.A. Common Stock"
      DEI,"Douglas Emmett, Inc. Common Stock"
      DEL,Deltic Timber Corporation Common Stock
      DEO,Diageo plc Common Stock
      DEX,Delaware Enhanced Global Dividend Common Shares of Beneficial Interest
      DF,Dean Foods Company Common Stock
      DFP,Flaherty & Crumrine Dynamic Preferred and Income Fund Inc. Common Stock
      DFS,Discover Financial Services Common Stock
      DFS$B,Discover Financial Services Dep Shs
      DFT,"Dupont Fabros Technology, Inc. Common Stock"
      DFT$A,DuPont Fabros Technology Inc CUMULATIVE RED PERP PFD SER A
      DFT$B,"Dupont Fabros Technology, Inc. 7.625% Series B Cumulative Redeemable Perpetual Preferred Stock"
      DG,Dollar General Corporation Common Stock
      DGI,"DigitalGlobe, Inc Common Stock"
      DGX,Quest Diagnostics Incorporated Common Stock
      DHF,Dreyfus High Yield Strategies Fund Common Stock
      DHG,"Deutsche High Income Opportunities Fund, Inc  New Common Stock"
      DHI,"D.R. Horton, Inc. Common Stock"
      DHR,Danaher Corporation Common Stock
      DHT,"DHT Holdings, Inc."
      DHX,"Dice Holdings, Inc. Common Stock"
      DIAX,Nuveen Dow 30SM Dynamic Overwrite Fund Common Shares of Beneficial Interest
      DIN,"DineEquity, Inc Common Stock"
      DIS,Walt Disney Company (The) Common Stock
      DK,"Delek US Holdings, Inc. Common Stock"
      DKL,"Delek Logistics Partners, L.P. Common Units representing Limited Partner Interests"
      DKS,Dick's Sporting Goods Inc Common Stock
      DKT,Deutsch Bk Contingent Cap Tr V Tr Pfd Secs
      DL,China Distance Education Holdings Limited American Depositary Shares
      DLB,Dolby Laboratories Common Stock
      DLNG,Dynagas LNG Partners LP Common Units
      DLPH,Delphi Automotive plc Ordinary Shares
      DLR,"Digital Realty Trust, Inc. Common Stock"
      DLR$E,"Digital Realty Trust, Inc. Redeemable Pfd Ser E"
      DLR$F,"Digital Realty Trust, Inc. Preferred Series F"
      DLR$G,"Digital Realty Trust, Inc. Preferred Series G"
      DLR$H,"Digital Realty Trust, Inc. Redeemable Preferred Stock Series H"
      DLX,Deluxe Corporation Common Stock
      DM,"Dominion Midstream Partners, LP Common Units representing Limited Partner Interests"
      DMB,"Dreyfus Municipal Bond Infrastructure Fund, Inc. Common Stock"
      DMD,Demand Media Inc. Common Stock
      DMO,Western Asset Mortgage Defined Opportunity Fund Inc Common Stock
      DNB,Dun & Bradstreet Corporation (The) Common Stock
      DNI,Dividend and Income Fund Common Stock
      DNOW,NOW Inc. Common Stock
      DNP,"DNP Select Income Fund, Inc. Common Stock"
      DNR,Denbury Resources Inc. Common Stock
      DNY,The Denali Fund Inc
      DO,"Diamond Offshore Drilling, Inc. Common Stock"
      DOC,Physicians Realty Trust Common Shares of Beneficial Interest
      DOM,Dominion Resources Black Warrior Trust Common Stock
      DOOR,Masonite International Corporation Ordinary Shares (Canada)
      DOV,Dover Corporation Common Stock
      DOW,Dow Chemical Company (The) Common Stock
      DPG,Duff & Phelps Global Utility Income Fund Inc. Common Stock
      DPLO,"Diplomat Pharmacy, Inc. Common Stock"
      DPM,"DCP Midstream Partners, LP DCP Midstream Partnership, LP Common Units"
      DPS,"Dr Pepper Snapple Group, Inc Dr Pepper Snapple Group, Inc  Common Stock"
      DPZ,Domino's Pizza Inc Common Stock
      DQ,"DAQO New Energy Corp. American Depositary Shares, each representing five ordinary shares"
      DRA,Diversified Real Asset Income Fund Common Shares of Beneficial Interest
      DRC,Dresser
      DRD,DRDGOLD Limited American Depositary Shares
      DRE,Duke Realty Corporation Common Stock
      DRH,Diamondrock Hospitality Company Common Stock
      DRI,"Darden Restaurants, Inc. Common Stock"
      DRII,"Diamond Resorts International, Inc. Common Stock"
      DRL,Doral Financial Corporation NEW Common Stock
      DRQ,Dril
      DSE,Duff & Phelps Select Energy MLP Fund Inc. Common Stock
      DSL,DoubleLine Income Solutions Fund Common Shares of Beneficial Interests
      DSM,"Dreyfus Strategic Municipal Bond Fund, Inc. Common Stock"
      DST,"DST Systems, Inc. Common Stock"
      DSU,"Blackrock Debt Strategies Fund, Inc. Common Stock"
      DSW,DSW Inc. Common Stock
      DSX,Diana Shipping inc. common stock
      DSX$B,Diana Shipping Inc. Perpetual Preferred Shares Series B (Marshall Islands)
      DTE,DTE Energy Company Common Stock
      DTF,DTF Tax
      DTK,Deutsche Bk Contingent Cap Tr III Tr Pfd Secs
      DTLA$,Brookfield DTLA Inc. 7.625% Series A Cumulative Redeemable Preferred Stock
      DTQ,"DTE Energy Company 2012 Series C 5.25% Junior Subordinate Debentures due December 1, 2062"
      DTT,Deutsche Bank Cap Fdg Tr IX Guaranteed Trust Preferred Securities
      DTZ,DTE Energy Company 2011 Series I 6.50% Junior Subordinate Debentures due 2061
      DUA,Deutsche Bank Cap Fdg Tr VIII 6.375% Tr Pfd Secs
      DUC,"Duff & Phelps Utility & Corporate Bond Trust, Inc. Common Stock"
      DUK,Duke Energy Corporation (Holding Company) Common Stock
      DUKH,Duke Energy Corporation 5.125% Junior Subordinated Debentures due 2073
      DV,DeVry Education Group Inc. Common Stock
      DVA,DaVita HealthCare Partners Inc. Common Stock
      DVD,"Dover Motorsports, Inc. Common Stock"
      DVN,Devon Energy Corporation Common Stock
      DW,Drew Industries Incorporated Common Stock ($0.01 Par Value)
      DWRE,"DEMANDWARE, INC. Common Stock"
      DX,"Dynex Capital, Inc. Common Stock"
      DX$A,"Dynex Capital, Inc. Preferred Stock Series A"
      DX$B,"Dynex Capital, Inc. Preferred Series B"
      DXB,Deutsche Bk Contingent Cap TR II Tr Pfd Sec
      DY,"Dycom Industries, Inc. Common Stock"
      DYN,Dynegy Inc. Common Stock
      DYN$A,Dynegy Inc. Mandatory Preferred Convertible Series A%
      DYN.W,"Dynegy Inc. Warrant expiring October 2, 2017"
      E,ENI S.p.A. Common Stock
      EAA,"Entergy Arkansas, Inc. First Mortgage Bonds, 5.75% Series Due November 1, 2040"
      EAB,"Entergy Arkansas, Inc. First Mortgage Bonds, 4.90% Series Due December 1, 2052"
      EAE,"Entergy Arkansas, Inc. First Mortgage Bonds, 4.75% Series due June 1, 2063"
      EARN,Ellington Residential Mortgage REIT Common Shares of Beneficial Interest
      EAT,"Brinker International, Inc. Common Stock"
      EBF,"Ennis, Inc. Common Stock"
      EBR,Centrais Elc Braz Pfb B Elbras American Depositary Shares
      EBR.B,Centrais Elc Braz Pfb B Elbras American Depositary Shares
      EBS,"Emergent Biosolutions, Inc. Common Stock"
      EC,Ecopetrol S.A. American Depositary Shares
      ECA,Encana Corporation
      ECC,Eagle Point Credit Company Inc. Common Stock
      ECL,Ecolab Inc. Common Stock
      ECOM,ChannelAdvisor Corporation Common Stock
      ECR,Eclipse Resources Corporation Common Stock
      ECT,ECA Marcellus Trust I Common Units of Beneficial Interest
      ED,"Consolidated Edison, Inc. Common Stock"
      EDD,"Morgan Stanley Emerging Markets Domestic Debt Fund, Inc. Morgan Stanley Emerging Markets Domestic Debt Fund, Inc. Common Stock"
      EDE,Empire District Electric Company (The) Common Stock
      EDF,Stone Harbor Emerging Markets Income Fund Common Shares of Beneficial Interest
      EDI,Stone Harbor Emerging Markets Total Income Fund Common Shares of Beneficial Interests
      EDN,Empresa Distribuidora Y Comercializadora Norte S.A. (Edenor) Empresa Distribuidora Y Comercializadora Norte S.A. (Edenor) American Depositary Shares
      EDR,"Education Realty Trust, Inc. Common Stock"
      EDU,"New Oriental Education & Technology Group, Inc. Sponsored ADR representing 1 Ordinary Share (Cayman Islands)"
      EE,El Paso Electric Company Common Stock
      EEA,"The European Equity Fund, Inc. Common Stock"
      EEP,"Enbridge Energy, L.P. Class A Common Units"
      EEQ,Enbridge Energy Management LLC Shares repstg limited liability company interests
      EFC,"Ellington Financial LLC Common Shares representing Limitied Liability Company Interests, no par valu"
      EFF,Eaton vance Floating
      EFM,"Entergy Mississippi, Inc. First Mortgage Bonds, 6.20% Series due April 15, 2040"
      EFR,Eaton Vance Senior Floating
      EFT,Eaton Vance Floating Rate Income Trust Common Shares of Beneficial Interest
      EFX,"Equifax, Inc. Common Stock"
      EGF,"Blackrock Enhanced Government Fund, Inc. Common Stock"
      EGL,"Engility Holdings, Inc. Common Stock"
      EGN,Energen Corporation Common Stock
      EGO,Eldorado Gold Corporation Ordinary Shares
      EGP,"EastGroup Properties, Inc. Common Stock"
      EGY,Vaalco Energy Inc Common Stock
      EHI,Western Asset Global High Income Fund Inc Common Stock
      EHIC,eHi Car Services Limited American Depositary Shares
      EIG,Employers Holdings Inc Common Stock
      EIX,Edison International Common Stock
      EJ,E
      EL,"Estee Lauder Companies, Inc. (The) Common Stock"
      ELA,"Entergy Louisiana, LLC First Mortgage Bonds, 5.875% Series due June 15, 2041"
      ELB,"Entergy Louisiana, Inc. 6.0% Series Due March 15, 2040"
      ELJ,"Entergy Louisiana, Inc. First Mortgage Bonds, 5.25% Series due July 1, 2052"
      ELLI,"Ellie Mae, Inc. Common Stock"
      ELP,Companhia Paranaense de Energia (COPEL) Common Stock
      ELS,"Equity Lifestyle Properties, Inc. Common Stock"
      ELS$C,"Equity Lifestyle Properties, Inc. Depositary Shares each representing 1/100th of a share of 6.75% Series C Cumulative Redeemable Perpetual Preferred Stock"
      ELU,"Entergy Louisiana, Inc. First Mortgage Bonds, 4.70% Series due June 1, 2063"
      ELX,Emulex Corporation Common Stock
      ELY,Callaway Golf Company Common Stock
      EMC,EMC Corporation Common Stock
      EMD,"Western Asset Emerging Markets Income Fund, Inc. Common Stock"
      EME,"EMCOR Group, Inc. Common Stock"
      EMES,Emerge Energy Services LP Common Units representing Limited Partner Interests
      EMF,Templeton Emerging Markets Fund Common Stock
      EMN,Eastman Chemical Company Common Stock
      EMO,ClearBridge Energy MLP Opportunity Fund Inc. Common Stock
      EMQ,"Entergy Mississippi, Inc. 1st Mtg Bds"
      EMR,Emerson Electric Company Common Stock
      EMZ,"Entergy Mississippi, Inc. First Mortgage Bonds, 6.0% Series due May 1, 2051"
      ENB,Enbridge Inc Common Stock
      ENBL,"Enable Midstream Partners, LP Common Units representing limited partner interests"
      ENH,Endurance Specialty Holdings Ltd Common Stock
      ENH$A,Endurance Specialty Holdings Ltd Preferred Series A
      ENH$B,Endurance Specialty Holdings Ltd PFD SER B (Bermuda)
      ENI,Enersis S A Common Stock
      ENJ,"Entergy New Orleans, Inc. First Mortgage Bonds, 5.0% Series due December 1, 2052"
      ENL,Reed Elsevier NV American Depositary Shares
      ENLC,"EnLink Midstream, LLC Common Units representing Limited Partner Interests"
      ENLK,"EnLink Midstream Partners, LP Common Units Representing Limited Partnership Interests"
      ENR,"Energizer Holdings, Inc. Common Stock"
      ENS,Enersys Common Stock
      ENV,"Envestnet, Inc Common Stock"
      ENVA,"Enova International, Inc. Common Stock"
      ENZ,"Enzo Biochem, Inc. Common Stock ($0.01 Par Value)"
      EOC,Empresa Nacional de Electricidad S.A. Common Stock
      EOD,Wells Fargo Advantage Global Dividend Opportunity Fund
      EOG,"EOG Resources, Inc. Common Stock"
      EOI,Eaton Vance Enhance Equity Income Fund Eaton Vance Enhanced Equity Income Fund Shares of Beneficial Interest
      EOS,Eaton Vance Enhance Equity Income Fund II Common Stock
      EOT,Eaton Vance Municipal Income Trust EATON VANCE NATIONAL MUNICIPAL OPPORTUNITIES TRUST
      EP$C,El Paso Corporation Preferred Stock
      EPAM,"EPAM Systems, Inc. Common Stock"
      EPD,Enterprise Products Partners L.P. Common Stock
      EPE,EP Energy Corporation Class A Common Stock
      EPR,EPR Properties Common Stock
      EPR$C,EPR Properties 5.75% Series C Cumulative Convertible Preferred Shares
      EPR$E,EPR Properties Series E Cumulative Conv Pfd Shs Ser E
      EPR$F,EPR Properties Pfd Ser F
      EQC,Equity Commonwealth Common Shares of Beneficial Interest
      EQC$D,Equity Commonwealth 6.50% Pfd Conv Shs Ser D
      EQC$E,Equity Commonwealth 7.25% Series E Cumulative Redeemable Preferred Shares
      EQCO,Equity Commonwealth 5.75% Senior Notes due 2042
      EQM,"EQT Midstream Partners, LP Common Units representing Limited Partner Interests"
      EQR,Equity Residential Common Shares of Beneficial Interest
      EQS,"Equus Total Return, Inc. Common Stock"
      EQT,EQT Corporation Common Stock
      EQY,"Equity One, Inc. Common Stock"
      ERA,"Era Group, Inc. Common Stock"
      ERF,Enerplus Corporation Common Stock
      ERJ,Embraer S.A. Common Stock
      EROS,Eros International PLC A Ordinary Shares
      ESD,Western Asset Emerging Markets Debt Fund Inc Common Stock
      ESE,ESCO Technologies Inc. Common Stock
      ESI,"ITT Educational Services, Inc. Common Stock"
      ESL,Esterline Technologies Corporation Common Stock
      ESNT,Essent Group Ltd. Common Shares
      ESRT,"Empire State Realty Trust, Inc. Class A Common Stock"
      ESS,"Essex Property Trust, Inc. Common Stock"
      ESS$H,"Essex Property Trust, Inc. 7.125% Series H Cumulative Redeemable Preferred Stock"
      ESV,Ensco plc Class A Ordinary Shares
      ETB,Eaton Vance Tax
      ETE,"Energy Transfer Equity, L.P. Energy Transfer Equity, L.P. Common Units representing Limited Partnership interests"
      ETG,Eaton Vance Tax
      ETH,Ethan Allen Interiors Inc. Common Stock
      ETJ,Eaton Vance Risk
      ETM,Entercom Communications Corporation Common Stock
      ETN,"Eaton Corporation, PLC Ordinary Shares"
      ETO,Eaton Vance Tax
      ETP,"Energy Transfer Partners, L.P. ENERGY TRANSFER PARNTERS"
      ETR,Entergy Corporation Common Stock
      ETV,Eaton Vance Corporation Eaton Vance Tax
      ETW,Eaton Vance Corporation Eaton Vance Tax
      ETX,Eaton Vance Municipal Income Term Trust Common Shares of Beneficial Interest
      ETY,Eaton Vance Tax
      EV,Eaton Vance Corporation Common Stock
      EVC,Entravision Communications Corporation Common Stock
      EVDY,"Everyday Health, Inc. Common Stock"
      EVER,EverBank Financial Corp. Common Stock
      EVER$A,EverBank Financial Corp. Depositary Shares Representing 1/1000th Perpetual Preferred Series A
      EVF,Eaton Vance Senior Income Trust Common Stock
      EVG,Eaton Vance Short Diversified Income Fund Eaton Vance Short Duration Diversified Income Fund Common Shares of Beneficial Interest
      EVGN,Evogene Ltd Ordinary shares (Israel)
      EVHC,"Envision Healthcare Holdings, Inc. Common Stock"
      EVN,Eaton Vance Municipal Income Trust Common Stock
      EVR,Evercore Partners Inc Class A Common Stock
      EVT,Eaton Vance Tax Advantaged Dividend Income Fund Common Shares of Beneficial Interest
      EVTC,"Evertec, Inc. Common Stock"
      EW,Edwards Lifesciences Corporation Common Stock
      EXAM,"ExamWorks Group, Inc. Common Stock"
      EXAR,Exar Corporation Common Stock
      EXC,Exelon Corporation Common Stock
      EXCU,Exelon Corp. Conv Unit
      EXD,Eaton Vance Tax
      EXG,Eaton Vance Tax
      EXH,"Exterran Holdings, Inc. Common Stock"
      EXK,Endeavour Silver Corporation Ordinary Shares (Canada)
      EXL,"Excel Trust, Inc. Common Stock"
      EXL$B,"Excel Trust, Inc. 8.125% Series B Cumulative Redeemable Preferred Stock, $0.01 par value"
      EXP,Eagle Materials Inc Common Stock
      EXPR,"Express, Inc. Common Stock"
      EXR,Extra Space Storage Inc Common Stock
      EZT,"Entergy Texas Inc First Mortgage Bonds 5.625% Series due June 1, 2064"
      F,Ford Motor Company Common Stock
      FAC,First Acceptance Corporation
      FAF,First American Corporation (New) Common Stock
      FAM,First Trust/Aberdeen Global Opportunity Income Fund First Trust/Aberdeen Global Opportunity Income Fund Common Shares of Beneficial Interest
      FAV,First Trust Dividend and Income Fund Common Shares of Beneficial Interest
      FBC,"Flagstar Bancorp, Inc. Common Stock"
      FBHS,"Fortune Brands Home & Security, Inc. Common Stock"
      FBP,First BanCorp. New Common Stock
      FBR,Fibria Celulose S.A.
      FBS$A,First Preferred Cap Tr Iv First Preferred Capital Trust IV 8.15% Cum Trust Pfd Sec
      FC,Franklin Covey Company Common Stock
      FCAM,Fiat Chrysler Automobiles N.V. Mandatory Convertible Securities
      FCAU,Fiat Chrysler Automobiles N.V. Common Shares
      FCB,"FCB Financial Holdings, Inc. Class A Common Stock"
      FCE.A,"Forest City Enterprises, Inc. Common Stock"
      FCE.B,"Forest City Enterprises, Inc. Common Stock"
      FCF,First Commonwealth Financial Corporation Common Stock
      FCH,FelCor Lodging Trust Incorporated Common Stock
      FCH$A,FelCor Lodging Trust Incorporated Preferred Stock
      FCH$C,FelCor Lodging Trust Incorporated Dep Shares Representing 1/100 Preferred Series C
      FCN,"FTI Consulting, Inc. Common Stock"
      FCT,First Trust Senior Floating Rate Income Fund II Common Shares of Beneficial Interest
      FCX,Freeport
      FDI,"Fort Dearborn Income Securities, Inc. Common Stock"
      FDO,"Family Dollar Stores, Inc. Common Stock"
      FDP,"Fresh Del Monte Produce, Inc. Common Stock"
      FDS,FactSet Research Systems Inc. Common Stock
      FDX,FedEx Corporation Common Stock
      FE,FirstEnergy Corporation Common Stock
      FEI,First Trust MLP and Energy Income Fund Common Shares of Beneficial Interest
      FELP,Foresight Energy LP Common Units representing Limited Partner Interests
      FENG,"Phoenix New Media Limited American Depositary Shares, each representing 8 Class A ordinary shares."
      FEO,First Trust/Aberdeen Emerging Opportunity Fund Common Shares of Beneficial Interest
      FET,"Forum Energy Technologies, Inc. Common Stock"
      FF,FutureFuel Corp.  Common shares
      FFA,First Trust Enhanced Equity Income Fund
      FFC,Flaherty & Crumrine Preferred Securities Income Fund Incorporated
      FFG,"FBL Financial Group, Inc. Common Stock"
      FGB,First Trust Specialty Finance and Financial Opportunities Fund
      FGL,Fidelity & Guaranty Life Common Stock
      FGP,"Ferrellgas Partners, L.P. Common Stock"
      FHN,First Horizon National Corporation Common Stock
      FHN$A,First Horizon National Corporation Depositary Shares
      FHY,First Trust Strategic High Income Fund II First Trust Strategic High Income Fund II Common Shares of Beneficial Interest
      FI,Frank's International N.V. Common Stock
      FICO,Fair Isaac Corproation Common Stock
      FIF,First Trust Energy Infrastructure Fund Common Shares of Beneficial Interest
      FIG,Fortress Investment Group LLC Class A Common Stock
      FII,"Federated Investors, Inc. Common Stock"
      FIS,"Fidelity National Information Services, Inc. Common Stock"
      FIX,"Comfort Systems USA, Inc. Common Stock"
      FL,"Foot Locker, Inc."
      FLC,Flaherty & Crumrine Total Return Fund Inc Common Stock
      FLO,"Flowers Foods, Inc. Common Stock"
      FLR,Fluor Corporation Common Stock
      FLS,Flowserve Corporation Common Stock
      FLT,"FleetCor Technologies, Inc. Common Stock"
      FLTX,Fleetmatics Group PLC Ordinary Shares
      FLY,Fly Leasing Limited
      FMC,FMC Corporation Common Stock
      FMD,First Marblehead Corporation (The) Common Stock
      FMER$A,FirstMerit Corporation Depositary Shares
      FMN,Federated Premier Municipal Income Fund Federated Premier Municipal Income Fund
      FMO,Fiduciary/Claymore MLP Opportunity Fund Fiduciary/Claymore MLP Opportunity Fund Common Shares of Beneficial Interest
      FMS,Fresenius Medical Care AG Common Stock
      FMSA,FMSA Holdings Inc. Common Stock
      FMX,Fomento Economico Mexicano S.A.B. de C.V. Common Stock
      FMY,First Trust Motgage Income Fund Common Shares of Beneficial Interest
      FN,Fabrinet Ordinary Shares
      FNB,F.N.B. Corporation Common Stock
      FNB$E,"F.N.B. Corporation Depositary Shares, each representing a 1/40th interest in a share of Fixed"
      FNF,"FNF Group of Fidelity National Financial, Inc. Common Stock"
      FNFG$B,First Niagara Financial Group Inc. PFD NON CUM SER B FXD/FLTG
      FNFV,"FNFV Group of Fidelity National Financial, Inc. Common Stock"
      FNV,Franco
      FOE,Ferro Corporation Common Stock
      FOF,Cohen & Steers Closed
      FOR,Forestar Group Inc Common Stock
      FPF,First Trust Intermediate Duration Preferred & Income Fund Common Shares of Beneficial Interest
      FPL,First Trust New Opportunities MLP & Energy Fund Common Shares of Beneficial Interest
      FPO,First Potomac Realty Trust Common Shares of Beneficial Interest
      FPO$A,First Potomac Realty Trust CUMULATIVE REDEEMABLE PFD PERPETUAL SER A
      FPT,Federated Premier Intermediate Municipal Income Fund Federated Premier Intermediate Municipal Income Fund
      FR,"First Industrial Realty Trust, Inc. Common Stock"
      FRA,Blackrock Floating Rate Income Strategies Fund Inc  Common Stock
      FRC,FIRST REPUBLIC BANK Common Stock
      FRC$A,First Republicbank Corp DEP SHS REPSTG 1/40TH PERP PFD SER A
      FRC$B,First Republic Bank Depositary Shares Representing 1/40th Perpetual Preferred Series B
      FRC$C,FIRST REPUBLIC BANK Dep Shs Repstg 1/40th Perp Pfd Ser C
      FRC$D,First Republic Bank San Francisco California Depositary Shares Representing 1/40th Perpetual Preferred Series D
      FRC$E,FIRST REPUBLIC BANK Depositary Shs Repstg 1/40th Perp Pfd Ser E Fixed To Fltg (RATE)
      FRM,Furmanite Corporation Common Stock
      FRO,Frontline Ltd. Ordinary Shares
      FRT,Federal Realty Investment Trust Common Stock
      FSCE,Fifth Street Finance Corp. 5.875% Senior Notes due 2024
      FSD,First Trust High Income Long Short Fund Common Shares of Beneficial Interest
      FSIC,FS Investment Corporation Common Stock
      FSL,"Freescale Semiconductor, Ltd Common Shares"
      FSM,Fortuna Silver Mines Inc Ordinary Shares (Canada)
      FSS,Federal Signal Corporation Common Stock
      FT,Franklin Universal Trust Common Stock
      FTI,"FMC Technologies, Inc. Common Stock"
      FTK,"Flotek Industries, Inc. Common Stock"
      FTT,Federated Enhanced Treasury Income Fund Common Shares of Beneficial Interest
      FUL,H. B. Fuller Company Common Stock
      FUN,"Cedar Fair, L.P. Common Stock"
      FUR,Winthrop Realty Trust New Common Stock
      FVE,"Five Star Quality Care, Inc. Common Stock"
      FXCM,FXCM Inc. Class A Common Stock
      G,Genpact Limited Common Stock
      GAB,"Gabelli Equity Trust, Inc. (The) Common Stock"
      GAB$D,"Gabelli Equity Trust, Inc. (The) Preferred Stock Series D"
      GAB$G,"Gabelli Equity Trust, Inc. (The) Series G Cumulative Preferred Stock"
      GAB$H,"Gabelli Equity Trust, Inc. (The) Pfd Ser H"
      GAM,"General American Investors, Inc. Common Stock"
      GAM$B,"General American Investors Company, Inc. Cumulative Preferred Stock"
      GAS,"AGL Resources, Inc. Common Stock"
      GB,"Greatbatch, Inc. Common Stock"
      GBAB,Guggenheim Build America Bonds Managed Duration Trust Common Shares of Beneficial Interest
      GBL,"Gamco Investors, Inc. Common Stock"
      GBX,"Greenbrier Companies, Inc. (The) Common Stock"
      GCA,"Global Cash Access Holdings, Inc. Common Stock"
      GCAP,"GAIN Capital Holdings, Inc. Common Stock"
      GCH,"Aberdeen Greater China Fund, Inc. Common Stock"
      GCI,"Gannett Co., Inc. Common Stock"
      GCO,Genesco Inc. Common Stock
      GCV,"Gabelli Convertible and Income Securities Fund, Inc. (The) Common Stock"
      GCV$B,"Gabelli Convertible and Income Securities Fund, Inc. (The) Series B 6.00% Cumulative Preferred Stock"
      GD,General Dynamics Corporation Common Stock
      GDF,"Western Asset Global Partners Income Fund, Inc. Common Stock"
      GDL,"GDL Fund, The Common Shares of Beneficial Interest"
      GDL$B,The GDL Fund Series B Cumulative Puttable and Callable Preferred Shares
      GDO,Western Asset Global Corporate Defined Opportunity Fund Inc. Western Asset Global Corporate Defined Opportunity Fund Inc.
      GDOT,"Green Dot Corporation Class A Common Stock, $0.001 par value"
      GDP,Goodrich Petroleum Corporation Common Stock
      GDP$C,Goodrich Petroleum Corporation Depositary Shares Representing 1/1000th Preferred Series C
      GDP$D,Goodrich Petroleum Corporation Depositary Shares Representing 1/1000th Preferred Series D
      GDV,Gabelli Dividend & Income Trust Common Shares of Beneficial Interest
      GDV$A,Gabelli Dividend & Income Tr Preferred Series A
      GDV$D,Gabelli Dividend Pfd Series D
      GE,General Electric Company Common Stock
      GEB,"General Electric Company 4.875% Notes due October 15, 2052"
      GEF,Greif Inc. Class A Common Stock
      GEF.B,"Greif, Inc. Corporation Class B Common Stock"
      GEH,"General Electric Capital Corporation 4.876% Notes due January 29, 2053"
      GEK,"General Electric Capital Corporation 4.70% Notes due May 16, 2053"
      GEL,"Genesis Energy, L.P. Common Units"
      GEO,Geo Group Inc (The) REIT
      GEQ,Guggenheim Equal Weight Enhanced Equity Income Fund Common Shares of Beneficial Interest
      GER,Goldman Sachs MLP Energy Renaissance Fund
      GES,"Guess?, Inc. Common Stock"
      GF,"New Germany Fund, Inc. (The) Common Stock"
      GFA,Gafisa SA Gafisa S.A. American Depositary Shares
      GFF,Griffon Corporation Common Stock
      GFI,Gold Fields Limited American Depositary Shares
      GFIG,GFI Group Inc. Common Stock
      GFY,Western Asset Variable Rate Strategic Fund Inc. Common Stock
      GG,Goldcorp Inc. Common Stock
      GGB,Gerdau S.A. Common Stock
      GGE,Guggenheim Enhanced Equity Strategy Fund
      GGG,Graco Inc. Common Stock
      GGM,Guggenheim Credit Allocation Fund Common Shares of Beneficial Interest
      GGP,"General Growth Properties, Inc. Common Stock"
      GGP$A,"General Growth Properties, Inc. Preferred Series A"
      GGT,Gabelli Multi
      GGT$B,Gabelli Multi
      GGZ,Gabelli Global Small and Mid Cap Value Trust (The) Common Shares of Beneficial Interest
      GHC,Graham Holdings Company Common Stock
      GHI,"Global High Income Fund, Inc. Common Stock"
      GHL,"Greenhill & Co., Inc. Common Stock"
      GHM,Graham Corporation Common Stock
      GHY,"Prudential Global Short Duration High Yield Fund, Inc. Common Stock"
      GIB,"CGI Group, Inc. Common Stock"
      GIL,"Gildan Activewear, Inc. Class A Sub. Vot. Common Stock"
      GIM,"Templeton Global Income Fund, Inc. Common Stock"
      GIMO,Gigamon Inc. Common Stock
      GIS,"General Mills, Inc. Common Stock"
      GJH,Synthetic Fixed
      GJO,Synthetic Fixed
      GJP,Synthetic Fixed
      GJR,Synthetic Fixed
      GJS,"Goldman Sachs Group Securities STRATS Trust for Goldman Sachs Group Securities, Series 2006"
      GJT,Synthetic Fixed
      GJV,Synthetic Fixed
      GLF,"GulfMark Offshore, Inc. New Common Stock"
      GLOB,Globant S.A. Common Shares
      GLOG,GasLog Ltd. Common Shares
      GLOP,GasLog Partners LP Common Units representing limited partnership interests
      GLP,Global Partners LP Global Partners LP Common Units representing Limited Partner Interests
      GLPW,Global Power Equipment Group Inc Common Stock
      GLT,Glatfelter Common Stock
      GLW,Corning Incorporated Common Stock
      GM,General Motors Company Common Stock
      GM.A,General Motors Company Warrant (Expires 07/10/2016)
      GM.B,General Motors Company Warrant (Expires 07/10/2019)
      GM.C,"General Motors Company Warrants (expiring December 31, 2015)"
      GME,Gamestop Corporation Common Stock
      GMED,"Globus Medical, Inc. Class A Common Stock"
      GMK,"GRUMA, S.A.B de C.V. Common Stock"
      GMT,GATX Corporation Common Stock
      GMZ,Goldman Sachs MLP Income Opportunities Fund
      GNC,"GNC Holdings, Inc. Class A Common Stock"
      GNE,Genie Energy Ltd. Class B Common Stock Stock
      GNE$A,Genie Energy Ltd. Series 2012
      GNI,Great Northern Iron Ore Properties Common Stock
      GNRC,Generac Holdlings Inc. Common Stock
      GNT,"GAMCO Natural Resources, Gold & Income Trust"
      GNW,Genworth Financial Inc Common Stock
      GOF,Guggenheim Strategic Opportunities Fund Common Shares of Beneficial Interest
      GOL,Gol Linhas Aereas Inteligentes S.A. Sponsored ADR representing Pfd Shares
      GOV,Government Properties Income Trust Common Shares of Beneficial Interest
      GPC,Genuine Parts Company Common Stock
      GPE$A,"Georgia Power Company Georgia Power Company 6 1/8% Series Class A Preferred Stock, Non"
      GPI,"Group 1 Automotive, Inc. Common Stock"
      GPK,Graphic Packaging Holding Company
      GPM,Guggenheim Enhanced Equity Income Fund
      GPN,Global Payments Inc. Common Stock
      GPRK,Geopark Ltd Common Shares
      GPS,"Gap, Inc. (The) Common Stock"
      GPT,Gramercy Property Trust Inc. Common Stock
      GPT$B,Gramercy Property Trust Inc. Preferred Series B
      GPX,GP Strategies Corporation Common Stock
      GRA,W.R. Grace & Co. Common Stock
      GRAM,"Grana y Montero S.A.A. American Depositary Shares, each representing five Common Shares"
      GRO,Agria Corporation American Depositary Shares
      GRP.U,"Granite Real Estate Inc. Stapled Units, each consisting of one unit of Granite Real Estate Trust and one common share of Granite REIT Inc."
      GRR,"Asia Tigers Fund, Inc. (The) Common Stock"
      GRT,Glimcher Realty Trust Common Stock
      GRT$G,Glimcher Realty Trust Preferred Shares of Beneficial Interest Series G
      GRT$H,Glimcher Reatly Tr Pfd Sh Ben Int Ser H %
      GRT$I,Glimcher Realty Trust 6.875% Cumulative Redeemable Preferred Shares of Beneficial Interest
      GRUB,GrubHub Inc. Common Stock
      GRX,The Gabelli Healthcare & Wellness Trust Common Shares of Beneficial Interest
      GRX$A,Gabelli Healthcare PFD SER A
      GRX$B,Gabelli Healthcare Preferred Series B
      GS,"Goldman Sachs Group, Inc. (The) Common Stock"
      GS$A,"Goldman Sachs Group, Inc. (The) Depositary Shares each representing 1/1000th Interest in a Share of Floating Rate Non"
      GS$B,"Goldman Sachs Group, Inc. (The) Depositary Share repstg 1/1000th Preferred Series B"
      GS$C,"Goldman Sachs Group, Inc. (The) Depositary Share repstg 1/1000th Preferred Series C"
      GS$D,"Goldman Sachs Group, Inc. (The) Dep Shs repstg 1/1000 Pfd Ser D Fltg"
      GS$I,"Goldman Sachs Group, Inc. (The) Perpetual Preferred Series I"
      GS$J,Goldman Sachs Group Inc Depositary Shs Repstg 1/1000th Pfd Ser J Fixed to Fltg Rate
      GS$K,"Goldman Sachs Group, Inc. (The) Dep Shs Repstg 1/1000 Int Sh Fxd/Fltg Non Cum Pfd Stk Ser K"
      GSF,"Goldman Sachs Group, Inc. (The) 6.125% Notes due 2060"
      GSH,Guangshen Railway Company Limited Common Stock
      GSI,"General Steel Holdings, Inc. Common Stock"
      GSJ,"Goldman Sachs Group, Inc. (The) 6.50% Notes due 2061"
      GSK,GlaxoSmithKline PLC Common Stock
      GSL,Global Ship Lease Inc New Class A Common Shares
      GSL$B,"Global Ship Lease, Inc. Depository Shares Representing 1/100th Perpetual Preferred Series B% (Marshall Island)"
      GTI,GrafTech International Ltd (Holding Co.) Common Stock
      GTN,"Gray Communications Systems, Inc. Common Stock"
      GTN.A,"Gray Television, Inc. CLass A Common Stock"
      GTS,Triple
      GTT,"GTT Communications, Inc. Common Stock"
      GTY,Getty Realty Corporation Common Stock
      GUA,"Gulf Power Company Series 2011A 5.75% Senior Notes due June 1, 2051"
      GUT,Gabelli Utility Trust (The) Common Stock
      GUT$A,Gabelli Utility Trust (The) 5.625% Series A Cumulative Preferred Shares
      GVA,Granite Construction Incorporated Common Stock
      GWB,"Great Western Bancorp, Inc. Common Stock"
      GWR,Genesee & Wyoming Inc. Class A Common Stock
      GWRE,"Guidewire Software, Inc. Common Stock"
      GWRU,"Genesee & Wyoming, Inc. Tangible Equity Unit"
      GWW,"W.W. Grainger, Inc. Common Stock"
      GXP,Great Plains Energy Incorporated Common Stock
      GXP$A,Great Plains Energy Incorporated Preferred Stock
      GXP$D,Great Plains Energy Incorporated Preferred Stock
      GXP$E,Great Plains Energy Incorporated Preferred Stock
      GY,GenCorp Inc. Common Stock
      GYB,CABCO Series 2004
      GYC,Corporate Asset Backed Corp CABCO Corporate Asset Backed Corporation CABCO Series 2004
      GZT,Gazit
      H,Hyatt Hotels Corporation Class A Common Stock
      HAE,Haemonetics Corporation Common Stock
      HAL,Halliburton Company Common Stock
      HAR,"Harman International Industries, Incorporated Common Stock"
      HASI,"Hannon Armstrong Sustainable Infrastructure Capital, Inc. Common Stock"
      HBI,Hanesbrands Inc. Common Stock
      HBM,Hudbay Minerals Inc Ordinary Shares (Canada)
      HBM.W,HudBay Minerals Inc Warrants Expiring 07/20/2018 (Canada)
      HCA,"HCA Holdings, Inc. Common Stock"
      HCC,"HCC Insurance Holdings, Inc. Common Stock"
      HCI,"HCI Group, Inc. Common Stock"
      HCJ,"HCI Group, Inc. 8% Senior Notes due 2020"
      HCLP,Hi
      HCN,"Health Care REIT, Inc. Common Stock"
      HCN$I,"Health Care REIT, Inc. PFD PERPETUAL CONV SER I"
      HCN$J,HEALTH CARE REIT INC Preferred Stock 6.5% PFD SERIES J
      HCP,"HCP, Inc. Common Stock"
      HD,"Home Depot, Inc. (The) Common Stock"
      HDB,HDFC Bank Limited Common Stock
      HDY,HyperDynamics Corporation Common Stock
      HE,"Hawaiian Electric Industries, Inc. Common Stock"
      HE$U,"Hawaiian Electric Industries, Inc. 6.5 % Cum QUIPS"
      HEI,Heico Corporation Common Stock
      HEI.A,Heico Corporation Common Stock
      HELI,CHC Group Ltd. Ordinary Shares
      HEP,"Holly Energy Partners, L.P. Common Stock"
      HEQ,John Hancock Hedged Equity & Income Fund Common Shares of Beneficial Interest
      HES,Hess Corporation Common Stock
      HF,"HFF, Inc. Common Stock, Class A"
      HFC,HollyFrontier Corporation Common Stock
      HGG,"HHGregg, Inc. Common Stock"
      HGH,"Hartford Financial Services Group, Inc. (The) 7.875% Fixed to Floating Rate Junior Subordinated Debentures due 2042"
      HGR,"Hanger, Inc. Common Stock ($0.01 Par Value)"
      HGT,Hugoton Royalty Trust Common Stock
      HHC,Howard Hughes Corporation (The) Common Stock
      HHS,Harte
      HHY,Brookfield High Income Fund Inc.
      HI,Hillenbrand Inc Common Stock
      HIE,Miller/Howard High Income Equity Fund Common Shares of Beneficial Interest
      HIG,"Hartford Financial Services Group, Inc. (The) Common Stock"
      HIG.W,"Hartford Financial Services Group, Inc. (The) Warrants expiring June 26, 2019"
      HII,"Huntington Ingalls Industries, Inc. Common Stock"
      HIL,"Hill International, Inc. Common Stock"
      HIO,"Western Asset High Income Opportunity Fund, Inc. Common Stock"
      HIVE,"Aerohive Networks, Inc. Common Stock"
      HIW,"Highwoods Properties, Inc. Common Stock"
      HIX,Western Asset High Income Fund II Inc. Common Stock
      HJV,"MS Structured Asset Corp MS Structured Asset Corp. SATURNS J.C. Penney Company, Inc. Debenture Backed Series 2007"
      HK,Halcon Resources Corporation Common Stock
      HL,Hecla Mining Company Common Stock
      HL$B,Hecla Mining Company Preferred Stock
      HLF,Herbalife Ltd. Common Stock
      HLS,HealthSouth Corporation Common Stock
      HLT,Hilton Worldwide Holdings Inc. Common Stock
      HLX,"Helix Energy Solutions Group, Inc. Common Stock"
      HMC,"Honda Motor Company, Ltd. Common Stock"
      HME,"Home Properties, Inc. Common Stock"
      HMLP,Hoegh LNG Partners LP Common Units representing Limited Partner Interests
      HMN,Horace Mann Educators Corporation Common Stock
      HMY,Harmony Gold Mining Company Limited
      HNI,HNI Corporation Common Stock
      HNP,Huaneng Power Intl Common Stock
      HNR,Harvest Natural Resources Inc
      HNT,Health Net Inc. Common Stock
      HOG,Harley
      HON,Honeywell International Inc. Common Stock
      HOS,Hornbeck Offshore Services Common Stock
      HOT,"Starwood Hotels & Resorts Worldwide, Inc. Common Stock"
      HOV,"Hovnanian Enterprises, Inc. Class A Common Stock"
      HP,"Helmerich & Payne, Inc. Common Stock"
      HPF,John Hancock Pfd Income Fund II Pfd Income Fund II
      HPI,John Hancock Preferred Income Fund Common Shares of Beneficial Interest
      HPP,"Hudson Pacific Properties, Inc. Common Stock"
      HPP$B,"Hudson Pacific Properties, Inc. 8.375% Series B Cumulative Redeemable Preferred shares"
      HPQ,Hewlett
      HPS,John Hancock Preferred Income Fund III Preferred Income Fund III
      HPT,Hospitality Properites Trust Common Stock
      HPT$D,Hospitality Properties Trust Preferred Stock
      HPY,"Heartland Payment Systems, Inc. Common Stock"
      HQH,Tekla Healthcare Investors Common Stock
      HQL,TeklaLife Sciences Investors Common Stock
      HR,Healthcare Realty Trust Incorporated Common Stock
      HRB,"H&R Block, Inc. Common Stock"
      HRC,Hill
      HRG,Harbinger Group Inc Common Stock
      HRL,Hormel Foods Corporation Common Stock
      HRS,Harris Corporation Common Stock
      HRTG,"Heritage Insurance Holdings, Inc. Common Stock"
      HSBC,"HSBC Holdings, plc. Common Stock"
      HSBC$A,"HSBC Holdings, plc. ADR SER A REP 1/40 PFD SER A"
      HSC,Harsco Corporation Common Stock
      HSEA,"HSBC Holdings, plc. Perpetual Sub Cap Secs"
      HSEB,HSBC Holdings plc PERP SUB CAP SECS EXCH PREF SHS SER 2 (United Kingdom)
      HSFC$B,HSBC Finance Corp Dep. Shares reptsg 1/40 Preferred Series B
      HSP,Hospira Inc
      HST,"Host Hotels & Resorts, Inc. Common Stock"
      HSY,The Hershey Company Common Stock
      HT,Hersha Hospitality Trust Class A Common Shares of Beneficial Interest
      HT$B,Hersha Hospitality Trust PFD SER B
      HT$C,Hersha Hospitality Trust 6.875% Series C Cumulative Redeemable Preferred Shares of Beneficial Interest
      HTA,"Healthcare Trust of America, Inc. Class A Common Stock"
      HTD,John Hancock Tax Advantaged Dividend Income Fund Common Shares of Beneficial Interest
      HTF,Horizon Technology Finance Corporation 7.375% Senior Notes due 2019
      HTGC,"Hercules Technology Growth Capital, Inc. Common Stock"
      HTGX,"Hercules Technology Growth Capital, Inc. 6.25% Notes due 2024"
      HTGY,"Hercules Technology Growth Capital, Inc. 7.00% Senior Notes due 2019"
      HTGZ,"Hercules Technology Growth Capital, Inc. 7.00% Note due 2019"
      HTH,Hilltop Holdings Inc.
      HTR,Brookfield Total Return Fund Inc. (The) Common Stock
      HTS,Hatteras Financial Corp Hatteras Financial Corp  Common Stock
      HTS$A,Hatteras Financial Corp Cum Redeemable Pfd Ser A
      HTY,John Hancock Tax
      HTZ,"Hertz Global Holdings, Inc Common Stock"
      HUB.A,Hubbell Inc A Common Stock
      HUB.B,Hubbell Inc Common Stock Class B
      HUBS,"HubSpot, Inc. Common Stock"
      HUM,Humana Inc. Common Stock
      HUN,Huntsman Corporation Common Stock
      HUSI$D,"HSBC USA, Inc. Preferred Stock"
      HUSI$F,"HSBC USA, Inc. Preferred Series F Floating Rate"
      HUSI$G,"HSBC USA, Inc. Dep Shs repstg 1/40 Preferred Series G"
      HUSI$H,"HSBC USA, Inc. Depositary Sh repstg 1/40th Preferred Series H"
      HUSI$Z,"HSBC USA, Inc. Preferred Stock"
      HVB,Hudson Valley Holding Corp. Common Stock
      HVT,"Haverty Furniture Companies, Inc. Common Stock"
      HVT.A,"Haverty Furniture Companies, Inc. Common Stock"
      HW,Headwaters Incorporated Common Stock
      HXL,Hexcel Corporation Common Stock
      HY,Hyster
      HYB,"New America High Income Fund, Inc. (The) Common Stock"
      HYF,"Managed High Yield Plus Fund, Inc. Common Stock"
      HYH,"Halyard Health, Inc. Common Stock"
      HYI,Western Asset High Yield Defined Opportunity Fund Inc. Common Stock
      HYT,"Blackrock Corporate High Yield Fund, Inc. Common Stock"
      HZO,"MarineMax, Inc. Common Stock"
      I,Intelsat S.A. Common Shares
      I$A,Intelsat S.A. Series A mandatory convefrtible junior non
      IAE,Voya Asia Pacific High Dividend Equity Income Fund ING Asia Pacific High Dividend Equity Income Fund Common Shares of Beneficial Interest
      IAG,Iamgold Corporation Ordinary Shares
      IBA,"Industrias Bachoco, S.A.B. de C.V. Common Stock"
      IBM,International Business Machines Corporation Common Stock
      IBN,ICICI Bank Limited Common Stock
      IBP,"Installed Building Products, Inc. Common Stock"
      ICA,Empresas Ica Soc Contrladora Common Stock
      ICB,"MS Income Securities, Inc. Common Stock"
      ICD,"Independence Contract Drilling, Inc. Common Stock"
      ICE,Intercontinental Exchange Inc. Common Stock
      ICL,Israel Chemicals Limited Ordinary Shares
      IDA,"IDACORP, Inc. Common Stock"
      IDE,"Voya Infrastructure, Industrials and Materials Fund Common Shares of Beneficial Interest"
      IDG,ING GROEP N V PREF CTF 7.3750% Perp Hybrid Cap Secs (Netherlands)
      IDT,IDT Corporation Class B Common Stock
      IEH,Integrys Energy Group 6.00% Junior Subordinated Notes Due 2073
      IEX,IDEX Corporation Common Stock
      IFF,"Internationa Flavors & Fragrances, Inc. Common Stock"
      IFN,"India Fund, Inc. (The) Common Stock"
      IFT,"Imperial Holdings, Inc. Common Stock"
      IGA,Voya Global Advantage and Premium Opportunity Fund Common Shares of Beneficial Interest
      IGD,Voya Global Equity Dividend and Premium Opportunity Fund
      IGI,Western Asset Investment Grade Defined Opportunity Trust Inc. Common Stock
      IGR,CBRE Clarion Global Real Estate Income Fund Common Stock
      IGT,International Game Technology Common Stock
      IHC,Independence Holding Company Common Stock
      IHD,Voya Emerging Markets High Income Dividend Equity Fund Common Shares
      IHG,Intercontinental Hotels Group American Depositary Shares (Each representing one Ordinary Share)
      IHS,IHS Inc. IHS Inc. Class A Common Stock
      IID,Voya International High Dividend Equity Income Fund Common Shares of Beneficial Interest
      IIF,"Morgan Stanley India Investment Fund, Inc. Common Stock"
      IIM,Invesco Value Municipal Income Trust Common Stock
      IL,"IntraLinks Holdings, Inc. Common Stock $0.001 par value"
      IM,Ingram Micro Inc. Common Stock
      IMAX,Imax Corporation Common Stock
      IMN,Imation Corporation Common Stock
      IMPR,"Imprivata, Inc. Common Stock"
      IMPV,"Imperva, Inc. Common Stock"
      IMS,"IMS Health Holdings, Inc. Common Stock"
      INB,"Cohen & Steers Global Income Builder, Inc. Common Shares of Beneficial Interest"
      IND,"ING Group, N.V. Perpetual Debt Securities"
      INF,Brookfield Global Listed Infrastructure Income Fund Closed End Fund
      INFY,Infosys Limited American Depositary Shares
      ING,"ING Group, N.V. Common Stock"
      INGR,Ingredion Incorporated Common Stock
      INN,"Summit Hotel Properties, Inc. Common Stock"
      INN$A,"Summit Hotel Properties, Inc. 9.25% Series A Cumulative Redeemable Preferred Stock"
      INN$B,"Summit Hotel Properties, Inc. Pfd Ser B"
      INN$C,"Summit Hotel Properties, Inc. 7.125% Series C Cumulative Redeemable Preferred Stock"
      INT,World Fuel Services Corporation Common Stock
      INVN,"InvenSense, Inc. Common Stock"
      INXN,InterXion Holding N.V. Ordinary Shares (0.01 nominal value)
      INZ,Ing Groep NV Perpetual Debt Securities
      IO,Ion Geophysical Corporation Common Stock
      IOC,InterOil Corporation
      IP,International Paper Company Common Stock
      IPG,"Interpublic Group of Companies, Inc. (The) Common Stock"
      IPHI,Inphi Corporation Common Stock $0.001 par value
      IPI,"Intrepid Potash, Inc Common Stock"
      IPL$D,Interstate Power & Light Company Perp Prd Ser D
      IQI,Invesco Quality Municipal Income Trust Common Stock
      IR,Ingersoll
      IRC,Inland Real Estate Corporation Common Stock
      IRC$A,"Inland Real Estate Corporation 8.125% Series A Cumulative Redeemable Preferred Stock, $0.01 par value"
      IRC$B,Inland Real Estate Corporation Redeemable Preferred Series B
      IRE,Governor and Company of the Bank of Ireland (The) Common Stock
      IRET,Investors Real Estate Trust Shares of Beneficial Interest
      IRET$,Investors Real Estate Trust Series A Cumulative Redeemable Preferred Shares of Beneficial Interest
      IRET$B,Investors Real Estate Trust 7.95% Series B Cumulative Redeemable Preferred Shares
      IRF,International Rectifier Corporation Common Stock
      IRL,"New Ireland Fund, Inc (The) Common Stock"
      IRM,Iron Mountain Incorporated (Delaware)Common Stock
      IRR,Voya Natural Resources Equity Income Fund Common Shares of Beneficial Interest
      IRS,IRSA Inversiones Y Representaciones S.A. Common Stock
      ISD,"Prudential Short Duration High Yield Fund, Inc. Common Stock"
      ISF,"ING Group, N.V. Perp Hybrid Cap Secs (Netherlands)"
      ISG,"ING Group, N.V. Perpetual Dent Secs 6.125%"
      ISH,International Shipholding Corporation Common Stock
      ISH$A,International Shipholding Corporation Cumulative Redeemable Perpetual Preferred Series A
      ISH$B,International Shipholding Corporation PERP PFD SER B
      ISP,ING Groep NV 6.20% Perpetual Debt Securities (Netherlands)
      IT,"Gartner, Inc. Common Stock"
      ITC,ITC Holdings Corp. Common Stock
      ITG,"Investment Technology Group, Inc. Common Stock"
      ITT,ITT Corporation Common Stock New
      ITUB,Itau Unibanco Banco Holding SA American Depositary Shares (Each repstg 500 Preferred shares)
      ITW,Illinois Tool Works Inc. Common Stock
      IVC,Invacare Corporation Common Stock
      IVH,Ivy High Income Opportunities Fund Common Shares of Beneficial Interest
      IVR,INVESCO MORTGAGE CAPITAL INC Common Stock
      IVR$A,Invesco Mortgage Capital Inc. Pfd Ser A
      IVR$B,Invesco Mortgage Capital Inc. Preferred Series B Cum Fxd to Fltg
      IVZ,Invesco Plc New Common Stock
      IX,Orix Corp Ads Common Stock
      JAH,Jarden Corporation Common Stock
      JBK,Lehman ABS 3.50 3.50% Adjustable Corp Backed Tr Certs GS Cap I
      JBL,"Jabil Circuit, Inc. Common Stock"
      JBN,"Select Asset Inc. Select Asset Inc. on behalf of Corporate Backed Callable Trust Certificates, J.C. Penney Debenture Backed Series 2007"
      JBR,"Select Asset Inc. Corporate Backed Callable Trust Certificates, J.C. Penney Debenture"
      JBT,John Bean Technologies Corporation Common Stock
      JCE,Nuveen Core Equity Alpha Fund Nuveen Core Equity Alpha Fund Common Shares of Beneficial Interest
      JCI,"Johnson Controls, Inc. Common Stock"
      JCP,"J.C. Penney Company, Inc. Holding Company Common Stock"
      JDD,Nuveen Diversified Dividend and Income Fund Shares of Beneficial Interest
      JE,"Just Energy Group, Inc. Ordinary Shares (Canada)"
      JEC,Jacobs Engineering Group Inc. Common Stock
      JEQ,"Aberdeen Japan Equity Fund, Inc.  Common Stock"
      JFC,"JPMorgan China Region  Fund, Inc. Common Stock"
      JFR,Nuveen Floating Rate Income Fund Common Stock
      JGH,Nuveen Global High Income Fund Common Shares of Beneficial Interest
      JGV,Nuveen Global Equity Income Fund
      JGW,J.G. Wentworth Company (The) Class A Common Stock
      JHI,John Hancock Investors Trust Common Stock
      JHP,Nuveen Quality Preferred Income Fund 3 Preferred Income 3
      JHS,John Hancock Income Securities Trust Common Stock
      JHX,James Hardie Industries plc American Depositary Shares (Ireland)
      JKS,JinkoSolar Holding Company Limited American Depositary Shares (each representing 4 Common Shares)
      JLL,Jones Lang LaSalle Incorporated Common Stock
      JLS,Nuveen Mortgage Opportunity Term Fund Nuveen Mortgage Opportunity Term Fund
      JMEI,"Jumei International Holding Limited American Depositary Shares, each representing one Class A ordinary share"
      JMF,Nuveen Energy MLP Total Return Fund Common Shares of Beneficial Interest
      JMI,Javelin Mortgage Investment Corp. Common Stock
      JMLP,Nuveen All Cap Energy MLP Opportunities Fund Common Shares of Beneficial Interest
      JMM,Nuveen Multi
      JMP,JMP Group LLC Common Shares
      JMPB,JMP Group Inc 8.00% Senior Notes due 2023
      JMPC,JMP Group Inc 7.25% Senior Notes due 2021
      JMT,Nuveen Mortgage Opportunity Term Fund 2 Common Shares of Beneficial Interest
      JNJ,Johnson & Johnson Common Stock
      JNPR,"Juniper Networks, Inc. Common Stock"
      JNS,"Janus Capital Group, Inc. Cmn Stk"
      JOE,St. Joe Company (The) Common Stock
      JOF,Japan Smaller Capitalization Fund Inc Common Stock
      JONE,"Jones Energy, Inc. Class A Common Stock"
      JOY,Joy Global Inc. Common Stock
      JPC,Nuveen  Preferred Income Opportunities Fund
      JPEP,JP Energy Partners LP Common units representing limited partner interests
      JPI,Nuveen Preferred and Income Term Fund Common Shares of Beneficial Interest
      JPM,JP Morgan Chase & Co. Common Stock
      JPM$A,J P Morgan Chase & Co Depositary Shs Repstg 1/400 Pfd Ser P
      JPM$B,JP Morgan Chase & Co Depositary Shares Representing 1/400th Preferred Series T
      JPM$C,"JPMorgan Chase Capital XXIX 6.70% Capital Securities, Series CC"
      JPM$D,JPMorgan Chase Bank N A London Branch Depositary Shs Repstg 1/400th Pfd Ser O
      JPM$E,J P Morgan Chase & Co Depository Shares Representing 1/400th Int Perp Pfd Ser W
      JPM.W,"J P Morgan Chase & Co Warrant expiring October 28, 2018"
      JPS,Nuveen Quality Preferred Income Fund 2 Shares of Beneficial Interest
      JPW,Nuveen Flexible Investment Income Fund Common Shares of Beneficial Interest
      JQC,Nuveen Credit Strategies Income Fund Shares of Beneficial Interest
      JRI,Nuveen Real Asset Income and Growth Fund Common Shares of Beneficial Interest
      JRN,"Journal Communications, Inc. Class A Common Stock"
      JRO,Nuveen Floating Rate Income Opportuntiy Fund Shares of Beneficial Interest
      JSD,Nuveen Short Duration Credit Opportunities Fund Common Shares of Beneficial Interest
      JTA,Nuveen Tax
      JTD,Nuveen Tax
      JTP,Nuveen Quality Preferred Income Fund Shares of Beneficial Interest
      JW.A,"John Wiley & Sons, Inc. Common Stock"
      JW.B,"John Wiley & Sons, Inc. Common Stock"
      JWN,"Nordstrom, Inc. Common Stock"
      K,Kellogg Company Common Stock
      KAI,Kadant Inc Common Stock
      KAMN,Kaman Corporation Common Stock
      KAP,"KCAP Financial, Inc. 7.375% Senior Notes due 2019"
      KAR,"KAR Auction Services, Inc Common Stock"
      KATE,Kate Spade & Company Common Stock
      KB,KB Financial Group Inc
      KBH,KB Home Common Stock
      KBR,"KBR, Inc. Common Stock"
      KCC,Structured Products Corp. 8.20% Corporate Backed Trust Securities (CorTS)Issued by Provident Financial Trust I
      KCG,"KCG Holdings, Inc. Class A Common Stock"
      KED,Kayne Anderson Energy Development Company Common Stock
      KEF,"Korea Equity Fund, Inc. Common Stock"
      KEG,"Key Energy Services, Inc. Common Stock"
      KEM,Kemet Corporation New Common Stock
      KEN.V,Kenon Holdings Ltd. Ordinary Shares When Issued
      KEP,Korea Electric Power Corporation Common Stock
      KEX,Kirby Corporation Common Stock
      KEY,KeyCorp Common Stock
      KEY$G,KeyCorp Non Cumulative Perp Conv Pfd Ser A
      KEYS,Keysight Technologies Inc. Common Stock
      KF,"Korea Fund, Inc. (The) New Common Stock"
      KFH,KKR Financial Holdings LLC 8.375% Senior Notes due 2041
      KFI,KKR Financial Holdings LLC 7.50% Senior Notes due 2042
      KFN$,KKR Financial Holdings LLC Pfd Ser A Llc
      KFS,"Kingsway Financial Services, Inc. Ordinary Shares"
      KFY,Korn/Ferry International Common Stock
      KGC,Kinross Gold Corporation Common Stock
      KHI,Deutsche High Income Trust Shares of Beneficial Interest
      KIM,Kimco Realty Corporation Common Stock
      KIM$H,Kimco Realty Corporation Depositary Shares Representing 1/100 Shares of Redeemable Preferred Class H
      KIM$I,Kimco Realty Corporation DEPOSITARY SH REPSTG 1/1000TH PFD SER I
      KIM$J,Kimco Realty Corporation Depositary Sh Repstg 1/1000th Pfd CL J %
      KIM$K,Kimco Realty Corporation Depositary Shares Representing 1/1000th Preferred Series K
      KING,King Digital Entertainment plc Ordinary Share
      KIO,KKR Income Opportunities Fund Common Shares
      KKD,"Krispy Kreme Doughnuts, Inc. Common Stock"
      KKR,KKR & Co. L.P. Common Units Representing Limited Partnership Interest
      KMB,Kimberly
      KMF,"Kayne Anderson Midstream Energy Fund, Inc Common Stock"
      KMG,"KMG Chemicals, Inc. Common Stock"
      KMI,"Kinder Morgan, Inc. Common Stock"
      KMI.W,"Kinder Morgan, Inc. Warrants Expiring 2017"
      KMM,Deutsche  Multi
      KMPA,Kemper Corporation 7.375% Subordinated Debentures due 2054
      KMPR,Kemper Corporation
      KMT,Kennametal Inc. Common Stock
      KMX,CarMax Inc
      KN,Knowles Corporation Common Stock
      KND,"Kindred Healthcare, Inc. Common Stock"
      KNL,"Knoll, Inc. Common Stock"
      KNM,Konami Corporation American Depositary Shares (Each repstg one share of Common Stock)
      KNOP,KNOT Offshore Partners LP Common Units representing Limited Partner Interests
      KNX,"Knight Transportation, Inc. Common Stock"
      KO,Coca
      KODK,Eastman Kodak Company Common New
      KODK.A,Eastman Kodak Company Wt Exp 135%
      KODK.W,"Eastman Kodak Company Warrant (Expiring September 3, 2018)"
      KOF,Coca Cola Femsa S.A.B. de C.V.  Common Stock
      KOP,Koppers Holdings Inc. Koppers Holdings Inc. Common Stock
      KORS,Michael Kors Holdings Limited Ordinary Shares
      KOS,Kosmos Energy Ltd. Common Shares
      KR,Kroger Company (The) Common Stock
      KRA,"Kraton Performance Polymers, Inc Common Stock"
      KRC,Kilroy Realty Corporation Common Stock
      KRC$G,Kilroy Realty Corporation Preferred Stock Series G
      KRC$H,Kilroy Realty Corporation Pfd Ser H
      KRG,Kite Realty Group Trust Common Stock
      KRG$A,Kite Realty Group Trust PERP PFD SER A
      KRO,Kronos Worldwide Inc Common Stock
      KS,KapStone Paper and Packaging Corporation Common Stock
      KSM,Deutsche Strategic Municiple Income Trust Common Shares of Beneficial Interest
      KSS,Kohl's Corporation Common Stock
      KST,Deutsche Strategic Income Trust Shares of Beneficial Interest
      KSU,Kansas City Southern Common Stock
      KSU$,Kansas City Southern Preferred Stock
      KT,KT Corporation Common Stock
      KTF,Deutsche Municiple Income Trust Common Shares
      KTH,Structures Products Cp 8% CorTS Issued by Peco Energy Cap Tr II Preferred Stock
      KTN,Structured Products Corp 8.205% CorTS 8.205% Corporate Backed Trust Securities (CorTS)
      KTP,Corts 7.625 Pfd Common Stock
      KW,Kennedy
      KWN,Kennedy
      KWR,Quaker Chemical Corporation Common Stock
      KYE,"Kayne Anderson Total Energy Return Fund, Inc. Common Stock"
      KYN,Kayne Anderson MLP Investment Company Common Stock
      KYN$E,"Kayne Anderson MLP Investment Company Series E Mandatory Redeemable Preferred Shares, $25.00 liquidation preference"
      KYN$F,Kayne Anderson MLP Investment Company 3.50% Series F Mandatory Redeemable Preferred Shares $25.00 Liquidation Preference per share
      KYN$G,Kayne Anderson MLP Investment Company Series G Mandatory Redeemable Preferred Shares Liquidation Preference
      KYO,Kyocera Corporation Common Stock
      L,Loews Corporation Common Stock
      LAD,"Lithia Motors, Inc. Common Stock"
      LADR,Ladder Capital Corp Class A Common Stock
      LAS,"Lentuo International Inc. American Depositary Shares, each representing two ordinary shares"
      LAZ,"Lazard LTD. Lazard, LTD. Class A Common Stock"
      LB,"L Brands, Inc."
      LBF,"Deutsche Global High Income Fund, Inc. Common Stock"
      LC,LendingClub Corporation Common Stock
      LCI,Lannett Co Inc Common Stock
      LCM,Advent/Claymore Enhanced Growth & Income Fund Advent/Claymore Enhanced Growth & Income Fund Common Shares of Beneficial Interest
      LDF,"Latin American Discovery Fund, Inc. (The) Common Stock"
      LDL,"Lydall, Inc. Common Stock"
      LDOS,"Leidos Holdings, Inc. Common Stock"
      LDP,"Cohen & Steers Limited Duration Preferred and Income Fund, Inc."
      LDR,"Landauer, Inc. Common Stock"
      LEA,Lear Corporation Common Stock
      LEAF,"Springleaf Holdings, Inc. Common Stock"
      LEE,"Lee Enterprises, Incorporated Common Stock"
      LEG,"Leggett & Platt, Incorporated Common Stock"
      LEJU,"Leju Holdings Limited American Depositary Shares, each representing one Ordinary share"
      LEN,Lennar Corporation Class A Common Stock
      LEN.B,Lennar Corporation Class B
      LEO,"Dreyfus Strategic Municipals, Inc. Common Stock"
      LEU,Centrus Energy Corp. Class A Common Stock
      LF,Leapfrog Enterprises Inc Common Stock
      LFC,China Life Insurance Company Limited American Depositary Shares
      LFL,LATAM Airlines Group S.A.
      LG,Laclede Gas Company Common Stock
      LGF,Lions Gate Entertainment Corporation Common Stock
      LGI,Lazard Global Total Return and Income Fund Common Stock
      LH,Laboratory Corporation of America Holdings Common Stock
      LHO,LaSalle Hotel Properties Common Stock
      LHO$H,LaSalle Hotel Properties 7.50% Series H Cumulative Redeemable Preferred Shares of Beneficial Interest
      LHO$I,LaSalle Hotel Properties 6.375% Series I Cumulative Redeemable Redeemable Preferred SBI
      LII,"Lennox International, Inc. Common Stock"
      LITB,"LightInTheBox Holding Co., Ltd. American Depositary Shares, each representing 2 ordinary shares"
      LL,"Lumber Liquidators Holdings, Inc Common Stock"
      LLL,L
      LLY,Eli Lilly and Company Common Stock
      LM,"Legg Mason, Inc. Common Stock"
      LMT,Lockheed Martin Corporation Common Stock
      LNC,Lincoln National Corporation Common Stock
      LNC.W,"Lincoln National Corporation Warrant expiring July 10, 2019"
      LND,Brasilagro Brazilian Agric Real Estate Co Sponsored ADR (Brazil)
      LNKD,LinkedIn Corporation Class A Common Stock
      LNN,Lindsay Corporation Common Stock
      LNT,Alliant Energy Corporation Common Stock
      LO,"Lorillard, Inc Common Stock"
      LOCK,"LifeLock, Inc. Common Stock"
      LOR,"Lazard World Dividend & Income Fund, Inc. Common Stock"
      LOW,"Lowe's Companies, Inc. Common Stock"
      LPG,Dorian LPG Ltd. Common Stock
      LPI,"Laredo Petroleum, Inc. Common Stock"
      LPL,"LG Display Co, Ltd AMERICAN DEPOSITORY SHARES"
      LPT,Liberty Property Trust
      LPX,Louisiana
      LQ,La Quinta Holdings Inc. Common Stock
      LRE,"LRR Energy, L.P. Common Units Representing Limited Partner Interests"
      LRN,K12 Inc Common Stock
      LTC,"LTC Properties, Inc. Common Stock"
      LTM,Life Time Fitness Common Stock
      LUB,"Luby's, Inc. Common Stock"
      LUK,Leucadia National Corporation Common Stock
      LUV,Southwest Airlines Company Common Stock
      LUX,"Luxottica Group, S.p.A. Common Stock"
      LVLT,"Level 3 Communications, Inc. Common Stock"
      LVS,Las Vegas Sands Corp. Common Stock
      LXFR,Luxfer Holdings PLC American Depositary Shares (each representing one
      LXFT,"Luxoft Holding, Inc. Class A Ordinary Shares"
      LXK,"Lexmark International, Inc. Common Stock"
      LXP,Lexington Realty Trust Common Stock
      LXP$C,Lexington Realty Trust  Preferred Conv. Series C
      LXU,"LSB Industries, Inc. Common Stock"
      LYB,LyondellBasell Industries NV Ordinary Shares Class A (Netherlands)
      LYG,Lloyds Banking Group Plc American Depositary Shares
      LYG$A,"Lloyds Banking Group Plc 7.75% Public Income NotES (PINES) due July 15, 2050"
      LYV,"Live Nation Entertainment, Inc. Common Stock"
      LZB,La
      M,Macy's Inc Common Stock
      MA,Mastercard Incorporated Common Stock
      MAA,Mid
      MAC,Macerich Company (The) Common Stock
      MAIN,Main Street Capital Corporation Common Stock
      MAN,ManpowerGroup Common Stock
      MANU,Manchester United Ltd. Class A Ordinary Shares
      MAS,Masco Corporation Common Stock
      MATX,"Matson, Inc. Common Stock"
      MAV,Pioneer Municipal High Income Advantage Trust Common Shares of Beneficial Interest
      MBI,MBIA Inc. Common Stock
      MBLY,Mobileye N.V. Ordinary Shares
      MBT,Mobile TeleSystems OJSC
      MC,Moelis & Company Class A Common Stock
      MCA,"Blackrock MuniYield California Quality Fund, Inc. Common Stock"
      MCC,Medley Capital Corporation Common Stock
      MCD,McDonald's Corporation Common Stock
      MCI,Babson Capital Corporate Investors Common Stock
      MCK,McKesson Corporation Common Stock
      MCN,Madison Covered Call & Equity Strategy Fund Common Stock
      MCO,Moody's Corporation Common Stock
      MCP,"Molycorp, Inc Common Stock"
      MCQ,Medley Capital Corporation 7.125% Senior Notes due 2019
      MCR,MFS Charter Income Trust Common Stock
      MCS,Marcus Corporation (The) Common Stock
      MCV,Medley Capital Corporation 6.125% Senior Notes due 2023
      MCY,Mercury General Corporation Common Stock
      MD,"Mednax, Inc. Common Stock"
      MDC,"M.D.C. Holdings, Inc. Common Stock"
      MDLY,Medley Management Inc. Class A Common Stock
      MDP,Meredith Corporation Common Stock
      MDR,"McDermott International, Inc. Common Stock"
      MDT,Medtronic Inc. Common Stock
      MDU,"MDU Resources Group, Inc. Common Stock"
      MED,MEDIFAST INC Common Stock
      MEG,"Media General, Inc. Common Stock"
      MEI,"Methode Electronics, Inc. Common Stock"
      MEN,"Blackrock MuniEnhanced Fund, Inc Common Stock"
      MEP,"Midcoast Energy Partners, L.P. Common units representing limited partner interests"
      MER$D,"Merrill Lynch & Co., Inc. Preferred Stock"
      MER$E,"Merrill Lynch & Co., Inc. Preferred Stock"
      MER$F,"Merrill Lynch & Co., Inc. Preferred Stock"
      MER$K,"Merrill Lynch & Co., Inc. 6.45% Trust Preferred Securities"
      MER$M,"Merrill Lynch & Co., Inc. 6.45% Trust Preferred Securities"
      MER$P,"Merrill Lynch & Co., Inc. Merrill Lynch Capital Trust III 7.375% Trust Preferred Securities"
      MET,"MetLife, Inc. Common Stock"
      MET$A,"MetLife, Inc. Preferred Series A Floating Rate"
      MET$B,"MetLife, Inc. Preferred Series B"
      MFA,"MFA Financial, Inc."
      MFA$B,"MFA Financial, Inc. Preferred Series B"
      MFC,Manulife Financial Corporation Common Stock
      MFD,Macquarie/First Trust Global Common Stock
      MFG,"Mizuho Financial Group, Inc. Sponosred ADR (Japan)"
      MFL,Blackrock MuniHoldings Investment Quality Fund Common Shares of Beneficial Interest
      MFM,MFS Municipal Income Trust Common Stock
      MFO,"MFA Financial, Inc. 8.00% Senior Notes due 2042"
      MFT,Blackrock MuniYield Investment Quality Fund Common Shares of Beneficial Interest
      MFV,MFS Special Value Trust Common Stock
      MG,Mistras Group Inc Common Stock
      MGA,"Magna International, Inc. Common Stock"
      MGF,MFS Government Markets Income Trust Common Stock
      MGM,MGM Resorts International Common Stock
      MGR,"Affiliated Managers Group, Inc. 6.375% Senior Notes due 2042"
      MGU,Macquarie Global Infrastructure Total Return Fund Inc. Common Stock
      MH$A,"Maiden Holdings, Ltd. Pref Shs Ser A (Bermuda)"
      MHD,"Blackrock MuniHoldings Fund, Inc. Common Stock"
      MHF,"Western Asset Municipal High Income Fund, Inc. Common Stock"
      MHFI,"McGraw Hill Financial, Inc. Common Stock"
      MHG,Marine Harvest ASA Sponsored ADR (Norway)
      MHI,Pioneer Municipal High Income Trust Common Shares of Beneficial Interest
      MHK,"Mohawk Industries, Inc. Common Stock"
      MHN,"Blackrock MuniHoldings New York Quality Fund, Inc. Common Stock"
      MHNA,Maiden Holdings North America Ltd. 8.25% Notes due 2041
      MHNB,"Maiden Holdings North America, Ltd. 8.00% Notes due 2042"
      MHNC,"Maiden Holdings North America, Ltd. 7.75% Notes due 2043"
      MHO,"M/I Homes, Inc. Common Stock"
      MHO$A,"M/I Homes, Inc. M/I Homes, Inc. Depositary Shares (Each representing 1/1000 of a Share of 9.75% Series A Preferred Share)"
      MHR,Magnum Hunter Resources Corporation
      MHY,"Western Asset Managed High Income Fund, Inc. Common Stock"
      MIC,Macquarie Infrastructure Company LLC (New) Shares representing one Limited Liability Interest
      MIE,"Cohen & Steers MLP Income and Energy Opportunity Fund, Inc. Common Stock"
      MIG,"Meadowbrook Insurance Group, Inc. Common Stock"
      MIL,MFC Industrial Ltd.
      MILL,"Miller Energy Resourses, Inc. Common Stock"
      MILL$C,"Miller Energy Resources, Inc. 10.75% Series C Cumulative, Redeemable Preferred Stock"
      MILL$D,"Miller Energy Resources, Inc. 10.5% Series D Fixed Rate/Floating Rate Cumulative Redeemable Preferred Stock"
      MIN,MFS Intermediate Income Trust Common Stock
      MITT,"AG Mortgage Investment Trust, Inc. Common Stock"
      MITT$A,"AG Mortgage Investment Trust, Inc. 8.25% Preferred Series A"
      MITT$B,"AG Mortgage Investment Trust, Inc. Preferred Series B"
      MIXT,"MiX Telematics Limited American Depositary Shares, each representing 25 Ordinary Shares"
      MIY,"Blackrock MuniYield Michigan Quality Fund, Inc. Common Stock"
      MJI,"Blackrock MuniYield New Jersey Quality Fund, Inc. Common Stock"
      MJN,Mead Johnson Nutrition Company Common Stock
      MKC,"McCormick & Company, Incorporated Common Stock"
      MKC.V,"McCormick & Company, Incorporated Common Stock"
      MKL,Markel Corporation Common Stock
      MLI,"Mueller Industries, Inc. Common Stock"
      MLM,"Martin Marietta Materials, Inc. Common Stock"
      MLP,"Maui Land & Pineapple Company, Inc. Common Stock"
      MLR,"Miller Industries, Inc. Common Stock"
      MM,"Millennial Media, Inc. Common Stock"
      MMC,"Marsh & McLennan Companies, Inc. Common Stock"
      MMD,MainStay DefinedTerm Municipal Opportunities Fund Common Shares of Beneficial Interest
      MMI,"Marcus & Millichap, Inc. Common Stock"
      MMM,3M Company Common Stock
      MMP,Magellan Midstream Partners L.P. Limited Partnership
      MMS,"Maximus, Inc. Common Stock"
      MMT,MFS Multimarket Income Trust Common Stock
      MMU,"Western Asset Managed Municipals Fund, Inc. Common Stock"
      MN,"Manning & Napier, Inc. Class A Common Stock"
      MNE,Blackrock Muni New York Intermediate Duration Fund Inc Common Stock
      MNI,McClatchy Company (The) Common Stock
      MNK,Mallinckrodt plc Ordinary Shares
      MNP,"Western Asset Municipal Partners Fund, Inc. Common Stock"
      MNR,Monmouth Real Estate Investment Corporation Class A Common Stock
      MNR$A,Monmouth Real Estate Investment Corporation 7.625% Series A Cumulative Redeemable Preferred Stock
      MNR$B,Monmouth Real Estate Investment Corporation Series B Cumulative Redeemable Preferred Stock $0.01 par value
      MO,"Altria Group, Inc."
      MOD,Modine Manufacturing Company Common Stock
      MODN,"Model N, Inc. Common Stock"
      MOG.A,Moog Inc. Class A Common Stock
      MOG.B,Moog Inc. Class B Common Stock
      MOH,Molina Healthcare Inc Common Stock
      MON,Monsanto Company Common Stock
      MORE,"Monogram Residential Trust, Inc. Common"
      MOS,Mosaic Company (The) Common Stock
      MOV,Movado Group Inc. Common Stock
      MP$D,Mississippi Power Company 5.25 Srs Pfd
      MPA,Blackrock MuniYield Pennsylvania Quality Fund Common Stock
      MPC,Marathon Petroleum Corporation Common Stock
      MPG,Metaldyne Performance Group Inc. Common Stock
      MPLX,MPLX LP Common Units Representing Limited Partner Interests
      MPO,"Midstates Petroleum Company, Inc. Common Stock"
      MPV,Babson Capital Participation Investors Common Stock
      MPW,"Medical Properties Trust, Inc. common stock"
      MPX,Marine Products Corporation Common Stock
      MQT,"Blackrock MuniYield Quality Fund II, Inc. Common Stock"
      MQY,"Blackrock MuniYield Quality Fund, Inc. Common Stock"
      MR,Mindray Medical International Limited Sponsored ADR representing Class A shares (China)
      MRC,MRC Global Inc. Common Stock
      MRH,Montpelier Re Holdings Ltd.
      MRH$A,Montpelier RE Holdings Ltd Non Cumulative Series A Preferred Shares (Bermuda)
      MRIN,Marin Software Incorporated Common Stock
      MRK,"Merck & Company, Inc. Common Stock (new)"
      MRO,Marathon Oil Corporation Common Stock
      MS,Morgan Stanley Common Stock
      MS$A,Morgan Stanley Dep Shs repstg 1/1000 Pfd Ser A
      MS$E,Morgan Stanley DEPOSITARY SHARES REP 1/1000TH SHARES FIXED/FLTG PREFERRED STOCK SERIES E
      MS$F,Morgan Stanley Dep Shs Rpstg 1/1000th Int Prd Ser F Fxd to Flag
      MS$G,Morgan Stanley Depositary Shares Representing 1/1000th Preferred Series G
      MS$I,Morgan Stanley Depository Shares Representing 1/1000th Preferred Series 1 Fixed to Floating Non (Cum)
      MSA,MSA Safety Incorporated Common Stock
      MSB,Mesabi Trust Common Stock
      MSCA,Main Street Capital Corporation 6.125% Senior Notes due 2023
      MSCI,MSCI Inc Common Stock
      MSD,"Morgan Stanley Emerging Markets Debt Fund, Inc. Common Stock"
      MSF,"Morgan Stanley Emerging Markets Fund, Inc. Common Stock"
      MSI,"Motorola Solutions, Inc. Common Stock"
      MSJ,Morgan Stanley Cap Trust VI Cap Securities
      MSK,Morgan Stanley Cap TR VIII GDT Cap Securities
      MSL,MidSouth Bancorp Common Stock
      MSM,"MSC Industrial Direct Company, Inc. Common Stock"
      MSO,"Martha Stewart Living Omnimedia, Inc. Common Stock"
      MSP,Madison Strategic Sector Premium Fund Madison Strategic Sector Premium Fund Common Shares of Beneficial Interest
      MSZ,Morgan Stanley Capital Trust VII Cap Secs
      MT,Arcelor Mittal NY Registry Shares NEW
      MTB,M&T Bank Corporation Common Stock
      MTB$,"M&T Bank Corporation Fixed Rate Cumulative Perpetual Preferred Stock, Series A"
      MTB$C,"M&T Bank Corporation Fixed Rate Cumulative Perpetual Preferred Stock, Series C"
      MTB.W,"M&T Bank Corporation Warrant (Expiring December 23, 2018)"
      MTCN,ArcelorMittal 6.00% Mandatorily Convertible Subordinated Notes due 2016
      MTD,Mettler
      MTDR,Matador Resources Company Common Stock
      MTG,MGIC Investment Corporation Common Stock
      MTH,Meritage Homes Corporation Common Stock
      MTL,Mechel OAO American Depositary Shares (Each rep. 1 common shares)
      MTL$,Mechel Steel Group OAO American Depositary Shares (each representing one
      MTN,"Vail Resorts, Inc. Common Stock"
      MTOR,"Meritor, Inc. Common Stock"
      MTR,Mesa Royalty Trust Common Stock
      MTRN,Materion Corporation
      MTS,"Montgomery Street Income Securities, Inc. Common Stock"
      MTT,Western Asset Municipal Defined Opportunity Trust Inc Common Stock
      MTU,"Mitsubishi UFJ Financial Group, Inc. Common Stock"
      MTW,"Manitowoc Company, Inc. (The) Common Stock"
      MTX,Minerals Technologies Inc. Common Stock
      MTZ,"MasTec, Inc. Common Stock"
      MUA,"Blackrock MuniAssets Fund, Inc Common Stock"
      MUC,"Blackrock MuniHoldings California Quality Fund, Inc.  Common Stock"
      MUE,"Blackrock MuniHoldings Quality Fund II, Inc. Common Stock"
      MUH,"Blackrock MuniHoldings Fund II, Inc. Common Stock"
      MUI,Blackrock Muni Intermediate Duration Fund Inc Common Stock
      MUJ,"Blackrock MuniHoldings New Jersey Quality Fund, Inc. Common Stock"
      MUR,Murphy Oil Corporation Common Stock
      MUS,"Blackrock MuniHoldings Quality Fund, Inc Common Stock"
      MUSA,Murphy USA Inc. Common Stock
      MUX,McEwen Mining Inc. Common Stock
      MVC,"MVC Capital, Inc. Common Stock"
      MVCB,MVC Capital 7.25% Senior Notes due 2023
      MVNR,"Mavenir Systems, Inc. Common Stock"
      MVO,MV Oil Trust Units of Beneficial Interests
      MVT,"Blackrock MuniVest Fund II, Inc.  Common Stock"
      MW,"Men's Wearhouse, Inc. (The) Common Stock"
      MWA,MUELLER WATER PRODUCTS Common Stock
      MWE,"MarkWest Energy Partners, LP Common units representing limited partnership units"
      MWG,Morgan Stanley Cap Tr IV Gtd Cap Secs
      MWO,Morgan Stanley Cap Tr V Gtd Cap Secs
      MWR,Morgan Stanley Cap Tr III Capital Trust Securities
      MWV,Meadwestvaco Corporation Common Stock
      MWW,"Monster Worldwide, Inc. Common Stock"
      MX,"MagnaChip Semiconductor Corporation Depositary Shares, each representing one share of common stock"
      MXE,"Mexico Equity and Income Fund, Inc. (The) Common Stock"
      MXF,"Mexico Fund, Inc. (The) Common Stock"
      MXL,"MaxLinear, Inc Class A Common Stock"
      MY,"China Ming Yang Wind Power Group Limited American Depositary Shares, each representing one ordinary share $0.001 par value"
      MYC,"Blackrock MuniYield California Fund, Inc. Common Stock"
      MYCC,"ClubCorp Holdings, Inc. Common Stock"
      MYD,"Blackrock MuniYield Fund, Inc.  Common Stock"
      MYE,"Myers Industries, Inc. Common Stock"
      MYF,Blackrock MuniYield Investment Fund Common Stock
      MYI,"Blackrock MuniYield Quality Fund III, Inc Common Stock"
      MYJ,"Blackrock MuniYield New Jersey Fund, Inc Common Stock"
      MYM,"Blackrock MuniYield Michigan Quality Fund II, Inc. Common Stock"
      MYN,"Blackrock MuniYield New York Quality Fund, Inc.Common Stock"
      MZF,Managed Duration Investment Grade Municipal Fund
      N,Netsuite Inc Common Stock
      NAC,Nuveen California Dividend Advantage Municipal Fund Common Stock
      NAD,Nuveen Dividend Advantage Municipal Fund Common Stock
      NADL,North Atlantic Drilling Ltd. Common Shares
      NAN,Nuveen New York Dividend Advantage Municipal Fund Common Stock
      NAO,Nordic Amern Offshore Ltd Ordinary Shares Reg S (Marshall Islands)
      NAP,Navios Maritime Midstream Partners LP Common Units representing limited partner interests
      NAT,Nordic American Tankers Limited Common Stock
      NAV,Navistar International Corporation Common Stock
      NAV$D,Navistar International Corporation Preferred Stock
      NAZ,Nuveen Arizona Premium Income Municipal Fund Common Stock
      NBB,Nuveen Build America Bond Fund Common Shares of Beneficial Interest
      NBD,Nuveen Build America Bond Opportunity Fund Common Shares of Beneficial Interest
      NBG,Natl Bk Greece American Depositary Shares
      NBG$A,National Bank of Greece SA Sponsored ADR representing Series A Preferred Shares (Greece)
      NBHC,National Bank Holdings Corporation Common Stock
      NBL,Noble Energy Inc. Common Stock
      NBR,Nabors Industries Ltd.
      NC,"NACCO Industries, Inc. Common Stock"
      NCA,"Nuveen California Municipal Value Fund, Inc. Common Stock"
      NCFT,"Norcraft Companies, Inc. Common Stock"
      NCI,"Navigant Consulting, Inc. Common Stock"
      NCR,NCR Corporation Common Stock
      NCS,"NCI Building Systems, Inc. New Common Stock"
      NCT,Newcastle Investment Corporation
      NCT$B,Newcastle Investment Corporation Preferred Series B
      NCT$C,Newcastle Investment Corporation Preferred Series C
      NCT$D,Newcastle Invt Corp New PFD Ser D%
      NCV,AllianzGI Convertible & Income Fund
      NCZ,AllianzGI Convertible & Income Fund II Common Shares of Beneficial Interest
      NDP,"Tortoise Energy Independence Fund, Inc. Common Stock"
      NDRO,Enduro Royalty Trust Trust Units representing beneficial interest in the trust
      NE,Noble Corporation Ordinary Shares (UK)
      NEA,Nuveen AMT
      NEE,"NextEra Energy, Inc. Common Stock"
      NEE$C,"FPL Group, Inc. 5 7/8% Preferred Trust Securities"
      NEE$G,"NextEra Energy, Inc. Series G Junior Subordinated Debenture due March 1, 2072"
      NEE$H,"NextEra Energy, Inc. Series H Junior Subordinated Debentures due June 15, 2072"
      NEE$I,"NextEra Energy, Inc. Series I Junior Subordinated Debentures due November 15, 2072"
      NEE$J,"NextEra Energy, Inc. Series J Junior Subordinated Debentures due January 15, 2073"
      NEE$O,"NextEra Energy, Inc. Units Expiring 09/01/2015"
      NEE$P,"NextEra Energy, Inc. EQUITY UNIT"
      NEFF,Neff Corporation Common Stock
      NEM,Newmont Mining Corporation
      NEP,"NextEra Energy Partners, LP Common Units representing limited partner interests"
      NES,"Nuverra Environmental Solutions, Inc. Common Stock"
      NEU,NewMarket Corp Common Stock
      NEV,Nuveen Enhanced Municipal Value Fund Common Shares of Beneficial Interest
      NEWM,New Media Investment Group Inc. Common Stock
      NEWR,"New Relic, Inc. Common Stock"
      NFG,National Fuel Gas Company Common Stock
      NFJ,"AllianzGI NFJ Dividend, Interest & Premium Strategy Fund"
      NFX,Newfield Exploration Company Common Stock
      NGG,"National Grid Transco, PLC National Grid PLC (NEW) American Depositary Shares"
      NGL,NGL ENERGY PARTNERS LP Common Units representing Limited Partner Interests
      NGLS,Targa Resources Partners LP Common Units Representing Limited Partnership Interests
      NGS,"Natural Gas Services Group, Inc. Common Stock"
      NGVC,"Natural Grocers by Vitamin Cottage, Inc. Common Stock"
      NHF,NexPoint Credit Strategies Fund
      NHI,"National Health Investors, Inc. Common Stock"
      NI,NiSource Inc Common Stock
      NID,Nuveen Intermediate Duration Municipal Term Fund Common Shares of Beneficial Interest
      NIE,AllianzGI Equity & Convertible Income Fund
      NIM,Nuveen Select Maturities Municipal Fund Common Stock
      NIO,"Nuveen Municipal Opportunity Fund, Inc. Common Stock"
      NIQ,Nuveenn Intermediate Duration Quality Municipal Term Fund Common Shares of Beneficial Interest
      NJ,Nidec Corporation (Nihon Densan Kabushiki Kaisha) American Depositary Shares
      NJR,NewJersey Resources Corporation Common Stock
      NKA,Niska Gas Storage Partners LLC Common Units Representing Limited Liability Company Interests
      NKE,"Nike, Inc. Common Stock"
      NKG,Nuveen Georgia Dividend Advantage Municipal Fund 2 Nuveen Georgia Dividend Advantage Municipal Fund 2 (the
      NKX,Nuveen California AMT
      NL,"NL Industries, Inc. Common Stock"
      NLS,"Nautilus, Inc. Common Stock"
      NLSN,Nielsen N.V. Common Stock
      NLY,Annaly Capital Management Inc Common Stock
      NLY$A,Annaly Capital Management Inc Preferred Stock Series A
      NLY$C,Annaly Capital Management Inc 7.625% Series C Cumulative Redeemable Preferred Stock
      NLY$D,Annaly Capital Management Inc Preferred Series D
      NM,Navios Maritime Holdings Inc. Common Stock
      NM$G,Navios Maritime Holdings Inc. Sponsored ADR Representing 1/100th Perpetual Preferred Series G (Marshall Islands)
      NM$H,Navios Maritime Holdings Inc. Sponsored ADR Representing 1/100th Perp. Preferred Series H%
      NMA,"Nuveen Municipal Advantage Fund, Inc. Common Stock"
      NMBL,"Nimble Storage, Inc. Common Stock"
      NMFC,New Mountain Finance Corporation Common Stock
      NMI,"Nuveen Municipal Income Fund, Inc. Common Stock"
      NMK$B,"Niagara Mohawk Holdings, Inc. Preferred Stock"
      NMK$C,"Niagara Mohawk Holdings, Inc. Preferred Stock"
      NMM,Navios Maritime Partners LP Common Units Representing Limited Partner Interests
      NMO,"Nuveen Municipal Market Opportunity Fund, Inc. Common Stock"
      NMR,Nomura Holdings Inc ADR American Depositary Shares
      NMS,Nuveen Minnesota Municipal Income Fund Common Shares of Beneficial Interest
      NMT,Nuveen Massachusetts Premium Income Municipal Fund Common Stock
      NMY,Nuveen Maryland Premium Income Municipal Fund Common Stock
      NNA,Navios Maritime Acquisition Corporation Common stock
      NNC,Nuveen North Carolina Premium Income Municipal Fund Common Stock
      NNI,"Nelnet, Inc. Common Stock"
      NNN,National Retail Properties Common Stock
      NNN$D,National Retail Properties Depositary Shares Representing 1/100th Preferred Series D
      NNN$E,"National Retail Properties Depositary Shares, each representing a 1/100th interest in a share of 5.70% Series E Pfd."
      NNP,"Nuveen New York Performance Plus Municipal Fund, Inc. Common Stock"
      NNY,"Nuveen New York Municipal Value Fund, Inc. Common Stock"
      NOA,"North American Energy Partners, Inc. Common Shares (no par)"
      NOAH,Noah Holdings Limited
      NOC,Northrop Grumman Corporation Common Stock
      NOK,Nokia Corporation Sponsored American Depositary Shares
      NOM$C,Nuveen Missouri Premium Income Municipal Fund MUNIFUND TERM PFD SHS SER 2015 (United States)
      NOR,Noranda Aluminum Holding Corporation Common Stock
      NORD,"Nord Anglia Education, Inc. Ordinary Shares"
      NOV,"National Oilwell Varco, Inc. Common Stock"
      NOW,"ServiceNow, Inc. Common Stock"
      NP,"Neenah Paper, Inc. Common Stock"
      NPD,China Nepstar Chain Drugstore Ltd American Depositary Shares
      NPF,"Nuveen Premier Municipal Income Fund, Inc. Common Stock"
      NPI,"Nuveen Premium Income Municipal Fund, Inc. Common Stock"
      NPK,"National Presto Industries, Inc. Common Stock"
      NPM,"Nuveen Premium Income Municipal Fund II, Inc. Common Stock"
      NPO,Enpro Industries Inc
      NPP,"Nuveen Performance Plus Municipal Fund, Inc. Common Stock"
      NPT,"Nuveen Premium Income Municipal Fund IV, Inc. Common Stock"
      NPTN,NeoPhotonics Corporation Common Stock
      NPV,Nuveen Virginia Premium Income Municipal Fund Common Stock
      NQ,"NQ Mobile Inc. American Depositary Shares, each representing five Class A common shares"
      NQI,"Nuveen Quality Municipal Fund, Inc.  Common Stock"
      NQM,"Nuveen Investment Quality Municipal Fund, Inc. Common Stock"
      NQP,"Nuveen Pennsylvania Investment Quality Municipal Fund, Inc. Common Stock"
      NQS,"Nuveen Select Quality Municipal Fund, Inc. Common Stock"
      NQU,"Nuveen Quality Income Municipal Fund, Inc. Common Stock"
      NR,"Newpark Resources, Inc. Common Stock"
      NRF,NorthStar Realty Finance Corp. Common Stock (New)
      NRF$A,Northstar Realty Finance Corp. 8.75% Series A Cumulative Redeemable Preferred Stock
      NRF$B,Northstar Realty Finance Corp. Preferred Series B
      NRF$C,Northstar Realty Finance Corp. Preferred Series C
      NRF$D,Northstar Realty Finance Corp. 8.50% Series D Cumulative Redeemable Preferred Stock
      NRF$E,Northstar Realty Finance Corp. Preferred Stock Series E
      NRG,"NRG Energy, Inc. Common Stock"
      NRK,Nuveen New York AMT
      NRP,Natural Resource Partners LP Limited Partnership
      NRT,North European Oil Royality Trust Common Stock
      NRZ,New Residential Investment Corp. Common Stock
      NS,Nustar Energy L.P.  Common Units
      NSAM,"NorthStar Asset Management Group, Inc. Common Stock"
      NSC,Norfolk Southern Corporation Common Stock
      NSH,"Nustar GP Holdings, LLC Units"
      NSL,Nuveen Senior Income Fund Common Stock
      NSLP,New Source Energy Partners L.P. Common Units Representing Limited Partner Interests
      NSM,Nationstar Mortgage Holdings Inc. Common Stock
      NSP,"Insperity, Inc. Common Stock"
      NSR,"Neustar, Inc. Neustar, Inc. Class A Common Stock"
      NSS,"NuStar Logistics, L.P. 7.625% Fixed"
      NTC,Nuveen Connecticut Premium Income Municipal Fund Common Stock
      NTG,"Tortoise MLP Fund, Inc. Common Stock"
      NTI,Northern Tier Energy LP Common Units representing Limited Partner Interests
      NTL,"Nortel Inversora SA, ADR Common Stock"
      NTP,Nam Tai Property Inc. Common Stock
      NTT,Nippon Telegraph and Telephone Corporation Common Stock
      NTX,Nuveen Texas Quality Income Municipal Fund Common Stock
      NTX$C,Nuveen Texas Quality Income Municipal Fund Munifund Term Pfd Shs Ser 2013
      NTZ,"Natuzzi, S.p.A."
      NU,Northeast Utilities Common Stock
      NUE,Nucor Corporation Common Stock
      NUM,Nuveen Michigan Quality Income Municipal Fund Common Stock
      NUO,Nuveen Ohio Quality Income Municipal Fund Common Stock
      NUS,"Nu Skin Enterprises, Inc. Common Stock"
      NUV,"Nuveen Municipal Value Fund, Inc. Common Stock"
      NUW,Nuveen AMT
      NVGS,Navigator Holdings Ltd. Ordinary Shares (Marshall Islands)
      NVO,Novo Nordisk A/S Common Stock
      NVR,"NVR, Inc. Common Stock"
      NVRO,Nevro Corp. Common Stock
      NVS,Novartis AG Common Stock
      NW$C,Natl Westminster Pfd Preferred Stock
      NWE,NorthWestern Corporation Common Stock
      NWHM,New Home Company Inc. (The) Common Stock
      NWL,Newell Rubbermaid Inc. Common Stock
      NWN,Northwest Natural Gas Company Common Stock
      NWY,"New York & Company, Inc. New York & Company, Inc. Common Shares"
      NX,Quanex Building Products Corporation Common Stock
      NXC,Nuveen California Select Tax
      NXJ,Nuveen New Jersey Dividend Advantage Municipal Fund Share of Beneficial Interest
      NXJ$C,"Nuveen New Jersey Dividend Advantage Municipal Fund MuniFund Term Preferred Shares, 2.00% Series 2015, $10.00 Liquidation preference per share"
      NXN,Nuveen New York Select Tax
      NXP,Nuveen Select Tax Free Income Portfolio Common Stock
      NXQ,Nuveen Select Tax Free Income Portfolio II Common Stock
      NXR,Nuveen Select Tax Free Income Portfolio III Common Stock
      NYCB,"New York Community Bancorp, Inc. Common Stock"
      NYCB$U,"New York Community Bancorp, Inc. New York Community Capital Tr V (BONUSES)"
      NYLD,"NRG Yield, Inc. Class A Common Stock"
      NYRT,"New York REIT, Inc. Common Stock"
      NYT,New York Times Company (The) Common Stock
      O,Realty Income Corporation Common Stock
      O$F,Realty Income Corporation Monthly Income Cumulative Red Preferred Stock Class F
      OAK,"Oaktree Capital Group, LLC Class A Units Representing Limited Liability Company Interests"
      OAKS,Five Oaks Investment Corp. Common Stock
      OAKS$A,Five Oaks Investment Corp. 8.75% Series A Cumulative Redeemable Preferred Stock
      OAS,Oasis Petroleum Inc. Common Stock
      OB,"OneBeacon Insurance Group, Ltd. Class A Common Stock"
      OC,Owens Corning Inc Common Stock New
      OCIP,OCI Partners LP Common Units representing Limited Partner Interests
      OCIR,OCI Resources LP Common Units representing Limited Partner Interests
      OCN,Ocwen Financial Corporation NEW Common Stock
      OCR,"Omnicare, Inc. Common Stock"
      OCR$A,"Omnicare, Inc. Trust Preferred Income Equity Redeemable Securities (PIERS)"
      OCR$B,"Omnicare, Inc. Omnicare Capital Trust II Series B 4.00% Trust Preferred Income Equity Redeemable Securities (PIERS)"
      ODC,Oil
      OEC,Orion Engineered Carbons S.A Common Shares
      OFC,Corporate Office Properties Trust Common Stock
      OFC$L,Corporate Office Properties Trust Preferred Series L
      OFG,OFG Bancorp Common Stock
      OFG$A,OFG Bancorp Preferred Stock
      OFG$B,OFG Bancorp 7.0% Non Cumulative Monthly Income Preferred Stock Series B
      OFG$D,OFG Bancorp 7.125% Non
      OGE,OGE Energy Corporation Common Stock
      OGS,"ONE Gas, Inc. Common Stock"
      OHI,"Omega Healthcare Investors, Inc. Common Stock"
      OI,Owens
      OIA,Invesco Municipal Income Opportunities Trust Common Stock
      OIBR,Oi S.A. American Depositary Shares (Each representing 1 Preferred Share)
      OIBR.C,"Oi S.A. American Depositary Shares, (Each representing 1 Common Share)"
      OII,"Oceaneering International, Inc. Common Stock"
      OILT,"Oiltanking Partners, L.P. Common Units Representing Limited Partnership Interests"
      OIS,"Oil States International, Inc. Common Stock"
      OKE,"ONEOK, Inc. Common Stock"
      OKS,"ONEOK Partners, L.P. Common Stock"
      OLN,Olin Corporation Common Stock
      OLP,"One Liberty Properties, Inc. Common Stock"
      OMAM,OM Asset Management plc Ordinary Shares
      OMC,Omnicom Group Inc. Common Stock
      OME,Omega Protein Corporation Common Stock
      OMG,"OM Group, Inc. Common Stock"
      OMI,"Owens & Minor, Inc. Common Stock"
      OMN,OMNOVA Solutions Inc. Common Stock
      ONDK,"On Deck Capital, Inc. Common Stock"
      ONE,"Higher One Holdings, Inc. Common Stock"
      OPK,OPKO Health Inc. Common Stock
      OPWR,"Opower, Inc. Common Stock"
      OPY,"Oppenheimer Holdings, Inc. Class A Common Stock (DE)"
      ORA,"Ormat Technologies, Inc. Common Stock"
      ORAN,Orange
      ORB,Orbital Sciences Corporation Common Stock
      ORC,"Orchid Island Capital, Inc. Common Stock"
      ORCL,Oracle Corporation Common Stock
      ORI,Old Republic International Corporation Common Stock
      ORN,Orion Marine Group Inc Common
      OSK,Oshkosh Corporation (Holding Company)Common Stock
      OUBS,UBS AG Common Stock
      OUT,OUTFRONT Media Inc. Common Stock
      OWW,"Orbitz Worldwide, Inc. Common Stock"
      OXM,"Oxford Industries, Inc. Common Stock"
      OXY,Occidental Petroleum Corporation Common Stock
      OZM,Och
      P,"Pandora Media, Inc. Common Stock"
      PAA,"Plains All American Pipeline, L.P. Common Stock"
      PAC,"Grupo Aeroportuario Del Pacifico, S.A. B. de C.V. Grupo Aeroportuario Del Pacifico, S.A. de C.V. (each representing 10 Series B shares)"
      PACD,Pacific Drilling S.A. Common Shares
      PAG,"Penske Automotive Group, Inc. Common Stock"
      PAGP,"Plains Group Holdings, L.P. Class A Shares representing limited partner interests"
      PAH,Platform Specialty Products Corporation Common Stock
      PAI,Western Asset Income Fund Common Stock
      PAM,Pampa Energia S.A. Pampa Energia S.A.
      PANW,"Palo Alto Networks, Inc. Common Stock"
      PAR,PAR Technology Corporation Common Stock
      PAY,"Verifone Systems, Inc. Common Stock"
      PAYC,"Paycom Software, Inc. Common Stock"
      PB,"Prosperity Bancshares, Inc. Common Stock"
      PBA,Pembina Pipeline Corp. Ordinary Shares (Canada)
      PBF,PBF Energy Inc. Class A Common Stock
      PBFX,PBF Logistics LP Common Units representing limited partner interests
      PBH,"Prestige Brand Holdings, Inc. Common Stock"
      PBI,Pitney Bowes Inc. Common Stock
      PBI$A,Pitney Bowes Inc 5.25% Notes due 2022
      PBI$B,Pitney Bowes Inc 6.70% Notes Due 2043
      PBR,Petroleo Brasileiro S.A.
      PBR.A,Petroleo Brasileiro S.A.
      PBT,Permian Basin Royalty Trust Common Stock
      PBY,Pep Boys
      PBYI,Puma Biotechnology Inc Common Stock
      PCF,Putnam High Income Securities Fund Common Stock
      PCG,Pacific Gas & Electric Co. Common Stock
      PCI,PIMCO Dynamic Credit Income Fund Common Shares of Beneficial Interest
      PCK,Pimco California Municipal Income Fund II Common Shares of Beneficial Interest
      PCL,"Plum Creek Timber Company, Inc. Common Stock"
      PCM,"PCM Fund, Inc. Common Stock"
      PCN,Pimco Corporate & Income Strategy Fund Common Stock
      PCP,Precision Castparts Corporation Common Stock
      PCQ,PIMCO California Municipal Income Fund Common Stock
      PDI,PIMCO Dynamic Income Fund Common Stock
      PDM,"Piedmont Office Realty Trust, Inc. Class A Common Stock"
      PDS,Precision Drilling Corporation Common Stock
      PDT,John Hancock Premium Dividend Fund
      PE,"Parsley Energy, Inc. Class A Common Stock"
      PEB,Pebblebrook Hotel Trust Common Shares of Beneficial Interest
      PEB$A,Pebblebrook Hotel Trust PFD SER A
      PEB$B,Pebblebrook Hotel Trust Preferred Series B
      PEB$C,Pebblebrook Hotel Trust 6.50% Series C Cumulative Redeemable Preferred Shares of Beneficial Interest
      PEG,Public Service Enterprise Group Incorporated Common Stock
      PEI,Pennsylvania Real Estate Investment Trust Common Stock
      PEI$A,Pennsylvania Real Estate Investment Trust PFD sh CL A
      PEI$B,Pennsylvania Real Estate Investment Trust Cumulative Redeemable Perpetual Preferred Shares Series B
      PEO,Petroleum Resources Corporation Common Stock
      PEP,"Pepsico, Inc. Common Stock"
      PER,SandRidge Permian Trust Common Units of Benficial Interest
      PES,Pioneer Energy Services Corp. Common Stk
      PF,"Pinnacle Foods, Inc. Common Stock"
      PFD,Flaherty & Crumrine Preferred Income Fund Incorporated Common Stock
      PFE,"Pfizer, Inc. Common Stock"
      PFG,Principal Financial Group Inc Common Stock
      PFG$B,"Principal Financial Group, Inc. 6.518% Series B Non"
      PFH,Cabco Tr Jcp 7.625 Common Stock
      PFK,Prudential Financial Inflation
      PFL,PIMCO Income Strategy Fund Shares of Beneficial Interest
      PFN,PIMCO Income Strategy Fund II
      PFO,Flaherty & Crumrine Preferred Income Opportunity Fund Incorporated Common Stock
      PFS,"Provident Financial Services, Inc Common Stock"
      PFSI,"PennyMac Financial Services, Inc. Class A Common Stock"
      PFX,"Phoenix Companies, Inc. Phoenix Companies Inc 7.45% Pfd"
      PG,Procter & Gamble Company (The) Common Stock
      PGEM,"Ply Gem Holdings, Inc. Common Stock"
      PGH,Pengrowth Energy Corporation
      PGI,"Premiere Global Services, Inc."
      PGN,Paragon Offshore plc Ordinary Shares
      PGP,Pimco Global Stocksplus & Income Fund Pimco Global StocksPlus & Income Fund Common Shares of Beneficial Interest
      PGR,Progressive Corporation (The) Common Stock
      PGRE,"Paramount Group, Inc. Common Stock"
      PGZ,Principal Real Estate Income Fund Common Shares of Beneficial Interest
      PH,Parker
      PHD,Pioneer Floating Rate Trust Pioneer Floating Rate Trust Shares of Beneficial Interest
      PHG,Koninklijke Philips N.V. NY Registry Shares
      PHH,PHH Corp Common Stock
      PHI,Philippine Long Distance Telephone Company Sponsored ADR
      PHK,Pimco High Income Fund Pimco High Income Fund
      PHM,"PulteGroup, Inc. Common Stock"
      PHT,Pioneer High Income Trust Common Shares of Beneficial Interest
      PHX,Panhandle Oil and Gas Inc Common Stock
      PII,Polaris Industries Inc. Common Stock
      PIM,Putnam Master Intermediate Income Trust Common Stock
      PIR,"Pier 1 Imports, Inc. Common Stock"
      PIY,Preferred Plus Trust (Ser CZN) Preferred Plus Trust Ser CZN
      PJC,Piper Jaffray Companies Common Stock
      PJH,"Prudential Financial, Inc. 5.75% Junior Subordinated Notes due 2052"
      PJS,PreferredPlus Trust Ser FAR 1 Tr Ctf
      PKD,Parker Drilling Company Common Stock
      PKE,Park Electrochemical Corporation Common Stock
      PKG,Packaging Corporation of America Common Stock
      PKI,"PerkinElmer, Inc. Common Stock"
      PKO,Pimco Income Opportunity Fund Common Shares of Beneficial Interest
      PKX,POSCO Common Stock
      PKY,"Parkway Properties, Inc. Common Stock"
      PL,Protective Life Corporation Common Stock
      PL$B,Protective Life Corporation PLC Capital Trust V Trust Originated Preferred Securities (TOPRS)
      PL$C,Protective Life Corporation 6.25% Subordinated Debentures due 2042
      PL$E,Protective Life Corporation 6.00% Subordinated Debentures due 2042
      PLD,"ProLogis, Inc. Common Stock"
      PLL,Pall Corporation Common Stock
      PLOW,"Douglas Dynamics, Inc. Common Stock"
      PLT,"Plantronics, Inc. Common Stock"
      PM,Philip Morris International Inc Common Stock
      PMC,Pharmerica Corporation Common Stock
      PMF,PIMCO Municipal Income Fund Common Stock
      PML,Pimco Municipal Income Fund II Common Shares of Beneficial Interest
      PMM,Putnam Managed Municipal Income Trust Common Stock
      PMO,Putnam Municipal Opportunities Trust Common Stock
      PMT,PennyMac Mortgage Investment Trust Common Shares of Beneficial Interest
      PMX,PIMCO Municipal Income Fund III Common Shares of Beneficial Interest
      PNC,"PNC Financial Services Group, Inc. (The) Common Stock"
      PNC$P,"PNC Financial Services Group, Inc. (The) Depositary Shares Representing 1/4000th Perpetual Preferred Series P"
      PNC$Q,"PNC Financial Services Group, Inc. (The) Depositary Shares Representing 1/4000th Perpetual Preferred Shares Series Q"
      PNC.W,"PNC Financial Services Group, Inc. Warrant expiring December 31, 2018"
      PNF,PIMCO New York Municipal Income Fund Common Stock
      PNI,Pimco New York Municipal Income Fund II Common Shares of Beneficial Interest
      PNK,"Pinnacle Entertainment, Inc. Common Stock"
      PNM,"PNM Resources, Inc. (Holding Co.) Common Stock"
      PNR,Pentair plc. Ordinary Share
      PNTA,PennantPark Investment Corporation 6.25% Senior Notes due 2025
      PNW,Pinnacle West Capital Corporation Common Stock
      PNX,"Phoenix Companies, Inc. (The) Common Stock"
      PNY,"Piedmont Natural Gas Company, Inc. Common Stock"
      POL,PolyOne Corporation Common Stock
      POM,"PEPCO Holdings, Inc Common Stock"
      POR,Portland General Electric Co Common Stock
      POST,"Post Holdings, Inc. Common Stock"
      POT,Potash Corporation of Saskatchewan Inc. Common Stock
      POWR,"PowerSecure International, Inc. Common Stock"
      PPG,"PPG Industries, Inc. Common Stock"
      PPL,PP&L Corporation Common Stock
      PPO,Polypore International Inc Common Stock
      PPP,Primero Mining Corp.  New Common Shares (Canada)
      PPR,Voya Prime Rate Trust Shares of Beneficial Interest
      PPS,"Post Properties, Inc. Common Stock"
      PPS$A,"Post Properties, Inc. Preferred Stock"
      PPT,Putnam Premier Income Trust Common Stock
      PPX,"PPL Capital Funding, Inc. 2013 Series B Junior Subordinated Notes due 2073"
      PQ,Petroquest Energy Inc Common Stock
      PRA,ProAssurance Corporation Common Stock
      PRE,PartnerRe Ltd. Common Stock
      PRE$D,PartnerRe Ltd. Preferred Series D 6.5% (Bermuda)
      PRE$E,PartnerRe Ltd. PFD SER E (Bermuda)
      PRE$F,PartnerRe Ltd. Redeemable Preferred Shares Series F (Bermuda)
      PRGO,Perrigo Company plc Ordinary Shares
      PRH,"Prudential Financial, Inc. 5.70% Junior Subordinated Notes due 2053"
      PRI,"Primerica, Inc. Common Stock"
      PRLB,"Proto Labs, Inc. Common stock"
      PRO,"PROS Holdings, Inc. Common Stock"
      PRU,"Prudential Financial, Inc. Common Stock"
      PRY,Prospect Capital Corporation 6.95% Senior Notes due 2022
      PSA,Public Storage Common Stock
      PSA$A,"Public Storage Depositary Shares each representing 1/1,000 of a 5.875% Cumulative Preferred SBI, Series A"
      PSA$O,Public Storage Depositary Shares Representing 1/1000% Cumulative Pfd Sh Ben Int Series O
      PSA$P,Public Storage DEPOSITARY SHS REPSTG % CUMULATIVE PFD SHS BEN INT (SER P)
      PSA$Q,Public Storage DEPOSITARY SHS REPSTG 1/1000TH PFD SHS BEN INT SER Q
      PSA$R,Public Storage Depository Sh Repstg 1/1000th Pfd Ser R
      PSA$S,Public Storage DEP SH REPSTG PFD SH BEN INT SER S
      PSA$T,Public Storage Depository Shares Representing 1/1000 Pfd Shares Beneficial Interest Series T
      PSA$U,Public Storage Depositary Shares Representing 1/1000 Preferred Benerficial Interest Series U
      PSA$V,Public Storage Dep Shs Repstg 1/1000th Pfd Sh Ben Int Ser V
      PSA$W,Public Storage Depositary Shares Representing 1/1000 Preferred Shares of Benficial Interest Series W
      PSA$X,Public Storage Depositary Shares Representing 1/1000th Cumulative Preferred Shares Beneficial Interest Series X
      PSA$Y,Public Storage Dep Shs Repstg 1/1000th Pfd Sh Ben Int Ser Y
      PSA$Z,Public Storage Dep Shs Representing 1/1000th Pfd Sh Ben Int Ser Z
      PSB,"PS Business Parks, Inc. Common Stock"
      PSB$R,"PS Business Parks, Inc. Depositary Shares, Each representing 1/1,000 of a share of 6.875% Cumulative Preferred stock, Series R, $0.01 par"
      PSB$S,"PS Business Parks, Inc. Depositary Shares, each representing 1/1,000 of a share of 6.45% Cumulative Preferred Stock"
      PSB$T,"PS Business Parks, Inc. Depositary Shares Representing 1/1000th Preferred Series T"
      PSB$U,"PS Business Parks, Inc. Dep Shs Repstg 1/1000 Pfd Ser U"
      PSB$V,"PS Business Parks, Inc. Depositary Shares Represting 1/1000th Shares Cumulative Preferred Stock Series V"
      PSF,"Cohen & Steers Select Preferred and Income Fund, Inc. Common Stock"
      PSG,Performance Sports Group Ltd. Ordinary Shares (Canada)
      PSO,"Pearson, Plc Common Stock"
      PSX,Phillips 66 Common Stock
      PSXP,Phillips 66 Partners LP Common Units representing limited partner interest in the Partnership
      PT,"Portugal Telecom SGPS, S.A . Common Stock"
      PTP,"Platinum Underwriters Holdings, Ltd"
      PTR,PetroChina Company Limited Common Stock
      PTY,Pimco Corporate & Income Opportunity Fund
      PUK,Prudential Public Limited Company Common Stock
      PUK$,Prudential Public Limited Company 6.75% Perpetual Subordinated Captial Security
      PUK$A,Prudential Public Limited Company 6.50% Perpetual Subordinated Capital Securities Exchangeable at the Issuer's Option Into Non
      PVA,Penn Virginia Corporation Common Stock
      PVG,"Pretium Resources, Inc. Ordinary Shares (Canada)"
      PVH,PVH Corp. Common Stock
      PVTD,"PrivateBancorp, Inc. 7.125% Subordinated Debentures due 2042"
      PWE,Penn West Petroleum Ltd
      PWR,"Quanta Services, Inc. Common Stock"
      PX,"Praxair, Inc. Common Stock"
      PXD,Pioneer Natural Resources Company Common Stock
      PYB,PPlus Trust Series GSG
      PYN,PIMCO New York Municipal Income Fund III Common Shares of Beneficial Interest
      PYS,Merrill Lynch Depositor Inc PPlus Tr Ser RRD
      PYT,PPlus Tr GSC
      PZB,"Merrill Lynch Depositor, Inc. Merrill Lynch Depositor, Inc. PPLUS Class A 6.7% Callable Trust Certificates, Series LTD"
      PZC,PIMCO California Municipal Income Fund III Common Shares of Beneficial Interest
      PZE,Petrobras Argentina S.A. ADS
      PZN,Pzena Investment Management Inc Class A Common Stock
      Q,Quintiles Transnational Holdings Inc. Common Stock
      QEP,"QEP Resources, Inc. Common Stock"
      QEPM,"QEP Midstream Partners, LP Common Units representing Limited Partner Interests"
      QIHU,"Qihoo 360 Technology Co. Ltd. American Depositary Shares, every 2 of which representing three Class A Ordinary Shares"
      QSR,Restaurant Brands International Inc. Common Shares
      QTM,Quantum Corporation Common Stock
      QTS,"QTS Realty Trust, Inc. Class A Common Stock"
      QTWO,"Q2 Holdings, Inc. Common Stock"
      QUAD,"Quad Graphics, Inc Class A Common Stock"
      R,"Ryder System, Inc. Common Stock"
      RAD,Rite Aid Corporation Common Stock
      RAI,Reynolds American Inc Common Stock
      RALY,Rally Software Development Corp. Common Stock
      RAS,RAIT Financial Trust New Common Shares of Beneficial Interest
      RAS$A,RAIT Financial Trust  7.75% Series A Cumulative Redeemable Preferred Shares of Beneficial Interest
      RAS$B,RAIT Financial Trust 8.375% Series B Cumulative Redeemable Preferred Shares of Beneficial Interest
      RAS$C,RAIT Financial Trust 8.875% Series C Cumulative Redeemable Preferred Shares of Beneficial Interest
      RATE,"Bankrate, Inc. Common Stock"
      RAX,"Rackspace Hosting, Inc Common Stock"
      RBA,Ritchie Bros. Auctioneers Incorporated Common Stock
      RBC,Regal Beloit Corporation Common Stock
      RBS,Royal Bank of Scotland Group Plc New (The) ADS
      RBS$E,RBS Capital Funding Trust V
      RBS$F,Royal Bank of Scotland Group Plc (The) Preferred Stock
      RBS$G,RBS Capital Funding Trust VII
      RBS$H,Royal Bank of Scotland Group Plc (The) Preferred Stock
      RBS$I,RBS Capital Funding Trust VI
      RBS$L,Royal Bank of Scotland Group Plc (The) ADR representing One Non
      RBS$M,Royal Bank of Scotland Group Plc (The) ADS Series M
      RBS$N,Royal Bank of Scotland Group Plc (The) Royal Bank of Scotland Group PLC (The) American Depositary Shares (each representing One Non
      RBS$P,Royal Bank of Scotland Group Plc (The) ADR representing Preferred Shares Series P
      RBS$Q,Royal Bank of Scotland Group Plc (The) ADR repstg Pref Shs Ser Q
      RBS$R,Royal Bank of Scotland Group Plc (The) ADR repstg USD Pfd Shs Ser R (United Kingdom)
      RBS$S,Royal Bank of Scotland Group Plc (The) Sponsored ADR Repstg Pref Ser S (United Kingdom)
      RBS$T,Royal Bank of Scotland Group Plc (The) Sponsored ADR Representing Pfef shs ser T (United Kingdom)
      RCAP,RCS CAPITAL CORPORATION Common Stock
      RCI,"Rogers Communication, Inc. Common Stock"
      RCL,Royal Caribbean Cruises Ltd. Common Stock
      RCS,"PIMCO Strategic Income Fund, Inc."
      RDC,Rowan Companies plc Class A Ordinary Shares
      RDN,Radian Group Inc. Common Stock
      RDS.A,Royal Dutch Shell PLC Royal Dutch Shell American Depositary Shares (Each representing two Class A Ordinary Shares)
      RDS.B,Royal Dutch Shell PLC Royal Dutch Shell PLC American Depositary Shares (Each representing two Class B Ordinary Shares)
      RDY,Dr. Reddy's Laboratories Ltd Common Stock
      RE,"Everest Re Group, Ltd. Common Stock"
      REG,Regency Centers Corporation Common Stock
      REG$F,Regency Centers Corporation Cumulative Red Preferred Series 6%
      REG$G,Regency Centers Corporation Pfd Ser 7%
      REN,Resolute Energy Corporation Comon Stock
      RENN,"Renren Inc. American Depositary Shares, each representing three Class A ordinary shares"
      RES,"RPC, Inc. Common Stock"
      RESI,Altisource Residential Corporation Common Stock
      REV,"Revlon, Inc. New Common Stock"
      REX,REX American Resources Corporation
      REXR,"Rexford Industrial Realty, Inc. Common Stock"
      RF,Regions Financial Corporation Common Stock
      RF$A,Regions Financial Corporation Depositary Shares Representing 1/40th Perpetual Preferred Series A
      RF$B,Regions Financial Corporation Depositary Shares Representing 1/40th Perpetual Preferred Series B
      RFI,"Cohen & Steers Total Return Realty Fund, Inc. Common Stock"
      RFP,Resolute Forest Products Inc. Common Stock
      RFT,RAIT Financial Trust 7.625% Senior Notes due 2024
      RFTA,RAIT Financial Trust 7.125% Senior Notes due 2019
      RGA,"Reinsurance Group of America, Incorporated Common Stock"
      RGC,Regal Entertainment Group Class A Common Stock
      RGP,Regency Energy Partners LP Common Units Representing Limited Partner Interests
      RGR,"Sturm, Ruger & Company, Inc. Common Stock"
      RGS,Regis Corporation Common Stock
      RGT,"Royce Global Value Trust, Inc. Common Stock"
      RH,Restoration Hardware Holdings Inc. Common Stock
      RHI,Robert Half International Inc. Common Stock
      RHP,"Ryman Hospitality Properties, Inc. (REIT)"
      RHT,"Red Hat, Inc. Common Stock"
      RICE,Rice Energy Inc. Common Stock
      RIG,Transocean Ltd (Switzerland) Common Stock
      RIGP,Transocean Partners LLC Common Units Representing Limited Liability Company Interests
      RIO,Rio Tinto Plc Common Stock
      RIOM,Rio Alto Mining Limited Common Shares (Canada)
      RIT,LMP Real Estate Income Fund Inc Common Stock
      RJD,"Raymond James Financial, Inc. 6.90% Senior Notes Due 2042"
      RJF,"Raymond James Financial, Inc. Common Stock"
      RKT,Rock
      RKUS,"Ruckus Wireless, Inc. Common Stock"
      RL,Ralph Lauren Corporation Common Stock
      RLD,RealD Inc Common Stock
      RLGY,Realogy Holdings Corp. Common Stock
      RLH,Red Lions Hotels Corporation Common Stock
      RLH$A,Red Lion Hotels Capital Trust Red Lion Hotels Capital Trust
      RLI,RLI Corp. Common Stock
      RLJ,RLJ Lodging Trust Common Shares of Beneficial Interest $0.01 par value
      RM,Regional Management Corp. Common Stock
      RMAX,"RE/MAX Holdings, Inc. Class A Common Stock"
      RMD,ResMed Inc. Common Stock
      RMP,Rice Midstream Partners LP Common Units representing limited partner interests
      RMT,Royce Micro
      RNDY,"Roundy's, Inc. Common Stock"
      RNE,"Morgan Stanley Eastern Europe Fund, Inc. Common Stock"
      RNF,"Rentech Nitrogen Partners, L.P. Common Units representing limited partner interests"
      RNG,"Ringcentral, Inc. Class A Common Stock"
      RNO,Rhino Resource Partners LP Common Units representing limited partnership interests
      RNP,Cohen & Steers Reit and Preferred Income Fund Inc Common Shares
      RNR,RenaissanceRe Holdings Ltd. Common Stock
      RNR$C,RenaissanceRe Holdings Ltd. 6.08% Series C Preference Shares
      RNR$E,RenaissanceRe Holdings Ltd. 5.375% Series E Preference Shares
      ROC,"Rockwood Holdings, Inc. Common Stock"
      ROG,Rogers Corporation Common Stock
      ROK,"Rockwell Automation, Inc. Common Stock"
      ROL,"Rollins, Inc. Common Stock"
      ROP,"Roper Industries, Inc. Common Stock"
      ROYT,Pacific Coast Oil Trust Units of Beneficial Interest
      RPAI,"Retail Properties of America, Inc. Class A Common Stock"
      RPAI$A,"Retail Properties of America, Inc. Pfd Ser A %"
      RPM,RPM International Inc. Common Stock
      RPT,Ramco
      RPT$D,Ramco
      RQI,Cohen & Steers Quality Income Realty Fund Inc Common Shares
      RRC,Range Resources Corporation Common Stock
      RRMS,"Rose Rock Midstream, L.P. Common Units Representing Limited Partner Interests"
      RRTS,"Roadrunner Transportation Systems, Inc Common Stock"
      RS,Reliance Steel & Aluminum Co. Common Stock
      RSE,"Rouse Properties, Inc. Common Stock"
      RSG,"Republic Services, Inc. Common Stock"
      RSH,Radioshack Corporation Common Stock
      RSO,Resource Capital Corp. Resource Capital Corp. Common Stock
      RSO$A,Resource Capital Corp. 8.50% Series A Cumulative Redeemable Preferred Stock
      RSO$B,Resource Capital Corp. Pfd Ser B
      RSO$C,Resource Capital Corp. Preferred Series C
      RSPP,"RSP Permian, Inc. Common Stock"
      RST,"Rosetta Stone Rosetta Stone, Inc."
      RT,"Ruby Tuesday, Inc. Common Stock"
      RTEC,"Rudolph Technologies, Inc. Common Stock"
      RTI,"RTI International Metals, Inc. Common Stock"
      RTN,Raytheon Company Common Stock
      RUBI,"The Rubicon Project, Inc. Common Stock"
      RUK,Reed Elsevier NV PLC New ADS
      RVT,"Royce Value Trust, Inc. Common Stock"
      RWT,"Redwood Trust, Inc. Common Stock"
      RXN,Rexnord Corporation Common Stock
      RY,Royal Bank Of Canada Common Stock
      RYAM,Rayonier Advanced Materials Inc. Common Stock
      RYI,Ryerson Holding Corporation Common Stock
      RYL,"Ryland Group, Inc. (The) Common Stock"
      RYN,Rayonier Inc. REIT Common Stock
      RZA,"Reinsurance Group of America, Incorporated 6.20% Fixed"
      S,Sprint Corporation Common Stock
      SA,"Seabridge Gold, Inc. Ordinary Shares (Canada)"
      SAH,"Sonic Automotive, Inc. Common Stock"
      SAIC,SCIENCE APPLICATIONS INTERNATIONAL CORPORATION Common Stock
      SALT,Scorpio Bulkers Inc. Common Stock
      SAM,"Boston Beer Company, Inc. (The) Common Stock"
      SAN,"Banco Santander, S.A. Sponsored ADR (Spain)"
      SAN$A,"Banco Santander, S.A. 6.80% Non"
      SAN$B,Santander Finance Preferred SA Unipersonal Floating Rate Non
      SAN$C,"Banco Santander, S.A. 6.50% Non"
      SAN$I,"Banco Santander Central Hispano, S.A. Santander Finance Preferred S.A. Unipersonal 6.41% Non"
      SAP,SAP  SE ADS
      SAQ,Saratoga Investment Corp 7.50% Notes due 2020
      SAR,Saratoga Investment Corp New
      SB,"Safe Bulkers, Inc Common Stock ($0.001 par value)"
      SB$B,"Safe Bulkers, Inc 8.00% Series B Cumulative Redeemable Perpetual Preferred Shares"
      SB$C,"Safe Bulkers, Inc Cumulative Redeemable Perpetual Preferred Series C (Marshall Islands)"
      SB$D,"Safe Bulkers, Inc Perpetual Preferred Series D (Marshall Islands)"
      SBGL,Sibanye Gold Limited American Depositary Shares (Each representing four ordinary shares)
      SBH,"Sally Beauty Holdings, Inc. (Name to be changed from Sally Holdings, Inc.) Common Stock"
      SBNA,Scorpio Tankers Inc. 6.75% Senior Notes due 2020
      SBNB,Scorpio Tankers Inc. 7.50% Senior Notes Due 2017
      SBR,Sabine Royalty Trust Common Stock
      SBS,Companhia de saneamento Basico Do Estado De Sao Paulo
      SBW,Western Asset Worldwide Income Fund Inc. Common Stock
      SBY,Silver Bay Realty Trust Corp. Common Stock
      SC,Santander Consumer USA Holdings Inc. Common Stock
      SCCO,Southern Copper Corporation Common Stock
      SCD,LMP Capital and Income Fund Inc. Common Stock
      SCE$F,Southern California Edison Trust I Trust Preferred Securities
      SCE$G,SCE Trust II Trust Preferred Securities
      SCE$H,SCE Trust III Fixed/Floating Rate Trust Preference Securities
      SCG,SCANA Corporation Common Stock
      SCHW,Charles Schwab Corporation (The) Common Stock
      SCHW$B,Charles Schwab Corporation Depositary Shares Representing 1/40th Int Sh Non Cumulative Preferred Stock Series B
      SCI,Service Corporation International Common Stock
      SCL,Stepan Company Common Stock
      SCM,Stellus Capital Investment Corporation Common Stock
      SCQ,Stellus Capital Investment Corporation 6.50% Notes due 2019
      SCS,Steelcase Inc. Common Stock
      SCU,Scana Corporation SCANA CORPORATION 2009 Series A 7.70% Enhanced Junior Subordinated Notes
      SCX,L.S. Starrett Company (The) Common Stock
      SD,Sandridge Energy Inc. Common Stock
      SDLP,Seadrill Partners LLC Common Units Representing Limited Liability Company Interests
      SDR,SandRidge Mississippian Trust II Common Units representing Beneficial Interests
      SDRL,Seadrill Limited Ordinary Shares (Bermuda)
      SDT,SandRidge Mississippian Trust I Common Units of Beneficial Interest
      SE,Spectra Energy Corp Common Stock
      SEAS,"SeaWorld Entertainment, Inc. Common Stock"
      SEE,Sealed Air Corporation Common Stock
      SEM,Select Medical Holdings Corporation Common Stock
      SEMG,Semgroup Corporation Class A Common Stock
      SEP,"Spectra Energy Partners, LP Common Units representing Limited Partner Interests"
      SERV,"ServiceMaster Global Holdings, Inc. Common Stock"
      SF,Stifel Financial Corporation Common Stock
      SFB,Stifel Financial Corp. 6.70% Senior Note due 2022
      SFE,"Safeguard Scientifics, Inc. New Common Stock"
      SFG,"StanCorp Financial Group, Inc. Common Stock"
      SFL,Ship Finance International Limited
      SFN,Stifel Financial Corporation 5.375% Senior Notes due December 2022
      SFS,"Smart & Final Stores, Inc. Common Stock"
      SFUN,"SouFun Holdings Limited American Depositary Shares (Each representing Four Class A Ordinary Shares, HK$1.00 par value)"
      SFY,Swift Energy Company (Holding Company) Common Stock
      SGF,"Aberdeen Singapore Fund, Inc. Common Stock"
      SGL,"Strategic Global Income Fund, Inc. Common Stock"
      SGM,Stonegate Mortgage Corporation Common Stock
      SGU,"Star Gas Partners, L.P. Common Stock"
      SGY,Stone Energy Corporation Common Stock
      SGZA,"Selective Insurance Group, Inc. 5.875% Senior Notes due 2043"
      SHG,Shinhan Financial Group Co Ltd American Depositary Shares
      SHI,"SINOPEC Shangai Petrochemical Company, Ltd. Common Stock"
      SHLX,"Shell Midstream Partners, L.P. Common Units representing Limited Partner Interests"
      SHO,"Sunstone Hotel Investors, Inc. Sunstone Hotel Investors, Inc. Common Shares"
      SHO$D,"Sunstone Hotel Investors, Inc. 8.0% Series D Cumulative Redeemable Preferred Stock"
      SHW,Sherwin
      SID,Companhia Siderurgica Nacional S.A. Common Stock
      SIG,Signet Jewelers Limited Common Shares
      SIR,Select Income REIT Common Shares of Beneficial Interest
      SIX,Six Flags Entertainment Corporation New Common Stock
      SJI,"South Jersey Industries, Inc. Common Stock"
      SJM,J.M. Smucker Company (The) New Common Stock
      SJR,Shaw Communications Inc. Common Stock
      SJT,San Juan Basin Royalty Trust Common Stock
      SJW,SJW Corporation Common Stock
      SKH,"Skilled Healthcare Group, Inc. Common Stock"
      SKM,"SK Telecom Co., Ltd. Common Stock"
      SKT,"Tanger Factory Outlet Centers, Inc. Common Stock"
      SKX,"Skechers U.S.A., Inc. Common Stock"
      SLB,Schlumberger N.V. Common Stock
      SLCA,"U.S. Silica Holdings, Inc. Common Stock"
      SLF,Sun Life Financial Inc. Common Stock
      SLG,SL Green Realty Corporation Common Stock
      SLG$I,SL Green Realty Corporation Preferred Series I
      SLH,"Solera Holdings, Inc. Solera Holdings, Inc. Common Stock"
      SLRA,Solar Capital Ltd. 6.75% Senior Notes due 2042
      SLTB,Scorpio Bulkers Inc. 7.50% Senior Notes due 2019
      SLW,Silver Wheaton Corp Common Shares (Canada)
      SM,SM Energy Company Common Stock
      SMFG,Sumitomo Mitsui Financial Group Inc Unsponsored American Depositary Shares (Japan)
      SMG,Scotts Miracle
      SMI,Semiconductor  Manufacturing International Corporation ADR
      SMLP,"Summit Midstream Partners, LP Common Units Representing Limited Partner Interests"
      SMM,Salient Midstream Common Shares of Beneficial Interest
      SMP,"Standard Motor Products, Inc. Common Stock"
      SN,Sanchez Energy Corporation Common Stock
      SNA,Snap
      SNE,Sony Corporation Common Stock
      SNH,Senior Housing Properties Trust Common Stock
      SNHN,Senior Housing Properties Trust 5.625% Senior Notes due 2042
      SNI,"Scripps Networks Interactive, Inc Common Class A"
      SNN,"Smith & Nephew SNATS, Inc. Common Stock"
      SNOW,"Intrawest Resorts Holdings, Inc. Common Stock"
      SNP,China Petroleum & Chemical Corporation Common Stock
      SNR,New Senior Investment Group Inc. Common Stock
      SNV,Synovus Financial Corp. Common Stock
      SNV$C,Synovus Financial Corp. Perp Pfd Ser C Fxd To Fltg
      SNX,Synnex Corporation Common Stock
      SNY,Sanofi American Depositary Shares (Each repstg one
      SO,Southern Company (The) Common Stock
      SOL,Renesola Ltd. Common Shares of Beneficial Interest
      SON,Sonoco Products Company Common Stock
      SOR,"Source Capital, Inc. Common Stock"
      SOV$C,"Santander Holdings USA, Inc. Dep Shs repstg 1/1000 Perp Pfd Ser C"
      SPA,Sparton Corporation Common Stock
      SPB,"Spectrum Brands Holdings, Inc. Common Stock"
      SPE,"Special Opportunities Fund, Inc Common Stock"
      SPF,Standard Pacific Corp Common Stock
      SPG,"Simon Property Group, Inc. Common Stock"
      SPG$J,"Simon Property Group, Inc. Simon Property Group 8 3/8% Series J Cumulative Redeemable Preferred Stock"
      SPH,"Suburban Propane Partners, L.P. Common Stock"
      SPLP,Steel Partners Holdings LP LTD PARTNERSHIP UNIT
      SPN,"Superior Energy Services, Inc. Common Stock"
      SPR,"Spirit Aerosystems Holdings, Inc. Common Stock"
      SPW,SPX Corporation Common Stock
      SPXX,Nuveen S&P 500 Dynamic Overwrite Fund
      SQM,Sociedad Quimica y Minera S.A. Common Stock
      SQNS,"Sequans Communications S.A. American Depositary Shares, each representing one Ordinary Share"
      SR,Standard Register Company (The) Common Stock
      SRC,"Spirit Realty Capital, Inc. Common Stock"
      SRE,Sempra Energy Common Stock
      SRF,The Cushing Royalty & Income Fund Common Shares of Beneficial Interest
      SRI,"Stoneridge, Inc. Common Stock"
      SRLP,Sprague Resources LP Common Units representing Limited Partner Interests
      SRT,"StarTek, Inc. Common Stock"
      SRV,The Cushing MLP Total Return Fund Common Shares of Beneficial Interest
      SSD,"Simpson Manufacturing Company, Inc. Common Stock"
      SSE,Seventy Seven Energy Inc. Common Stock
      SSI,"Stage Stores, Inc. Common Stock"
      SSL,Sasol Ltd. American Depositary Shares
      SSLT,Sesa Sterlite Limited  American Depositary Shares (Each representing four equity shares)
      SSNI,"Silver Spring Networks, Inc. Common Stock"
      SSP,E.W. Scripps Company (The) Common Stock
      SSS,"Sovran Self Storage, Inc. Common Stock"
      SSTK,"Shutterstock, Inc. Common Stock"
      SSW,Seaspan Corporation Seaspan Corporation Common Shares
      SSW$C,Seaspan Corporation 9.50% Series C Cumulative Redeemable Perpetual Preferred Shares
      SSW$D,Seaspan Corporation Cumulative Redeemable Perpetual Preferred Series D (Marshall Islands)
      SSW$E,Seaspan Corporation Cumulative Redeemable Perpetual Preferred Series E (Marshall Islands)
      SSWN,Seaspan Corporation 6.375% Notes due 2019
      ST,Sensata Technologies Holding N.V. Ordinary Shares
      STAG,"Stag Industrial, Inc. Common Stock"
      STAG$A,"Stag Industrial, Inc. Preferred Series A"
      STAG$B,"Stag Industrial, Inc. Cum Pfd Ser B"
      STAR,iStar Financial Inc. Common Stock
      STAR$D,iStar Financial Inc. Preferred Stock
      STAR$E,iStar Financial Inc. 7.875% Preferred Ser E
      STAR$F,iStar Financial Inc. Series F Preferred Stock
      STAR$G,iStar Financial Inc. Preferred Stock Series G
      STAR$I,iStar Financial Inc. Preferred Series I
      STAY,"Extended Stay America, Inc. Common Stock"
      STC,Stewart Information Services Corporation Common Stock
      STE,STERIS Corporation Common Stock
      STI,"SunTrust Banks, Inc. Common Stock"
      STI$A,"SunTrust Banks, Inc. Dep Shs repstg 1/4000 Perpetual Pfd Stk Ser A"
      STI$E,"SunTrust Banks, Inc. Depositary Shares Representing Perpetual Preferred Series E"
      STI.A,"SunTrust Banks, Inc. Class A Warrant (Expiring December 31, 2018)"
      STI.B,"SunTrust Banks, Inc. Class B Warrant (Expiring November 14, 2018)"
      STJ,"St. Jude Medical, Inc. Common Stock"
      STK,Columbia Seligman Premium Technology Growth Fund Inc
      STL,Sterling Bancorp
      STM,STMicroelectronics N.V. Common Stock
      STN,Stantec Inc Common Stock
      STNG,Scorpio Tankers Inc. Common Shares
      STO,Statoil ASA
      STON,StoneMor Partners L.P. Common Unit Rep Limited Partnership Interests
      STOR,STORE Capital Corporation Common Stock
      STR,Questar Corporation Common Stock
      STRI,"STR Holdings, Inc Common Stock"
      STT,State Street Corporation Common Stock
      STT$C,State Street Corporation Dep Shs Representing 1/4000 Ownership Int In Sh Non Cum (Perpertual Pfd Stk Ser C)
      STT$D,State Street Corporation Depositary Shares representing 1/4000th Perpetual Preferred Series D
      STT$E,"State Street Corporation Depository Shares, each representing a 1/4,000th ownership interest in a share of Non"
      STV,"China Digital TV Holding Co., Ltd. American Depositary Shares"
      STWD,"STARWOOD PROPERTY TRUST, INC. Starwood Property Trust Inc."
      STZ,"Constellation Brands, Inc. Common Stock"
      STZ.B,"Constellation Brands, Inc. Common Stock"
      SU,Suncor Energy  Inc. Common Stock
      SUI,"Sun Communities, Inc. Common Stock"
      SUI$A,"Sun Communities, Inc. Preferred Series A"
      SUN,Sunoco LP Common Units representing limited partner interests
      SUNE,"SunEdison, Inc. Common Stock"
      SUP,"Superior Industries International, Inc. Common Stock"
      SVM,Silvercorp Metals Inc Ordinary Shares (Canada)
      SVU,SuperValu Inc. Common Stock
      SWAY,Starwood Waypoint Residential Trust Common Stock
      SWC,Stillwater Mining Company Common Stock ($0.01 Par Value)
      SWFT,Swift Transportation Company Class A Common Stock
      SWH,"Stanley Black & Decker, Inc. Corp Unit 2013"
      SWI,"Solarwinds, Inc. Common Stock"
      SWJ,"Stanley Black & Decker, Inc. 5.75% Junior Subordinated Debenture due 2052"
      SWK,"Stanley Black & Decker, Inc. Common Stock"
      SWM,Schweitzer
      SWN,Southwestern Energy Company Common Stock
      SWU,"Stanley Black & Decker, Inc Corporate Units"
      SWX,Southwest Gas Corporation Common Stock
      SWY,Safeway Inc. Common Stock
      SWZ,"Swiss Helvetia Fund, Inc. (The) Common Stock"
      SXC,"SunCoke Energy, Inc. Common Stock"
      SXCP,"SunCoke Energy Partners, L.P. Common Units Representing Limited partner Interests"
      SXE,"Southcross Energy Partners, L.P. Common Units representing limited partner interest in the Partnership"
      SXI,Standex International Corporation Common Stock
      SXL,Sunoco Logistics Partners LP Common Units representing limited partner interests
      SXT,Sensient Technologies Corporation Common Stock
      SYA,Symetra Financial Corporation Common Stock $0.01 par value
      SYF,Synchrony Financial Common Stock
      SYK,Stryker Corporation Common Stock
      SYT,Syngenta AG Common Stock
      SYX,Systemax Inc. Common Stock
      SYY,Sysco Corporation Common Stock
      SZC,Cushing Renaissance Fund (The) Common Shares of Beneficial Interest
      T,AT&T Inc.
      TA,TravelCenters of America LLC Common Stock
      TAC,TransAlta Corporation Ordinary Shares
      TAHO,"Tahoe Resources, Inc. Ordinary Shares (Canada)"
      TAI,"Transamerica Income Shares, Inc. Common Stock"
      TAL,"TAL International Group, Inc. Common Stock"
      TANN,TravelCenters of America LLC 8.25% Senior Notes due 2028
      TANO,TravelCenters of America LLC 8.00% Senior Notes due 2029
      TAOM,Taomee Holdings Limited American Depositary Shares (each representing 20 ordinary shares)
      TAP,Molson Coors Brewing Company Class B Common Stock
      TAP.A,Molson Coors Brewing  Company Molson Coors Brewing Company Class A Common Stock
      TARO,Taro Pharmaceutical Industries Ltd. Ordinary Shares
      TBI,"TrueBlue, Inc. Common Stock"
      TC,Thompson Creek Metals Company Inc. Ordinary Shares (Canada)
      TCAP,Triangle Capital Corporation Common Stock
      TCB,TCF Financial Corporation Common Stock
      TCB$B,TCF Financial Corporation Del Dep Shs Repstg 1/1000 Pfd Ser A
      TCB$C,TCF Financial Corporation Perp Pfd Ser B
      TCB.W,TCF Financial Corporation TCF Financial Corporation Warrants
      TCC,Triangle Capital Corporation 7.00% Senior Notes due 2019
      TCCA,Triangle Capital Corporation 6.375% Senior Notes due 2022
      TCI,"Transcontinental Realty Investors, Inc. Common Stock"
      TCK,Teck Resources Ltd Ordinary Shares
      TCO,"Taubman Centers, Inc. Common Stock"
      TCO$J,"Taubman Centers, Inc. Preferred Shares Series J"
      TCO$K,"Taubman Centers, Inc. Preferred Series K"
      TCP,"TC PipeLines, LP Common Units representing Limited Partner Interests"
      TCPI,TCP International Holdings Ltd. Common Shares
      TCRX,"THL Credit, Inc. 6.75% Notes due 2021"
      TCS,Container Store (The) Common Stock
      TD,Toronto Dominion Bank (The) Common Stock
      TDA,"Telephone and Data Systems, Inc. 5.875% Senior Notes due 2061"
      TDC,Teradata Corporation Common Stock
      TDE,"Telephone and Data Systems, Inc. 6.875% Senior Notes due 2059"
      TDF,"Templeton Dragon Fund, Inc. Common Stock"
      TDG,Transdigm Group Incorporated Transdigm Group Inc. Common Stock
      TDI,"Telephone and Data Systems, Inc. Sr Nt"
      TDJ,"Telephone and Data Systems, Inc. 7% Senior Notes due 2060"
      TDS,"Telephone and Data Systems, Inc. Common Shares"
      TDW,Tidewater Inc. Common Stock
      TDY,Teledyne Technologies Incorporated Common Stock
      TE,"TECO Energy, Inc. Common Stock"
      TEF,Telefonica SA Common Stock
      TEG,"Integrys Energy Group, Inc. Common Stock"
      TEI,"Templeton Emerging Markets Income Fund, Inc. Common Stock"
      TEL,TE Connectivity Ltd. New Switzerland Registered Shares
      TEN,Tenneco Inc. Common Stock
      TEO,Telecom Argentina SA
      TEP,"Tallgrass Energy Partners, LP Common Units representing limited partner interests"
      TER,"Teradyne, Inc. Common Stock"
      TEU,Box Ships Inc. Common Shares
      TEU$C,Box Ships Inc. 9.00% Series C Cumulative Perpetual Preferred Stock
      TEVA,Teva Pharmaceutical Industries Limited American Depositary Shares
      TEX,Terex Corporation Common Stock
      TFG,"Fixed Income Trust for Goldman Sachs Subordinated Notes, Series 2011"
      TFX,Teleflex Incorporated Common Stock
      TG,Tredegar Corporation Common Stock
      TGH,Textainer Group Holdings Limited Common Shares
      TGI,"Triumph Group, Inc. Common Stock"
      TGP,Teekay LNG Partners L.P.
      TGS,Transportadora de Gas del Sur SA TGS Common Stock
      TGT,Target Corporation Common Stock
      THC,Tenet Healthcare Corporation Common Stock
      THG,Hanover Insurance Group Inc
      THGA,"The Hanover Insurance Group, Inc. 6.35% Subordinated Debentures due 2053"
      THO,"Thor Industries, Inc. Common Stock"
      THQ,Tekla Healthcare Opportunies Fund Shares of Beneficial Interest
      THR,"Thermon Group Holdings, Inc. Common Stock"
      THS,"Treehouse Foods, Inc. Common Stock"
      TI,Telecom Italia S.P.A. New
      TI.A,Telecom Italia S.P.A. New
      TIF,Tiffany & Co. Common Stock
      TIME,Time Inc. Common Stock
      TISI,"Team, Inc. Common Stock"
      TJX,"TJX Companies, Inc. (The) Common Stock"
      TK,Teekay Corporation Common Stock
      TKC,Turkcell Iletisim Hizmetleri AS Common Stock
      TKF,"Turkish Investment Fund, Inc. (The) Common Stock"
      TKR,Timken Company (The) Common Stock
      TLI,LMP Corporate Loan Fund Inc Common Stock
      TLK,"PT Telekomunikasi Indonesia, Tbk"
      TLLP,Tesoro Logistics LP Common Units representing Limited Partner Interests
      TLM,Talisman Energy Inc. Common Stock
      TLP,Transmontaigne Partners L.P. Transmontaigne Partners L.P. Common Units representing limited partner interests
      TLYS,"Tilly's, Inc. Common Stock"
      TM,Toyota Motor Corporation Common Stock
      TMH,"Team Health Holdings, Inc. Team Health Holdings, Inc."
      TMHC,Taylor Morrison Home Corporation Class A Common Stock
      TMK,Torchmark Corporation Common Stock
      TMK$B,Torchmark Corporation 5.875% Junior Subordinated Debenture due 2052
      TMO,Thermo Fisher Scientific Inc Common Stock
      TMST,Timken Steel Corporation Common Shares
      TMUS,T
      TMUS$A,T
      TNC,Tennant Company Common Stock
      TNET,"TriNet Group, Inc. Common Stock"
      TNH,"Terra Nitrogen Company, L.P. Common Units"
      TNK,Teekay Tankers Ltd.
      TNP,Tsakos Energy Navigation Ltd Common Shares
      TNP$B,Tsakos Energy Navigation Ltd Red Perp Pfd Ser B% (Bermuda)
      TNP$C,Tsakos Energy Navigation Ltd 8.875% Series C Preferred Cumulative Redeemable Perpetual Preferred Shares
      TOL,Toll Brothers Inc. Common Stock
      TOO,Teekay Offshore Partners L.P. Common Units representing Limited Partner Interests
      TOO$A,Teekay Offshore Partners L.P. 7.25% Series A Redeemable Preferred Units
      TOT,Total S.A.
      TOWR,"Tower International, Inc. Common stock"
      TPC,Tutor Perini Corporation Common Stock
      TPH,"Tri Pointe Homes, Inc. Common Stock"
      TPL,Texas Pacific Land Trust Common Stock
      TPRE,Third Point Reinsurance Ltd. Common Shares
      TPUB,Tribune Publishing Company Common Stock
      TPVG,TriplePoint Venture Growth BDC Corp. Common Stock
      TPX,"Tempur Sealy International, Inc. Common Stock"
      TPZ,"Tortoise Power and Energy Infrastructure Fund, Inc Common Stock"
      TR,"Tootsie Roll Industries, Inc. Common Stock"
      TRC,Tejon Ranch Co Common Stock
      TRCO,Tribune Media Company Class A Common Stock
      TREC,Trecora Resources Common Stock
      TREX,"Trex Company, Inc. Common Stock"
      TRF,"Templeton Russia and East European Fund, Inc. Common Stock"
      TRGP,"Targa Resources, Inc. Common Stock"
      TRI,Thomson Reuters Corp Ordinary Shares
      TRK,"Speedway Motorsports, Inc. Common Stock"
      TRLA,"Trulia, Inc. Common Stock"
      TRMR,"Tremor Video, Inc. Common Stock"
      TRN,"Trinity Industries, Inc. Common Stock"
      TRNO,Terreno Realty Corporation Common Stock
      TRNO$A,Terreno Realty Corporation Preferred Shares Series A
      TROX,Tronox Limited Ordinary Shares Class A $0.01 par
      TRP,TransCanada Corporation Common Stock
      TRQ,Turquoise Hill Resources Ltd. Ordinary Shares
      TRR,"TRC Companies, Inc. Common Stock"
      TRUP,"Trupanion, Inc. Common Stock"
      TRV,"The Travelers Companies, Inc. Common Stock"
      TRW,TRW Automotive Holdings Corporation Common Stock
      TS,Tenaris S.A. American Depositary Shares
      TSE,Trinseo S.A. Ordinary Shares
      TSI,"TCW Strategic Income Fund, Inc. Common Stock"
      TSL,Trina Solar Limited Sponsored ADR (Cayman Islands)
      TSLF,THL Credit Senior Loan Fund Common Shares of Beneficial Interest
      TSLX,"TPG Specialty Lending, Inc. Common Stock"
      TSM,Taiwan Semiconductor Manufacturing Company Ltd.
      TSN,"Tyson Foods, Inc. Common Stock"
      TSNU,"Tyson Foods, Inc. Tangible Equity Unit 1 Prepaid Stock Purchase Contact & 1 Sr (Amortorizing NT)"
      TSO,Tesoro Corporation Common Stock
      TSQ,"Townsquare Media, Inc. Class A Common Stock"
      TSS,"Total System Services, Inc. Common Stock"
      TSU,TIM Participacoes S.A. American Depositary Shares (Each representing 5 Common Shares)
      TTC,Toro Company (The) Common Stock
      TTF,"Thai Fund, Inc. (The) Common Stock"
      TTI,"Tetra Technologies, Inc. Common Stock"
      TTM,Tata Motors Ltd Tata Motors Limited
      TTP,"Tortoise Pipeline & Energy Fund, Inc. Common Stock"
      TU,Telus Corporation Ordinary Shares
      TUMI,"Tumi Holdings, Inc. Common Stock"
      TUP,Tupperware Brands Corporation Common Stock
      TV,Grupo Televisa S.A. Common Stock
      TVC,Tennessee Valley Authority Common Stock
      TVE,Tennessee Valley Authority
      TVPT,Travelport Worldwide Limited Common Shares
      TW,Towers Watson & Co Common Stock Class A
      TWC,Time Warner Cable Inc Common Stock
      TWI,"Titan International, Inc. Common Stock"
      TWN,"Taiwan Fund, Inc. (The) Common Stock"
      TWO,Two Harbors Investment Corp
      TWTR,"Twitter, Inc. Common Stock"
      TWX,Time Warner Inc. New Common Stock
      TX,"Ternium S.A. Ternium S.A. American Depositary Shares (each representing ten shares, USD1.00 par value)"
      TXT,Textron Inc. Common Stock
      TXTR,Textura Corporation Common Stock
      TY,Tri Continental Corporation Common Stock
      TY$,Tri Continental Corporation Preferred Stock
      TYC,Tyco International plc (Ireland) Ordinary Share
      TYG,Tortoise Energy Infrastructure Corporation Common Stock
      TYG$B,Tortoise Energy Infrastructure Corporation Mandatory Red Pfd Ser B
      TYG$C,Tortoise Energy Infrastructure Corporation Series C Mandatory Redeemable Preferred Shares
      TYL,"Tyler Technologies, Inc. Common Stock"
      TZF,"Bear Stearns Depositor, Inc. Pfd Stk TRUCs Srs 2001"
      UA,"Under Armour, Inc. Class A Common Stock"
      UAL,United Continental Holdings
      UAM,Universal American Corporation New Common Stock
      UAN,"CVR Partners, LP Common Units representing Limited Partner Interests"
      UBA,Urstadt Biddle Properties Inc. Common Stock
      UBP,Urstadt Biddle Properties Inc. Common Stock
      UBP$F,Urstadt Biddle Properties Inc. Pfd Ser F
      UBP$G,Urstadt Biddle Properties Inc. Preferred Stock Series G 6.75%
      UBS,UBS Group AG Registered Ordinary Shares
      UBS$D,UBS AG Trust Preferred Securities
      UCP,"UCP, Inc. Class A Common Stock"
      UDR,"UDR, Inc. Common Stock"
      UE.V,Urban Edge Properties Common Shares of Beneficial Interest When Issued
      UFI,"Unifi, Inc. New Common Stock"
      UFS,Domtar Corporation (NEW) Common Stock
      UGI,UGI Corporation Common Stock
      UGP,Ultrapar Participacoes S.A. (New) American Depositary Shares (Each representing one Common Share)
      UHS,"Universal Health Services, Inc. Common Stock"
      UHT,Universal Health Realty Income Trust Common Stock
      UIL,UIL Holdings Corporation Common Stock
      UIS,Unisys Corporation New Common Stock
      UL,Unilever PLC Common Stock
      UMC,United Microelectronics Corporation (NEW) Common Stock
      UMH,"UMH Properties, Inc. Common Stock"
      UMH$A,"UMH Properties, Inc. 8.25% Series A Cumulative Redeemable Preferred Stock, Liquidation Preference $25 per share"
      UN,Unilever NV Common Stock
      UNF,Unifirst Corporation Common Stock
      UNH,UnitedHealth Group Incorporated Common Stock
      UNM,Unum Group Common Stock
      UNP,Union Pacific Corporation Common Stock
      UNT,Unit Corporation Common Stock
      UPL,Ultra Petroleum Corp. Common Stock
      UPS,"United Parcel Service, Inc. Common Stock"
      URI,"United Rentals, Inc. Common Stock"
      USA,Liberty All
      USAC,"USA Compression Partners, LP Common Units Representing Limited Partner Interests"
      USB,U.S. Bancorp Common Stock
      USB$A,"U.S. Bancorp Depositary Shares, Each representing a 1/100th interest in a share of Series A Non"
      USB$H,U.S. Bancorp Depositary Shares repstg 1/1000th Pfd Ser B
      USB$M,U.S. Bancorp Depositary Shares Representing 1/1000th Interest in a Shares Series F
      USB$N,US Bancorp Del DEPOSITARY SH S G
      USB$O,US Bancorp Del Dep Shs Repstg 1/1000th Perp Pfd Ser H
      USDP,USD Partners LP Common Units representing limited partner interest
      USG,USG Corporation Common Stock
      USM,United States Cellular Corporation Common Stock
      USNA,"USANA Health Sciences, Inc. Common Stock"
      USPH,"U.S. Physical Therapy, Inc. Common Stock"
      UTF,"Cohen & Steers Infrastructure Fund, Inc Common Stock"
      UTI,Universal Technical Institute Inc Common Stock
      UTL,UNITIL Corporation Common Stock
      UTX,United Technologies Corporation Common Stock
      UTX$A,United Technologies Corp Corp Unit
      UVE,UNIVERSAL INSURANCE HOLDINGS INC Common Stock
      UVV,Universal Corporation Common Stock
      UZA,United States Cellular Corporation 6.95% Senior Notes due 2060
      UZB,United States Cellular Corporation 7.25% Senior Notes due 2063
      V,Visa Inc.
      VAC,Marriot Vacations Worldwide Corporation Common Stock
      VAL,Valspar Corporation (The) Common Stock
      VALE,VALE S.A.  American Depositary Shares Each Representing one common share
      VALE.P,VALE S.A.
      VAR,"Varian Medical Systems, Inc. Common Stock"
      VBF,Invesco Bond Fund Common Stock
      VC,Visteon Corporation Common Stock
      VCO,Vina Concha Y Toro Common Stock
      VCRA,"Vocera Communications, Inc. Common Stock"
      VCV,Invesco California Value Municipal Income Trust Common Stock
      VEC,"Vectrus, Inc. Common Stock"
      VEEV,Veeva Systems Inc. Class A Common Stock
      VET,Vermilion Energy Inc. Common (Canada)
      VFC,V.F. Corporation Common Stock
      VG,Vonage Holdings Corp. Common Stock
      VGI,Virtus Global Multi
      VGM,Invesco Trust for Investment Grade Municipals Common Stock (DE)
      VGR,Vector Group Ltd. Common Stock
      VHI,"Valhi, Inc. Common Stock"
      VIPS,"Vipshop Holdings Limited American Depositary Shares, each representing two ordinary shares"
      VIV,"Telefonica Brasil, S.A. ADS"
      VJET,"voxeljet AG American Depositary Shares, each representing one"
      VKQ,Invesco Municipal Trust Common Stock
      VLO,Valero Energy Corporation Common Stock
      VLP,Valero Energy Partners LP Common Units representing limited partner interests
      VLRS,"Controladora Vuela Compania de Aviacion, S.A.B. de C.V. American Depositary Shares, each representing ten (10) Ordinary Participation Certificates"
      VLT,Invesco High Income Trust II
      VLY,Valley National Bancorp Common Stock
      VLY.W,Valley National Bancorp Warrants Expiring 11/14/2018
      VMC,Vulcan Materials Company (Holding Company) Common Stock
      VMEM,"Violin Memory, Inc. Common Stock"
      VMI,"Valmont Industries, Inc. Common Stock"
      VMO,Invesco Municipal Opportunity Trust Common Stock
      VMW,"Vmware, Inc. Common stock, Class A"
      VNCE,Vince Holding Corp. Common Stock
      VNO,Vornado Realty Trust Common Stock
      VNO$G,Vornado Realty Trust Preferred Series G
      VNO$I,Vornado Realty Trust Preferred Series I
      VNO$J,Vornado Realty Trust PFD CUMULATIVE RED SER J %
      VNO$K,Vornado Realty Trust Pfd S K
      VNO$L,Vornado Realty TrListingUtils; Inc. Common Stock"
      VSI,"Vitamin Shoppe, Inc Common Stock"
      VSLR,"Vivint Solar, Inc. Common Stock"
      VTA,Invesco Credit Opportunities Fund Common Shares of Beneficial Interest
      VTN,Invesco Trust for Investment Grade New York Municipals Common Stock
      VTR,"Ventas, Inc. Common Stock"
      VTRB,"Ventas Realty, Limited Partnership // Ventas Capital Corporation 5.45% Senior Notes due 2043"
      VTTI,VTTI Energy Partners LP Common Units representing limited partner interests
      VVC,Vectren Corporation Common Stock
      VVI,Viad Corp Common Stock
      VVR,Invesco Senior Income Trust Common Stock (DE)
      VZ,Verizon Communications Inc. Common Stock
      VZA,Verizon Communications Inc. 5.90% Notes due 2054
      W,Wayfair Inc. Class A Common Stock
      WAB,Westinghouse Air Brake Technologies Corporation Common Stock
      WAC,Walter Investment Management Corp. Common Stock
      WAGE,"WageWorks, Inc. Common Stock $0.001 par value"
      WAIR,"Wesco Aircraft Holdings, Inc. Common Stock"
      WAL,Western Alliance Bancorporation Common Stock (DE)
      WAT,Waters Corporation Common Stock
      WBAI,"500.com Limited American Depositary Shares, each representing 10 Class A shares"
      WBC,Wabco Holdings Inc. Common Stock
      WBK,Westpac Banking Corporation Common Stock
      WBS,Webster Financial Corporation Common Stock
      WBS$E,Webster Financial Corporation Dep Shs Repstg 1/1000th Perp Pfd Ser E
      WBS.W,"Webster Financial Corporation Warrant (expiring November 21, 2018)"
      WCC,"WESCO International, Inc. Common Stock"
      WCG,"Wellcare Health Plans, Inc. Common Stock"
      WCIC,"WCI Communities, Inc. Common Stock"
      WCN,"Waste Connections, Inc. Common Stock"
      WD,"Walker & Dunlop, Inc Common Stock"
      WDAY,"Workday, Inc. Common Stock"
      WDR,"Waddell & Reed Financial, Inc. Common Stock"
      WEA,Western Asset Bond Fund Share of Beneficial Interest
      WEC,Wisconsin Energy Corporation Common Stock
      WES,"Western Gas Partners, LP Limited Partner Interests"
      WEX,WEX Inc. common stock
      WF,Woori Bank American Depositary Shares (Each representing 3 shares of Common Stock)
      WFC,Wells Fargo & Company Common Stock
      WFC$J,Wells Fargo & Company Wells Fargo & Company 8.00% Non
      WFC$L,Wells Fargo & Company Wells Fargo & Company 7.50% Non
      WFC$N,Wells Fargo & Company Dep Shs Repstg 1/1000th Perp Pfd Cl A Ser N
      WFC$O,Wells Fargo & Company Depositary Shares Representing 1/1000th Perpetual Preferred Class A Series O
      WFC$P,Wells Fargo & Company Dep Shs Repstg 1/1000th Int Non Cum Perp Cl A Pfd (Ser P)
      WFC$Q,Wells Fargo & Company Depositary Shares Representing 1/1000th Interest Perpetual Preferred Class A Series Q Fixed to Floating
      WFC$R,Wells Fargo & Company Dep Shs Repstg 1/1000th Int Perp Pfd Cl A (Ser R Fixed To Flltg)
      WFC$T,Wells Fargo & Company New Depository Share Representing 1/1000th Perp. Preferred Class A Series T
      WFC.W,"Wells Fargo & Company Warrants expiring October 28, 2018"
      WFE$A,"Wells Fargo & Company Cumulative Perpetual Preferred Stock, Series A, Liquidation Preference $25 per share"
      WFT,Weatherford International plc (Ireland)
      WG,"Willbros Group, Inc. (DE) Common Stock"
      WGL,WGL Holdings IncCommon Stock
      WGO,"Winnebago Industries, Inc. Common Stock"
      WGP,"Western Gas Equity Partners, LP Common Units Representing Limited Partner Interests"
      WHG,Westwood Holdings Group Inc Common Stock
      WHR,Whirlpool Corporation Common Stock
      WHX,Whiting USA Trust I Whiting USA Trust I
      WHZ,Whiting USA Trust II Units of Beneficial Interest
      WIA,Western Asset/Claymore Inflation
      WIT,Wipro Limited Common Stock
      WIW,Western Asset/Claymore Inflation
      WK,Workiva Inc. Class A Common Stock
      WLH,Lyon William Homes Common Stock (Class A)
      WLK,Westlake Chemical Corporation Common Stock
      WLKP,Westlake Chemical Partners LP Common Units representing limited partner interests
      WLL,Whiting Petroleum Corporation Common Stock
      WLT,"Walter Energy, Inc. Common Stock"
      WM,"Waste Management, Inc. Common Stock"
      WMB,"Williams Companies, Inc. (The) Common Stock"
      WMC,Western Asset Mortgage Capital Corporation Common Stock
      WMK,"Weis Markets, Inc. Common Stock"
      WMLP,"Westmoreland Resource Partners, LP Common Units representing Limited Partner Interests"
      WMS,"Advanced Drainage Systems, Inc. Common Stock"
      WMT,Wal
      WNC,Wabash National Corporation Common Stock
      WNR,"Western Refining Inc. Western Refining, Inc. Common Stock"
      WNRL,"Western Refining Logistics, LP Common Units representing limited partner interests"
      WNS,WNS (Holdings) Limited Sponsored ADR (Jersey)
      WOR,"Worthington Industries, Inc. Common Stock"
      WPC,W.P. Carey Inc. REIT
      WPG,Washington Prime Group Inc. Common Stock
      WPP,Wausau Paper Corp. Common Stock
      WPT,"World Point Terminals, LP Common Units representing Limited Partner Interests"
      WPX,"WPX Energy, Inc. Common Stock"
      WPZ,Williams Partners L.P. Common Units
      WR,"Westar Energy, Inc. Common Stock"
      WRB,W.R. Berkley Corporation Common Stock
      WRB$B,W.R. Berkley Corporation 5.625% Subordinated Debentures due 2053
      WRE,Washington Real Estate Investment Trust Common Stock
      WRI,Weingarten Realty Investors Common Stock
      WRI$F,Weingarten Realty Investors Depository Shares Restg 1/100 Pfd Ser F
      WRT,Winthrop Realty Trust 7.75% Senior Notes due 2022
      WSH,Willis Group Holdings Public Limited (Ireland) Common Stock
      WSM,Williams
      WSO,"Watsco, Inc. Common Stock"
      WSO.B,"Watsco, Inc. Class B Common Stock"
      WSR,Whitestone REIT Common Shares
      WST,"West Pharmaceutical Services, Inc. Common Stock"
      WTI,"W&T Offshore, Inc. Common Stock"
      WTM,"White Mountains Insurance Group, Ltd. Common Stock"
      WTR,"Aqua America, Inc. Common Stock"
      WTS,"Watts Water Technologies, Inc. Class A Common Stock"
      WTW,Weight Watchers International Inc Weight Watchers International Inc
      WU,Western Union Company (The) Common Stock
      WUBA,"58.com Inc. American Depositary Shares, each representing 2 Class A Ordinary Shares"
      WWAV,Whitewave Foods Company (The) Common Stock
      WWE,"World Wrestling Entertainment, Inc. Class A Common Stock"
      WWW,"Wolverine World Wide, Inc. Common Stock"
      WX,WuXi PharmaTech (Cayman) Inc. American Depositary Shares
      WY,Weyerhaeuser Company Common Stock
      WY$A,Weyerhaeuser Company Pref Conv Ser A
      WYN,Wyndham Worldwide Corp Common  Stock
      X,United States Steel Corporation Common Stock
      XCO,"EXCO Resources, Inc. Exco Resources, Inc. Common Stock"
      XEC,Cimarex Energy Co Common Stock
      XEL,Xcel Energy Inc. Common Stock
      XIN,Xinyuan Real Estate Co Ltd American Depositary Shares
      XKE,Lehman ABS Corporation Corporate
      XL,XL Group plc
      XLS,Exelis Inc. Common Stock New
      XNY,"China Xiniya Fashion Limited American Depositary Shares, each representing four ordinary shares"
      XOM,Exxon Mobil Corporation Common Stock
      XON,Intrexon Corporation Common Stock
      XOXO,"XO Group, Inc. Common Stock"
      XPO,"XPO Logistics, Inc."
      XRM,"Xerium Technologies, Inc. New Common Stock"
      XRS,"TAL Education Group American Depositary Shares, each representing 2 Class A common shares"
      XRX,Xerox Corporation Common Stock
      XUE,"Xueda Education Group American Depositary Shares, each representing two Ordinary Shares, $0.0001 par value"
      XYL,Xylem Inc. Common Stock New
      Y,Alleghany Corporation Common Stock
      YDKN,Yadkin Financial Corporation Common Stock
      YELP,Yelp Inc. Class A Common Stock
      YGE,Yingli Green Energy Holding Company Limited ADR
      YOKU,"Youku Tudou Inc. American Depositary Shares, each representing 18 Class A ordinary shares."
      YPF,YPF Sociedad Anonima Common Stock
      YUM,"Yum! Brands, Inc."
      YUME,"YuMe, Inc. Common Stock"
      YZC,Yanzhou Coal Mining Company Limited Common Stock
      ZA,Zuoan Fashion Limited American Depositary Shares
      ZAYO,"Zayo Group Holdings, Inc. Common Stock"
      ZB$A,Zions Bancorporation Depositary Shares (Each representing 1/40th Interest in a Share of Series A Floating
      ZB$F,Zions Bancorporation Dep shs Repstg 1/40th Int Sh Ser F Fxd Rate Non Cum (Perp Pfd Stk)
      ZB$G,Zions Bancorporation Dep Shs Repstg 1/40th Perp Pfd Ser G
      ZB$H,Zions Bancorporation Dep Shs Repstg 1/40th Int Sh Ser H Perp Pfd Stk
      ZBK,Zions Bancorporation 6.95% Fixed
      ZEN,"Zendesk, Inc. Common Stock"
      ZEP,Zep Inc. Common Stock
      ZF,"Zweig Fund, Inc. (The) Common Stock"
      ZFC,ZAIS Financial Corp. Common Stock
      ZMH,"Zimmer Holdings, Inc. Common Stock"
      ZNH,China Southern Airlines Company Limited Common Stock
      ZOES,"Zoe's Kitchen, Inc. Common Stock"
      ZPIN,"Zhaopin Limited American Depositary Shares, each reprenting two Ordinary Shares"
      ZQK,"Quiksilver, Inc. Common Stock"
      ZTR,"Zweig Total Return Fund, Inc. (The) Common Stock"
      ZTS,Zoetis Inc. Class A Common Stock
      ZX,"China Zenix Auto International Limited American Depositary Shares, each representing four ordinary shares."`;
  

        let listings:Listing[] = [];

        let csvArr:string[] = csv.split('\n');

        csvArr.forEach(element => {

            let listingArr:string[] = element.split(",");
            listings.push({symbol: listingArr[0].trim(), companyName: listingArr[1]});
            
        });


        return listings;
    }

}
