import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { TestPageComponent } from './test-page/test-page.component';
import { NewsComponent } from './news/news.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailAddressComponent } from './verify-email-address/verify-email-address.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { UsersListComponent } from './users-list/users-list.component';


const routes: Routes = [
  {path: "", component: TestPageComponent},
  {path: "user", component: HomePageComponent},
  {path: "news", component: NewsComponent},
  {path: "login", component: LoginComponent},
  {path: "register", component: RegisterComponent},
  {path: "verify-email-address", component: VerifyEmailAddressComponent},
  {path: "forgot-password", component: ForgotPasswordComponent},
  {path: 'profile', component: MyProfileComponent},
  {path: 'users', component: UsersListComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
