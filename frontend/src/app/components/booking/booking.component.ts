import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ParkingService } from '../../services/parking.service';
import { JwtResponse, ParkingSpace, Reservation, ReservationRequest } from '../../models/user.model';

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
    myReservations: Reservation[] = [];
    loading = false;
    error = '';
    showBookingPopup = false;
    showCancelPopup = false;
    selectedSpace: ParkingSpace | null = null;
    cancellingReservation = false;
    selectedReservation: Reservation | null = null;

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
        this.loadMyReservations();
        this.loadParkingSpaces();
    }

    loadMyReservations(): void {
        this.parkingService.getMyReservations().subscribe({
            next: (reservations) => {
                this.myReservations = reservations;
            },
            error: (error) => {
                console.error('Failed to load reservations:', error);
            }
        });
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
                this.loadMyReservations();
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

        //Pronađite ID rezervacije - kanije u aplikaciji, razviti funkcionalnost da hvata sa bekenda
        // // Za sada, ovo je način za praćenje ID-ova rezervacija
        // // alert('Funkcija otkazivanja zahteva ID rezervacije.');
        // // this.showCancelPopup = false;
        // // Pronadji rezervaciju za mesto i za izabrani datum
        const reservation = this.myReservations.find(r =>
            r.parkingSpaceId === this.selectedSpace!.id &&
            this.normalizeDate(r.reservationDate) === this.formatDate(this.selectedDate)
        );

        if (!reservation || !reservation.id) {
            alert('Reservation not found. Please try refreshing the page.');
            this.showCancelPopup = false;
            return;
        }
        this.cancellingReservation = true;

        this.parkingService.cancelReservation(reservation.id).subscribe({
            next: () => {
                this.cancellingReservation = false;
                this.showCancelPopup = false;
                alert('Reservation cancelled successfully!');
                this.loadMyReservations();
                this.loadParkingSpaces();
            },
            error: (error) => {
                this.cancellingReservation = false;
                this.showCancelPopup = false;
                alert(error.error?.message || 'Failed to cancel reservation');
            }
        });
    }
    // Otkazi rezervaciju, ,,myReservation" list
    cancelReservationFromList(reservation: Reservation): void {
        if (!reservation.id) {
            alert('Invalid reservation');
            return;
        }

        if (confirm(`Are you sure you want to cancel your reservation for spot #${reservation.spotNumber} on ${this.normalizeDate(reservation.reservationDate)}?`)) {
            this.cancellingReservation = true;
            this.parkingService.cancelReservation(reservation.id).subscribe({
                next: () => {
                    this.cancellingReservation = false;
                    alert('Reservation cancelled successfully!');
                    this.loadMyReservations();
                    this.loadParkingSpaces();
                },
                error: (error) => {
                    this.cancellingReservation = false;
                    alert(error.error?.message || 'Failed to cancel reservation');
                }
            });
        }
    }

    // Normalizacija date formata
    normalizeDate(date: string | Date): string {
        if (date instanceof Date) {
            return this.formatDate(date);
        }
        // Ako je vec string, uveriti se da je format: YYYY-MM-DD
        const dateObj = new Date(date);
        return this.formatDate(dateObj);
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

    // Izgenerisi niz za grid layout
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