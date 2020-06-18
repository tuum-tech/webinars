import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Injectable()
export class Native {
    constructor(private navCtrl: NavController,
                private zone: NgZone,
                private router: Router) {
    }


    public go(page: any, options: any = {}) {
        console.log("Navigating to:", page);
        this.zone.run(()=>{
            this.navCtrl.setDirection('forward');
            this.router.navigate([page], { queryParams: options });
        });
    }
}

