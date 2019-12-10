import { Component, OnInit } from '@angular/core';
import { FinancialApiService } from '../financial-api.service';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.css']
})
export class TestPageComponent implements OnInit {

  constructor(private fs: FinancialApiService) { }

  ngOnInit() {
  }

  getIntraDay()
  {
    return this.fs.getData();
  }

 

}
