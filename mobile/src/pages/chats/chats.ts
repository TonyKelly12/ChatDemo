import { Component,ViewChild, ElementRef, Input, Output, OnInit } from '@angular/core';
import { NavController, NavParams, IonicPage, Events, Content, PopoverController } from 'ionic-angular';
import { FeedApiProvider } from '../../providers/feed-api/feed-api';
import { PostsApiProvider } from '../../providers/posts-api/posts-api';
import { Feed } from '../../components/feed/feed';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import { User, Chat, Message } from '../../interfaces';
import * as moment from 'moment';
import { Observable } from '../../../node_modules/rxjs';
import { database } from '../../../node_modules/firebase';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");


@IonicPage()
@Component({
  selector: 'page-chats',
  templateUrl: 'chats.html',
  providers: [FeedApiProvider, PostsApiProvider, Feed, AuthServiceProvider]
})
export class ChatsPage implements OnInit  {
  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: ElementRef;
  //chatSession;
  chatID;
  editorMsg = ''
  avatars = [];
  chatRef$: AngularFirestoreDocument<Chat>
  currentChat = {} as Chat
  
  userRef$: AngularFirestoreDocument<User>
  messageArray;
  messages;
  membersRef =[];
  chatNames= [];
  chatMemRef$:string[] = []
  currentUser
  currentUserData;
  currentUserID;
  showFriendPicker = false;
  showEdit = false;
  UserDataRef$;
  chatSession:Chat;
  chatMembers;
  constructor(
      public navParams: NavParams, 
      public navCtrl: NavController, 
      private afStore : AngularFirestore, 
      private auth : AuthServiceProvider,
      public events: Events,
      public popoverCtrl: PopoverController,
      private afAuth: AngularFireAuth,
      public fb: FormBuilder    
  ) 
  {

    const uid = this.afAuth.authState.subscribe(user =>{
			if(user){
        this.currentUserID = user.uid
        const userRef= this.afStore.collection('people').doc(this.currentUserID).ref
        userRef.get().then(user =>{
          this.currentUser = user.data();
          console.log('init', this.currentUser)
        })
			}
    })
    
     //this.chatSession = this.navParams.data
    this.chatID = this.navParams.get('chatID');
    

    console.log('chatID',this.chatID);
    //Gets the chat and get each members username to display at top of chat//
    const chatRef$ = this.afStore.collection('chats').doc(this.chatID);
    chatRef$.valueChanges()
      .subscribe(chat => {
        const ctSession = chat as Chat
        this.avatars = Object.values(ctSession.photoURL)
        //every memebers uid in chat
        this.membersRef = Object.keys(ctSession.members)
      
        const memsort = this.membersRef.forEach(m => {
          const mRef = this.afStore.collection('people').doc(m).valueChanges();
            mRef.subscribe(memberRef => {
              const member = memberRef as User
              if(!this.chatMemRef$.includes(member.uid))
                this.chatNames.push(member);
                this.chatMemRef$.push(member.uid)   
          })
        });
      }); 
  }


  //checks if user is logged in and can access page
  ionViewCanEnter() : boolean {
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

  };

  ngOnInit(){
    // const userRef= this.afStore.collection('people').doc(this.currentUserID).ref
    // userRef.get().then(user =>{
    //   this.currentUser = user.data();
      
    // })
  console.log('init', this.currentUser)
  }

  ionViewDidLoad(): void {
    this.chatSession = this.navParams.data as Chat
    this.chatID = this.navParams.get('chatID')
    this.chatMembers = Observable.of(this.chatNames)
    console.log('current user', this.currentUser)
    this.messages = this.afStore.collection('people').doc(this.currentUserID)
    .collection('chats').doc(this.chatID)
    .collection('messages', ref => ref.orderBy('time','asc')).valueChanges();
    console.log('subChatID',this.chatID);
    console.log('subUserID',this.currentUserID);
  
  };

  showEditButton(){
    console.log('current user',this.currentUser)
    this.afStore.collection('people').doc(this.currentUserID).snapshotChanges().subscribe(user =>{
      const checkUser = user.payload.data() as User;
        if(this.auth.canEdit(checkUser)){
        this.showEdit = !this.showEdit;
        console.log('showEdit Ran', this.showEdit)
      }
    })  
  }


