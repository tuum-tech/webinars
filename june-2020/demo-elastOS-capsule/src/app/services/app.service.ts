import { Injectable } from "@angular/core";
import { Native } from './Native';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./localstorage.service";
declare let appManager: AppManagerPlugin.AppManager;
let myService = null;


@Injectable({
    providedIn: 'root'
})
export class AppService {

    static intentConfig: any;
    static signedIdentity: DIDSessionManagerPlugin.IdentityEntry = null;
    static email = '';
    private isReceiveIntentReady = false;


    constructor(public native: Native, private http: HttpClient, private localStorage : LocalStorageService) {

        myService = this;
    }

    init() {
        this.setIntentListener()
    }

    setIntentListener() {
        if (!this.isReceiveIntentReady) {
            this.isReceiveIntentReady = true;
            appManager.setIntentListener((intent: AppManagerPlugin.ReceivedIntent) => {
                this.onReceiveIntent(intent);
            });
        }
    }

    tryDoLogin(): Promise<boolean> {
        var self = this;

        return new Promise(async (resolve, reject) => {
           
            let profile =  await this.localStorage.getProfile();
            if (profile)
            {
                AppService.signedIdentity = profile[0];
                AppService.email = profile[1];
                resolve(true);
                return;
            }

            //did:elastos:iWm3fwhsVbXJ1ecSi7n7Q9L6qNmH14FsuN
            appManager.sendIntent("credaccess", {
                claims: 
                    { 
                        name: true,
                        email: true
                    }
                },
                {},
                (response) => {
                    var nameSubject = self.getSubject(response.result.presentation, "name");
                    var emailSubject = self.getSubject(response.result.presentation, "email");
                    AppService.signedIdentity = {
                                didString: response.result.did,
                                didStoreId: response.result.did,
                                name:  nameSubject || "Not Set",
                            };
                    AppService.email = emailSubject || "Not Set";
                    this.localStorage.setProfile(AppService.signedIdentity,  AppService.email);
                    resolve(true);
                },
                function(err){
                    console.log(err);
                    resolve(false);
                })
        });

    }

    logout(): Promise<any> {
        var self = this;
        return self.localStorage.clear();
    }

    private getSubject(presentation, fragment): any {
        var subject = null;
        presentation.verifiableCredential.forEach(vc => {
            let element = vc.credentialSubject[fragment]
            if (element != null) {
                subject = element;
            }
        });
        return subject;
    }

    onReceiveIntent(intent: AppManagerPlugin.ReceivedIntent) {
        console.log("Intent received message:", intent.action, ". params: ", intent.params, ". from: ", intent.from);
        AppService.intentConfig = {};
        AppService.intentConfig.transfer = {
            memo: intent.params.memo || '',
            intentId: intent.intentId,
            action: intent.action,
            from: intent.from,
            payPassword: '',
            fee: 0,
            didrequest: intent.params.didrequest,
            chainId: 'IDChain',
        };
        myService.native.go('/create');
    }

   

    sendIntentResponse(action, result, intentId) {
        appManager.sendIntentResponse(action, result, intentId, () => {
            AppService.intentConfig = null;
        }, (err) => {
            console.error('sendIntentResponse error!', err);
        });

    }
}