import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ParkingService } from '../../services/parking.service';
import { JwtResponse, ParkingSpace, ReservationRequest } from '../../models/user.model';

@Component({
    selector: 'app-booking',
    templateUrl: './booking.component.html',
    standalone: false,
    styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
    currentUser: JwtResponse | null = null;
    selectedDate: Date = new Date();
    parkingSpaces: ParkingSpace[] = [];
    yardSpaces: ParkingSpace[] = [];
    garageSpaces: ParkingSpace[] = [];
    loading = false;
    error = '';
    showBookingPopup = false;
    showCancelPopup = false;
    selectedSpace: ParkingSpace | null = null;

    constructor(
        private authService: AuthService,
        private parkingService: ParkingService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;

        // Redirect owners to owner page
        if (this.currentUser?.role === 'OWNER') {
            this.router.navigate(['/owner']);
            return;
        }

        this.loadParkingSpaces();
    }

    loadParkingSpaces(): void {
        this.loading = true;
        this.error = '';

        const dateStr = this.formatDate(this.selectedDate);

        this.parkingService.getParkingSpaces(dateStr).subscribe({
            next: (spaces) => {
                this.parkingSpaces = spaces;
                this.yardSpaces = spaces.filter(s => s.parkingType === 'YARD').sort((a, b) => a.spotNumber - b.spotNumber);
                this.garageSpaces = spaces.filter(s => s.parkingType === 'GARAGE').sort((a, b) => a.spotNumber - b.spotNumber);
                this.loading = false;
            },
            error: (error) => {
                this.error = error.error?.message || 'Failed to load parking spaces';
                this.loading = false;
            }
        });
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    onDateChange(event: any): void {
        this.selectedDate = new Date(event.target.value);
        this.loadParkingSpaces();
    }

    onSpaceClick(space: ParkingSpace): void {
        this.selectedSpace = space;

        if (space.status === 'available') {
            this.showBookingPopup = true;
        } else if (space.status === 'my-reservation') {
            this.showCancelPopup = true;
        }
    }

    confirmBooking(): void {
        if (!this.selectedSpace) return;

        const request: ReservationRequest = {
            parkingSpaceId: this.selectedSpace.id,
            reservationDate: this.formatDate(this.selectedDate)
        };

        this.parkingService.createReservation(request).subscribe({
            next: () => {
                this.showBookingPopup = false;
                alert('Parking space booked successfully! (Email notification will be sent)');
                this.loadParkingSpaces();
            },
            error: (error) => {
                this.showBookingPopup = false;
                alert(error.error?.message || 'Failed to book parking space');
            }
        });
    }

    confirmCancel(): void {
        if (!this.selectedSpace) return;

        // Find the reservation ID - in a real app, we'd fetch this from the backend
        // For now, we'll need to add a way to track reservation IDs
        alert('Cancel functionality requires reservation ID. Please implement getMyReservations endpoint.');
        this.showCancelPopup = false;
    }

    closePopup(): void {
        this.showBookingPopup = false;
        this.showCancelPopup = false;
        this.selectedSpace = null;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    getSpaceClass(space: ParkingSpace): string {
        switch (space.status) {
            case 'available':
                return 'space-available';
            case 'occupied':
                return 'space-occupied';
            case 'my-reservation':
                return 'space-my-reservation';
            case 'owner-cancelled':
                return 'space-cancelled';
            default:
                return '';
        }
    }

    // Generate array for grid layout
    getYardRows(): number[] {
        return Array(5).fill(0).map((_, i) => i);
    }

    getYardCols(): number[] {
        return Array(10).fill(0).map((_, i) => i);
    }

    getGarageRows(): number[] {
        return Array(10).fill(0).map((_, i) => i);
    }

    getGarageCols(): number[] {
        return Array(10).fill(0).map((_, i) => i);
    }

    getSpaceAtPosition(type: string, row: number, col: number): ParkingSpace | null {
        const spotNumber = row * (type === 'YARD' ? 10 : 10) + col + 1;
        const spaces = type === 'YARD' ? this.yardSpaces : this.garageSpaces;
        return spaces.find(s => s.spotNumber === spotNumber) || null;
    }
}