import { getSupabaseClient, isSupabaseConfigured } from './client';
import {
  User,
  BusinessProfile,
  Product,
  Storefront,
  Order,
  CommissionPayout,
  Notification,
  Category,
  AccountAppeal,
  ProductAppeal,
  ModerationReport,
  SupportTicket,
  OrderReport,
  AuditLog,
  PlatformSettings,
  StorefrontSocialLink,
  Collection,
  StorefrontProduct
} from '../../types';

export const supabaseDbService = {
  // --- PROFILES & USERS ---
  async getUsers(): Promise<User[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data } = await (client.from('profiles') as any).select('*');
    if (!data) return [];
    return (data as any[]).map((p) => ({
      id: p.id,
      email: p.email,
      name: p.name,
      phone: p.phone || undefined,
      role: p.role as any,
      avatarUrl: p.avatar_url || '',
      createdAt: p.created_at,
      status: p.status as any,
    }));
  },

  async updateUserStatus(userId: string, status: string, reason?: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await (client.from('profiles') as any)
      .update({ status: status as any, ban_reason: reason })
      .eq('id', userId);
    return !error;
  },

  // --- BUSINESSES ---
  async getBusinesses(): Promise<BusinessProfile[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data } = await (client.from('businesses') as any).select('*');
    if (!data) return [];
    return (data as any[]).map((b) => ({
      id: b.id,
      ownerId: b.owner_id,
      businessName: b.business_name,
      slug: b.slug,
      logoUrl: b.logo_url || '',
      bannerUrl: b.banner_url || '',
      description: b.description || '',
      website: b.website || '',
      phone: b.phone || undefined,
      category: b.category,
      rating: Number(b.rating),
      followerCount: b.follower_count,
      createdAt: b.created_at,
      status: b.status as any,
      isVerified: b.is_verified,
      defaultCommissionRate: Number(b.default_commission_rate),
      tagline: b.tagline || undefined,
      email: b.email || undefined,
      city: b.city || undefined,
      country: b.country,
      address: b.address || undefined,
      yearEstablished: b.year_established || undefined,
      story: b.story || undefined,
      mission: b.mission || undefined,
      specialties: b.specialties || [],
      socialLinks: (b.social_links as any) || {},
    }));
  },

  async updateBusiness(id: string, updates: Partial<BusinessProfile>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await (client.from('businesses') as any)
      .update({
        business_name: updates.businessName,
        logo_url: updates.logoUrl,
        banner_url: updates.bannerUrl,
        description: updates.description,
        website: updates.website,
        phone: updates.phone,
        email: updates.email,
        category: updates.category,
        default_commission_rate: updates.defaultCommissionRate,
        tagline: updates.tagline,
        city: updates.city,
        address: updates.address,
        story: updates.story,
        mission: updates.mission,
        specialties: updates.specialties,
        social_links: updates.socialLinks as any,
      })
      .eq('id', id);
    return !error;
  },

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data } = await (client.from('products') as any).select('*');
    if (!data) return [];
    return (data as any[]).map((p) => ({
      id: p.id,
      businessId: p.business_id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory || undefined,
      description: p.description,
      price: Number(p.price),
      costPrice: p.cost_price ? Number(p.cost_price) : undefined,
      stock: p.stock,
      status: p.status as any,
      images: p.images || [],
      tags: p.tags || [],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      isHidden: p.is_hidden,
      adminNotes: p.admin_notes || undefined,
      hiddenReason: p.hidden_reason || undefined,
      commissionRate: p.commission_rate ? Number(p.commission_rate) : 20,
      commissionAmount: p.commission_amount ? Number(p.commission_amount) : undefined,
    }));
  },

  async createProduct(product: Partial<Product>): Promise<Product | null> {
    const client = getSupabaseClient();
    if (!client || !product.businessId || !product.title || !product.price) return null;

    const { data, error } = await (client.from('products') as any)
      .insert({
        business_id: product.businessId,
        title: product.title,
        brand: product.brand || 'Generic',
        category: product.category || 'General',
        subcategory: product.subcategory,
        description: product.description || '',
        price: product.price,
        cost_price: product.costPrice,
        stock: product.stock || 0,
        status: (product.status as any) || 'active',
        images: product.images || [],
        tags: product.tags || [],
        commission_rate: product.commissionRate || 20,
      })
      .select()
      .single();

    if (error || !data) return null;
    const p = data as any;

    return {
      id: p.id,
      businessId: p.business_id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory || undefined,
      description: p.description,
      price: Number(p.price),
      costPrice: p.cost_price ? Number(p.cost_price) : undefined,
      stock: p.stock,
      status: p.status as any,
      images: p.images || [],
      tags: p.tags || [],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      isHidden: p.is_hidden,
      commissionRate: Number(p.commission_rate),
    };
  },

  // --- STOREFRONTS ---
  async getStorefronts(): Promise<Storefront[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data } = await (client.from('storefronts') as any).select('*');
    if (!data) return [];
    return (data as any[]).map((s) => ({
      id: s.id,
      resellerId: s.reseller_id,
      storeName: s.store_name,
      slug: s.slug,
      logoUrl: s.logo_url || '',
      bannerUrl: s.banner_url || '',
      bannerTitle: s.banner_title || s.store_name,
      bannerSubtitle: s.banner_subtitle || '',
      themeColor: s.theme_color as any,
      layoutMode: s.layout_mode as any,
      minPayoutThreshold: Number(s.min_payout_threshold),
      totalEarnings: Number(s.total_earnings),
      pendingPayout: Number(s.pending_payout),
      totalOrdersCount: s.total_orders_count,
      createdAt: s.created_at,
      status: s.status as any,
      isDisabled: s.is_disabled,
      customization: (s.customization as any) || undefined,
    }));
  },

  // --- ORDERS & CHECKOUT ---
  async getOrders(): Promise<Order[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data: orderRows } = await (client.from('orders') as any)
      .select('*, order_items(*)');

    if (!orderRows) return [];

    return (orderRows as any[]).map((o: any) => ({
      id: o.id,
      storefrontId: o.storefront_id,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      shippingAddress: o.shipping_address,
      items: (o.order_items || []).map((i: any) => ({
        productId: i.product_id,
        productTitle: i.product_title,
        brand: i.brand,
        unitPrice: Number(i.unit_price),
        quantity: i.quantity,
        businessId: i.business_id,
        coverImage: i.cover_image || '',
      })),
      totalAmount: Number(o.total_amount),
      resellerCommission: Number(o.reseller_commission),
      status: o.status as any,
      paymentMethod: o.payment_method,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      deliveredAt: o.delivered_at || undefined,
      rejectedAt: o.rejected_at || undefined,
      rejectionReason: o.rejection_reason || undefined,
      commissionEligibleForPayout: o.commission_eligible_for_payout,
    }));
  },

  async createOrderRPC(orderData: {
    storefrontId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: any;
    items: any[];
    paymentMethod: string;
  }): Promise<{ orderId?: string; totalAmount?: number; resellerCommission?: number; error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { error: 'Supabase client is not configured' };

    const { data, error } = await (client as any).rpc('create_order', {
      p_storefront_id: orderData.storefrontId,
      p_customer_name: orderData.customerName,
      p_customer_email: orderData.customerEmail,
      p_customer_phone: orderData.customerPhone,
      p_shipping_address: orderData.shippingAddress,
      p_items: orderData.items,
      p_payment_method: orderData.paymentMethod,
    });

    if (error) return { error: error.message };
    return data as any;
  },

  async acceptOrderRPC(orderId: string, actorId: string, actorName: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await (client as any).rpc('accept_order', {
      p_order_id: orderId,
      p_actor_id: actorId,
      p_actor_name: actorName,
    });
    return !error;
  },

  async rejectOrderRPC(orderId: string, actorId: string, actorName: string, reason: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await (client as any).rpc('reject_order', {
      p_order_id: orderId,
      p_actor_id: actorId,
      p_actor_name: actorName,
      p_reason: reason,
    });
    return !error;
  },

  // --- FOLLOWS ---
  async followSupplierRPC(resellerId: string, businessId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await (client as any).rpc('follow_supplier', {
      p_reseller_id: resellerId,
      p_business_id: businessId,
    });
    return !error;
  },

  async unfollowSupplierRPC(resellerId: string, businessId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await (client as any).rpc('unfollow_supplier', {
      p_reseller_id: resellerId,
      p_business_id: businessId,
    });
    return !error;
  },

  // --- REALTIME SUBSCRIPTION ---
  subscribeToTableUpdates(
    table: string,
    callback: (payload: any) => void
  ): { unsubscribe: () => void } | null {
    const client = getSupabaseClient();
    if (!client) return null;

    const channel = client
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        client.removeChannel(channel);
      },
    };
  },
};
