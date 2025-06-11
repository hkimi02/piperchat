import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotAuthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
                <p className="text-lg mb-6 text-muted-foreground">
                    You do not have permission to access this page.
                </p>
                <Button
                    onClick={() => navigate('/')}
                    className="px-6 py-2"
                >
                    Go to Home
                </Button>
            </div>
        </div>
    );
};

export default NotAuthorized;