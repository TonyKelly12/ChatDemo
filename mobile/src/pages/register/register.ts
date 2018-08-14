import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthServiceProvider } from '../../providers/auth-service/auth-service'
import {DataModelServiceService} from '../../providers/data-objects/data-objects';
import {SetError} from '../../providers/set-errors/set-errors';
import {Platform} from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
  providers: [AuthServiceProvider, DataModelServiceService, SetError]
})
export class RegisterPage implements OnInit {

  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  
  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public authService: AuthServiceProvider,
    
    private fb: FormBuilder,
    private ds: DataModelServiceService,
    public Error: SetError,
    public platform: Platform
  ) {
    
    
   }

   ngOnInit(){
    this.registerForm = this.fb.group({
      email: ['',[Validators.required, Validators.email]],
      password: ['', [
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25),
        Validators.required
        ]],
      
   });
   
   }

   get email() {return this.registerForm.get('email')};
   get password(){return this.registerForm.get('password')};
   


  //  tryFacebookLogin(){
  //    this.authService.doFacebookLogin()
  //    .then(res =>{
  //      this.navCtrl.setRoot('LoginPage');
  //    }, err => console.log(err)
  //    )
  //  }

  //  tryTwitterLogin(){
  //    this.authService.doTwitterLogin()
  //    .then(res =>{
  //     this.navCtrl.setRoot('LoginPage');
  //    }, err => console.log(err)
  //    )
  //  }

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

   tryRegister(){
     let newUser =this.ds.newUser();
     newUser.email = this.email.value
     newUser.password = this.password.value
     this.authService.doRegister(newUser)
     .then(res=> {
       console.log(res);
       this.errorMessage = "";
       this.successMessage = "Your account has been created";
     }, err => {
       console.log(err);
       this.errorMessage = err.message;
       this.successMessage = "";
     })
   }

 
   loginPage(){
     this.navCtrl.setRoot('LoginPage');
   }

  

}
