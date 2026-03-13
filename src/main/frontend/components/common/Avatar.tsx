import React from 'react';
import { twMerge } from "tailwind-merge";

interface AvatarProps {
    url?: string | null;
    name?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ url, name, alt = "User", size = "md", className }) => {
    const sizeClasses = {
        sm: "size-8 text-[10px]",
        md: "size-10 text-xs",
        lg: "size-16 text-lg",
        xl: "size-32 text-2xl"
    };

    const initial = name ? name.charAt(0).toUpperCase() : (alt ? alt.charAt(0).toUpperCase() : "?");

    return (
        <div className={twMerge(
            "rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 text-slate-400 font-black select-none shadow-inner",
            sizeClasses[size],
            className
        )}>
            {url ? (
                <img src={url} alt={name || alt} className="w-full h-full object-cover" />
            ) : (
                <span>{initial}</span>
            )}
        </div>
    );
};

export default Avatar;
