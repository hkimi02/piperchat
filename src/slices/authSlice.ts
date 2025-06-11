import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the user object
interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    organisation_id?: number;
}

// Define the shape of the auth state
interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    error: string | null;
    access_token: string | null;
}

// Initial state
const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    error: null,
    access_token: null,
};

// Create the auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (
            state,
            action: PayloadAction<{ user: User; access_token: string }>
        ) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.access_token = action.payload.access_token;
            state.error = null;
            console.log("state after loginSuccess:", state);
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.isAuthenticated = false;
            state.user = null;
            state.access_token = null;
            state.error = action.payload;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
            state.access_token = null;
            localStorage.removeItem('token');
        },
        refreshUser: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.access_token = action.payload.token;
            state.error = null;
        },
    },
});

// Export actions
export const { loginSuccess, loginFailure, logout, refreshUser } = authSlice.actions;

// Export reducer
export default authSlice.reducer;