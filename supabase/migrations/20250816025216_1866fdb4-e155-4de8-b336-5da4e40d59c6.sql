-- Create product_reseller_prices table
CREATE TABLE public.product_reseller_prices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    reseller_name TEXT NOT NULL,
    reseller_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_reseller_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for reseller prices
CREATE POLICY "Admin and staff can manage reseller prices" 
ON public.product_reseller_prices 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'staff'::user_role]))
WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'staff'::user_role]));

-- Migrate data from product_price_comparisons to product_reseller_prices
INSERT INTO public.product_reseller_prices (product_id, reseller_name, reseller_price, created_at, updated_at)
SELECT 
    ppc.product_id,
    s.shipper_name as reseller_name,
    ppc.price as reseller_price,
    ppc.last_updated as created_at,
    ppc.last_updated as updated_at
FROM public.product_price_comparisons ppc
JOIN public.shippers s ON ppc.shipper_id = s.id;

-- Add trigger for updated_at
CREATE TRIGGER update_product_reseller_prices_updated_at
BEFORE UPDATE ON public.product_reseller_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Drop the old product_price_comparisons table after migration
DROP TABLE IF EXISTS public.product_price_comparisons;