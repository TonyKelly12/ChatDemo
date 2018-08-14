import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ToastOptions} from 'ionic-angular';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import {AngularFirestore} from 'angularfire2/firestore';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';


@IonicPage()
@Component({
  selector: 'page-friend-pending',
  templateUrl: 'friend-pending.html',
})
export class FriendPendingPage {
  pendingRequest;
  friendRequest;
  
  currentUserID;
  toastOptions: ToastOptions
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afStore : AngularFirestore,
    private auth: AuthServiceProvider,
    private toast: ToastController,
    private afAuth: AngularFireAuth
  ) {
    
    const testRef =this.afAuth.authState.subscribe(user =>{
			this.currentUserID = user.uid
			
		})
  }

  ionViewCanEnter():boolean {
   
    let authStatus = this
      .auth
      .getAuthStatus();
    if (authStatus === true) {
      return this
        .auth
        .getAuthStatus();
    } else {
      this
        .navCtrl
        .setRoot('LoginPage');
    }

  }

  ionViewDidLoad():void {
    console.log('ionViewDidLoad FriendsListPage');

    this.pendingRequest = this
      .afStore
      .collection('people')
      .doc(this.currentUserID)
      .collection('pendingFriendRequest');
    this.friendRequest = this
      .pendingRequest
      .valueChanges()
    console.log(this.currentUserID);
  }

  approve(firendRequestkey, sender):void{
    console.log('approved');
    console.log(firendRequestkey);
    console.log(sender)
    let approvedRequest ={
      key: firendRequestkey,
      senderID: sender.uid,
      approverID: this.currentUserID

    }
    this.toastOptions = {
      message:'You and ' + sender.first_name + ' ' + sender.last_name + " are now friends!",
      duration: 4000,
      position: 'center'
    }

    this.afStore.collection('people').doc(this.currentUserID).collection('approvedFriendRequestReceived').add(approvedRequest);
    this.afStore.collection('people').doc(sender.uid).collection('approvedFriendRequestSent').add(approvedRequest);
    
    this.afStore.collection('people').doc(this.currentUserID).collection('friendsList').doc(sender.uid).set(sender);
    this.showToast(this.toastOptions)
    this.deleteRequest(firendRequestkey)
  }

  deny(requestKey, sender):void{
    console.log('denied')
    this.toastOptions = {
      message:'You Denied ' + sender.first_name + ' ' + sender.last_name + " friend request",
      duration: 4000,
      position: 'center'
    }
    this.deleteRequest(requestKey);
    this.showToast(this.toastOptions);
  }

  deleteRequest(requestKey):void{
    this.afStore.collection('people').doc(this.currentUserID).collection('pendingFriendRequest').doc(requestKey).delete()

  }

  showToast(toastOptions):void{
    this.toast.create(toastOptions).present();
  }

  friendsListPage():void{
    this.navCtrl.setRoot('FriendsListPage')
  }
  invitePage():void {
    this.navCtrl.setRoot("FriendInvitePage");
  }

}
