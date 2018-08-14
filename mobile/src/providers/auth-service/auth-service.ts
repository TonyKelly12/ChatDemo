import { HttpClient,} from '@angular/common/http';
import { Injectable, } from '@angular/core';
import firebase, { User, firestore } from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/switchMap';
import * as ix from '../../interfaces';
import { ProfileData, UserProfile } from '../profile-data/profile-data';
import { NativeStorage } from '@ionic-native/native-storage';
import SimpleCrypto from 'simple-crypto-js';
import { Action } from '../../../node_modules/rxjs/scheduler/Action';
import {GooglePlus} from '@ionic-native/google-plus';
 
// These have to be outside the class to become globals. and hence persisted beyond the life of the AuthServiceProvider.
// Without these here, then the information would be lost  shortly after we make it past the login screen.

@Injectable()
export class AuthServiceProvider {
	private isAuthenticated: boolean;
	user: Observable<User>;
	userID;
	deviceType:string;
	userKeyURL ='https://us-central1-socialdemo-b8fe1.cloudfunctions.net/getUserKey';
	crypto;
	cryptoKey:string;
	testuser;
	constructor(
		public http:HttpClient,
		public pltform:Platform,
		private afAuth: AngularFireAuth,
		private afstore: AngularFirestore,
		private profileData: ProfileData,
		public localStorage: NativeStorage, 
		public gplus: GooglePlus
	) {
		console.error('1');
		//Keeps track of the users auth status with firebase.
		//can be called from other pages by auth.user
		this.user = this.afAuth.authState
			.switchMap(user => {
				console.log(user);
				if (user) {
					//this.userID = user.uid
					
					return this.afstore.doc<ix.User>('people/${user.uid}').valueChanges()
				} else {
					return Observable.of(null)
				}
			});

			this.userID = this.afAuth.authState.switchMap(user =>{
				if(user){
					return user.uid
				}
			});

			//used for online status
			// this.afAuth.authState.do(user =>{
			// 	if(user){
			// 		this.upDateConnectionStatus();
			// 	}
			// }).subscribe();

		console.error('2');
		//used for the page router gaurds. sets auth status if user is logged in
		this.afAuth.authState.subscribe(user => {
			if (user && user.email && user.uid) {
				console.log('Logged in successfully');
				
				return this.isAuthenticated = true;
			} else {
				return this.isAuthenticated = false
			}
		});	
	};

	//helper to perform the update in firebase
	private updateStatus(status:string){
		if(!this.userID) return 
		this.afstore.collection('people').doc(this.userID).update({status:status})
	}
	//makes a random key
	public static makeKey(): string {
		let key = "";
		const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (let i = 0; i < 16; i++)
			key += possible.charAt(Math.floor(Math.random() * possible.length));

		return key;
	}

	/**
	 * Returns users seceret key to dycrypt userToken in local storage
	 */	
	public  getUserKey() {
		//FIXME: Get key from firebase
		// let propHeader = new HttpHeaders();
		// propHeader.append("Content-Type", "application/json");	
		// const url = 'https://us-central1-socialdemo-b8fe1.cloudfunctions.net/getUserKey'
		// await this.http.get(url,{headers:propHeader}).map(this.extractData)
		return 'Uua9HhsHDrJTAu3SlLcX';
		  
	  }
	//returns http data as a object 
	  private extractData(data){
		//console.log(data);
		return data || {}
	  }

	

	/**
	 * returns current user as snapshot changes. 
	 * Can be subscribed to get doc key when not saved as uid.
	*/
	public getUserData(){
		//TODO: LESSON** THis is how to convert Promise<string> to a string
		const currentUserIDRef$ = this.getUserID()
		const currentUserID = currentUserIDRef$.toString()
		return this.afstore.collection('people').doc(currentUserID).snapshotChanges() 
		  	
	}

	
	/** 
	 * dycrypts userToken from local storage and returns as string.
	 * Because one local storage returns string and on returns Promise<string> 
	 	function must return any
	**/
	public getUserID():string{
		//FIXME: Crypoto May not work in native debug or delete later

			//gets userID from storage based on platform
			//const secret = this.getUserKey()
			//this.crypto = new SimpleCrypto(secret);
			const plt:string = this.getPlatform()
			if(plt === 'web'){
				const userToken = this.getUserIDBrowser();
				return userToken
			//	const currentUserID = this.crypto.decrypt(userToken);
			//	console.log('id Dycrypted',currentUserID);
			//	return currentUserID;	
			}else{
				this.getUserIDNative().then(userID =>{
					console.log('get userId', userID)
					return userID
				})
				//const currentUserID = this.crypto.decrypt(userToken);
				//console.log('id Dycrypted',currentUserID);
				
			};
	};

	/**Returns auth status as true or false for page auth guards
	 */
	public getAuthStatus(): boolean {
		console.log(this.isAuthenticated);
		return this.isAuthenticated;
	}

