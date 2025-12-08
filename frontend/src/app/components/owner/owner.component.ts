import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OwnerService } from '../../services/owner.service';
import { JwtResponse, OwnerCancellationRequest } from '../../models/user.model';

@Component({
    selector: 'app-owner',
    templateUrl: './owner.component.html',
    standalone: false,
    styleUrls: ['./owner.component.css']
})
export class OwnerComponent implements OnInit {
    currentUser: JwtResponse | null = null;
    selectedDate: Date = new Date();
    minDate: string = '';
    error = '';
    success = '';
    showConfirmPopup = false;

    constructor(
        private authService: AuthService,
        private ownerService: OwnerService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;

        // Redirect non-owners to booking page
        if (this.currentUser?.role !== 'OWNER') {
            this.router.navigate(['/booking']);
            return;
        }

        // Set minimum date based on current time
        this.updateMinDate();
    }

    updateMinDate(): void {
        const now = new Date();
        const currentHour = now.getHours();

        // If after 5pm (17:00), minimum date is day after tomorrow
        // Otherwise, minimum date is tomorrow
        const daysToAdd = currentHour >= 17 ? 2 : 1;

        const minDate = new Date(now);
        minDate.setDate(minDate.getDate() + daysToAdd);

        this.minDate = this.formatDate(minDate);

        // Set selected date to min date if current selection is before it
        if (this.formatDate(this.selectedDate) < this.minDate) {
            this.selectedDate = minDate;
        }
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    onDateChange(event: any): void {
        this.selectedDate = new Date(event.target.value);
        this.error = '';
        this.success = '';
    }

    cancelAvailability(): void {
        this.showConfirmPopup = true;
    }

    confirmCancel(): void {
        this.error = '';
        this.success = '';

        const request: OwnerCancellationRequest = {
            cancellationDate: this.formatDate(this.selectedDate)
        };

        this.ownerService.cancelSpotAvailability(request).subscribe({
            next: (response) => {
                this.success = 'Parking spot availability cancelled successfully for ' + this.formatDate(this.selectedDate);
                this.showConfirmPopup = false;

                // Update min date in case we're past 5pm now
                setTimeout(() => this.updateMinDate(), 100);
            },
            error: (error) => {
                this.error = error.error?.message || 'Failed to cancel parking spot availability';
                this.showConfirmPopup = false;
            }
        });
    }

    closePopup(): void {
        this.showConfirmPopup = false;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    getCurrentTime(): string {
        return new Date().toLocaleTimeString();
    }

    isAfter5PM(): boolean {
        return new Date().getHours() >= 17;
    }
}