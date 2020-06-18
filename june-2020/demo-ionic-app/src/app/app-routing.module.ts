import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { LoginPage } from './pages/login/login';
import { HomePage } from './pages/home/home';

const routes: Routes = [
  { path: '', component: LoginPage, pathMatch: 'full' },
  { path: 'home', component: HomePage },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}