import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Variant, Size, IconProps } from '../../types/ui';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, IconProps {
 variant?: Variant;
 size?: Size;
 isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
 children,
 variant = 'primary',
 size = 'md',
 className,
 icon,
 isLoading,
 ...props
}, ref) => {

 const baseStyles = "inline-flex items-center justify-center rounded-none font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

 const variants = {
 primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary-light hover:shadow-primary/40 border border-transparent",
 secondary: "monolithic-panel text-foreground/80 hover:bg-foreground/5 hover:text-foreground hover:border-foreground/40",
 ghost: "bg-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5",
 danger: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:border-destructive/50 hover:shadow-lg hover:shadow-destructive/10",
 outline: "bg-transparent border border-primary/50 text-primary hover:bg-primary/10"
 };

 const sizes: Record<Size, string> = {
 xs: "px-2.5 py-1 text-xs gap-1.5",
 sm: "px-3 py-1.5 text-xs gap-1.5",
 md: "px-4 py-2 text-sm gap-2",
 lg: "px-6 py-3 text-base gap-3",
 xl: "px-8 py-4 text-lg gap-4",
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
