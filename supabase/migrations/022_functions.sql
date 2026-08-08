-- ==========================================
-- Migration 022: PostgreSQL RPC Functions
-- ==========================================

-- 1. Create Order Function (Guest / Customer checkout)
CREATE OR REPLACE FUNCTION public.create_order(
  p_storefront_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_shipping_address JSONB,
  p_items JSONB, -- Array of { productId, quantity, unitPrice, businessId, title, brand, coverImage }
  p_payment_method TEXT
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_total_amount NUMERIC(10,2) := 0;
  v_total_commission NUMERIC(10,2) := 0;
  v_item JSONB;
  v_product_price NUMERIC(10,2);
  v_comm_rate NUMERIC(5,2);
  v_quantity INT;
  v_item_comm NUMERIC(10,2);
  v_storefront_name TEXT;
  v_reseller_id UUID;
BEGIN
  -- Verify storefront
  SELECT store_name, reseller_id INTO v_storefront_name, v_reseller_id
  FROM public.storefronts WHERE id = p_storefront_id;

  IF v_reseller_id IS NULL THEN
    RAISE EXCEPTION 'Storefront not found';
  END IF;

  -- Create Order Header
  INSERT INTO public.orders (
    storefront_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    total_amount,
    reseller_commission,
    status,
    payment_method
  ) VALUES (
    p_storefront_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_shipping_address,
    0,
    0,
    'pending',
    p_payment_method
  ) RETURNING id INTO v_order_id;

  -- Process line items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_quantity := (v_item->>'quantity')::INT;
    v_product_price := (v_item->>'unitPrice')::NUMERIC(10,2);

    -- Get product commission rate
    SELECT COALESCE(commission_rate, 20.00) INTO v_comm_rate
    FROM public.products WHERE id = (v_item->>'productId')::UUID;

    v_item_comm := round((v_product_price * v_quantity * (v_comm_rate / 100.0)), 2);
    v_total_amount := v_total_amount + (v_product_price * v_quantity);
    v_total_commission := v_total_commission + v_item_comm;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      business_id,
      product_title,
      brand,
      unit_price,
      quantity,
      cover_image
    ) VALUES (
      v_order_id,
      (v_item->>'productId')::UUID,
      (v_item->>'businessId')::UUID,
      v_item->>'title',
      COALESCE(v_item->>'brand', 'Generic'),
      v_product_price,
      v_quantity,
      v_item->>'coverImage'
    );

    -- Reduce stock
    UPDATE public.products
    SET stock = GREATEST(0, stock - v_quantity),
        updated_at = NOW()
    WHERE id = (v_item->>'productId')::UUID;
  END LOOP;

  -- Update totals on Order
  UPDATE public.orders
  SET total_amount = v_total_amount,
      reseller_commission = v_total_commission
  WHERE id = v_order_id;

  -- Add Initial Order Timeline Event
  INSERT INTO public.order_timeline_events (order_id, stage, title, description, actor)
  VALUES (
    v_order_id,
    'created',
    'Order Placed',
    'Order successfully created via guest checkout on ' || v_storefront_name,
    p_customer_name
  );

  -- Notify Creator
  INSERT INTO public.notifications (user_id, user_role, type, title, message, link)
  VALUES (
    v_reseller_id,
    'creator',
    'new_order',
    'New Sale Received!',
    'An order of ETB ' || v_total_amount || ' was placed on ' || v_storefront_name || '. Estimated commission: ETB ' || v_total_commission,
    '/reseller/orders'
  );

  RETURN jsonb_build_object('orderId', v_order_id, 'totalAmount', v_total_amount, 'resellerCommission', v_total_commission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Accept Order Function (Supplier accepts order)
CREATE OR REPLACE FUNCTION public.accept_order(p_order_id UUID, p_actor_id UUID, p_actor_name TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.orders
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.order_timeline_events (order_id, stage, title, description, actor)
  VALUES (p_order_id, 'accepted', 'Order Accepted', 'Supplier accepted order for fulfillment.', COALESCE(p_actor_name, 'Business Supplier'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reject Order Function
CREATE OR REPLACE FUNCTION public.reject_order(p_order_id UUID, p_actor_id UUID, p_actor_name TEXT, p_reason TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.orders
  SET status = 'rejected',
      rejected_at = NOW(),
      rejected_by = p_actor_id,
      rejected_by_name = p_actor_name,
      rejection_reason = p_reason,
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.order_timeline_events (order_id, stage, title, description, actor)
  VALUES (p_order_id, 'created', 'Order Rejected', 'Order rejected: ' || COALESCE(p_reason, 'No reason provided'), COALESCE(p_actor_name, 'Supplier'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Follow Supplier Function
CREATE OR REPLACE FUNCTION public.follow_supplier(p_reseller_id UUID, p_business_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.follows (reseller_id, business_id)
  VALUES (p_reseller_id, p_business_id)
  ON CONFLICT (reseller_id, business_id) DO NOTHING;

  UPDATE public.businesses
  SET follower_count = follower_count + 1
  WHERE id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Unfollow Supplier Function
CREATE OR REPLACE FUNCTION public.unfollow_supplier(p_reseller_id UUID, p_business_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.follows
  WHERE reseller_id = p_reseller_id AND business_id = p_business_id;

  UPDATE public.businesses
  SET follower_count = GREATEST(0, follower_count - 1)
  WHERE id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Mark Notification Read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Mark All Notifications Read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
