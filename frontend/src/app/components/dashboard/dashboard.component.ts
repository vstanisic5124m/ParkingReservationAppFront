import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { JwtResponse } from '../../models/user.model';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    standalone: false,
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    currentUser: JwtResponse | null = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}