import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FriendInvitePage } from './friend-invite';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
@NgModule({
  declarations: [
    FriendInvitePage,
  ],
  imports: [
    IonicPageModule.forChild(FriendInvitePage),ComponentsModule, DirectivesModule
  ],
})
export class FriendInvitePageModule {}
