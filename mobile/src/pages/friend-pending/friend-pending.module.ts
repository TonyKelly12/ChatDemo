import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FriendPendingPage } from './friend-pending';
import { DirectivesModule } from './../../directives/directives.module';
import { ComponentsModule } from '../../components/components.module';
@NgModule({
  declarations: [
    FriendPendingPage,
  ],
  imports: [
    IonicPageModule.forChild(FriendPendingPage),DirectivesModule, ComponentsModule
  ],
})
export class FriendPendingPageModule {}
