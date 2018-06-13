import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateAuthPage } from './create-auth';

@NgModule({
  declarations: [
    CreateAuthPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateAuthPage),
  ],
})
export class CreateAuthPageModule {}
