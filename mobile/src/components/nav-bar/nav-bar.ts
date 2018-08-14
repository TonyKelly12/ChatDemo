import { Component } from '@angular/core';
import { Nav } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import {User} from '../../interfaces';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';
import { AngularFirestore } from '../../../node_modules/angularfire2/firestore';
import { Observable } from 'rx';

@Component({
  selector: 'nav-bar',
  templateUrl: 'nav-bar.html'
})
export class NavBarComponent {
  currentUserID;
  text: string;
  photoURL: string;
  currentUser:User;
  constructor(private nav: Nav, private auth: AuthServiceProvider, private afAuth: AngularFireAuth, public afStore: AngularFirestore) {
    
    
    const testRef =this.afAuth.authState.subscribe(user =>{
      if (!user) {
        this.photoURL = "";
  
      }else{
        this.currentUserID = user.uid
        const currentUserRef$ = this.afStore.collection('people').doc(this.currentUserID).valueChanges()
        .subscribe(u =>{
          this.currentUser = u as User
           this.photoURL = this.currentUser.photoURL
        })
      }	
		})
  }

  viewMyProfile() {
    this.nav.setRoot('Profile', {profileID: this.currentUserID});
  }
}
