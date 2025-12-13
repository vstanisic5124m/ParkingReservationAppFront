import { Component, OnInit } from '@angular/core';
// @ts-ignore
import { AdminService, User, Reservation} from 'frontend/src/app/services/admin.service.ts';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
    users: User[] = [];
    reservations: Reservation[] = [];
    loadingUsers = false;
    loadingReservations = false;
    savingRoleUserId: string | null = null;
    revokingParkingId: string | null = null;

    constructor(private adminService: AdminService, public auth: AuthService) {}

    ngOnInit(): void {
        this.loadUsers();
        this.loadReservations();
    }

    loadUsers() {
        this.loadingUsers = true;
        this.adminService.getAllUsers()
            .pipe(finalize(() => (this.loadingUsers = false)))
            .subscribe({
                next: users => (this.users = users),
                error: err => console.error('Failed to load users', err)
            });
    }

    loadReservations() {
        this.loadingReservations = true;
        this.adminService.getAllReservations()
            .pipe(finalize(() => (this.loadingReservations = false)))
            .subscribe({
                next: res => (this.reservations = res),
                error: err => console.error('Failed to load reservations', err)
            });
    }

    onRoleChange(user: User, newRole: string) {
        if (!user?.id) return;
        this.savingRoleUserId = user.id;
        this.adminService.updateUserRole(user.id, newRole)
            .pipe(finalize(() => (this.savingRoleUserId = null)))
            .subscribe({
                next: () => {
                    user.role = newRole;
                },
                error: err => {
                    console.error('Failed to update role', err);
                    // Optionally show UI feedback
                }
            });
    }

    revokeParking(user: User) {
        const parkingId = user.parkingId;
        if (!parkingId) return;
        this.revokingParkingId = parkingId;
        this.adminService.revokeParkingFromUser(parkingId)
            .pipe(finalize(() => (this.revokingParkingId = null)))
            .subscribe({
                next: () => {
                    // reflect change locally (backend should remove ownership)
                    user.parkingId = null;
                    // refresh reservations if needed
                    this.loadReservations();
                },
                error: err => {
                    console.error('Failed to revoke parking', err);
                }
            });
    }

    // helper to show if logged-in is admin (depends on your AuthService)
    isAdmin(): boolean {
        return this.auth?.isAdmin ? this.auth.isAdmin() : (this.auth?.currentUser?.role === 'ADMIN');
    }
}