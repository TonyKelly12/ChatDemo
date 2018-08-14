import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController, NavParams, IonicPage, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { ISubscription } from "rxjs/Subscription";
import { ImageCapture } from '../../classes/image-capture/image-capture';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { ProfileVisibility } from '../../providers/profile-data/profile-data';
import { finalize } from 'rxjs/operators';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';

const IN_TO_FT: number = 12;
const IN_TO_CM: number = 2.54;
const LB_TO_KG: number = 0.45359237;



@IonicPage()
@Component({
  templateUrl: 'profile.html',
  providers: [AuthServiceProvider]
})
export class Profile {
  
  currentUser;
  currentUserID;
  
  isMyProfile: boolean = false;
  editMode: boolean = false;
  submitAttempt: boolean = false;

  profilePage: FormGroup;
  subscription: ISubscription;

  ProfileVisibility = ProfileVisibility;

  profileForm = {
    username: '',
    userPhoto: '',
    shortBio: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    height: '',
    weight: '',
    profileVisibility: ProfileVisibility.friends
  };

  heightFt: string = '';
  heightIn: string = '';
  weightLbs: string = '';
  newImage: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder,
              public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController,
              public platform: Platform, public camera: Camera, public file: File, public sanitizer: DomSanitizer,
              private afs: AngularFirestore, private afStorage: AngularFireStorage, private auth: AuthServiceProvider, private afAuth: AngularFireAuth) {
    
                const testRef =this.afAuth.authState.subscribe(user =>{
                  this.currentUserID = user.uid
                  this.currentUser = this.afs.collection('people').doc(this.currentUserID).valueChanges()
                })
               

    // Get passed-in properties
    let profileID = (navParams.get('profileID')) ? navParams.get('profileID') : '';

    if (profileID) {
      // Is this my profile or someone else's?
      if (profileID == this.currentUserID) {
        this.isMyProfile = true;
        this.subscription = this.currentUser.subscribe(profileData => {
          this.loadProfileForm(profileData);
        });
      }
    }

    // Build the profile form
    this.profilePage = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required])],
      shortBio: ['', Validators.compose([Validators.required])],
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      birthDate: ['', Validators.compose([Validators.required])],
      heightFt: ['', Validators.compose([Validators.required, Validators.pattern('^[2-9]')])],
      heightIn: ['', Validators.compose([Validators.required, Validators.pattern('^[2-9]|1[0-2]?')])],
      weightLbs: ['', Validators.compose([Validators.required, Validators.pattern('^[1-9][0-9][0-9]?')])],
      profileVisibility: ['', Validators.compose([Validators.required])]
    });
  }

  ionViewCanEnter(){
    //console.log(this.auth.getAuthStatus())
    let authStatus = this.auth.getAuthStatus();
    if (authStatus === true) {
      return this.auth.getAuthStatus();
    } else {
      this.navCtrl.setRoot('LoginPage');
    }
  }

  ionViewDidLoad() {
   //**Gets logged in user creds */
   
   
  }

  ionViewCanLeave() {
    // No need to save data if viewing another's profile
    if (!this.isMyProfile) return true;

    if (this.editMode) {
      this.saveProfile();
      return true;
    }
  }

  // Load profile form
  loadProfileForm(profileData) {
    this.profileForm.username = profileData.username;
    this.profileForm.userPhoto = profileData.photoURL;
    this.profileForm.shortBio = profileData.short_bio;
    this.profileForm.firstName = profileData.first_name;
    this.profileForm.lastName = profileData.last_name;
    this.profileForm.birthDate = profileData.birth_date;
    this.profileForm.height = Number(profileData.height).toString();
    this.heightFt = (this.profileForm.height != '0') ?
                     Math.trunc(Number(this.profileForm.height) / IN_TO_CM / IN_TO_FT).toString() :
                     this.profileForm.height;
    this.heightIn = (this.profileForm.height != '0') ?
                     Math.trunc(Number(this.profileForm.height) / IN_TO_CM % IN_TO_FT).toString() :
                     this.profileForm.height;
    this.profileForm.weight = Number(profileData.weight).toString();
    this.weightLbs = (this.profileForm.weight != '0') ? (Number(this.profileForm.weight) / LB_TO_KG).toString() :
                                                        this.profileForm.weight;
    this.profileForm.profileVisibility = (profileData.profileVisibility) ? profileData.profileVisibility :
                                                                           ProfileVisibility.friends;
  }

  // Set 'Edit' mode from Edit button
  editProfile() {
    console.log(`Editing Profile Data.`);

    this.editMode = true;
  }

  setProfilePic() {
    if (!(this.editMode) || !(this.platform.is('cordova'))) return;

    // Build actionsheet for user to choose to take a picture or select one from their photo library
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [{
        text: `Load from photo library`,
        handler: () => {this.getProfilePicture(this.camera.PictureSourceType.PHOTOLIBRARY);}
      },{
        text: `Take a photo`,
        handler: () => {this.getProfilePicture(this.camera.PictureSourceType.CAMERA);}
      }, {
        text: `Cancel`,
        role: `cancel`
      }]
    });
    actionSheet.present();
  }

  getProfilePicture(cameraSourceType: number) {
    let imageCapture = new ImageCapture(this.camera, this.file);

    imageCapture.loadImage(cameraSourceType).then(image => {
      this.newImage = image;
    });
  }

  saveProfile() {
    this.submitAttempt = true;

    if (this.profilePage.valid) { // Input fields validate
      console.log(`Saving Profile Data.`);

      // Save profile data
      let personUpdate = {};
      Object.keys(this.profilePage.controls).forEach(key => {
        const value = this.profilePage.get(key).value;

        switch (key) {
          case 'username':
            personUpdate['username'] = value;
            break;

          case 'shortBio':
            personUpdate['short_bio'] = value;
            break;

          case 'firstName':
            personUpdate['first_name'] = value;
            break;

          case 'lastName':
            personUpdate['last_name'] = value;
            break;

          case 'birthDate':
            personUpdate['birth_date'] = value;
            break;

          case 'heightFt':
            let heightFt = Number(value) * IN_TO_FT * IN_TO_CM;
            personUpdate['height'] = (personUpdate['height']) ? personUpdate['height'] + heightFt : heightFt;
            break;
            
          case 'heightIn':
            let heightIn = Number(value) * IN_TO_CM;
            personUpdate['height'] = (personUpdate['height']) ? personUpdate['height'] + heightIn : heightIn;
            break;

          case 'weightLbs':
            personUpdate['weight'] = Number(value) * LB_TO_KG;
            break;

          case 'profileVisibility':
            personUpdate['profile_visibility'] = value;
            break;
        }
      });
      this.updatePerson(personUpdate);
  
      this.editMode = false;
      this.resetSubmitAttempt();
    } else {     // Input fields do not validate
        console.log(`Not Saving Profile Data.`);
    }
  }

  updatePerson(personData) {
    const peopleCollectionRef = this.afs.collection('people');
    const myPersonRef = peopleCollectionRef.doc(this.currentUserID);

    Object.keys(personData).forEach(key => {
      const fieldUpdate = {[key]: personData[key]};
      myPersonRef.update(fieldUpdate);
    });

    if (this.newImage) {
      const filePath = (`avatars/${this.currentUserID}.jpg`);
      const imageRef = this.afStorage.ref(filePath);
      const upload = imageRef.putString(this.newImage, 'data_url')

      upload.snapshotChanges().pipe(
        finalize(() => {
          imageRef.getDownloadURL().subscribe(downloadURL => {
            myPersonRef.update({ photoURL: downloadURL });
          })
        })
      )
      .subscribe();
    }
  }

  // Reset submitAttempt boolean
  resetSubmitAttempt() {
    this.submitAttempt = false;
  }

  showGymsPage() {
    this.navCtrl.push('GymsPage');
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
