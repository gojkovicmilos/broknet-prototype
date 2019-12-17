import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { TestPageComponent } from './test-page/test-page.component';
import { NewsComponent } from './news/news.component';


const routes: Routes = [
  {path: "", component: HomePageComponent},
  {path: "test", component: TestPageComponent},
  {path: "news", component: NewsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
