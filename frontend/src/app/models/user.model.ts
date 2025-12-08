export interface User {
    id?: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

export interface JwtResponse {
    token: string;
    type: string;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
}