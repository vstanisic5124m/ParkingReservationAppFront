import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { AdminService } from './admin.service';
import { Reservation, ParkingSpace, JwtResponse, User } from '../../models/user.model';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements AfterViewInit, OnDestroy {
    // Users table (simple array wrapper to avoid Angular Material dependency)
    usersDataSource: { data: User[] } = { data: [] };
    usersDisplayedColumns = ['id', 'email', 'name', 'isAdmin', 'actions'];
    usersTotal = 0;
    usersPageSize = 10;
    usersPageIndex = 0;
    usersLoading = false;
    usersSearch = new FormControl('');

    // Reservations table
    reservationsDataSource: { data: Reservation[] } = { data: [] };
    reservationsDisplayedColumns = ['id', 'userEmail', 'spot', 'start', 'end', 'actions'];
    reservationsTotal = 0;
    reservationsPageSize = 10;
    reservationsPageIndex = 0;
    reservationsLoading = false;
    reservationsSearch = new FormControl('');

    private destroy$ = new Subject<void>();

    constructor(private adminService: AdminService, private toast: ToastService) {}

    ngAfterViewInit(): void {
        // Initial load
        this.loadUsers();
        this.loadReservations();

        // Users search stream (debounced)
        this.usersSearch.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.usersPageIndex = 0;
            this.loadUsers();
        });

        // Reservations search stream
        this.reservationsSearch.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.reservationsPageIndex = 0;
            this.loadReservations();
        });
    }

    private buildSortParam(sort?: {active?: string, direction?: string}): string | undefined {
        if (!sort || !sort.active) return undefined;
        return `${sort.active},${sort.direction || 'asc'}`;
    }

    loadUsers(): void {
        this.usersLoading = true;
        const sort = this.buildSortParam();
        this.adminService.getUsers(this.usersPageIndex, this.usersPageSize, this.usersSearch.value || '', sort).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (res: any) => {
                this.usersDataSource.data = res.items || [];
                this.usersTotal = res.total || 0;
                this.usersLoading = false;
            },
            error: (err: any) => {
                this.usersLoading = false;
                console.error('Failed to load users', err);
                this.toast.error('Failed to load users');
            }
        });
    }

    loadReservations(): void {
        this.reservationsLoading = true;
        const sort = this.buildSortParam();
        this.adminService.getReservations(this.reservationsPageIndex, this.reservationsPageSize, this.reservationsSearch.value || '', sort).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (res: any) => {
                this.reservationsDataSource.data = res.items || [];
                this.reservationsTotal = res.total || 0;
                this.reservationsLoading = false;
            },
            error: (err: any) => {
                this.reservationsLoading = false;
                console.error('Failed to load reservations', err);
                this.toast.error('Failed to load reservations');
            }
        });
    }

    onUsersPage(e: any): void {
        this.usersPageIndex = e.pageIndex || this.usersPageIndex;
        this.usersPageSize = e.pageSize || this.usersPageSize;
        this.loadUsers();
    }

    onReservationsPage(e: any): void {
        this.reservationsPageIndex = e.pageIndex || this.reservationsPageIndex;
        this.reservationsPageSize = e.pageSize || this.reservationsPageSize;
        this.loadReservations();
    }

    onToggleAdmin(user: User): void {
        const original = !!user.isAdmin;
        user.isAdmin = !original;
        this.adminService.setAdmin(user.id!, user.isAdmin).pipe(takeUntil(this.destroy$)).subscribe({
             next: () => {
                this.toast.success('User admin status updated');
             },
             error: err => {
                 user.isAdmin = original;
                 console.error(err);
                 this.toast.error('Failed to update user admin status');
             }
         });
    }

    onToggleOwner(user: User): void {
        const original = !!user.parkingType && user.parkingType === 'OWNER';
        const makeOwner = !original;
        // Optimistic UI update
        user.parkingType = makeOwner ? 'OWNER' : 'USER';
        this.adminService.setOwner(user.id!, makeOwner).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.toast.success(makeOwner ? 'User is now Owner' : 'User removed from Owner role');
            },
            error: err => {
                // revert
                user.parkingType = original ? 'OWNER' : 'USER';
                console.error(err);
                this.toast.error('Failed to update owner status');
            }
        });
    }

    onDeleteUser(user: User): void {
        if (!confirm(`Delete user ${user.email}? This is irreversible.`)) return;
        this.adminService.deleteUser(user.id!).pipe(takeUntil(this.destroy$)).subscribe({
             next: () => {
                this.toast.success('User deleted');
                 this.loadUsers();
             },
             error: err => {
                 console.error(err);
                 this.toast.error('Failed to delete user');
             }
         });
    }

    onCancelReservation(r: Reservation): void {
        if (!confirm(`Cancel reservation ${r.id}?`)) return;
        this.adminService.cancelReservation(r.id!).pipe(takeUntil(this.destroy$)).subscribe({
             next: () => {
                this.toast.success('Reservation cancelled');
                 this.loadReservations();
             },
             error: err => {
                 console.error(err);
                 this.toast.error('Failed to cancel reservation');
             }
         });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}