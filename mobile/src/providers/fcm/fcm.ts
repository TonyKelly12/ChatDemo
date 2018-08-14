
import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { AngularFirestore } from 'angularfire2/firestore';


@Injectable()
export class FcmProvider {

	constructor(
		
		public afs: AngularFirestore,
		public firebaseNative: Firebase
	) {
		console.log('Hello FcmProvider Provider');

	}

	async getTokenAndroid(userID:string) {
		
		const token = await this.firebaseNative.getToken().then(() =>{
		return this.saveTokenToFirestore(token, userID);	
		});

		

	}

	async getTokenIOS(userID:string): Promise<void> {
		return this.firebaseNative.getToken().then((token) => {
			this.firebaseNative.grantPermission().then(()=>{
			return this.saveTokenToFirestore(token, userID);	
			});
			
		});
	}

	async getTokenCordova() {
		console.log('token cordova')
	}


	private saveTokenToFirestore(token: string, userID: string):Promise<void> {
		if (!token) return;
		console.log(token)

		const devicesRef = this.afs.collection('devices')
		//TODO: Add auth-provider and get logged in user id
		const docData = {
			token,
			userID: userID
		}
		return devicesRef.doc(token).set(docData).then(()=> console.log('success saving token'))
		.catch(err => console.log('error saving token',err))
	}

	listenToNotifications(){
		return this.firebaseNative.onNotificationOpen();
	}
}
