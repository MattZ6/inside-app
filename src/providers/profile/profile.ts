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
        this.userProfile = firebase.database().ref(`/Profile/${user.uid}`);
      }
    });
  }

  getUserProfile(): firebase.database.Reference {
    return this.userProfile;
  }

  createUserProfile(user: any): Promise<any> {

    return this.userProfile.set({
      email: this.currentUser.email,
      firstName: user.firstName,
      name: user.name,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      yearsOld: user.yearsOld,
      photoUrl: user.photoUrl
    });

  }

}
