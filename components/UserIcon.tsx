
import React from 'react';
import { UserSilhouetteIcon } from './icons';

interface UserIconProps {
  name: string;
  color: string;
  className?: string;
}

const UserIcon: React.FC<UserIconProps> = ({ name, color, className }) => {
  return (
    <div title={name} className={`flex items-center justify-center rounded-full ${color} ${className}`}>
      <UserSilhouetteIcon className="w-3/5 h-3/5 text-white" />
    </div>
  );
};

export default UserIcon;
