import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OwnerCancellationRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class OwnerService {
    private apiUrl = 'http://localhost:8080/api/owner';

    constructor(private http: HttpClient) {}

    cancelSpotAvailability(request: OwnerCancellationRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/cancel`, request);
    }
}