import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewProfilePage } from './new-profile';

@NgModule({
  declarations: [
    NewProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(NewProfilePage),
  ],
})
export class NewProfilePageModule {}
