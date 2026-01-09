import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
//import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Connexion - LightOps' }
  },
  //{
   // path: 'register',
   // component: RegisterComponent,
   // data: { title: 'Inscription - LightOps' }
  //},
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: { title: 'Mot de passe oublié - LightOps' }
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: { title: 'Réinitialiser mot de passe - LightOps' }
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent,
    data: { title: 'Réinitialiser mot de passe - LightOps' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
