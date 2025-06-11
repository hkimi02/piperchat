import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
    className?: string;
}

const Loader: React.FC<LoaderProps> = ({ className }) => {
    return (
        <div
            className={cn(
                'flex h-screen items-center justify-center bg-background',
                className
            )}
        >
            <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};

export default Loader;