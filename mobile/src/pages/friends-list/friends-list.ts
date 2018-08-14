import {Component, OnInit} from '@angular/core';
import {IonicPage, NavController, NavParams, ActionSheetController, PopoverController} from 'ionic-angular';
import {AngularFirestore} from 'angularfire2/firestore';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import {DataModelServiceService} from '../../providers/data-objects/data-objects';
import {User, Chat} from '../../interfaces'
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';



@IonicPage()
@Component({selector: 'page-friends-list', templateUrl: 'friends-list.html', providers: [AuthServiceProvider, DataModelServiceService]})
export class FriendsListPage implements OnInit {

  private friendsArray : any;
  friends : any
  userKey = 'ZaqYVsWT2sVAc70XJmhX'
  friendsRefTest;
  friendsList;
  userRef$;
  User: User
  currentUserID:string;
  currentUser;
  chatMatchArray:Chat[] = [];
  constructor(
    public navCtrl : NavController,
    public navParams : NavParams,
    private afStore : AngularFirestore,
    private auth : AuthServiceProvider,
    private ds: DataModelServiceService,
    public actionSheetCtrl: ActionSheetController,
    public popoverCtrl: PopoverController,
    private afAuth: AngularFireAuth
  ) {

    const uid = this.afAuth.authState.subscribe(user =>{
			if(user){
				this.currentUserID = user.uid
			}
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

  ngOnInit(){
    const userRef= this.afStore.collection('people').doc(this.currentUserID).ref
    userRef.get().then(user =>{
      this.currentUser = user.data();
      console.log('init', this.currentUser)
    })
  }

  ionViewDidLoad():void {
    console.log('ionViewDidLoad FriendsListPage');
    
    this.friendsArray = this
      .afStore
      .collection('people')
      .doc(this.currentUserID)
      .collection('friendsList');
    this.friends = this
      .friendsArray
      .valueChanges()
    
  }

  invitePage():void {
    this
      .navCtrl
      .setRoot("FriendInvitePage");
  }
  pendingRequestPage():void {
    this
      .navCtrl
      .setRoot("FriendPendingPage");
  };

  openMessage(friend):void {
    
    //GO through the users chats and get all that have the friend in it
    let userMessages = this
    .afStore
    .collection('people')
    .doc(this.currentUserID)
    .collection('chats', ref => ref.where('members.' + friend.uid, '==', true)).ref;
    userMessages.get().then(chatArrRef$=>{

       if (!chatArrRef$ || chatArrRef$ == undefined || chatArrRef$ == null || chatArrRef$.empty){
        //if chatlist is empty create a new chat
        console.log('chat snapp is null');
        this.createChat(friend);
      } else{
        
        //go through each chat that the selected friend is aprat of
        chatArrRef$ .forEach(chatRef =>{
          
          let chat = chatRef.data() as Chat
          let membersArray = Object.keys(chat.members)
          //loop through each memeber involved in the chat
          membersArray.forEach(member => {
            if(member === friend.uid && member != 'theBot'){
              this.chatMatchArray.push(chat)
            }
            
            if(member === 'theBot' && friend.uid === 'theBot')
            //TODO: don push to chat once bot can no longer be added to other chats
            //instead call bot chat here
            this.chatMatchArray.push(chat)
          });
        })
        console.log('chatMatch array',this.chatMatchArray)
       
      }
  
     this.callChat(this.chatMatchArray, friend)
    });
    
      
     
  }

  //FIXME: Messes up during group chat and creats infinite loop of new chats 
  callChat(chatMatchArray, friend): void {
    console.log('isEvery', chatMatchArray.every(this.onlyGroupChats))
    //if there are no chats in chatlist start new chat with friend
    if (chatMatchArray.length === 0 || chatMatchArray.length === undefined || chatMatchArray.length === null) {
      return this.createChat(friend);
    } else
    //if there are only groupchats start new single chat with friend
    if (chatMatchArray.every(this.onlyGroupChats)) {
      return this.createChat(friend);
    } else
    if(chatMatchArray.length === 1){
      chatMatchArray.forEach(chatRef => {
      const chat = chatRef as Chat
      const userIDS = Object.keys(chat.members)
       if (userIDS.length === 2) {
      return this.navCtrl.setRoot('ChatsPage', chat);
      }
    })
    }else 
    if(chatMatchArray.length >= 2){
      //loop through each chat in array with the selected friend in it
      const singleChat = chatMatchArray.find(chat =>{return this.hasSingleChat(chat, friend)});
      console.log('single', singleChat);
      if(singleChat === undefined || !singleChat || singleChat === null){
        return this.createChat(friend);
      }else{
        this.navCtrl.setRoot('ChatsPage', singleChat)
      }
    }
    this.chatMatchArray = [];
  }
   hasSingleChat(chatRef, friend){
    console.log('call chat', chatRef);
    const chat = chatRef as Chat
    //keys is an array of userIDs
    const userIDS = Object.keys(chat.members)
    
    if ( userIDS.length === 2 && userIDS.includes(this.currentUserID) && userIDS.includes(friend.uid) ) {
        console.log('chatMembers', chat);
        return chat
   }
  }

  onlyGroupChats(chat){
    const userKeys = Object.keys(chat.members)
    if(userKeys.length > 2)
    return chat
  }

  createChat(friend): void {
    
    
      
      const newChat = this.ds.newChat();
      newChat.members = {
        [this.currentUserID]: true,
        [friend.uid]: true
      }
      newChat.photoURL = {
        [this.currentUserID]: this.currentUser.photoURL,
        [friend.uid]: friend.photoURL
      }
      newChat.createdBy = this.currentUserID;
      this.afStore.collection('chats').add(newChat)
        .then((res) => {
          console.log('function response', res.id)
          newChat.chatID = res.id
          this.navCtrl.push('ChatsPage', newChat);
        })
        .catch(err => console.log(err));


    
     
  

  }

  
  presentPopover(ev, friend) {

    let popover = this.popoverCtrl.create('DeletePopoverPage',{
    
    })

    popover.present({
      ev: ev
    });

    popover.onDidDismiss(res => this.deleteFriend(res, friend))
  }

  presentBlockedPopover(ev, friend) {

    let popover = this.popoverCtrl.create('DeletePopoverPage',{
    
    })

    popover.present({
      ev: ev
    });

    popover.onDidDismiss(res => this.blockUser(res, friend))
  }

  deleteFriend(res, friend){
    if(res === true){
      this.afStore.collection('people').doc(this.currentUserID).collection('friendsList').doc(friend.uid).delete();
      this.afStore.collection('people').doc(friend.uid).collection('friendsList').doc(this.currentUserID).delete();
    }else{
      return
    }
  }

  blockUser(res, friend){
    if(res === true){
      console.log('Working on blocking method');
    }else{
      return
    }
  }

  presentActionSheet(friend) {
    console.log('action friend',friend)
    let actionSheet = this.actionSheetCtrl.create({
      title: friend.username,
      
      buttons: [
        {
          text: 'View Profile',
          
          handler: () => {
            console.log('Destructive clicked');
          }
        },
        {
          text: 'Delete Friend',
          role: 'destructive',
          handler: () => {
            console.log('Delete clicked');
            this.presentPopover(event,friend)
          }
        },
        {
          text: 'Block User',
          role: 'destructive',
          handler: () => {
            console.log('Block clicked');
            this.presentBlockedPopover(event,friend)
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }

}
