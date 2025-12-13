import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService, User, Reservation } from '../../services/admin.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css'],
    standalone: false
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    users: User[] = [];
    reservations: Reservation[] = [];
    loadingUsers = false;
    loadingReservations = false;
    savingRoleUserId: string | null = null;
    revokingParkingId: string | null = null;
    private destroy$ = new Subject<void>();

    constructor(private adminService: AdminService, public auth: AuthService) {}

    ngOnInit(): void {
        this.loadUsers();
        this.loadReservations();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadUsers() {
        this.loadingUsers = true;
        this.adminService.getAllUsers()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingUsers = false))
            )
            .subscribe({
                next: (users: User[]) => (this.users = users),
                error: (err: any) => console.error('Failed to load users', err)
            });
    }

    loadReservations() {
        this.loadingReservations = true;
        this.adminService.getAllReservations()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingReservations = false))
            )
            .subscribe({
                next: (res: Reservation[]) => (this.reservations = res),
                error: (err: any) => console.error('Failed to load reservations', err)
            });
    }

    onRoleChangeEvent(user: User, event: Event) {
        const target = event.target as HTMLSelectElement;
        this.onRoleChange(user, target.value);
    }

    onRoleChange(user: User, newRole: string) {
        if (!user?.id) return;
        this.savingRoleUserId = user.id;
        this.adminService.updateUserRole(user.id, newRole)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.savingRoleUserId = null))
            )
            .subscribe({
                next: () => {
                    user.role = newRole;
                },
                error: (err: any) => {
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
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.revokingParkingId = null))
            )
            .subscribe({
                next: () => {
                    // reflect change locally (backend should remove ownership)
                    user.parkingId = null;
                    // refresh reservations if needed
                    this.loadReservations();
                },
                error: (err: any) => {
                    console.error('Failed to revoke parking', err);
                }
            });
    }

    // helper to show if logged-in is admin (depends on your AuthService)
    isAdmin(): boolean {
        return this.auth?.isAdmin || false;
    }
}