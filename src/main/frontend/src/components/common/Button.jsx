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

    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-light hover:shadow-primary/40 border border-transparent",
        secondary: "bg-surface-light text-slate-200 border border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20",
        ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10",
        outline: "bg-transparent border border-primary/50 text-primary hover:bg-primary/10"
    };

    const sizes = {
        xs: "px-2.5 py-1 text-xs gap-1.5",
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-6 py-3 text-base gap-3",
        icon: "size-9 p-0"
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
