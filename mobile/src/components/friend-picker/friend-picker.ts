import { Component, EventEmitter, forwardRef, Output, Input, OnInit } from '@angular/core';
import { FriendsProvider } from "../../providers/friends/friends-service";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Events } from 'ionic-angular';
import { firestore, User } from '../../../node_modules/firebase';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';
import { AngularFirestore } from '../../../node_modules/angularfire2/firestore';
import { Chat } from '../../interfaces';
export const EMOJI_PICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FriendPickerComponent),
  multi: true
};
@Component({
  selector: 'friend-picker',
  templateUrl: 'friend-picker.html',
  
})
export class FriendPickerComponent implements OnInit {
 @Input()chatID
@Output() friendEvent = new EventEmitter();
  friendsArr = [];
  friendsArrRef$
  currentUserID;
  _content: string;
  _onChanged: Function;
  _onTouched: Function;
  chatMembers = [];
  invites = [];
  constructor(public friendsProvider: FriendsProvider, public events: Events, public afAuth: AngularFireAuth, public afStore: AngularFirestore) {
    
  }

ngOnInit(){
  const uid = this.afAuth.authState.subscribe(user => {
    if (user) {
      this.currentUserID = user.uid
      console.log('chatID',this.chatID)
      console.log('current user',this.currentUserID)
      
      
      const chatRef$ = this.afStore
      .collection('people')
      .doc(this.currentUserID)
      .collection('chats')
      .doc(this.chatID).valueChanges().subscribe(chat  =>{
        const currentChat = chat as Chat
        this.chatMembers = Object.keys(currentChat.members)
        this.friendsArrRef$ = this
          .afStore
          .collection('people')
          .doc(this.currentUserID)
          .collection('friendsList').valueChanges().subscribe(fr => {
            fr.forEach(friend => {
              const thisFriend = friend as User
              if(!this.chatMembers.includes(thisFriend.uid))
              this.friendsArr.push(friend)
            })
          })


      })

      
    }
  });
}

 sendFriend(friend):void{
   console.log(friend);
   return this.friendEvent.emit(friend);
 }
}
