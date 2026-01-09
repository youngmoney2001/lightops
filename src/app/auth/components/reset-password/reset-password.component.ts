import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, NewPasswordData } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  //styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  token = '';
  email = '';
  showPassword = false;
  showConfirmPassword = false;
  appName = 'LightOps';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Récupérer le token depuis l'URL
    this.token = this.route.snapshot.params['token'] || '';

    // Pour le développement, on peut pré-remplir l'email
    // Dans la réalité, il viendrait d'un query param ou d'un autre mécanisme
    this.email = this.route.snapshot.queryParams['email'] || '';

    if (this.email) {
      this.resetPasswordForm.patchValue({ email: this.email });
    }
  }

  private initForm(): void {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator
      ]],
      password_confirmation: ['', [Validators.required]],
      token: [this.token, [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validator personnalisé pour la force du mot de passe
  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;

    return !passwordValid ? {
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasNumeric,
        hasSpecial
      }
    } : null;
  }

  // Validator pour vérifier que les mots de passe correspondent
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirmation')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const data: NewPasswordData = this.resetPasswordForm.value;

    this.authService.resetPassword(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.submitted = true;
        this.successMessage = 'Votre mot de passe a été réinitialisé avec succès.';

        // Rediriger après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 400) {
          this.errorMessage = 'Le lien de réinitialisation est invalide ou a expiré.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
        console.error('Reset password error:', error);
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  getPasswordFieldType(field: 'password' | 'confirmPassword'): string {
    if (field === 'password') {
      return this.showPassword ? 'text' : 'password';
    } else {
      return this.showConfirmPassword ? 'text' : 'password';
    }
  }

  getPasswordStrength(): { score: number; message: string; color: string } {
    const password = this.password?.value || '';

    if (!password) {
      return { score: 0, message: '', color: 'gray' };
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const messages = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon', 'Excellent'];
    const colors = ['red', 'orange', 'yellow', 'lightgreen', 'green', 'darkgreen'];

    return {
      score: (score / 5) * 100,
      message: messages[Math.min(score, 5)],
      color: colors[Math.min(score, 5)]
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters pour faciliter l'accès aux champs
  get emailField() { return this.resetPasswordForm.get('email'); }
  get password() { return this.resetPasswordForm.get('password'); }
  get password_confirmation() { return this.resetPasswordForm.get('password_confirmation'); }
}
