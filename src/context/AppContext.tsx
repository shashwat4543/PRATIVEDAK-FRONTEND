import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  ProjectReviewAction,
  ReviewStatus,
  UserRole,
  UserSession,
} from '../types';
import { resolveFeaturedMPId, subscribeColdStart } from '../services/api';

export type AppView =
  | 'landing'
  | 'login'
  | 'national-dashboard'
  | 'mp-directory'
  | 'mp-profile'
  | 'anomalies'
  | 'state-explorer'
  | 'review-queue';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  currentView: AppView;
  selectedMpId: number | null;
  selectedState: string | null;
  userSession: UserSession;
  isWakingUp: boolean;
  toasts: ToastMessage[];
  reviewActions: Record<number, ProjectReviewAction>;
  setCurrentView: (view: AppView) => void;
  navigateTo: (view: AppView, params?: { mpId?: number; stateName?: string }) => void;
  setUserSession: (session: UserSession) => void;
  logout: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  takeReviewAction: (projectId: number, status: ReviewStatus, note?: string) => void;
  getProjectReviewStatus: (projectId: number) => ReviewStatus;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SESSION: UserSession = {
  role: 'citizen',
  username: 'Public Citizen',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedMpId, setSelectedMpId] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<UserSession>(DEFAULT_SESSION);
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [reviewActions, setReviewActions] = useState<Record<number, ProjectReviewAction>>({});

  useEffect(() => {
    // Dynamically resolve prime case study MP ID on session init
    resolveFeaturedMPId().then((id) => {
      if (id) {
        setSelectedMpId((prev) => (prev === null ? id : prev));
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeColdStart((wakingUp) => {
      setIsWakingUp(wakingUp);
    });
    return unsubscribe;
  }, []);

  const navigateTo = (view: AppView, params?: { mpId?: number; stateName?: string }) => {
    if (params?.mpId !== undefined) {
      setSelectedMpId(params.mpId);
    }
    if (params?.stateName !== undefined) {
      setSelectedState(params.stateName);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logout = () => {
    setUserSession(DEFAULT_SESSION);
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'Returned to Citizen public access mode.',
    });
    navigateTo('landing');
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const takeReviewAction = (projectId: number, status: ReviewStatus, note?: string) => {
    setReviewActions((prev) => ({
      ...prev,
      [projectId]: {
        projectId,
        status,
        actionByRole: userSession.role,
        actionByUsername: userSession.username,
        timestamp: new Date().toISOString(),
        note,
      },
    }));

    if (status === 'escalated') {
      addToast({
        type: 'warning',
        title: 'Flagged Project Escalated',
        message: `Project #${projectId} escalated to State Authority for formal audit inquiry.`,
      });
    } else if (status === 'resolved') {
      addToast({
        type: 'success',
        title: 'Project Marked as Resolved',
        message: `Project #${projectId} logged as reviewed and resolved in session.`,
      });
    }
  };

  const getProjectReviewStatus = (projectId: number): ReviewStatus => {
    return reviewActions[projectId]?.status || 'pending';
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        selectedMpId,
        selectedState,
        userSession,
        isWakingUp,
        toasts,
        reviewActions,
        setCurrentView,
        navigateTo,
        setUserSession,
        logout,
        addToast,
        removeToast,
        takeReviewAction,
        getProjectReviewStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
