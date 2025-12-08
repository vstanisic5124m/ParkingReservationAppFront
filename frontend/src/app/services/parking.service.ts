import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParkingSpace, Reservation, ReservationRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class ParkingService {
    private apiUrl = 'http://localhost:8080/api';

    constructor(private http: HttpClient) {}

    getParkingSpaces(date: string): Observable<ParkingSpace[]> {
        return this.http.get<ParkingSpace[]>(`${this.apiUrl}/parking/spaces?date=${date}`);
    }

    createReservation(request: ReservationRequest): Observable<Reservation> {
        return this.http.post<Reservation>(`${this.apiUrl}/reservations`, request);
    }

    cancelReservation(reservationId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/reservations/${reservationId}`);
    }
}