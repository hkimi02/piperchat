import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import echo from '@/services/echo';
import type { RootState } from '@/store/store';
import { useCallStatus } from '@/hooks/useCallStatus';

const AuthenticatedLayout = () => {
    useCallStatus();

    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user && echo.connector) {
            console.log('AuthenticatedLayout: Echo connector found, connection should be active.');
        } else if (!user) {
            echo.disconnect();
            console.log('AuthenticatedLayout: User logged out, Echo disconnected.');
        }
    }, [user]);

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <AuthenticatedNavbar />
            <main className="flex-grow overflow-y-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default AuthenticatedLayout;
