import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Profile } from './profile';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [Profile],
  imports: [IonicPageModule.forChild(Profile), ComponentsModule],
  exports: [Profile]
})
export class ProfileModule {}
