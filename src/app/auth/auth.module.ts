import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components
import { LoginComponent } from './components/login/login.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from '../auth/components/forgot-password/forgot-password.component';
//import { RegisterComponent } from '../auth/components/register/register.component';

// Routes
import { AuthRoutingModule } from './auth-routing.module';

// Services
import { AuthService } from '../core/services/auth.service';

@NgModule({
  declarations: [
    // Components are now standalone and imported instead
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthRoutingModule,
    LoginComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent
  ],
  providers: [
    AuthService
  ],
  exports: [
    LoginComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    //RegisterComponent
  ]
})
export class AuthModule { }
