import React, { useState } from 'react';
import { User } from 'lucide-react';
import type { AccountProfile } from '../types/workspace';

export function getNameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

interface UserAvatarProps {
  user: Pick<AccountProfile, 'name' | 'avatarColor' | 'avatarUrl'> | null;
  sizeClass?: string;
  textClass?: string;
  roundedClass?: string;
  fallbackIcon?: React.ReactNode;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  sizeClass = 'w-6 h-6',
  textClass = 'text-[10px]',
  roundedClass = 'rounded-full',
  fallbackIcon,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (!user) {
    return (
      <span
        aria-hidden="true"
        className={`${sizeClass} ${roundedClass} flex items-center justify-center text-white shrink-0`}
        style={{ backgroundColor: 'var(--accent-primary)' }}
      >
        {fallbackIcon ?? <User className="w-3.5 h-3.5" />}
      </span>
    );
  }

  if (user.avatarUrl && !imgFailed) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${sizeClass} ${roundedClass} object-cover shrink-0 border border-white/15`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${sizeClass} ${roundedClass} flex items-center justify-center font-bold text-white shrink-0 ${textClass}`}
      style={{ backgroundColor: user.avatarColor }}
    >
      {getNameInitials(user.name)}
    </span>
  );
};
