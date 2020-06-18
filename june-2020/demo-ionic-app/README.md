## Resources
- Install Ionic 
- [Enable Capacitor to be used](https://capacitor.ionicframework.com/docs/getting-started/with-ionic/?utm_source=cli&utm_medium=referral&utm_campaign=CLI)
- [Deploying to Mobile](https://ionicframework.com/docs/angular/your-first-app/6-deploying-mobile)

## How to run
- Install dependencies
```
npm install -g native-run
npm install
```
- Run
```
ionic capacitor run android --livereload --external
```

## If there are any changes to the code
```
ionic cap copy // If only web code has changed
ionic cap sync // If you made changes to plugins
```

