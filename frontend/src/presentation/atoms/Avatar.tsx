import React from 'react';
import { twMerge } from "tailwind-merge";
import { Size, BaseProps } from '@domain/models/ui';

interface AvatarProps extends BaseProps {
 url?: string | null;
 name?: string;
 alt?: string;
 size?: Size;
}

const Avatar: React.FC<AvatarProps> = ({ url, name, alt = "User", size = "md", className }) => {
 const sizeClasses: Record<Size, string> = {
 xs: "size-6 text-[8px]",
 sm: "size-8 text-[10px]",
 md: "size-10 text-xs",
 lg: "size-16 text-lg",
 xl: "size-32 text-2xl",
 icon: "size-9 text-xs"
 };

 const initial = name ? name.charAt(0).toUpperCase() : (alt ? alt.charAt(0).toUpperCase() : "?");

 return (
 <div className={twMerge(
 "rounded-full monolithic-panel flex items-center justify-center overflow-hidden shrink-0 text-foreground/60 font-black select-none shadow-inner",
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
