import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, JwtResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/api/auth';
    private tokenKey = 'auth_token';
    private userKey = 'current_user';

    private currentUserSubject: BehaviorSubject<JwtResponse | null>;
    public currentUser: Observable<JwtResponse | null>;

    constructor(private http: HttpClient) {
        const storedUser = localStorage.getItem(this.userKey);
        this.currentUserSubject = new BehaviorSubject<JwtResponse | null>(
            storedUser ? JSON.parse(storedUser) : null
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): JwtResponse | null {
        return this.currentUserSubject.value;
    }

    login(credentials: LoginRequest): Observable<JwtResponse> {
        return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                    // Store token under the main key and a legacy/alternate key for compatibility
                    localStorage.setItem(this.tokenKey, response.token);
                    localStorage.setItem('token', response.token);
                    localStorage.setItem(this.userKey, JSON.stringify(response));
                    this.currentUserSubject.next(response);
                })
            );
    }

    register(userData: RegisterRequest): Observable<JwtResponse> {
        return this.http.post<JwtResponse>(`${this.apiUrl}/register`, userData)
            .pipe(
                tap(response => {
                    // Store token under the main key and a legacy/alternate key for compatibility
                    localStorage.setItem(this.tokenKey, response.token);
                    localStorage.setItem('token', response.token);
                    localStorage.setItem(this.userKey, JSON.stringify(response));
                    this.currentUserSubject.next(response);
                })
            );
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('token');
        localStorage.removeItem(this.userKey);
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        // Check multiple possible places for the token to be present for backwards compatibility
        const fromKey = localStorage.getItem(this.tokenKey) || localStorage.getItem('token');
        if (fromKey) return fromKey;

        // Fallback: token might be embedded in the stored user object
        const user = this.currentUserValue as any;
        if (user && user.token) return user.token;
        if (user && user.accessToken) return user.accessToken;

        return null;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}