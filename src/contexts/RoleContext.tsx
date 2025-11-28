import { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'Student' | 'Tutor' | 'Manager' | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  userName: string | null;
  setUserName: (userName: string | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <RoleContext.Provider value={{ role, setRole, userId, setUserId, userName, setUserName }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

