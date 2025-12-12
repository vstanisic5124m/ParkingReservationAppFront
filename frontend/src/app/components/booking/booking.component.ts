import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ParkingService } from '../../services/parking.service';
import { JwtResponse, ParkingSpace, Reservation, ReservationRequest } from '../../models/user.model';
import { DateUtils } from '../../utils/date-utils';

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

    // UI state for popups and feedback
    showBookingPopup = false;
    showCancelPopup = false;
    selectedSpace: ParkingSpace | null = null;
    cancellingReservation = false;
    bookingInProgress = false;

    // UI selection state
    selectedSpotId: number | null = null;

    // Random UI decorations map (parkingSpaceId -> color hex)
    randomDecorations: Map<number, string> = new Map();
    // debug: last time decoration was applied
    randomDecorationTimestamp: number | null = null;

    // New: show email notification message returned from backend/assumed sent
    emailNotificationMessage: string | null = null;

    // New: show popup-level error
    popupError: string | null = null;

    // Track available count for template usage (avoid inline functions)
    availableCount = 0;

    // DEV: force demo data (set true to always show colored demo spots)
    demoMode = true;

    constructor(
        public authService: AuthService,
        private parkingService: ParkingService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;

        // NOTE: do not force redirect to login here so the UI can show a demo view
        // if the backend is not reachable or the user is not authenticated.
        // Users can still log in via the Login page if needed.

        // (Optional) If you want to force login, re-enable redirect here.


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

        // If demoMode is enabled, skip API calls and use demo data
        if (this.demoMode) {
            const demo = this.generateDemoSpaces();
            this.parkingSpaces = demo;
            this.yardSpaces = demo.filter(s => s.parkingType === 'YARD').sort((a, b) => a.spotNumber - b.spotNumber);
            this.garageSpaces = demo.filter(s => s.parkingType === 'GARAGE').sort((a, b) => a.spotNumber - b.spotNumber);
            this.availableCount = this.parkingSpaces.filter(s => s.status === 'available').length;
            this.applyRandomOccupiedDecoration();
            this.loading = false;
            return;
        }

        this.parkingService.getParkingSpaces(dateStr).subscribe({
            next: (spaces) => {
                // If backend returned an empty list, fall back to demo dataset so UI remains visible
                if (!spaces || spaces.length === 0) {
                    console.warn('[Booking] API returned empty parking spaces; using demo data');
                    spaces = this.generateDemoSpaces();
                }
                this.parkingSpaces = spaces;
                this.yardSpaces = spaces.filter(s => s.parkingType === 'YARD').sort((a, b) => a.spotNumber - b.spotNumber);
                this.garageSpaces = spaces.filter(s => s.parkingType === 'GARAGE').sort((a, b) => a.spotNumber - b.spotNumber);

                // Update availableCount for template
                this.availableCount = this.parkingSpaces.filter(s => s.status === 'available').length;

                // Apply random red decorations for visual variety
                this.applyRandomOccupiedDecoration();

                this.loading = false;
            },
            error: (error) => {
                // If API fails (e.g., 403) provide a client-side demo dataset so the UI is visible.
                console.warn('[Booking] Failed to load parking spaces from API, falling back to demo data:', error?.status);
                this.error = error.error?.message || 'Failed to load parking spaces; showing demo data';
                // generate demo spaces for UI demonstration
                const demo = this.generateDemoSpaces();
                this.parkingSpaces = demo;
                this.yardSpaces = demo.filter(s => s.parkingType === 'YARD').sort((a, b) => a.spotNumber - b.spotNumber);
                this.garageSpaces = demo.filter(s => s.parkingType === 'GARAGE').sort((a, b) => a.spotNumber - b.spotNumber);
                this.availableCount = this.parkingSpaces.filter(s => s.status === 'available').length;
                this.applyRandomOccupiedDecoration();
                this.loading = false;
             }
        });
    }

    // Create a demo dataset: 50 yard spots (5x10) and 100 garage spots (10x10)
    private generateDemoSpaces(): ParkingSpace[] {
        const demo: ParkingSpace[] = [];
        let id = 1;

        // Yard: 5 rows x 10 cols => 50 spots
        for (let i = 0; i < 50; i++) {
            demo.push({
                id: id++,
                parkingType: 'YARD',
                spotNumber: i + 1,
                status: this.randomDemoStatus()
            });
        }

        // Garage: 10 rows x 10 cols => 100 spots
        for (let i = 0; i < 100; i++) {
            demo.push({
                id: id++,
                parkingType: 'GARAGE',
                spotNumber: i + 1,
                status: this.randomDemoStatus()
            });
        }

        return demo;
    }

    private randomDemoStatus(): string {
        // Mostly available, some occupied, a tiny fraction as 'my-reservation' for visual variety
        const r = Math.random();
        if (r < 0.08) return 'occupied';
        if (r < 0.10) return 'my-reservation';
        return 'available';
    }

    // Mark a small subset of all spaces as visually decorated (random colors)
    private applyRandomOccupiedDecoration(): void {
        this.randomDecorations.clear();

        const allSpaces = this.parkingSpaces.slice();
        if (!allSpaces || allSpaces.length === 0) return;

        // pick up to ~12% of all spaces, minimum 5, maximum 24 to ensure visible decorations
        const pickCount = Math.min(24, Math.max(5, Math.floor(allSpaces.length * 0.12)));
        const shuffled = allSpaces.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // color palette for random decoration
        const colors = ['#f44336', '#4caf50', '#ffb300', '#ff5722', '#9c27b0'];

        for (let i = 0; i < Math.min(pickCount, shuffled.length); i++) {
            const s = shuffled[i];
            if (s && s.id) {
                // assign a random color from palette
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.randomDecorations.set(s.id, color);
            }
        }
        this.randomDecorationTimestamp = Date.now();
        console.log('[Booking] randomDecorations:', Array.from(this.randomDecorations.entries()));
    }

    // Public method to refresh random decoration from UI (debug helper)
    refreshRandomDecoration(): void {
        this.applyRandomOccupiedDecoration();
    }

    getRandomOccupiedArray(): string[] {
        // Return debug array like ['12(#f44336)', '45(#4caf50)']
        return Array.from(this.randomDecorations.entries()).map(([id, color]) => `${id}(${color})`);
    }

    isRandomDecorated(space: ParkingSpace | null): boolean {
        if (!space || !space.id) return false;
        return this.randomDecorations.has(space.id);
    }

    getRandomColor(space: ParkingSpace | null): string | null {
        if (!space || !space.id) return null;
        return this.randomDecorations.get(space.id) || null;
    }

    private statusOf(space: ParkingSpace | null): string {
        if (!space || !space.status) return '';
        return ('' + space.status).toLowerCase();
    }

    isAvailable(space: ParkingSpace | null): boolean {
        return this.statusOf(space) === 'available';
    }

    isMyReservation(space: ParkingSpace | null): boolean {
        return this.statusOf(space) === 'my-reservation' || this.statusOf(space) === 'my_reservation';
    }

    isSelected(space: ParkingSpace | null): boolean {
        if (!space || !space.id) return false;
        return this.selectedSpotId === space.id;
    }

    // Decide the UI class for a space with precedence: random-occupied -> selected -> actual status
    getUiClass(space: ParkingSpace): string {
        if (!space) return '';
        // Selected state should override random decoration (user clicked it)
        if (this.isSelected(space)) return 'space-my-reservation';
        if (this.isRandomDecorated(space)) return 'space-random';
        return this.getSpaceClass(space);
     }

     // Normalize and map status to class (case-insensitive)
     getSpaceClass(space: ParkingSpace): string {
         const s = this.statusOf(space);
         switch (s) {
             case 'available':
                 return 'space-available';
             case 'occupied':
                 return 'space-occupied';
             case 'my-reservation':
             case 'my_reservation':
                 return 'space-my-reservation';
             case 'owner-cancelled':
             case 'owner_cancelled':
                 return 'space-cancelled';
             default:
                 return '';
         }
     }

     // Helpers to compute colors for inline styles (ensures template visuals are robust)
     getBackgroundColor(space: ParkingSpace | null): string {
         if (!space) return 'transparent';
        // Selected overrides random decoration
        if (this.isSelected(space)) return '#1976d2';
        if (this.isRandomDecorated(space)) {
            const c = this.getRandomColor(space);
            if (c) return c;
        }
         const s = this.statusOf(space);
         if (s === 'available') return '#4caf50';
         if (s === 'occupied') return '#f44336';
         if (s === 'my-reservation' || s === 'my_reservation') return '#2196f3';
         if (s === 'owner-cancelled' || s === 'owner_cancelled') return '#9e9e9e';
         return 'transparent';
     }

     getBorderColor(space: ParkingSpace | null): string {
         if (!space) return '#ddd';
        if (this.isSelected(space)) return '#0d47a1';
        if (this.isRandomDecorated(space)) {
            const c = this.getRandomColor(space);
            // Map random color to a darker border variant
            const borderMap: { [k: string]: string } = {
                '#f44336': '#d32f2f',
                '#4caf50': '#2e7d32',
                '#ffb300': '#ff8f00',
                '#ff5722': '#e64a19'
            };
            if (c && borderMap[c]) return borderMap[c];
        }
         const s = this.statusOf(space);
         if (s === 'available') return '#45a049';
         if (s === 'occupied') return '#d32f2f';
         if (s === 'my-reservation' || s === 'my_reservation') return '#1976d2';
         return '#757575';
     }

     getTextColor(space: ParkingSpace | null): string {
         const bg = this.getBackgroundColor(space);
         return bg && bg !== 'transparent' ? 'white' : 'inherit';
     }

    formatDate(date: Date): string {
        return DateUtils.formatDate(date);
    }

    onDateChange(event: any): void {
        this.selectedDate = new Date(event.target.value);
        this.loadParkingSpaces();
    }

    onSpaceClick(space: ParkingSpace): void {
        this.selectedSpace = space;
        this.popupError = null;
        this.emailNotificationMessage = null;

        // allow selection for available spots OR user's own reservations OR random-decorated (visual) spots
        if (this.isAvailable(space) || this.isMyReservation(space) || this.isRandomDecorated(space)) {
            // set UI selected state (turn selected spot blue visually)
            this.selectedSpotId = space.id || null;
            console.log('[Booking] spot selected', this.selectedSpotId);
            // if user has a reservation, open cancel popup, otherwise booking popup
            if (this.isMyReservation(space)) {
                this.showCancelPopup = true;
            } else {
                this.showBookingPopup = true;
            }
        }
     }

    confirmBooking(): void {
        if (!this.selectedSpace) return;

        const request: ReservationRequest = {
            parkingSpaceId: this.selectedSpace.id,
            reservationDate: this.formatDate(this.selectedDate)
        };

        this.bookingInProgress = true;
        this.popupError = null;
        this.emailNotificationMessage = null;

        this.parkingService.createReservation(request).subscribe({
            next: () => {
                this.bookingInProgress = false;
                this.showBookingPopup = false;
                // clear UI selection (actual booking will refresh data)
                this.selectedSpotId = null;
                 // show a friendly UI message (backend now sends email notifications)
                 this.emailNotificationMessage = 'A confirmation email has been sent to your account.';
                 // refresh lists
                 this.loadMyReservations();
                 this.loadParkingSpaces();
             },
             error: (error) => {
                 this.bookingInProgress = false;
                 // show server-provided message in popup
                 this.popupError = error.error?.message || 'Failed to book parking space';
             }
         });
     }

    confirmCancel(): void {
        if (!this.selectedSpace) return;

        // Find the reservation for this space on the selected date
        const reservation = this.myReservations.find(r =>
            r.parkingSpaceId === this.selectedSpace!.id &&
            this.normalizeDate(r.reservationDate) === this.formatDate(this.selectedDate)
        );

        if (!reservation || !reservation.id) {
            this.popupError = 'Reservation not found. Please try refreshing the page.';
            this.showCancelPopup = false;
            return;
        }

        this.performCancellation(reservation.id);
        this.showCancelPopup = false;
    }

    // Cancel reservation from the "My Reservations" list
    cancelReservationFromList(reservation: Reservation): void {
        if (!reservation.id) {
            alert('Invalid reservation');
            return;
        }

        if (confirm(`Are you sure you want to cancel your reservation for spot #${reservation.spotNumber} on ${this.normalizeDate(reservation.reservationDate)}?`)) {
            this.performCancellation(reservation.id);
        }
    }

    // Common cancellation logic
    private performCancellation(reservationId: number): void {
        this.cancellingReservation = true;
        this.popupError = null;
        this.emailNotificationMessage = null;

        this.parkingService.cancelReservation(reservationId).subscribe({
            next: () => {
                this.cancellingReservation = false;
                // UI message that email was sent
                this.emailNotificationMessage = 'A cancellation confirmation email has been sent to your account.';
                this.loadMyReservations();
                this.loadParkingSpaces();
            },
            error: (error) => {
                this.cancellingReservation = false;
                this.popupError = error.error?.message || 'Failed to cancel reservation';
            }
        });
    }

    // Normalize date format to ensure consistent comparison
    normalizeDate(date: string | Date): string {
        return DateUtils.normalizeDate(date);
    }

    closePopup(): void {
        this.showBookingPopup = false;
        this.showCancelPopup = false;
        this.selectedSpace = null;
        this.popupError = null;
        this.emailNotificationMessage = null;
        this.bookingInProgress = false;
        this.selectedSpotId = null;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
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

    // Helper to get the canonical spot number for a grid cell (used for placeholders)
    getSpotNumber(type: 'YARD' | 'GARAGE', row: number, col: number): number {
        const columns = 10; // both grids use 10 columns
        return row * columns + col + 1;
    }
}