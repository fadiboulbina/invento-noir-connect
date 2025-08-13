-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'staff', 'shipper', 'readonly');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role DEFAULT 'readonly',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  shop_name TEXT,
  phone_number TEXT,
  wilaya TEXT,
  commune TEXT,
  address_details TEXT,
  location_url TEXT,
  total_purchases DECIMAL(12,2) DEFAULT 0,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table for products
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  buying_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shippers table
CREATE TABLE public.shippers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id TEXT UNIQUE NOT NULL,
  shipper_name TEXT NOT NULL,
  contact_person TEXT,
  phone_number TEXT,
  address TEXT,
  wilaya TEXT,
  commune TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')) DEFAULT 'pending',
  delivery_status TEXT CHECK (delivery_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  shipper_id UUID REFERENCES shippers(id),
  total_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product price comparisons table
CREATE TABLE public.product_price_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  shipper_id UUID REFERENCES shippers(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'DZD',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, shipper_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shippers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_price_comparisons ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- Create general access policies for main tables
CREATE POLICY "Allow authenticated users to view customers" ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin and staff to manage customers" ON public.customers
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Allow authenticated users to view categories" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin and staff to manage categories" ON public.categories
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Allow authenticated users to view products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin and staff to manage products" ON public.products
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Allow authenticated users to view shippers" ON public.shippers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin and staff to manage shippers" ON public.shippers
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Allow authenticated users to view orders" ON public.orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin and staff to manage orders" ON public.orders
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Allow authenticated users to view order items" ON public.order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin and staff to manage order items" ON public.order_items
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Allow authenticated users to view price comparisons" ON public.product_price_comparisons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin and staff to manage price comparisons" ON public.product_price_comparisons
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'staff'));

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'readonly'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shippers_updated_at
  BEFORE UPDATE ON public.shippers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shippers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_price_comparisons;

-- Insert some sample categories
INSERT INTO public.categories (name, description) VALUES
  ('Smartphones', 'Mobile phones and accessories'),
  ('Laptops', 'Portable computers and accessories'),
  ('Audio', 'Headphones, speakers, and audio equipment'),
  ('Tablets', 'Tablet computers and accessories');

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),
  ('receipts', 'receipts', false),
  ('invoices', 'invoices', false);

-- Create storage policies
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated' AND
    public.get_user_role(auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "Allow public access to product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'receipts' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow users to view their own receipts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated users to upload invoices" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'invoices' AND
    auth.role() = 'authenticated' AND
    public.get_user_role(auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "Allow users to view invoices" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoices' AND
    auth.role() = 'authenticated'
  );