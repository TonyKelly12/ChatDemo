import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, MenuController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocationTracker } from '../providers/location-tracker/location-tracker';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { PopoverController } from 'ionic-angular';

@Component({
	templateUrl: 'app.html'
})

export class MyApp {
	@ViewChild(Nav) nav: Nav;
	rootPage: string = 'LoginPage';
	pages: Array<{ title: string, component: any }>;
	providers: [AuthServiceProvider]
	constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
		locationTracker: LocationTracker, public menuCtrl: MenuController, public auth: AuthServiceProvider, private db: AngularFirestore, public alertCtrl: AlertController, 	public popoverCtrl: PopoverController) {
		platform.ready().then(() => {
			// Okay, so the platform is ready and our plugins are available.
			// Here you can do any higher level native things you might need.
			if (platform.is('cordova')) {
				statusBar.styleDefault();
				splashScreen.hide();
			}

			// Initialize background location tracker
			if (platform.is('ios') || platform.is('android')) {
				locationTracker.initialize();
			}
		});

		db.firestore.settings({ timestampsInSnapshots: true });
	}

	friendsList() {
		this.nav.setRoot('FriendsListPage');
		this.menuCtrl.close();
	}

	dashboard() {
		this.nav.setRoot('Dashboard');
		this.menuCtrl.close();
	}

	challenge() {
		this.nav.setRoot('CompetitionListPage');
		// this.nav.setRoot('TeamsPage');
		this.menuCtrl.close();
	}

	rankings() {
		this.nav.setRoot('RankingPage');
		this.menuCtrl.close();
	}

	showLogout() {
		let confirm = this.alertCtrl.create({
			message: 'Are you sure you want to logout?',
			buttons: [
				{
					text: 'No',
					handler: () => {
						console.log('No clicked');
					}
				},
				{
					text: 'Logout',
					handler: () => {
						console.log('Logout clicked');
						this.logout();
					}
				}
			]
		});
		confirm.present();
	}

	logout() {
		this.auth.doLogout();
		this.nav.setRoot('LoginPage');
		this.menuCtrl.close();
	}

	friendsPending() {
		this.nav.setRoot('FriendPendingPage');
		this.menuCtrl.close();
	}

	chatList() {
		this.nav.push('ChatListPage');
		this.menuCtrl.close();
	}

	reportPopover(myEvent) {
    let popover = this.popoverCtrl.create('ReportContentPage');
    popover.present({
      ev: myEvent
    });
  }

}
