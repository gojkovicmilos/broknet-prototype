import { StockData } from './stock-data';

export class Stock
{
    symbol:string;
    open:number;
    high:number;
    low:number;
    price:number;
    volume:number;
    latestDay:string;
    prevClose:number;
    change:number;
    changePercent:string;
    daily:StockData[];
    weekly:StockData[];
    monthly:StockData[];

}