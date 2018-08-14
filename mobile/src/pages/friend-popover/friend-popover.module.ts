import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FriendPopoverPage } from './friend-popover';

@NgModule({
  declarations: [
    FriendPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(FriendPopoverPage),
  ],
})
export class FriendPopoverPageModule {}
