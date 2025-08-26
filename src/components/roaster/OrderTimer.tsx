import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEADLINE_MINUTES = 120;

const formatTime = (milliseconds: number) => {
    if (milliseconds < 0) milliseconds = 0;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const OrderTimer = ({ createdAt }: { createdAt: string }) => {
    const [remainingTime, setRemainingTime] = useState('');
    const [isOvertime, setIsOvertime] = useState(false);

    useEffect(() => {
        const deadline = new Date(createdAt).getTime() + DEADLINE_MINUTES * 60 * 1000;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = deadline - now;
            
            setRemainingTime(formatTime(diff));
            
            if (diff < 0) {
                setIsOvertime(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [createdAt]);

    return (
        <div className={cn(
            "flex items-center gap-2 text-lg font-mono bg-muted px-3 py-1 rounded-md",
            isOvertime && "bg-destructive text-destructive-foreground animate-pulse"
        )}>
            <Timer className="h-5 w-5" />
            <span>{remainingTime}</span>
        </div>
    );
};

export default OrderTimer;