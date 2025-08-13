import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Products } from "@/pages/Products";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Placeholder components for other pages
const Customers = () => (
  <div className="space-y-6 animate-fade-in">
    <h1 className="text-3xl font-bold gradient-text">Customers</h1>
    <div className="glass-card p-8 text-center">
      <p className="text-muted-foreground">Customer management module coming soon...</p>
    </div>
  </div>
);

const Orders = () => (
  <div className="space-y-6 animate-fade-in">
    <h1 className="text-3xl font-bold gradient-text">Orders</h1>
    <div className="glass-card p-8 text-center">
      <p className="text-muted-foreground">Order management module coming soon...</p>
    </div>
  </div>
);

const Shippers = () => (
  <div className="space-y-6 animate-fade-in">
    <h1 className="text-3xl font-bold gradient-text">Suppliers</h1>
    <div className="glass-card p-8 text-center">
      <p className="text-muted-foreground">Supplier management module coming soon...</p>
    </div>
  </div>
);

const PriceComparison = () => (
  <div className="space-y-6 animate-fade-in">
    <h1 className="text-3xl font-bold gradient-text">Price Comparison</h1>
    <div className="glass-card p-8 text-center">
      <p className="text-muted-foreground">Price comparison module coming soon...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/shippers" element={<Shippers />} />
              <Route path="/price-comparison" element={<PriceComparison />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
