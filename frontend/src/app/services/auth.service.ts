import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, JwtResponse } from '../models/user.model';

export interface CurrentUser {
    token: string;
    type: string;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    ownedParkingSpaceId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/api/auth';
    private tokenKey = 'auth_token';
    private userKey = 'current_user';

    private currentUserSubject: BehaviorSubject<CurrentUser | null>;
    public currentUser: Observable<CurrentUser | null>;
    isAdmin: boolean = false;


    constructor(private http: HttpClient) {
        const storedUser = localStorage.getItem(this.userKey);
        const user: CurrentUser | null = storedUser ? JSON.parse(storedUser) : null;
        this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(user);
        this.currentUser = this.currentUserSubject.asObservable();
        this.isAdmin = user?.role === 'ADMIN';
    }

    private setCurrentUser(user: CurrentUser | null): void {
        this.currentUserSubject.next(user);
        this.isAdmin = user?.role === 'ADMIN';
    }

    public get currentUserValue(): CurrentUser | null {
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
                    this.setCurrentUser(response);
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
                    this.setCurrentUser(response);
                })
            );
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('token');
        localStorage.removeItem(this.userKey);
        this.setCurrentUser(null);
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