// src/app/auth/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Récupérer l'URL de retour si présente
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Vérifier si la session a expiré
    if (this.route.snapshot.queryParams['sessionExpired']) {
      this.errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (error) => {
          this.errorMessage = error.error?.message ||
            'Erreur de connexion. Vérifiez vos identifiants.';
        }
      });
  }

  forgotPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (email) {
      this.router.navigate(['/auth/reset-password'], {
        queryParams: { email }
      });
    } else {
      this.router.navigate(['/auth/reset-password']);
    }
  }
}
