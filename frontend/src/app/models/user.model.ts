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

export interface OwnerCancellationRequest {
    cancellationDate: string;  // ISO date string
}

export interface Reservation {
    id?: number;
    parkingSpaceId: number;
    spotNumber?: number;
    reservationDate: string;  // ISO date string
    status?: string;
}

export interface ParkingSpace {
    id: number;
    parkingType: string;
    spotNumber: number;
    status: string;  // 'available', 'occupied', 'my-reservation', 'owner-cancelled'
}

export interface ReservationRequest {
    parkingSpaceId: number;
    reservationDate: string;  // ISO date string
}