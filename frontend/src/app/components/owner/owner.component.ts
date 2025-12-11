import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OwnerService } from '../../services/owner.service';
import { JwtResponse, OwnerCancellationRequest } from '../../models/user.model';

interface CalendarDay {
    date: Date | null;        // null = blank cell
    label: string;            // day number or ''
    disabled: boolean;
    isSelected: boolean;
    isCurrentMonth: boolean;
}

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

    // Calendar data
    weeks: CalendarDay[][] = []; // niz od 7 dana nedeljno
    monthLabel = '';

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

        // Postavi minimum datum baziran na vremenu (po specifikaciji)
        this.updateMinDate();
        // Generisi kalendar za tekuci mesec
        this.generateCalendarForCurrentMonth();
    }

    // Podesi minDate po pravilima specifikacije: ne mozete otkazati za danas; posle 17:00 -> sutra disabled (min = prekosutra)
    updateMinDate(): void {
        const now = new Date();
        const currentHour = now.getHours();

        // If after 5pm (17:00), minimum date is day after tomorrow
        // Otherwise, minimum date is tomorrow
        const daysToAdd = currentHour >= 17 ? 2 : 1;

        const minDate = new Date(now);
        minDate.setDate(minDate.getDate() + daysToAdd);
        // zero time to compare only dates
        minDate.setHours(0, 0, 0, 0);

        this.minDate = this.formatDate(minDate);

        // Uveri se da selektovan datum nije pre minimalnog
        if (this.formatDate(this.selectedDate) < this.minDate) {
            this.selectedDate = minDate;
        }

        // regenerate calendar so disabled flags update if time crosses threshold
        this.generateCalendarForCurrentMonth();
    }

    // Build calendar weeks for current month only
    generateCalendarForCurrentMonth(): void {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // current month
        this.monthLabel = now.toLocaleString(undefined, { month: 'long', year: 'numeric' });

        // First day of month
        const firstOfMonth = new Date(year, month, 1);
        const lastOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastOfMonth.getDate();

        // weekday index (0 = Sunday, 1 = Monday, ... 6 = Saturday)
        const startWeekday = firstOfMonth.getDay();

        const days: CalendarDay[] = [];

        // Leading blanks
        for (let i = 0; i < startWeekday; i++) {
            days.push({ date: null, label: '', disabled: true, isSelected: false, isCurrentMonth: false });
        }

        // Fill days
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            date.setHours(0, 0, 0, 0);
            const disabled = this.isBeforeMinDate(date);
            const isSelected = this.formatDate(date) === this.formatDate(this.selectedDate);
            days.push({
                date,
                label: String(d),
                disabled,
                isSelected,
                isCurrentMonth: true
            });
        }

        // Trailing blanks to complete last week
        while (days.length % 7 !== 0) {
            days.push({ date: null, label: '', disabled: true, isSelected: false, isCurrentMonth: false });
        }

        // Chunk into weeks
        const weeks: CalendarDay[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        this.weeks = weeks;
    }

    // Return true if date is before minDate (i.e., should be disabled)
    isBeforeMinDate(date: Date): boolean {
        if (!date) return true;
        const dateStr = this.formatDate(date);
        return dateStr < this.minDate;
    }

    // Called when user clicks a calendar cell
    selectCalendarDay(day: CalendarDay): void {
        if (!day.date || day.disabled) return;

        // mark selection
        this.selectedDate = new Date(day.date);
        this.weeks.forEach(week => week.forEach(d => d.isSelected = (d.date ? this.formatDate(d.date) === this.formatDate(this.selectedDate) : false)));
        this.error = '';
        this.success = '';
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // kept for compatibility with template & info box
    onDateChange(event: any): void {
        this.selectedDate = new Date(event.target.value);
        this.error = '';
        this.success = '';
        // refresh calendar selection state
        this.generateCalendarForCurrentMonth();
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