// src/app/auth/components/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  isSubmitted = false;
  message = '';
  errorMessage = '';
  email = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Récupérer l'email depuis les query params si présent
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
        this.resetForm.patchValue({ email: this.email });
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.message = '';

    const email = this.resetForm.value.email;

    this.authService.forgotPassword(email)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: any) => {
          this.isSubmitted = true;
          this.message = response.message ||
            'Un email de réinitialisation a été envoyé à votre adresse.';
        },
        error: (error) => {
          this.errorMessage = error.error?.message ||
            'Une erreur est survenue. Veuillez réessayer.';
        }
      });
  }

  resetFormState(): void {
    this.isSubmitted = false;
    this.message = '';
    this.errorMessage = '';
  }
}
