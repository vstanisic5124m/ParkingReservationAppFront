import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    standalone: false,
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;
    loading = false;
    submitted = false;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) {
        // Redirect to dashboard if already logged in
        if (this.authService.currentUserValue) {
            this.router.navigate(['/dashboard']);
        }
    }

    ngOnInit(): void {
        this.registerForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            firstName: ['', [Validators.required, Validators.maxLength(50)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            phoneNumber: ['', [Validators.maxLength(20)]]
        });
    }

    // Convenience getter for easy access to form fields
    get f() {
        return this.registerForm.controls;
    }

    onSubmit(): void {
        this.submitted = true;
        this.error = '';

        // Stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;
        this.authService.register(this.registerForm.value)
            .subscribe({
                next: () => {
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    this.error = error.error?.message || 'Registration failed. Please try again.';
                    this.loading = false;
                }
            });
    }
}