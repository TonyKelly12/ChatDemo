import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import firebase from 'firebase/app';
import { NativeStorage } from '@ionic-native/native-storage';
import {Platform} from 'ionic-angular';

@IonicPage()
@Component({
	selector: 'page-login',
	templateUrl: 'login.html',
	providers: [AuthServiceProvider]
})
export class LoginPage {
	private static MS_TO_CLEAR_ERROR_MSG: number = 10_000;
	private loginForm: FormGroup;
	private errorMessage: string = '';
	private errorMessageTO: NodeJS.Timer;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public authService: AuthServiceProvider,
		public storage: NativeStorage,
		public fb: FormBuilder, 
		public platform: Platform
	) {
	}

	ngOnInit():void {
		this.createForm();
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				console.log('logged in', user);
				
				this.navCtrl.setRoot('Dashboard');
			}
		});

	}

	createForm():void {
		this.loginForm = this.fb.group({
			email: ['', Validators.required],
			password: ['', Validators.required]
		});
	}

	// tryFacebookLogin(){
	//   this.authService.doFacebookLogin()
	//   .then(res => {
	//     console.log(res);
	//     
	//     
	//     this.storage.setItem('_USER', {auth: User});
	//     this.navCtrl.setRoot('Dashboard');
	//   })
	// }

	// tryTwitterLogin(){
	//   this.authService.doTwitterLogin()
	//   .then(res => {
	//     console.log(res);
	//     const User = res;
	//     
	//     //this.storage.set('_USER', User);
	//     this.navCtrl.setRoot('Dashboard');
	//   })
	// }

	tryGoogleLogin(){
		if(this.platform.is('cordova')){
			this.authService.nativeGoogleLogin()
	  .then(res => {
	    console.log(res)
	    
	    //this.storage.set('_USER', User);
	    this.navCtrl.setRoot('Dashboard');
	  })
		}else{
			this.authService.webGoogleLogin();
		}
	  
	}

	private tryLogin(value):void {
		this.authService.doLogin(value)
			.then(res => {
				console.log(res);
				const User = res;
				
				
				this.navCtrl.setRoot('Dashboard');
			}, err => {
				this.setError(err.message);
			})
	}

	registerPage():void {
		this.navCtrl.setRoot('RegisterPage')
	}

	private setError(message: string): void {
		this.errorMessage = message;
		this.errorMessageTO = setTimeout(() => {
			this.errorMessage = ''
		}, LoginPage.MS_TO_CLEAR_ERROR_MSG);
	}
}
