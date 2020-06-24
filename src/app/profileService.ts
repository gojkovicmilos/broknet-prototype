
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  uri = 'http://localhost:4200/profile';
  // adminUri = 'http://localhost:8080/admin';
  reloadData: any;
  authKey: string;

  constructor(private http: HttpClient) { }

//   addStudent(firstname, lastname, cardnumber, password) {
//     const obj = {
//       firstName: firstname,
//       lastName: lastname,
//       cardNumber: cardnumber,
//       pass: password
//     };
//     console.log(obj);
//     this.http.post(`${this.uri}`, obj)
//         .subscribe(res => console.log('Done'));
//   }

  getUser() {
    return this
           .http
           .get(`${this.uri}`);
  }

  editUser(id) {
    return this
            .http
            .get(`${this.uri}/${id}`);
    }
    updateUser(email, displayName, photoURL, id) {

      const obj = {
          id:id,
          email: email,
          displayName: displayName,
          photoURL: photoURL
};
      this
        .http
        .put(`${this.uri}/update/${id}`, obj)
        .subscribe(res => console.log('Done'));
    }
}