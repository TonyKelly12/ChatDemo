import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl} from '@angular/forms';
//import {ErrorMessages} from './ErrorMessages'
import {ErrorMessagesProvider} from '../error-messages/error-messages'



@Injectable()
export class SetError{
    userIDError:string;
    usernameError: string;
    firstNameError: string;
    lastNameError:string;
    weightError: string;
    heightError:string;
    favQuoteError: string;
    profileError: string;
    constructor(public errorMessage: ErrorMessagesProvider){}

setErrorMessage(c: AbstractControl) :void{
    if((c.touched || c.dirty)&& c.errors){
      const formLabel = c.parent.controls;
      const formName = Object.keys(formLabel).find(name => c === formLabel[name]) || null;
      console.log(formName);
      switch(formName){
      
        case 'userID':
        this.userIDError = '';
        let errorName;
        let e = Object.keys(c.errors).map(key => {
          if (key == 'required'){
            errorName = "userID_required"
          }
          if (key == 'minlength'){
            errorName = "userID_length"
          }
        });
          
          this.userIDError =  this.errorMessage.formValidation[errorName]
          console.log(this.userIDError)
        break;
        case 'firstname':
        this.firstNameError = '';
        e = Object.keys(c.errors).map(key => {
          if (key == 'required'){
            errorName = "first_name_required"
          }
          if (key == 'minlength'){
            errorName = "first_name_length"
          }
        });
          
          this.firstNameError = this.errorMessage.formValidation[errorName]
          console.log(this.firstNameError)

        break;
        case 'lastname':
        this.lastNameError = '';
        e = Object.keys(c.errors).map(key => {
          if (key == 'required'){
            errorName = "last_name_required"
          }
          if (key == 'minlength'){
            errorName = "last_name_length"
          }
        });
          
          this.lastNameError = this.errorMessage.formValidation[errorName]
          console.log(this.lastNameError)
        break;
        case 'username':
        this.usernameError = '';
        e = Object.keys(c.errors).map(key => {
         if (key == 'required'){
           errorName = "user_name_required"
         }
         if (key == 'minlength'){
           errorName = "user_name_length"
         }
       });
         
         this.usernameError = this.errorMessage.formValidation[errorName]
         console.log(this.usernameError)

       break;
        case 'weight_in_kg':
        this.weightError = '';
        e = Object.keys(c.errors).map(key => {
          if (key == 'required'){
            errorName = "weight_required"
          }
          if (key == 'minlength'){
            errorName = "weight_min"
          }
        });
          
          this.weightError = this.errorMessage.formValidation[errorName]

        break;
        case 'height_in_cm':
        this.heightError = '';
        e = Object.keys(c.errors).map(key => {
          if (key == 'required'){
            errorName = "height_required"
          }
          if (key == 'minlength'){
            errorName = "height_min"
          }
        });
          
          this.heightError = this.errorMessage.formValidation[errorName]

        break;
        case 'favoritequote':
        this.favQuoteError = '';
        e = Object.keys(c.errors).map(key => {
          if (key == 'minlength'){
            errorName = "favQuote_min"
          }
        });
          
          this.favQuoteError =  this.errorMessage.formValidation[errorName]

        break;
        case 'profilevisibility':
        this.profileError = '';
        e = Object.keys(c.errors).map(key => {
          if (key == 'required'){
            errorName = "favQuote_min"
          }
        });
          
          this.profileError = this.errorMessage.formValidation[errorName]

        break;
        default:
        console.log("unknown Error Below")
        console.log(c.errors)

    }
    } 
    if((c.touched || c.dirty)&& c.valid){
      this.userIDError = '';
      this.usernameError = '';
      this.firstNameError = '';
      this.lastNameError = '';
      this.weightError = '';
      this.heightError = '';
      this.favQuoteError = '';
      this.profileError = '';
    }
  }

}