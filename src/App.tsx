import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Dashboard } from "@/pages/Dashboard";
import { Products } from "@/pages/Products";
import { Customers } from "@/pages/Customers";
import { Orders } from "@/pages/Orders";
import { Shippers } from "@/pages/Shippers";
import { Store } from "@/pages/Store";
import { StoreProducts } from "@/pages/StoreProducts";
import { StoreContact } from "@/pages/StoreContact";
import { ProductDetail } from "@/pages/ProductDetail";
import { Checkout } from "@/pages/Checkout";
import { OrderSuccess } from "@/pages/OrderSuccess";
import { About } from "@/pages/About";

import { Auth } from "@/pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              {/* Customer Store Routes */}
              <Route path="/store" element={<Store />} />
              <Route path="/store/products" element={<StoreProducts />} />
              <Route path="/store/product/:id" element={<ProductDetail />} />
              <Route path="/store/checkout" element={<Checkout />} />
              <Route path="/store/order-success" element={<OrderSuccess />} />
              <Route path="/store/contact" element={<StoreContact />} />
              <Route path="/store/about" element={<About />} />
              
              {/* Admin Dashboard Routes */}
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/shippers" element={<Shippers />} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
