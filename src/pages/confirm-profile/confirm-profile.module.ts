import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfirmProfilePage } from './confirm-profile';

@NgModule({
  declarations: [
    ConfirmProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ConfirmProfilePage),
  ],
})
export class ConfirmProfilePageModule {}
