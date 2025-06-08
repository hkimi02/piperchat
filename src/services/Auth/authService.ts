import apiClient from '../apiClient';

// Interfaces for request data
interface RegisterRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    organisation_name?: string;
    join_code?: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

interface AdminLoginRequest {
    email: string;
    password: string;
}

interface VerifyEmailRequest {
    email: string;
    verification_code: string;
}

interface ResendVerificationCodeRequest {
    email: string;
}

interface ForgetPasswordRequest {
    email: string;
}

interface VerifyResetPinRequest {
    email: string;
    pin: string;
}

interface ResendForgetPasswordRequest {
    email: string;
}

interface ResetPasswordRequest {
    email: string;
    pin: string;
    password: string;
}

// Interfaces for response data
interface AuthResponse {
    status: 'ok' | 'error';
    statusCode: number;
    message: string;
    data?: {
        user: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            role: string;
            organisation_id?: number;
        };
        organisation?: {
            id: number;
            name: string;
            slug: string;
            admin_id: number;
        };
        join_code?: string;
        access_token?: string;
    };
}

interface RefreshTokenResponse {
    access_token: string;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
        organisation_id?: number;
    };
}

interface UserResponse {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    organisation_id?: number;
}

// Auth Service Functions
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.data.status === 'ok' && response.data.data?.access_token) {
        localStorage.setItem('token', response.data.data.access_token);
    }
    return response.data;
};

export const verifyEmail = async (data: VerifyEmailRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-email', data);
    return response.data;
};

export const resendVerificationCode = async (data: ResendVerificationCodeRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/resend-verification-code', data);
    return response.data;
};

export const forgetPassword = async (data: ForgetPasswordRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/forget-password', data);
    return response.data;
};

export const verifyResetPin = async (data: VerifyResetPinRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-reset-pin', data);
    return response.data;
};

export const resendForgetPassword = async (data: ResendForgetPasswordRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/resend-forget-password', data);
    return response.data;
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/reset-password', data);
    return response.data;
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.data.status === 'ok' && response.data.data?.access_token) {
        localStorage.setItem('token', response.data.data.access_token);
    }
    return response.data;
};

export const adminLogin = async (data: AdminLoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/admin-login', data);
    if (response.data.status === 'ok' && response.data.data?.access_token) {
        localStorage.setItem('token', response.data.data.access_token);
    }
    return response.data;
};

export const logout = async (): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/logout');
    localStorage.removeItem('token');
    return response.data;
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh-token');
    return response.data;
};

export const getCurrentUser = async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response.data;
};