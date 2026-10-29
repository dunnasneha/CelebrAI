import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { CreateEventView } from './views/CreateEventView';
import { EventWorkspaceView } from './views/EventWorkspaceView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StorageService } from './services/storageService';
import { CelebrationEvent, DashboardMetrics } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'create' | 'workspace'>('landing');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<string>('overview');
  const [events, setEvents] = useState<(CelebrationEvent & { total_tasks: number; completed_tasks: number; total_allocated: number })[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_events: 0,
    upcoming_events: 0,
    total_budget_sum: 0,
    completed_tasks: 0,
    total_tasks: 0
  });
  const [createEventType, setCreateEventType] = useState<string>('Wedding');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data and load events
  const refreshData = () => {
    StorageService.init();
    const all = StorageService.getAllEvents();
    setEvents(all);
    setMetrics(StorageService.getDashboardMetrics());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNavigate = (view: string, eventId?: string, tab: string = 'overview') => {
    if (view === 'workspace' && eventId) {
      setSelectedEventId(eventId);
      setWorkspaceTab(tab);
      setCurrentView('workspace');
    } else if (view === 'dashboard') {
      refreshData();
      setCurrentView('dashboard');
    } else if (view === 'create') {
      if (tab && tab !== 'overview') {
        setCreateEventType(tab);
      } else {
        setCreateEventType('Wedding');
      }
      setCurrentView('create');
    } else {
      setCurrentView('landing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateEvent = (eventId: string) => {
    const newId = StorageService.duplicateEvent(eventId);
    if (newId) {
      refreshData();
      showToast('Event duplicated successfully!');
      handleNavigate('workspace', newId);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    const success = StorageService.deleteEvent(eventId);
    if (success) {
      refreshData();
      showToast('Event removed successfully.');
      if (currentView === 'workspace' && selectedEventId === eventId) {
        setCurrentView('dashboard');
      }
    }
  };

  const sampleEventId = events.length > 0 ? events[0].id : undefined;
  const currentEvent = selectedEventId ? StorageService.getEventById(selectedEventId) : null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1F2937]">
        {/* Skip to Main Content Link for Accessibility (WCAG 2.4.1) */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2E1065] focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none"
        >
          Skip to main content
        </a>

        {/* Accessible Toast Notification */}
        {toastMessage && (
          <div 
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 bg-[#2E1065] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs sm:text-sm font-semibold flex items-center gap-2 border border-[#F59E0B]/30 animate-bounce"
          >
            <span aria-hidden="true">✨</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Navigation Header */}
        <Navbar currentView={currentView} onNavigate={handleNavigate} />

        {/* Main Landmark */}
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {currentView === 'landing' && (
          <LandingView onNavigate={handleNavigate} sampleEventId={sampleEventId} />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            events={events}
            metrics={metrics}
            onNavigate={handleNavigate}
            onDuplicate={handleDuplicateEvent}
            onDelete={handleDeleteEvent}
          />
        )}

        {currentView === 'create' && (
          <CreateEventView
            initialEventType={createEventType}
            onCancel={() => handleNavigate('dashboard')}
            onSuccess={(newEventId) => {
              refreshData();
              showToast('Celebration plan generated successfully!');
              handleNavigate('workspace', newEventId);
            }}
          />
        )}

        {currentView === 'workspace' && currentEvent && (
          <EventWorkspaceView
            event={currentEvent}
            initialTab={workspaceTab}
            onBack={() => handleNavigate('dashboard')}
            onRefresh={refreshData}
            onDuplicate={handleDuplicateEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
    </ErrorBoundary>
  );
}

export default App;
