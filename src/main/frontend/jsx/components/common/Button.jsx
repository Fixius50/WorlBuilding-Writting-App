import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = forwardRef(({
    children,
    variant = 'primary', // primary, secondary, ghost, danger
    size = 'md', // sm, md, lg
    className,
    icon,
    isLoading,
    ...props
}, ref) => {

    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 border border-transparent",
        secondary: "bg-surface-light hover:bg-surface-lighter text-slate-200 border border-glass-border",
        ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-6 py-3 text-base gap-3"
    };

    return (
        <button
            ref={ref}
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : icon ? (
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
            ) : null}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
