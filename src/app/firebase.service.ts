import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private db: AngularFirestore) { }


  createStock(value)
  {
    return this.db.collection('stocks').add(value);
  }

  createArticle(value)
  {
    return this.db.collection('articles').add(value);
  }

  getStocks()
  {
    return this.db.collection('stocks').snapshotChanges();
  }

  getNews()
  {
    return this.db.collection('articles').snapshotChanges();
  }

  updateStock(id, stock)
  {
    return this.db.doc('stocks/' + id).update(stock);
  }

  getUser(id)
  {
    return this.db.doc('users/'+ id).snapshotChanges();
  }

  getUsers(){
    return this.db.collection('users').snapshotChanges();
  }

  updatePortfolio(userId:string, newPortfolio:any)
  {
    return this.db.doc('users/' + userId).update({portfolio: newPortfolio});
  }

  addStockNotification(notification: string){


    let messages = [];
    this.db.collection('chats').doc('globalChat').get().subscribe(doc => {
      messages = doc.data().messages;
      messages.push(
        {
          message: notification, 
          timestamp: Date.now(),
        });
        return this.db.doc('chats/globalChat').update({
          messages: messages,
          users: JSON.parse(localStorage.getItem('users')).map(item => item.email)
       });
    });
  }

}
