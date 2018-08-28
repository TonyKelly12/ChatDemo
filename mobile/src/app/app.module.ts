import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { Camera } from '@ionic-native/camera';
import { IonicStorageModule } from '@ionic/storage';
import { Health } from '@ionic-native/health';
import { HttpClientModule } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeStorage } from '@ionic-native/native-storage';
import { ImagePicker } from '@ionic-native/image-picker';
import { DatePicker } from '@ionic-native/date-picker';
import { AlertController } from 'ionic-angular';
import { File } from '@ionic-native/file';

// Main Component
import { MyApp } from './app.component';
// Providers
import { PersonsApiProvider } from '../providers/persons-api/persons-api';
import { FeedApiProvider } from '../providers/feed-api/feed-api';
import { PostsApiProvider } from '../providers/posts-api/posts-api';
import { AppGlobals } from '../providers/app-globals/app-globals';
import { LocationTracker } from '../providers/location-tracker/location-tracker';
import { GymsApiProvider } from '../providers/gyms-api/gyms-api';

import { ProfileData } from '../providers/profile-data/profile-data';

// Directives
import { DirectivesModule } from '../directives/directives.module';

// Firebase
import { Firebase } from '@ionic-native/firebase';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { DataModelServiceService } from '../providers/data-objects/data-objects';
import { SetError } from '../providers/set-errors/set-errors';
import { ErrorMessagesProvider } from '../providers/error-messages/error-messages';
import { FcmProvider } from '../providers/fcm/fcm';
import { FileStorageProvider } from '../providers/file-storage/file-storage';

import {FriendsProvider} from '../providers/friends/friends-service';
import {GooglePlus} from '@ionic-native/google-plus';

 //TODO: YOUR FIREBASE CONFIG GOES HERE
export const firebaseConfig = {
	apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};

// Pages
@NgModule({
	declarations: [
		MyApp
	],
	imports: [
		BrowserModule,
		IonicModule.forRoot(MyApp),
		HttpClientModule,
		IonicStorageModule.forRoot(),
		FormsModule,
		DirectivesModule,
		AngularFireModule.initializeApp(firebaseConfig),
		AngularFirestoreModule,
		AngularFireAuthModule,
		AngularFireStorageModule
	],
	// Pages
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp
	],
	// Providers
	providers: [
		StatusBar,
		SplashScreen,
		InAppBrowser,
		Camera,
		
		UniqueDeviceID,
		PersonsApiProvider,
		FeedApiProvider,
		PostsApiProvider,
		AppGlobals,
		LocationTracker,
		Geolocation,
		
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
		AuthServiceProvider,
		DataModelServiceService,
		SetError,
		ErrorMessagesProvider,
		FcmProvider,
		Firebase,
		NativeStorage,
		ImagePicker,
		DatePicker,
		AlertController,
		FileStorageProvider,
		
		ProfileData,
    FriendsProvider,
		File,
		GooglePlus
	]
})

export class AppModule { }
