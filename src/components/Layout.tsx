import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isRTL } = useLanguage();

  return (
    <SidebarProvider>
      <div className={`min-h-screen w-full flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div className="hidden lg:block">
                <SidebarTrigger />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto px-4 lg:px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};