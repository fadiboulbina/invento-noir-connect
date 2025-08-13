import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Truck,
  BarChart3,
  ChevronRight,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  {
    title: 'dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'products',
    url: '/products',
    icon: Package,
  },
  {
    title: 'customers',
    url: '/customers',
    icon: Users,
  },
  {
    title: 'orders',
    url: '/orders',
    icon: ShoppingCart,
  },
  {
    title: 'shippers',
    url: '/shippers',
    icon: Truck,
  },
  {
    title: 'priceComparison',
    url: '/price-comparison',
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { t, isRTL } = useLanguage();
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar
      className={`
        ${collapsed ? 'w-16' : 'w-64'} 
        transition-all duration-300 ease-in-out
        bg-sidebar border-sidebar-border
        ${isRTL ? 'border-l' : 'border-r'}
      `}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground text-lg">
                {t.inventoryManagement}
              </h2>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium ${collapsed ? 'sr-only' : ''}`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                          ${active 
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                          }
                          ${collapsed ? 'justify-center' : ''}
                        `}
                      >
                        <item.icon className={`h-5 w-5 ${active ? 'text-sidebar-primary' : ''}`} />
                        {!collapsed && (
                          <>
                            <span className="font-medium">{t[item.title as keyof typeof t]}</span>
                            {active && (
                              <ChevronRight className={`h-4 w-4 ml-auto ${isRTL ? 'rotate-180' : ''}`} />
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className={`flex items-center gap-3 px-3 py-2 text-sidebar-foreground ${collapsed ? 'justify-center' : ''}`}>
                <User className="h-5 w-5" />
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{profile?.full_name || 'User'}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {profile?.role || 'readonly'}
                    </span>
                  </div>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className={`flex items-center gap-3 px-3 py-2 text-sidebar-foreground ${collapsed ? 'justify-center' : ''}`}>
                <Settings className="h-5 w-5" />
                {!collapsed && <span className="font-medium">Settings</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={signOut}
              className={`flex items-center gap-3 px-3 py-2 text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer ${collapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="font-medium">Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}