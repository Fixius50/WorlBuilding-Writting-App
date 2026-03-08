import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const Avatar = ({ url, name, alt = "User", size = "md", className }) => {
    const sizeClasses = {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-16 text-lg",
        xl: "size-32 text-2xl"
    };

    const initial = name ? name.charAt(0).toUpperCase() : (alt ? alt.charAt(0).toUpperCase() : "?");

    return (
        <div className={twMerge(
            "rounded-full bg-surface-light border border-white/10 flex items-center justify-center overflow-hidden shrink-0 text-slate-400 font-bold select-none",
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
