import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatsPage } from './chats';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import {PipesModule} from '../../pipes/pipes.module'
@NgModule({
  declarations: [
    ChatsPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatsPage), ComponentsModule, DirectivesModule, PipesModule
  ],
})
export class ChatsPageModule {}
