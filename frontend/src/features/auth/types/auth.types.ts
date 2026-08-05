export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    expiresAtUtc: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}