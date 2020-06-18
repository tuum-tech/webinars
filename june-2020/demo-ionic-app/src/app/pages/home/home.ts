import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styleUrls: ['./home.scss']
})
export class HomePage {
  constructor(public navCtrl: NavController,
              public router: Router,
              private appService: AppService) {
  }

  ionViewDidEnter() {
  }

  logout() {
    var logoutResponse = this.appService.logout();

    if (logoutResponse) this.router.navigate([''],{ replaceUrl: true });
  }

  get did(): string {
    return AppService.login.didString;
  }

  get name(): string {
    return AppService.login.name;
  }

  get email(): string {
    return AppService.email;
  }
}
