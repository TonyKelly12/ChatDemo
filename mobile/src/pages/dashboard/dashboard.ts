import { Component } from '@angular/core';
import { NavController, Platform, IonicPage } from 'ionic-angular';
import { PersonsApiProvider } from '../../providers/persons-api/persons-api';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { ToastController } from 'ionic-angular';
import { tap } from 'rxjs/operators';
import { AlertController } from 'ionic-angular';
import { FcmProvider } from '../../providers/fcm/fcm';
import { HealthData } from '../../../node_modules/@ionic-native/health';
import { NativeStorage } from '@ionic-native/native-storage';
import {AngularFirestore} from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
	templateUrl: 'dashboard.html',
	providers: [PersonsApiProvider, AuthServiceProvider]
})
export class Dashboard {
	public crypto;
	public currentUserID:string;
	public stepData: HealthData[];
	public currentUser;
	public userData;
	public userRef;
	userIDRef$
	idTest;
	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public personsApi: PersonsApiProvider,
		private auth: AuthServiceProvider,
		public fcm: FcmProvider,
		public toastCtrl: ToastController,
		public alertCtrl: AlertController,
		public afStore: AngularFirestore,
		public localStorage: NativeStorage,
		private afAuth: AngularFireAuth
	) {
		
		const uid = this.afAuth.authState.subscribe(user =>{
			if(user){
				this.currentUserID = user.uid
				this.currentUser = this.afStore.collection('people').doc(this.currentUserID).valueChanges()
				
			}
			
		});

		
			// this.currentUserID = this.auth.getUserID()
			// console.error('userID', this.currentUserID)
			// this.currentUser = this.afStore.collection('people').doc(this.currentUserID).valueChanges()
		
		
	}

	/**
	 * Fired before entering into a view, allows you to control whether the view can be accessed
	 *  or not (returning true or false).
	 * @return True if we are authorized to enter this view.
	 */
	public ionViewCanEnter(): boolean {
		const authStatus = this.auth.getAuthStatus();
		if (authStatus === true) {
		} else {
			this.navCtrl.setRoot('LoginPage');
		}
		return authStatus;
	}

	/**
	 * This method is part of the ionic life cycle events. Fired only when a view is stored in memory.
	 *  This event is NOT fired on entering a view that is already cached. It’s a nice place for init
	 *  related tasks.
	 *  @see https://blog.ionicframework.com/navigating-lifecycle-events/
	 */
	public ionViewDidLoad(): void {
	
		//if user data is needed it must be done witin the subscription//
		
			
				
				console.log('switch', this.currentUserID)
				//***BELOW GETS LOGED IN USER CREDENTIALS */
			//this.fcm.getToken();
			//**Code for push notifications */
			if (this.platform.is('ios')) {
				console.error('ios');
				this.fcm.getTokenIOS(this.currentUserID);
			}
			if (this.platform.is('android')) {
				console.error('android');
				this.fcm.getTokenAndroid(this.currentUserID);
			}
			if (this.platform.is('cordova')) {
				console.log('cordova');
				this.fcm.getTokenCordova();
			}
			this.fcm.listenToNotifications().pipe(
				tap(msg => {
					const toast = this.toastCtrl.create({
						message: msg.body,
						duration: 4000
					});
					toast.present();
				})
			).subscribe();	
		
	}
}
