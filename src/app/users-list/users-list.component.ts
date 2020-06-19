import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FirebaseService } from '../firebase.service';
import { Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material';

const ELEMENT_DATA: Element[] = [];

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})

export class UsersListComponent implements OnInit {

  displayedColumns: string[] = ['Id', 'Display Name', 'E-mail'];
  dataSource = ELEMENT_DATA;
  users: any;


  constructor(private as: AuthService, private fbs: FirebaseService, private db: AngularFirestore) { }

  ngOnInit() {
    this.fbs.getUsers().subscribe(data => {

      this.users = data.map(e => {
        return {
          id: e.payload.doc.id,
          displayName: e.payload.doc.data()['displayName'],
          email: e.payload.doc.data()['email'],
        };
      })
      console.table(this.users);

    });
  }
}

export interface Element {
  displayName: string;
  email: string;
}




