import { Injectable } from '@angular/core';
import firebase, { User } from 'firebase/app';
import 'firebase/database';

@Injectable()
export class ProfileProvider {

  public userProfile: firebase.database.Reference;
  public currentUser: User;

  constructor() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        this.userProfile = firebase.database().ref('/Profile/').child(user.uid);
      }
    });
  }

  getUserProfile(): firebase.database.Reference {
    return this.userProfile;
  }

  createAndUpdateUserProfile(user: any): Promise<any> {

    return this.userProfile.update({
      'email': this.currentUser.email,
      'firstName': user.firstName,
      'name': user.name,
      'gender': user.gender,
      'dateOfBirth': user.dateOfBirth,
      'yearsOld': user.yearsOld
    });

  }

  setUserProfilePicture(picture: string): Promise<any> {
    return this.userProfile.update({
      'photoUrl': picture
    })
  }

}
