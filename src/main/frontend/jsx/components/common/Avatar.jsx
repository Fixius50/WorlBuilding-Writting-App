import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const Avatar = ({ url, alt = "User", size = "md", className }) => {
    const sizeClasses = {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-16 text-lg",
        xl: "size-32 text-2xl"
    };

    return (
        <div className={twMerge(
            "rounded-full bg-surface-light border border-white/10 flex items-center justify-center overflow-hidden shrink-0",
            sizeClasses[size],
            className
        )}>
            {url ? (
                <img src={url} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <span className="font-bold text-slate-400">{alt.charAt(0)}</span>
            )}
        </div>
    );
};

export default Avatar;
