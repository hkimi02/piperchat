import React from 'react';
import { Button } from '@/components/ui/button'; // Shadcn/UI Button component
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils'; // Shadcn/UI utility for className concatenation

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
                <p className="text-lg mb-6 text-muted-foreground">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Button
                    onClick={() => navigate('/')}
                    className="px-6 py-2"
                >
                    Back to Home
                </Button>
            </div>
        </div>
    );
};

export default NotFound;