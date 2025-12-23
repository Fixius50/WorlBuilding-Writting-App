import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const GlassPanel = ({ children, className, ...props }) => {
    return (
        <div
            className={twMerge(
                "bg-glass backdrop-blur-xl border border-glass-border rounded-xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassPanel;
