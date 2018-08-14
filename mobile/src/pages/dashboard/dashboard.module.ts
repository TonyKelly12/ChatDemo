import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Dashboard } from './dashboard';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';


@NgModule({
  declarations: [Dashboard],
  imports: [IonicPageModule.forChild(Dashboard), ComponentsModule, DirectivesModule],
  exports: [Dashboard]
})
export class DashboardModule {}