  addPost() {
    if (!this.editorMsg.trim()) return;
    console.log('view user1', this.editorMsg);
    //** Below has to be snapshotChanges. ValueChanges never end subscription causing freez//
    
      
       const membersArray = this.navParams.get('members');
      const relTime = moment().startOf('days').fromNow();
      const now = new Date();
      const timestamp = now.getTime()
      //console.log(chat);
      const sendMessage: Message = {
        messageID: '',
        message: this.editorMsg,
        photoURL: this.currentUser.photoURL,
        time: timestamp,
        fromUID: this.currentUserID,
        username: this.currentUser.username,
        relTime: relTime,
        chatID: this.chatID
      };

      console.log('after lastChat update');
      //TODO: NO Trigger
      return this.afStore.collection('people').doc(this.currentUserID).collection('chats').doc(this.chatID)
        .collection('messages').add(sendMessage)
    
        .then(res => {
          console.log('resp', res)
          this.editorMsg = '';
          if (!this.showFriendPicker) {
            this.focus();
          }
          this.resizeContent()
          console.log('after save res', res.id)
          let chatMessage = sendMessage
          chatMessage.messageID = res.id;
          console.log('after send', sendMessage)

          //updates the messageID for the user who sent the chat
          //TODO: no trigger
          this.afStore.collection('people').doc(chatMessage.fromUID).collection('chats').doc(this.chatID).collection('messages').doc(res.id)
            .update({ messageID: res.id })
            .then(() => {
              //TODO: Triggers Sync Message
              //sets the new message in the main chat node which will trigger cloud function to update members of chat
              this.afStore.collection('chats').doc(this.chatID).collection('messages').doc(res.id).set(chatMessage)
                .then(() => {
                  //TODO: Triggers Sync Chat
                  //updates the last message section which is displayed on chatlist
                  this.afStore.collection('chats').doc(this.chatID).update({ lastMessage: sendMessage })
                }).catch(err => console.error(err))
                .then(() => {
                  //TODO: triggers sync chat
                  //updates the message id in the lastMessage on the chat document
                  this.afStore.collection('chats').doc(this.chatID).update({ 'lastMessage.messageID': res.id })
               
                }).catch(err => console.log(err));
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

   

  }

  ionViewDidEnter():void{
      this.scrollToNewestPost();
  }

  scrollToNewestPost():void {
    this.content.scrollToBottom(0);  
  }

  resizeContent():void {
      this.content.resize();
      this.scrollToNewestPost();
  }

  onFocus():void {
    this.showFriendPicker = false;
    this.content.resize();
    this.scrollToBottom();
  }

  //shows friend picker to add user to chat
  switchFriendPicker():void {
    this.showFriendPicker = !this.showFriendPicker;
    if (!this.showFriendPicker) {
      this.focus();
    } else {
      this.setTextareaScroll();
    }
    this.content.resize();
    this.scrollToBottom();
  }

  //adds friend to chat
  async addToChat(friend) {
    const friendUID = friend.uid 
    let chatUpdate = this.chatSession 
    let members = this.chatSession.members
    let photos = this.chatSession.photoURL;
    const newMembers = await Object.assign({[friendUID]: true}, chatUpdate.members);
    const newPhotos = await Object.assign({[friendUID]: friend.photoURL}, chatUpdate.photoURL);
    chatUpdate.members = newMembers;
    chatUpdate.photoURL = newPhotos;
    console.log('members',members)
    console.log('photos',photos)
    console.log('chatUpdate', chatUpdate);
    setTimeout(() =>{this.saveChatUpdate(chatUpdate)}, 1000)
    this.showFriendPicker = !this.showFriendPicker;
   
    // updates the chat to add the new member. on next message sent the new user will get the text
    
  }
  
    scrollToBottom():void {
        setTimeout(() => {
          if (this.content.scrollToBottom) {
              this.content.scrollToBottom();
          }
        }, 400)
      }

      saveChatUpdate(chatUpdate: Chat):Promise<void>{
        console.log('saveChat',chatUpdate)
        return this.afStore.collection('chats').doc(this.chatID).set(chatUpdate, {merge:true})
      }

      private focus():void {
        if (this.messageInput && this.messageInput.nativeElement) {
          this.messageInput.nativeElement.focus();
        }
      }
    
      private setTextareaScroll():void {
        const textarea =this.messageInput.nativeElement;
        textarea.scrollTop = textarea.scrollHeight;
      }
    
  
}
