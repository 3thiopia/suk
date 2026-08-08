export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'admin' | 'business_owner' | 'reseller' | 'creator' | 'customer'
          avatar_url: string | null
          status: 'active' | 'suspended' | 'banned' | 'pending_review'
          ban_reason: string | null
          banned_at: string | null
          ban_type: string | null
          suspension_reason: string | null
          suspended_at: string | null
          suspension_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          role?: 'admin' | 'business_owner' | 'reseller' | 'creator' | 'customer'
          avatar_url?: string | null
          status?: 'active' | 'suspended' | 'banned' | 'pending_review'
          ban_reason?: string | null
          banned_at?: string | null
          ban_type?: string | null
          suspension_reason?: string | null
          suspended_at?: string | null
          suspension_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'admin' | 'business_owner' | 'reseller' | 'creator' | 'customer'
          avatar_url?: string | null
          status?: 'active' | 'suspended' | 'banned' | 'pending_review'
          ban_reason?: string | null
          banned_at?: string | null
          ban_type?: string | null
          suspension_reason?: string | null
          suspended_at?: string | null
          suspension_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          business_name: string
          slug: string
          logo_url: string | null
          banner_url: string | null
          description: string | null
          website: string | null
          phone: string | null
          email: string | null
          category: string
          rating: number
          follower_count: number
          is_verified: boolean
          status: string
          status_reason: string | null
          default_commission_rate: number
          tagline: string | null
          city: string | null
          country: string
          address: string | null
          year_established: number | null
          story: string | null
          mission: string | null
          specialties: string[]
          social_links: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          business_name: string
          slug: string
          logo_url?: string | null
          banner_url?: string | null
          description?: string | null
          website?: string | null
          phone?: string | null
          email?: string | null
          category: string
          rating?: number
          follower_count?: number
          is_verified?: boolean
          status?: string
          status_reason?: string | null
          default_commission_rate?: number
          tagline?: string | null
          city?: string | null
          country?: string
          address?: string | null
          year_established?: number | null
          story?: string | null
          mission?: string | null
          specialties?: string[]
          social_links?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          business_name?: string
          slug?: string
          logo_url?: string | null
          banner_url?: string | null
          description?: string | null
          website?: string | null
          phone?: string | null
          email?: string | null
          category?: string
          rating?: number
          follower_count?: number
          is_verified?: boolean
          status?: string
          status_reason?: string | null
          default_commission_rate?: number
          tagline?: string | null
          city?: string | null
          country?: string
          address?: string | null
          year_established?: number | null
          story?: string | null
          mission?: string | null
          specialties?: string[]
          social_links?: Json
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          business_id: string
          title: string
          brand: string
          category: string
          subcategory: string | null
          description: string
          price: number
          cost_price: number | null
          stock: number
          status: 'active' | 'archived' | 'out_of_stock'
          images: string[]
          tags: string[]
          is_hidden: boolean
          admin_notes: string | null
          hidden_reason: string | null
          hidden_at: string | null
          hidden_by_admin_id: string | null
          hidden_by_admin_name: string | null
          appeal_status: string | null
          current_appeal_id: string | null
          specifications: Json
          commission_rate: number
          commission_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          title: string
          brand: string
          category: string
          subcategory?: string | null
          description: string
          price: number
          cost_price?: number | null
          stock?: number
          status?: 'active' | 'archived' | 'out_of_stock'
          images?: string[]
          tags?: string[]
          is_hidden?: boolean
          admin_notes?: string | null
          hidden_reason?: string | null
          hidden_at?: string | null
          hidden_by_admin_id?: string | null
          hidden_by_admin_name?: string | null
          appeal_status?: string | null
          current_appeal_id?: string | null
          specifications?: Json
          commission_rate?: number
          commission_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          title?: string
          brand?: string
          category?: string
          subcategory?: string | null
          description?: string
          price?: number
          cost_price?: number | null
          stock?: number
          status?: 'active' | 'archived' | 'out_of_stock'
          images?: string[]
          tags?: string[]
          is_hidden?: boolean
          admin_notes?: string | null
          hidden_reason?: string | null
          hidden_at?: string | null
          hidden_by_admin_id?: string | null
          hidden_by_admin_name?: string | null
          appeal_status?: string | null
          current_appeal_id?: string | null
          specifications?: Json
          commission_rate?: number
          commission_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      storefronts: {
        Row: {
          id: string
          reseller_id: string
          store_name: string
          slug: string
          logo_url: string | null
          banner_url: string | null
          banner_title: string | null
          banner_subtitle: string | null
          theme_color: string
          layout_mode: string
          min_payout_threshold: number
          total_earnings: number
          pending_payout: number
          total_orders_count: number
          status: string
          is_disabled: boolean
          disabled_reason: string | null
          disabled_at: string | null
          customization: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reseller_id: string
          store_name: string
          slug: string
          logo_url?: string | null
          banner_url?: string | null
          banner_title?: string | null
          banner_subtitle?: string | null
          theme_color?: string
          layout_mode?: string
          min_payout_threshold?: number
          total_earnings?: number
          pending_payout?: number
          total_orders_count?: number
          status?: string
          is_disabled?: boolean
          disabled_reason?: string | null
          disabled_at?: string | null
          customization?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reseller_id?: string
          store_name?: string
          slug?: string
          logo_url?: string | null
          banner_url?: string | null
          banner_title?: string | null
          banner_subtitle?: string | null
          theme_color?: string
          layout_mode?: string
          min_payout_threshold?: number
          total_earnings?: number
          pending_payout?: number
          total_orders_count?: number
          status?: string
          is_disabled?: boolean
          disabled_reason?: string | null
          disabled_at?: string | null
          customization?: Json
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          storefront_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address: Json
          total_amount: number
          reseller_commission: number
          status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'shipped' | 'delivered' | 'completed'
          payment_method: string
          delivered_at: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejected_by_name: string | null
          rejection_reason: string | null
          commission_eligible_for_payout: boolean
          is_delivered_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          storefront_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address: Json
          total_amount: number
          reseller_commission: number
          status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'shipped' | 'delivered' | 'completed'
          payment_method: string
          delivered_at?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_by_name?: string | null
          rejection_reason?: string | null
          commission_eligible_for_payout?: boolean
          is_delivered_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          storefront_id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          shipping_address?: Json
          total_amount?: number
          reseller_commission?: number
          status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'shipped' | 'delivered' | 'completed'
          payment_method?: string
          delivered_at?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_by_name?: string | null
          rejection_reason?: string | null
          commission_eligible_for_payout?: boolean
          is_delivered_locked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_reviews: {
        Row: {
          id: string
          order_id: string
          product_id: string
          business_id: string
          storefront_id: string | null
          customer_name: string
          is_anonymous: boolean
          rating: number
          comment: string | null
          is_verified_purchase: boolean
          is_hidden: boolean
          hidden_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          business_id: string
          storefront_id?: string | null
          customer_name?: string
          is_anonymous?: boolean
          rating: number
          comment?: string | null
          is_verified_purchase?: boolean
          is_hidden?: boolean
          hidden_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          business_id?: string
          storefront_id?: string | null
          customer_name?: string
          is_anonymous?: boolean
          rating?: number
          comment?: string | null
          is_verified_purchase?: boolean
          is_hidden?: boolean
          hidden_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      review_replies: {
        Row: {
          id: string
          review_id: string
          business_id: string
          author_name: string
          reply_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          business_id: string
          author_name: string
          reply_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          business_id?: string
          author_name?: string
          reply_text?: string
          created_at?: string
          updated_at?: string
        }
      }
      review_reports: {
        Row: {
          id: string
          review_id: string
          reporter_id: string | null
          reporter_role: string
          reason: string
          details: string | null
          status: 'open' | 'reviewed' | 'dismissed' | 'actioned'
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          reporter_id?: string | null
          reporter_role?: string
          reason: string
          details?: string | null
          status?: 'open' | 'reviewed' | 'dismissed' | 'actioned'
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          reporter_id?: string | null
          reporter_role?: string
          reason?: string
          details?: string | null
          status?: 'open' | 'reviewed' | 'dismissed' | 'actioned'
          created_at?: string
        }
      }
      reserved_slugs: {
        Row: {
          id: string
          word: string
          created_at: string
        }
        Insert: {
          id?: string
          word: string
          created_at?: string
        }
        Update: {
          id?: string
          word?: string
          created_at?: string
        }
      }
      storefront_slug_history: {
        Row: {
          id: string
          storefront_id: string
          old_slug: string
          new_slug: string
          changed_at: string
        }
        Insert: {
          id?: string
          storefront_id: string
          old_slug: string
          new_slug: string
          changed_at?: string
        }
        Update: {
          id?: string
          storefront_id?: string
          old_slug?: string
          new_slug?: string
          changed_at?: string
        }
      }
      account_bans: {
        Row: {
          id: string
          user_id: string
          banned_by_admin_id: string | null
          reason: string
          ban_type: 'permanent' | 'temporary'
          status: 'active' | 'lifted' | 'appealed'
          created_at: string
          lifted_at: string | null
          lifted_by_admin_id: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          banned_by_admin_id?: string | null
          reason: string
          ban_type?: 'permanent' | 'temporary'
          status?: 'active' | 'lifted' | 'appealed'
          created_at?: string
          lifted_at?: string | null
          lifted_by_admin_id?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          banned_by_admin_id?: string | null
          reason?: string
          ban_type?: 'permanent' | 'temporary'
          status?: 'active' | 'lifted' | 'appealed'
          created_at?: string
          lifted_at?: string | null
          lifted_by_admin_id?: string | null
          notes?: string | null
        }
      }
      storefront_customizations: {
        Row: {
          id: string
          storefront_id: string
          current_style: Json
          previous_style: Json | null
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          storefront_id: string
          current_style?: Json
          previous_style?: Json | null
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          storefront_id?: string
          current_style?: Json
          previous_style?: Json | null
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      account_setup_progress: {
        Row: {
          id: string
          user_id: string
          role: string
          completion_percentage: number
          checklist: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          completion_percentage?: number
          checklist?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          completion_percentage?: number
          checklist?: Json
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deliver_order: {
        Args: {
          p_order_id: string
          p_actor_id: string
          p_actor_name: string
        }
        Returns: Json
      }
      create_order: {
        Args: {
          p_storefront_id: string
          p_customer_name: string
          p_customer_email: string
          p_customer_phone: string
          p_shipping_address: Json
          p_items: Json
          p_payment_method: string
        }
        Returns: Json
      }
      accept_order: {
        Args: {
          p_order_id: string
          p_actor_id: string
          p_actor_name: string
        }
        Returns: void
      }
      reject_order: {
        Args: {
          p_order_id: string
          p_actor_id: string
          p_actor_name: string
          p_reason: string
        }
        Returns: void
      }
      follow_supplier: {
        Args: {
          p_reseller_id: string
          p_business_id: string
        }
        Returns: void
      }
      unfollow_supplier: {
        Args: {
          p_reseller_id: string
          p_business_id: string
        }
        Returns: void
      }
      mark_notification_read: {
        Args: {
          p_notification_id: string
        }
        Returns: void
      }
      mark_all_notifications_read: {
        Args: {
          p_user_id: string
        }
        Returns: void
      }
    }
    Enums: {
      user_role: 'admin' | 'business_owner' | 'reseller' | 'creator' | 'customer'
      order_status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'shipped' | 'delivered' | 'completed'
      product_status: 'active' | 'archived' | 'out_of_stock'
      user_account_status: 'active' | 'suspended' | 'banned' | 'pending_review'
      appeal_status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'more_info_requested'
      ticket_status: 'Open' | 'Investigating' | 'Waiting for Business' | 'Resolved' | 'Closed'
      ticket_priority: 'low' | 'medium' | 'high' | 'urgent'
      report_status: 'open' | 'investigating' | 'waiting_business_response' | 'waiting_reseller_response' | 'resolved' | 'closed' | 'actioned' | 'dismissed'
    }
  }
}
