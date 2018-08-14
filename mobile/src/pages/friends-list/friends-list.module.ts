import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FriendsListPage } from './friends-list';
import { DirectivesModule } from './../../directives/directives.module';
import { ComponentsModule } from '../../components/components.module';
@NgModule({
  declarations: [FriendsListPage],
  imports: [IonicPageModule.forChild(FriendsListPage), DirectivesModule, ComponentsModule],
  exports: [FriendsListPage]
})
export class FriendsListPageModule {}
