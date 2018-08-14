import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatListPage } from './chat-list';
import { DirectivesModule } from '../../directives/directives.module';
import { ComponentsModule } from '../../components/components.module';
@NgModule({
  declarations: [
    ChatListPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatListPage),DirectivesModule,ComponentsModule
  ],
})
export class ChatListPageModule {}
