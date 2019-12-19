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

  updatePortfolio(userId:string, newPortfolio:any)
  {
    return this.db.doc('users/' + userId).update({portfolio: newPortfolio});
  }
}
