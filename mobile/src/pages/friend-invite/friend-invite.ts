import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ToastOptions, LoadingController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { AngularFirestore} from 'angularfire2/firestore';
import { Observable } from '../../../node_modules/rxjs';
import { firestore } from '../../../node_modules/firebase';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';

@IonicPage()
@Component({
	selector: 'page-friend-invite',
	templateUrl: 'friend-invite.html',
	providers: [AuthServiceProvider]
})
export class FriendInvitePage {
	currentUser:firestore.DocumentData;
	currentUserID;
	User;
	inviteArray;
	invitesList = [];
	sender;
	friendsArray
	displayInvites = [];
	friendMatchArray;
	requestArray;
	isLoading: false
	toastOptions: ToastOptions

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public loading: LoadingController,
		public auth: AuthServiceProvider,
		private afStore: AngularFirestore,
		private toast: ToastController,
		private afAuth: AngularFireAuth
	) {
		this.presentLoading()
		const testRef = this.afAuth.authState.subscribe(user => {
			this.currentUserID = user.uid
			this.currentUser = this.afStore.collection('people').doc(this.currentUserID).valueChanges()


			let friendMatchers = [];
			let requestMatchers = [];
			let friendFiltered = [];
			let userFiltered = [];
			this.friendsArray = this
				.afStore
				.collection('people')
				.doc(this.currentUserID)
				.collection('friendsList').snapshotChanges().subscribe(async friendRef => {
					//for each object get its data
					await friendRef.forEach(fl => {
						let friend = fl.payload.doc.data();
						friendMatchers.push(friend);
					});
				});

			this.requestArray = this
				.afStore
				.collection('people')
				.doc(this.currentUserID)
				.collection('friendRequestSent').snapshotChanges().subscribe(async reqRef => {
					//for each object get its data
					await reqRef.forEach(rq => {
						let request = rq.payload.doc.data();
						requestMatchers.push(request);
					});
				});


			this.inviteArray = this.afStore.collection('people').snapshotChanges().subscribe(async inviteRef => {
				await inviteRef.forEach(invRef => {
					let invite = invRef.payload.doc.data();
					this.invitesList.push(invite);

				})
				//since function is called from filter it looses scope of this.currentUserID
				// so need to pass this.currentUserID into filterby user to test.
				userFiltered = this.invitesList.filter(invite => filterByUser(invite, this.currentUserID));
				friendFiltered = userFiltered.filter(filterByFriend);
				this.displayInvites = friendFiltered.filter(filterByRequest);
			});

			function filterByUser(invite, tester): boolean {
				if (invite.uid === tester) {
					return false;
				} else {
					return true;
				}
			}

			function filterByFriend(invite): boolean {
				const testArray = friendMatchers;
				function matchFriend(invite, test) {
					console.log(invite, test)
					if (invite === test) {
						console.log('match true')
						return false
					} else {
						console.log('match false')
						return true
					}
				}
				const resultArray = testArray.map(test => {
					let result = matchFriend(invite.uid, test.uid)
					console.log(result)
					return result
				});
				const i = resultArray.length
				console.log(resultArray)
				if (resultArray.includes(false)) {
					return false;
				} else {
					return true;
				}
			}

			function filterByRequest(invite): boolean {
				const testArray = requestMatchers;
				function matchFriend(request, test) {
					console.log(request, test)
					if (request === test) {
						console.log('match true')
						return false
					} else {
						console.log('match false')
						return true
					}
				}
				const resultArray = testArray.map(test => {
					let result = matchFriend(invite.uid, test.sentTo)
					console.log(result)
					return result
				});
				const i = resultArray.length
				console.log(resultArray)
				if (resultArray.includes(false)) {
					return false;
				} else {
					return true;
				}
			}
		})

	}

	presentLoading():void {
		const loader = this.loading.create({
			content: "Please wait...",
			duration: 2500,
			spinner: 'bubbles'
		});
		loader.present();
	}

	ionViewCanEnter():boolean {
		let authStatus = this.auth.getAuthStatus();
		if (authStatus === true) {
			return this.auth.getAuthStatus();
		} else {
			this.navCtrl.setRoot('LoginPage');
		}

	}

	inviteUser(user):void {
		let sentBy;
		const friendRequestKey = AuthServiceProvider.makeKey();
		const senderRef = this.afStore.collection('people').doc(this.currentUserID);
		this.sender = senderRef.valueChanges().subscribe(sender => {
			console.log(sender)
			sentBy = sender
			let friendRequest = {
				message: "you have a friend Request From: " + sentBy.first_name + " " + sentBy.last_name,
				sender: sentBy,
				key: friendRequestKey,
				sentTo: user.uid
			}
			this.toastOptions = {
				message: 'Friend Request to ' + user.first_name + ' ' + user.last_name + " has been sent!",
				duration: 4000,
				position: 'center'
			}
			this.afStore.collection('people').doc(user.uid).collection('pendingFriendRequest').doc(friendRequest.key).set(friendRequest);
			this.afStore.collection('people').doc(this.currentUserID).collection('friendRequestSent').doc(friendRequest.key).set(friendRequest);
			this.showToast(this.toastOptions)
			this.navCtrl.setRoot('FriendsListPage');
		})
	}

	showToast(toastOptions):void {
		this.toast.create(toastOptions).present();
	}

	toFriendsList():void {
		this
			.navCtrl
			.setRoot("FriendsListPage");
	}
	pendingRequestPage():void {
		this
			.navCtrl
			.setRoot("FriendPendingPage");
	};
}
