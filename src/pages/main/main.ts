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

  yearsCattegorie: string;
  modifiedTopics = [];
  originalTopics = [];

  title: string;
  cattegorie: string;
  cattegories: string;

  hideLeftButton: string = 'left-button-hide';
  hideRightButton: string = 'right-button';

  isEnableNeeds: string = 'enable';
  isEnableHygiene: string = 'disabled';
  isEnableChat: string = 'disabled';
  isEnableAlimentation: string = 'disabled';
  isEnableRecreation: string = 'disabled';

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

      if (this.userProfile.yearsOld <= 11) {
        this.yearsCattegorie = 'child';
      } else if (this.userProfile.yearsOld > 11 && this.userProfile.yearsOld <= 20) {
        this.yearsCattegorie = 'teenager';
      } else if (this.userProfile.yearsOld > 20) {
        this.yearsCattegorie = 'adult';
      }

      this.fillOriginalTopics();

      this.userMessage = this.userProfile.gender == 'man' ? 'Seja bem-vindo!' : 'Seja bem-vinda!';

      const pathReference = firebase.storage().ref(`/pictures/${firebase.auth().currentUser.uid}/profilePicture.jpeg`);

      pathReference.getDownloadURL().then(profilePicture => {
        this.userPicture = profilePicture;

        load.dismiss();
      });

      setTimeout(() => { this.userMessage = 'Clique aqui para ver seu Perfil' }, 2500);

      this.modifiedTopics = this.originalTopics.filter((topic) => {

        this.cattegories = 'basicas';

        return topic.cattegorie == 'Necessidades Básicas';

      });

      this.title = this.modifiedTopics[0].title;
      this.cattegorie = this.modifiedTopics[0].cattegorie;
    })
  }

  ionViewWillEnter() {

    this.slides.slideTo(0, 500);

    /*
    *
    * Para que não exceda o requests
    * 
    if (this.userProfile.photoUrl) {

      let load = this.loadingCtrl.create({
        content: 'Carregando sua foto...'
      });

      load.present();

      const pathReference = firebase.storage().ref(`/pictures/${firebase.auth().currentUser.uid}/profilePicture.jpeg`);

      pathReference.getDownloadURL().then(profilePicture => {
        this.userPicture = profilePicture;
        load.dismiss();
      })
    }
    */

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
              this.canVibrate = true;
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

  disableCattegories() {
    this.isEnableNeeds = 'disabled';
    this.isEnableAlimentation = 'disabled';
    this.isEnableChat = 'disabled';
    this.isEnableHygiene = 'disabled';
    this.isEnableRecreation = 'disabled';
  }

  setCattegorie(cattegorie) {

    this.disableCattegories();

    switch (cattegorie) {
      case 'Necessidades Básicas':
        this.isEnableNeeds = 'enable';
        break;

      case 'Diálogo':
        this.isEnableChat = 'enable';
        break;

      case 'Higiêne':
        this.isEnableHygiene = 'enable';
        break;

      case 'Lazer':
        this.isEnableRecreation = 'enable';
        break;

      case 'Alimentação':
        this.isEnableAlimentation = 'enable';
        break;
    }

    this.modifiedTopics = this.originalTopics.filter((topic) => {

      if (topic.cattegorie == cattegorie) {
        this.cattegorie = topic.cattegorie;
      }

      return topic.cattegorie == cattegorie;
    });

    this.slides.slideTo(0, 500);
    this.title = this.modifiedTopics[0].title;
  }

  fillOriginalTopics() {

    this.originalTopics = [{ title: 'Sono', cattegorie: 'Necessidades Básicas', urlImagem: 'assets/imgs/topicos/sono.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/sono.mp3`, notification: 'Estou com sono' },
    { title: 'Calor', cattegorie: 'Necessidades Básicas', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/calor.mp3`, notification: 'Estou com calor' },
    { title: 'Frio', cattegorie: 'Necessidades Básicas', urlImagem: 'assets/imgs/topicos/sono.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/frio.mp3`, notification: 'Estou com frio' },
    { title: 'Ir ao banheiro', cattegorie: 'Necessidades Básicas', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/banheiro.mp3`, notification: 'Preciso ir ao banheiro' },
    { title: 'Escovar os dentes', cattegorie: 'Higiêne', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/escovar-dentes.mp3`, notification: 'Quero escovar meus dentes' },
    { title: 'Tomar banho', cattegorie: 'Higiêne', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/banho.mp3`, notification: 'Quero tomar banho' },
    { title: 'Trocar de roupa', cattegorie: 'Higiêne', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/trocar-roupa.mp3`, notification: 'Quero trocar de roupa' },
    { title: 'Fome', cattegorie: 'Alimentação', urlImagem: 'assets/imgs/topicos/iceCream.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/fome.mp3`, notification: 'Estou com fome' },
    { title: 'Sede', cattegorie: 'Alimentação', urlImagem: 'assets/imgs/topicos/comida.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/sede.mp3`, notification: 'Estou com sede' },
    { title: 'Brincar', cattegorie: 'Lazer', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/brincar.mp3`, notification: 'Quero brincar' },
    { title: 'Assistir', cattegorie: 'Lazer', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/assistir.mp3`, notification: 'Quero assistir' },
    { title: 'Olá', cattegorie: 'Diálogo', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/ola.mp3`, notification: 'Olá!' },
    { title: 'Bom dia', cattegorie: 'Diálogo', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/bom-dia.mp3`, notification: 'Bom dia' },
    { title: 'Boa tarde', cattegorie: 'Diálogo', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/boa-tarde.mp3`, notification: 'Boa tarde' },
    { title: 'Boa noite', cattegorie: 'Diálogo', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/boa-noite.mp3`, notification: 'Boa noite' },
    { title: 'Sim', cattegorie: 'Diálogo', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/sim.mp3`, notification: 'Sim' },
    { title: 'Não', cattegorie: 'Diálogo', urlImagem: 'assets/imgs/topicos/fome1.png', urlSound: `assets/audio/${this.userProfile.gender}/${this.yearsCattegorie}/nao.mp3`, notification: 'Não' },
    ];

  }

  goToProfilePage() {
    this.navCtrl.push('ProfilePage');
  }

}