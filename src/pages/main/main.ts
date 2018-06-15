import { StatusBar } from '@ionic-native/status-bar';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Slides, LoadingController, Platform } from 'ionic-angular';
import { ProfileProvider } from '../../providers/profile/profile';
import { Profile } from './../../models/Profile';
import { Vibration } from '@ionic-native/vibration';
import { NativeAudio } from '@ionic-native/native-audio';
import firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {

  @ViewChild(Slides) slides: Slides;

  userProfile = {} as Profile;
  username: string;
  userPicture: string = 'assets/imgs/user.png';
  userMessage: string = 'Seja bem-vindo!';

  topicClass: string = 'activity';
  isPlaying: boolean = false;
  canVibrate: boolean = true;

  modifiedTopics = [];
  originalTopics = [
    { title: 'Sono', cattegorie: '', urlImagem: 'assets/imgs/topicos/sono.png', urlSound: 'assets/audio/example.mp3', notification: 'Estou com sono' },
    { title: 'Fome', cattegorie: 'Alimentação', urlImagem: 'assets/imgs/topicos/iceCream.png', urlSound: 'assets/audio/example.mp3', notification: 'Estou com fome' },
    { title: 'Sede', cattegorie: 'Alimentação', urlImagem: 'assets/imgs/topicos/comida.png', urlSound: 'assets/audio/example.mp3', notification: 'Estou com sede' },
    { title: 'Ir ao banheiro', cattegorie: '', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: 'assets/audio/example.mp3', notification: 'Preciso ir ao banheiro' },
    { title: 'Tomar banho', cattegorie: 'Higiêne', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: 'assets/audio/example.mp3', notification: 'Quero tomar banho' },
    { title: 'Escovar os dentes', cattegorie: 'Higiêne', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: 'assets/audio/example.mp3', notification: 'Quero escovar meus dentes' },
    { title: 'Trocar de roupa', cattegorie: '', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: 'assets/audio/example.mp3', notification: 'Quero trocar de roupa' },
    { title: 'Brincar', cattegorie: 'Lazer', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: 'assets/audio/example.mp3', notification: 'Quero brincar' },
    { title: 'Assistir', cattegorie: 'Lazer', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: 'assets/audio/example.mp3', notification: 'Quero assistir' },
    { title: 'Passear', cattegorie: 'Lazer', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: 'assets/audio/example.mp3', notification: 'Quero passear' }

  ];

  title: string;
  cattegorie: string;
  cattegories: string;

  hideLeftButton: string = 'left-button-hide';
  hideRightButton: string = 'right-button';

  constructor(private profileProvider: ProfileProvider, private loadingCtrl: LoadingController,
    private vibrator: Vibration, private audio: NativeAudio, private statusBar: StatusBar, private platform: Platform, public navCtrl: NavController) {

  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.statusBar.show();
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#ffffff');
    });
  }

  ionViewWillEnter() {
    if (this.userProfile.photoUrl) {
      const pathReference = firebase.storage().ref(`/pictures/${firebase.auth().currentUser.uid}/profilePicture.jpeg`);
      pathReference.getDownloadURL().then(profilePicture => {
        this.userPicture = profilePicture;
      })
    }
  }

  ionViewCanEnter() {

    this.profileProvider.getUserProfile().once('value', userProfileSnapshot => {
      this.userProfile = userProfileSnapshot.val();
    }).then(() => {

      if (this.userProfile.name == null) {
        this.navCtrl.push('NewProfilePage');
        return false;
      } else {
        return true;
      }
    })
  }

  ionViewDidLoad() {

    let load = this.loadingCtrl.create({
      content: 'Carregando seu perfil...'
    });

    load.present();

    this.profileProvider.getUserProfile().on('value', userProfileSnapshot => {
      this.userProfile = userProfileSnapshot.val();

      this.userMessage = this.userProfile.gender == 'man' ? 'Seja bem-vindo!' : 'Seja bem-vinda!';

      load.dismiss();

      setTimeout(() => { this.userMessage = 'Clique aqui para ver seu Perfil' }, 2500);
      this.modifiedTopics = this.originalTopics;
      this.title = this.modifiedTopics[0].title;
      this.cattegorie = this.modifiedTopics[0].cattegorie;
    })
  }

  playSound(topic) {

    if (this.canVibrate) {
      this.vibrator.vibrate(180);
      this.canVibrate = false;

      if (!this.isPlaying) {
        this.isPlaying = true;
        this.topicClass = 'desabledActivity';
        this.audio.preloadSimple('audioMessage', topic.urlSound).then(() => {
          this.audio.play('audioMessage', () => {

            this.audio.unload('audioMessage').then(() => {
              this.topicClass = 'activity';
              this.isPlaying = false;
            });

          });
        });
      }
    }
  }

  slideBack() {
    this.slides.slidePrev();
  }

  slideForward() {
    this.slides.slideNext();
  }

  slideChanged() {
    if (this.slides.length() > this.slides.getActiveIndex()) {
      let currentIndex = this.slides.getActiveIndex();
      this.title = this.modifiedTopics[currentIndex].title;
      this.cattegorie = this.modifiedTopics[currentIndex].cattegorie;

      if (this.slides.isBeginning()) {
        this.hideLeftButton = 'left-button-hide';
      } else {
        this.hideLeftButton = 'left-button';
      }

      if (this.slides.isEnd()) {
        this.hideRightButton = 'right-button-hide';
      } else {
        this.hideRightButton = 'right-button';
      }
    }

  }

  setCattegorie(cattegorie) {
    this.modifiedTopics = this.originalTopics.filter((topic) => {

      if (topic.cattegorie == cattegorie) {
        this.cattegorie = topic.cattegorie;
      }

      return topic.cattegorie == cattegorie;
    });

    this.slides.slideTo(0, 500);
    this.title = this.modifiedTopics[0].title;
  }

  goToProfilePage() {
    this.navCtrl.push('ProfilePage');
  }

}