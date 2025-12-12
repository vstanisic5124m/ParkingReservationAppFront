import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private apiUrl = 'http://localhost:8080/api/admin';

    constructor(private http: HttpClient) {}

    getUsers(pageIndex: number, pageSize: number, search: string, sort?: string): Observable<{ items: any[]; total: number }> {
        const params = new HttpParams()
            .set('page', (pageIndex || 0).toString())
            .set('size', (pageSize || 10).toString())
            .set('search', search || '')
            .set('sort', sort || '');

        return this.http.get<any>(`${this.apiUrl}/users`, { params }).pipe(
            map(res => {
                const items = res.items || res || [];
                if (!items || items.length === 0) {
                    // seed demo users
                    return { items: this.demoUsers(), total: this.demoUsers().length };
                }
                return { items, total: res.total || (items.length) };
            }),
            catchError(err => {
                console.warn('[AdminService] getUsers failed, returning demo data', err);
                return of({ items: this.demoUsers(), total: this.demoUsers().length });
            })
        );
    }

    getReservations(pageIndex: number, pageSize: number, search: string, sort?: string): Observable<{ items: any[]; total: number }> {
        const params = new HttpParams()
            .set('page', (pageIndex || 0).toString())
            .set('size', (pageSize || 10).toString())
            .set('search', search || '')
            .set('sort', sort || '');

        return this.http.get<any>(`${this.apiUrl}/reservations`, { params }).pipe(
            map(res => {
                const items = res.items || res || [];
                if (!items || items.length === 0) {
                    return { items: this.demoReservations(), total: this.demoReservations().length };
                }
                return { items, total: res.total || (items.length) };
            }),
            catchError(err => {
                console.warn('[AdminService] getReservations failed, returning demo data', err);
                return of({ items: this.demoReservations(), total: this.demoReservations().length });
            })
        );
    }

    setAdmin(userId: number, isAdmin: boolean): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/${userId}/admin`, { isAdmin }).pipe(
            catchError(err => {
                console.warn('[AdminService] setAdmin failed, returning fallback', err);
                return of(null);
            })
        );
    }

    setOwner(userId: number, makeOwner: boolean): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/${userId}/owner`, { makeOwner }).pipe(
            catchError(err => {
                console.warn('[AdminService] setOwner failed, returning fallback', err);
                return of(null);
            })
        );
    }

    deleteUser(userId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${userId}`).pipe(
            catchError(err => {
                console.warn('[AdminService] deleteUser failed, returning fallback', err);
                return of(null);
            })
        );
    }

    cancelReservation(reservationId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/reservations/${reservationId}`).pipe(
            catchError(err => {
                console.warn('[AdminService] cancelReservation failed, returning fallback', err);
                return of(null);
            })
        );
    }

    // Demo data helpers
    private demoUsers() {
        return [
            { id: 1, email: 'owner1@example.com', firstName: 'Owner', lastName: 'One', isAdmin: false, parkingType: 'OWNER' },
            { id: 2, email: 'user2@example.com', firstName: 'User', lastName: 'Two', isAdmin: false, parkingType: 'USER' },
            { id: 3, email: 'admin@example.com', firstName: 'Admin', lastName: 'User', isAdmin: true, parkingType: 'USER' }
        ];
    }

    private demoReservations() {
        return [
            { id: 101, userEmail: 'user2@example.com', spot: 12, start: '2025-12-20', end: '2025-12-20' },
            { id: 102, userEmail: 'owner1@example.com', spot: 5, start: '2025-12-22', end: '2025-12-22' }
        ];
    }
}