	/**checks platform and returns as string 
	 * example: 'ios'
	*/
	public getPlatform():string{
		if (this.pltform.is('ios')) {
			return 'ios';
		}else if(this.pltform.is('android')) {
			return 'android';
		}else if(this.pltform.is('cordova')) {
			return 'cordova';
		}else{
			return 'web';
		}
		
	}
		/**Gets user token saved to browser local storage */
	 public getUserIDBrowser():string{
		this.deviceType = this.getPlatform();
		if(this.deviceType === 'web'){
			const userToken =  window.localStorage.getItem('userToken');
			return userToken;
		}else{
			return
		}
	}
		/** gets user token from native device storage */
	async getUserIDNative():Promise<string>{

		//TODO: LESSON** Another way to convert promise sting to string.
		//FIXME:  this may not be correct if not use example in getUserData()
			//  let userToken:string;
			//  let token:Promise<any>;
			// return  token =  this.localStorage.getItem('USER').then(user =>{
			// 	return userToken = user
			// })
			const uid = this.afAuth.authState.switchMap(user =>{
				if(user){
					return user.uid
				}
				
			})

			const uidRef$ = uid.toPromise()
			return uidRef$.then(user=>{
				const userID = user
				return userID
				})	
	}
		/**updates user Document in firestore */ 
	public updateUser(user: ix.User, data:any){
		console.log(user)
		console.log(this.userID)
		return this.afstore.doc('people/' + user.uid).update(data);
	}

	/**Registers user for app */
	public doRegister(value: ix.newUser): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			firebase.auth().createUserWithEmailAndPassword(value.email, value.password)	
			.then(res => {
				const uidRes = res.uid;
				//FIXME: Crypoto May not work for native debug or delete later
				
				this.deviceType = this.getPlatform();
				console.error('platform', this.deviceType);
				//encrypts uid before storing in local storage.
				//const secret = this.getUserKey();
				//this.crypto = new SimpleCrypto(secret);
				//const userToken = this.crypto.encrypt(uidRes);
				//stores token in local storage based off platform
				//console.log(userToken)
				if(this.deviceType === 'web'){
					window.localStorage.setItem('userToken',uidRes)
				}else{
					this.localStorage.setItem('USER', { userToken: uidRes });
					this.isAuthenticated = true;
					resolve(res);
				}
				
			}, err => reject(err)).then((res)=>{
				const thhat = res;
			})
		})
	}

	/**
	 * logs user in using firestore auth 
	 */
	public doLogin(value: ix.newUser): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
				.then(() => {
					console.log('Logging in');
					firebase.auth().signInWithEmailAndPassword(value.email, value.password)
						.then(res => {
							const uidRes = res.uid;
							console.error(res.uid)
							this.userID = res.uid
							//this.isAuthenticated = true;
							//const secret = this.getUserKey();
							//this.crypto = new SimpleCrypto(secret);
							//encrypts uid before storing in local storage.
							//const userToken = this.crypto.encrypt(uidRes);
							this.deviceType = this.getPlatform();
							console.error('platform', this.deviceType);
							//stores token in local storage based off platform
							//console.log(userToken)
							// if (this.deviceType === 'web') {
							//  	 window.localStorage.setItem('userToken', uidRes)
							//  } 
							
							//  this.localStorage.setItem('USER', {userToken: '1234'}).then(()=>{
							// 	console.log('user saved to local!')
								
							// })
							// 	.catch(err => console.log(err));
								
							
					
						}, err => reject(err))
				});
		});
	}

	public async nativeGoogleLogin(): Promise<void> {
		try{
			const googleUser = await this.gplus.login({
				//FIXME: REMOVE KEY BEFORE SUBMITTING TO PUBLIC REPO!!
				'webClientId': '557118430343-0vfmf920aell6rk0pscfpcoco6vk2nie.apps.googleusercontent.com',
				'offline': true,
				'scopes': 'profile email'
			})
			 return await this.afAuth.auth.signInWithCredential(
				 firebase.auth.GoogleAuthProvider.credential(googleUser.idToken)
			 )

		}catch(err){
			console.error('Native Login Error',err)

		}
	}

	public async webGoogleLogin(): Promise<void>{
		try{
			const provider = new firebase.auth.GoogleAuthProvider();
			const credential = await this.afAuth.auth.signInWithPopup(provider);
		}catch(err){
			console.error('web login error', err)
		}
	}


	/**
	 * logs user out
	 */
	public doLogout(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.deviceType = this.getPlatform();
			if (firebase.auth().currentUser) {
				this.afAuth.auth.signOut()
				this.isAuthenticated = false;
				if (this.deviceType === 'cordova'){
					this.gplus.logout();
				}
				if(this.deviceType === 'web'){
					window.localStorage.clear()
				}else{
				this.localStorage.remove('USER')	
				}
				
				resolve();
			}
			else {
				reject();
			}
		});
	}
	
	/**
	 * gets userProfile Data for profile page
	 * @param user 
	 */
	public getProfileData(user: firebase.User): Observable<UserProfile> {
		return this.profileData.getProfileData(user).map(profile => {
			return profile;
		});
	}


	// Abilities and Roles // 

	
	public canRead(user: ix.User): boolean{
		const allowed  = ['user', 'pro', 'staff', 'admin']
		return this.checkRoleAuth(user, allowed);
	}

	public canEdit(user: ix.User): boolean{
		const allowed  = ['pro', 'staff', 'admin']
		return this.checkRoleAuth(user, allowed);
	}

	public canDelete(user: ix.User): boolean{
		const allowed  = ['staff', 'admin']
		return this.checkRoleAuth(user, allowed);
	}
		/**
		 * Checks to see if the user has matching role
		 * @param user 
		 * @param allowedRoles 
		 */
	private checkRoleAuth(user: ix.User, allowedRoles: string[]):boolean{
		if(!user || !user.roles) return false
		for (const role of allowedRoles){
			if (user.roles[role]){
				return true
			}
		}
		return false
	}

	
}
