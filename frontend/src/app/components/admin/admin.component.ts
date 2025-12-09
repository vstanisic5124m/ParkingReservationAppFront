import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { AdminService } from './admin.service';
import { User } from '../models/user';
import { Reservation } from '../models/reservation';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Subject, merge, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements AfterViewInit, OnDestroy {
    // Users table
    usersDataSource = new MatTableDataSource<User>([]);
    usersDisplayedColumns = ['id', 'email', 'name', 'isAdmin', 'actions'];
    usersTotal = 0;
    usersPageSize = 10;
    usersPageIndex = 0;
    usersLoading = false;
    usersSearch = new FormControl('');

    // Reservations table
    reservationsDataSource = new MatTableDataSource<Reservation>([]);
    reservationsDisplayedColumns = ['id', 'userEmail', 'spot', 'start', 'end', 'actions'];
    reservationsTotal = 0;
    reservationsPageSize = 10;
    reservationsPageIndex = 0;
    reservationsLoading = false;
    reservationsSearch = new FormControl('');

    private destroy$ = new Subject<void>();

    @ViewChild('usersPaginator') usersPaginator!: MatPaginator;
    @ViewChild('usersSort') usersSort!: MatSort;
    @ViewChild('reservationsPaginator') reservationsPaginator!: MatPaginator;
    @ViewChild('reservationsSort') reservationsSort!: MatSort;

    constructor(private adminService: AdminService, private snack: MatSnackBar) {}

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

        // Sorting (listen for sort changes)
        this.usersSort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.usersPageIndex = 0;
            this.loadUsers();
        });

        this.reservationsSort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.reservationsPageIndex = 0;
            this.loadReservations();
        });
    }

    private buildSortParam(sort: MatSort | {active?: string, direction?: string}): string | undefined {
        if (!sort || !('active' in sort) || !sort.active) return undefined;
        return `${sort.active},${(sort as any).direction || 'asc'}`;
    }

    loadUsers(): void {
        this.usersLoading = true;
        const sort = this.buildSortParam(this.usersSort);
        this.adminService.getUsers(this.usersPageIndex, this.usersPageSize, this.usersSearch.value || '', sort).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: res => {
                this.usersDataSource.data = res.items || [];
                this.usersTotal = res.total || 0;
                this.usersLoading = false;
            },
            error: err => {
                this.usersLoading = false;
                this.snack.open('Failed to load users', 'Close', { duration: 4000 });
                console.error(err);
            }
        });
    }

    loadReservations(): void {
        this.reservationsLoading = true;
        const sort = this.buildSortParam(this.reservationsSort);
        this.adminService.getReservations(this.reservationsPageIndex, this.reservationsPageSize, this.reservationsSearch.value || '', sort).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: res => {
                this.reservationsDataSource.data = res.items || [];
                this.reservationsTotal = res.total || 0;
                this.reservationsLoading = false;
            },
            error: err => {
                this.reservationsLoading = false;
                this.snack.open('Failed to load reservations', 'Close', { duration: 4000 });
                console.error(err);
            }
        });
    }

    onUsersPage(e: PageEvent): void {
        this.usersPageIndex = e.pageIndex;
        this.usersPageSize = e.pageSize;
        this.loadUsers();
    }

    onReservationsPage(e: PageEvent): void {
        this.reservationsPageIndex = e.pageIndex;
        this.reservationsPageSize = e.pageSize;
        this.loadReservations();
    }

    onToggleAdmin(user: User): void {
        const original = !!user.isAdmin;
        user.isAdmin = !original;
        this.adminService.setAdmin(user.id, user.isAdmin).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.snack.open('User admin status updated', 'Close', { duration: 3000 });
            },
            error: err => {
                user.isAdmin = original;
                this.snack.open('Failed to update user admin status', 'Close', { duration: 4000 });
                console.error(err);
            }
        });
    }

    onDeleteUser(user: User): void {
        if (!confirm(`Delete user ${user.email}? This is irreversible.`)) return;
        this.adminService.deleteUser(user.id).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.snack.open('User deleted', 'Close', { duration: 3000 });
                this.loadUsers();
            },
            error: err => {
                this.snack.open('Failed to delete user', 'Close', { duration: 4000 });
                console.error(err);
            }
        });
    }

    onCancelReservation(r: Reservation): void {
        if (!confirm(`Cancel reservation ${r.id}?`)) return;
        this.adminService.cancelReservation(r.id).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.snack.open('Reservation cancelled', 'Close', { duration: 3000 });
                this.loadReservations();
            },
            error: err => {
                this.snack.open('Failed to cancel reservation', 'Close', { duration: 4000 });
                console.error(err);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}