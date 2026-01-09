import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

// Modules
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';

// Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';

@NgModule({
  declarations: [
    // AppComponent is now standalone and imported instead
  ],
  imports: [
    // Angular modules
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,

    // App modules
    CoreModule,
    AuthModule,
    // SharedModule, // Temporarily removed due to missing components
    AppRoutingModule,
    AppComponent
  ],
  providers: [],
  bootstrap: [] // Bootstrap moved to main.ts
})
export class AppModule { }
