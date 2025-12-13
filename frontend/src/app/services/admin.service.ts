import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare global {
    interface Window {
        API_BASE_URL?: string;
    }
}

export interface User {
    id: string;
    username: string;
    email?: string;
    role?: string;
    parkingId?: string | null;
    // add other fields your backend returns
}

export interface Reservation {
    id: string;
    userId: string;
    parkingId: string;
    startTime: string;
    endTime: string;
    status?: string;
    // add other fields your backend returns
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private baseUrl: string = (typeof window !== 'undefined' && window.API_BASE_URL) || '';

    constructor(private http: HttpClient) {}

    // GET all users (admin-only)
    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/api/admin/users`);
    }

    // GET all reservations (admin-only)
    getAllReservations(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.baseUrl}/api/admin/reservations`);
    }

    // Update a user's role. Body: { role: 'ADMIN' | 'USER' }
    updateUserRole(userId: string, role: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/api/admin/users/${userId}/role`, { role });
    }

    // Revoke/Take a parking spot from owner (admin-only)
    // Assumes backend route: PUT /api/admin/parkings/{parkingId}/revoke
    revokeParkingFromUser(parkingId: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/api/admin/parkings/${parkingId}/revoke`, {});
    }
}