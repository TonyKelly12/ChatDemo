import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-delete-popover',
  templateUrl: 'delete-popover.html',
})
export class DeletePopoverPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl : ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeletePopoverPage');
  }

  closePopover(res){
    return this.viewCtrl.dismiss(res)
  }
}
