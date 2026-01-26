-- Enable RLS on platform_settings (was missing)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Platform settings should only be readable by admins, but for now allow read for app functionality
CREATE POLICY "Platform settings are readable by authenticated users"
  ON public.platform_settings FOR SELECT
  TO authenticated
  USING (true);

-- Fix permissive INSERT policies by requiring store context or authenticated user context

-- Drop and recreate customers INSERT policy to be more restrictive
DROP POLICY IF EXISTS "Customers can insert themselves" ON public.customers;
CREATE POLICY "Authenticated users can create customer records"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Allow anon users to create customer records during checkout (needed for guest checkout)
CREATE POLICY "Anonymous users can create customer records for checkout"
  ON public.customers FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Drop and recreate orders INSERT policy  
DROP POLICY IF EXISTS "Orders can be created by anyone" ON public.orders;
CREATE POLICY "Orders can be created for valid stores"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores s WHERE s.id = store_id
    )
  );

CREATE POLICY "Anonymous orders for checkout"
  ON public.orders FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores s WHERE s.id = store_id
    )
  );

-- Drop and recreate subscriptions INSERT policy
DROP POLICY IF EXISTS "Subscriptions can be created" ON public.subscriptions;
CREATE POLICY "Subscriptions can be created for valid memberships"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m WHERE m.id = membership_id
    )
  );

-- Drop and recreate appointments INSERT policy
DROP POLICY IF EXISTS "Appointments can be created by anyone" ON public.appointments;
CREATE POLICY "Appointments can be created for valid booking types"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.booking_types bt WHERE bt.id = booking_type_id
    )
  );

CREATE POLICY "Anonymous appointments for checkout"
  ON public.appointments FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.booking_types bt WHERE bt.id = booking_type_id
    )
  );