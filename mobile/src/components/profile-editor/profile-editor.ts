import { Component, OnInit } from '@angular/core';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service'
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ix from '../../interfaces';
import {DataModelServiceService} from '../../providers/data-objects/data-objects';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';
import { Observable } from 'rx';
import { firestore, User } from '../../../node_modules/firebase';
@Component({
  selector: 'profile-editor',
  templateUrl: 'profile-editor.html'
})
export class ProfileEditorComponent implements OnInit {
  currentUser;
  currentUserID;
  text: string;
  infoForm: FormGroup
  constructor(public fb: FormBuilder, private ds: DataModelServiceService, private auth: AuthServiceProvider, public afStore:AngularFirestore, public afAuth:AngularFireAuth ) {
    
    const testRef =this.afAuth.authState.subscribe(user =>{
			this.currentUserID = user.uid
			
		})
    
   
  }

ngOnInit(){
 
  this.infoForm = this.fb.group({
      username:['',[Validators.required]],
      first_name:['',],
      last_name:[''],
      
   })
}

    get username(){return this.infoForm.get('username')};
    get first_name(){return this.infoForm.get('first_name')};
    get last_name(){return  this.infoForm.get('last_name')};


  setProfile(user: ix.User) {
   console.log('userid',this.currentUserID)
    
   const userRef$ = this.afStore.collection('people').doc(this.currentUserID).valueChanges()
      userRef$.subscribe(user=>{
        this.currentUser = user as User

        let initUser = this.ds.User();
        const updateUser = Object.assign({}, this.currentUser) as ix.User;
        updateUser.username = this.username.value;
        updateUser.first_name = this.first_name.value;
        updateUser.last_name = this.last_name.value;

        console.log('updateuser',updateUser);
        // updateUser.phone = this.phone.value;
        // updateUser.photoURL = this.photoURL.value;
        return this.auth.updateUser(updateUser, {
          username: updateUser.username,
          first_name: updateUser.first_name,
          last_name: updateUser.last_name,
        })
      })
  }

}
