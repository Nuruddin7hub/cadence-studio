import React, { useEffect, useRef } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { InspectorRail, MobileInspectorSheet } from './components/InspectorRail';
import { TasksWorkspace } from './components/TasksWorkspace';
import { FocusHabitsStudio } from './components/FocusHabitsStudio';
import { AnalyticsSuite } from './components/AnalyticsSuite';
import { ProductivityOverview } from './components/ProductivityOverview';
import { RewardsStudio } from './components/RewardsStudio';
import { ComebackModal } from './components/ComebackModal';
import { CommandPalette } from './components/CommandPalette';
import { AccountModal } from './components/AccountModal';
import { InstallAppModal } from './components/InstallAppModal';
import { FocusCurtain } from './components/FocusCurtain';
import { MobileDock } from './components/MobileDock';
import { ToastStack } from './components/ToastStack';
import { ClickSpark } from './lib/reactbits';

const WorkspaceShell: React.FC = () => {
  const { activeTab, setActiveTab, importCalendarIcs } = useWorkspace();
  const globalIcsRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onTrigger = () => globalIcsRef.current?.click();
    window.addEventListener('cadence:open-ics-import', onTrigger);
    return () => window.removeEventListener('cadence:open-ics-import', onTrigger);
  }, []);

  return (
    <ClickSpark
      sparkColor={['#E74004', '#F4C46C', '#14A4FC', '#FFFFFF']}
      sparkSize={10}
      sparkRadius={22}
      sparkCount={9}
      duration={420}
      glow={0.45}
      className="min-h-screen h-screen"
    >
      <div className="min-h-screen h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--ink-primary)] pb-14 md:pb-0">
        <TopBar />

        <main className="flex-1 min-h-0 flex overflow-hidden">
          {activeTab === 'planner' && <Sidebar />}

          {activeTab === 'planner' && (
            <>
              <CalendarView />
              <InspectorRail />
            </>
          )}

          {activeTab === 'tasks' && <TasksWorkspace />}

          {activeTab === 'focus' && <FocusHabitsStudio />}

          {activeTab === 'analytics' && <AnalyticsSuite />}

          {activeTab === 'rewards' && <RewardsStudio />}

          {activeTab === 'overview' && <ProductivityOverview />}
        </main>

        <MobileDock />
        <MobileInspectorSheet />
        <CommandPalette />
        <AccountModal />
        <ComebackModal />
        <InstallAppModal />
        <FocusCurtain />
        <ToastStack />
        <input
          ref={globalIcsRef}
          type="file"
          accept=".ics,text/calendar"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            void file.text().then((txt) => {
              const res = importCalendarIcs(txt);
              if (res.ok) setActiveTab('planner');
            });
            e.target.value = '';
          }}
        />
      </div>
    </ClickSpark>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}
