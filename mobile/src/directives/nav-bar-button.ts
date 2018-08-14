import { Directive } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AppGlobals } from '../providers/app-globals/app-globals';

@Directive({
  selector: '[nav-bar-button]',
  host: {
      '(click)': 'handleNavBtn($event.currentTarget.id)'
  }
})

export class NavBarButton {
  constructor(public navCtrl: NavController, public navParams: NavParams, private _global: AppGlobals) {}

  handleNavBtn(navBtnID) {
      switch (navBtnID) {
        case 'chatNavBtn':
          this.navCtrl.push('ChatListPage');
          break;
        case 'avatarNavBtn':
          this.navCtrl.push('Profile', {profileID: this._global.myPersonProperties.personID});
          break;
      }
  }
}
