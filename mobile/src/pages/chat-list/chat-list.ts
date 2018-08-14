import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import {AngularFirestore} from 'angularfire2/firestore';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import { Observable } from '../../../node_modules/rxjs';
import { Firebase } from '../../../node_modules/@ionic-native/firebase';
import { firestore } from '../../../node_modules/firebase';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';


@IonicPage()
@Component({
  selector: 'page-chat-list',
  templateUrl: 'chat-list.html',
})
export class ChatListPage {
  chatArray;
  chats;
  messageArray;
  message;
  currentUser:firestore.DocumentData;
  currentUserID;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afStore : AngularFirestore, 
    private auth : AuthServiceProvider,
    public popoverCtrl: PopoverController,
    private afAuth: AngularFireAuth
  ) {
    const testRef =this.afAuth.authState.subscribe(user =>{
			this.currentUserID = user.uid
			this.currentUser = this.afStore.collection('people').doc(this.currentUserID).valueChanges()
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
    console.log('ionViewDidLoad ChatListPage');
      
   
      
    this.chatArray = this
      .afStore
      .collection('people')
      .doc(this.currentUserID)
      .collection('chats');
    this.chats = this
      .chatArray
      .valueChanges()
    console.log(this.currentUserID);
    
    this.messageArray = this
    .afStore
    .collection('people')
    .doc(this.currentUserID)
    .collection('chats')
    
  }

  chatPage(chat):void{
    console.log(chat)
    this.navCtrl.push('ChatsPage', chat);
  }

  presentPopover(ev, chat) {

    let popover = this.popoverCtrl.create('DeletePopoverPage',{
    
    })

    popover.present({
      ev: ev
    });

    popover.onDidDismiss(res => this.deleteChat(res, chat))
  }

  deleteChat(res, chat){
    if(res === true){
      this.afStore.collection('people').doc(this.currentUserID).collection('chats').doc(chat.chatID).delete();
    }else{
      return
    }
  }

}
