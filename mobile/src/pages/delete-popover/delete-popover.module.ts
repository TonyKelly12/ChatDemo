import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeletePopoverPage } from './delete-popover';

@NgModule({
  declarations: [
    DeletePopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(DeletePopoverPage),
  ],
})
export class DeletePopoverPageModule {}
