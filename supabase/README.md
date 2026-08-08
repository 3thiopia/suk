# SUK Production Supabase Backend Guide

This folder contains the complete, production-ready backend architecture for **SUK (E-Commerce Platform for Suppliers & Creators)** built for Supabase.

---

## 📁 Directory Structure

```
/supabase
  ├── config.toml                 # Supabase local development & project configuration
  ├── types.ts                    # Auto-generated & typed Supabase database interfaces
  ├── README.md                   # Complete deployment & schema guide
  └── /migrations                 # Sequential, versioned PostgreSQL migration files
      ├── 001_extensions.sql       # Extensions (uuid-ossp, pgcrypto, pg_trgm)
      ├── 002_enums.sql            # Enumerated types (user_role, order_status, etc.)
      ├── 003_profiles.sql         # User profiles table (linked to auth.users)
      ├── 004_businesses.sql       # Supplier business profiles & wholesale settings
      ├── 005_creator_profiles.sql # Creator profile metadata & bank details
      ├── 006_storefronts.sql      # Creator storefronts & payout settings
      ├── 007_categories.sql       # Hierarchical product category tree
      ├── 008_products.sql         # Supplier product catalog with stock & commission
      ├── 009_product_images.sql   # Product gallery images
      ├── 010_orders.sql           # Storefront orders table
      ├── 011_order_items.sql      # Order line items & timeline tracking events
      ├── 012_commissions.sql      # Creator payout records
      ├── 013_notifications.sql    # User notifications system
      ├── 014_reports.sql          # Moderation reports, order reports, support tickets, disputes
      ├── 015_product_appeals.sql  # Account & Product moderation appeals
      ├── 016_product_moderation.sql # System audit logs, announcements, platform settings
      ├── 017_following.sql        # Supplier following relationship mapping
      ├── 018_storefront_customization.sql # Custom storefront links, collections, curated products
      ├── 019_analytics.sql        # Analytics event logs & performance views
      ├── 020_storage.sql          # Storage buckets setup & security access rules
      ├── 021_rls.sql              # Strict Row Level Security policies
      ├── 022_functions.sql        # Atomic PostgreSQL RPC stored procedures
      ├── 023_triggers.sql         # Automatic database triggers (auth signup, timestamps)
      ├── 024_seed.sql             # Initial seed data for immediate testing
      ├── 025_reviews.sql          # Reviews, rating calculation triggers, review replies, reports
      ├── 026_subdomains.sql       # Storefront wildcard subdomains, reserved slugs, alias history
      └── 027_account_bans_customization_setup.sql # Account bans audit, style versions, setup progress
```

---

## 🚀 Quick Start & Deployment Guide

### Option A: Using the Supabase SQL Editor (Fastest)

1. Open your Supabase Dashboard: [https://app.supabase.com](https://app.supabase.com)
2. Create or select your project.
3. Go to the **SQL Editor** tab in the sidebar.
4. Execute the migration files **in numerical order** (001_extensions.sql through 024_seed.sql).
5. Verify in Table Editor that all tables (`profiles`, `businesses`, `products`, `storefronts`, `orders`, etc.) are created.

### Option B: Using the Supabase CLI

```bash
# 1. Install Supabase CLI
npm i -g supabase

# 2. Link your CLI to your remote project
supabase link --project-ref your-project-ref

# 3. Push all migrations to your live database
supabase db push
```

---

## 🔐 Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your project credentials from your Supabase Dashboard (**Project Settings -> API**):
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## 📊 Database Schema Summary

| Table | Description | Primary Key | Key Foreign Keys |
|---|---|---|---|
| `profiles` | User accounts (Admin, Business Owner, Creator, Customer) | `id` | `auth.users(id)` |
| `businesses` | Supplier business profiles & wholesale setup | `id` | `profiles(id)` |
| `creator_profiles` | Creator bio, niche, payout bank details | `id` | `profiles(id)` |
| `storefronts` | Creator custom storefronts & domain slugs | `id` | `profiles(id)` |
| `categories` | Product categories hierarchy | `id` | `categories(id)` |
| `products` | Supplier products catalog | `id` | `businesses(id)` |
| `product_images` | Gallery images for products | `id` | `products(id)` |
| `orders` | Guest & customer storefront purchases | `id` | `storefronts(id)` |
| `order_items` | Line items for each order | `id` | `orders(id)`, `products(id)` |
| `payouts` | Creator commission payout history | `id` | `profiles(id)`, `storefronts(id)` |
| `notifications` | Targeted user notifications | `id` | `profiles(id)` |
| `follows` | Creators following supplier businesses | `id` | `profiles(id)`, `businesses(id)` |
| `moderation_reports` | Compliance & content flags | `id` | `profiles(id)` |
| `product_appeals` | Business owner moderation appeals | `id` | `products(id)`, `businesses(id)` |
| `platform_settings` | Global platform parameters | `id` | N/A |

---

## 🛡️ Row Level Security (RLS) Summary

- **Guest Users / Customers**:
  - View public active products and active creator storefronts.
  - Can place orders and create order items via guest checkout.
- **Business Owners (Suppliers)**:
  - Full write/edit access to their own business profile and products.
  - View orders containing items from their business.
  - Submit product appeals for moderated items.
- **Creators**:
  - Full control over their storefront theme, curated product catalog, collections, and social links.
  - Access to their orders, commission earnings, and payout requests.
  - Follow / unfollow suppliers.
- **Admins**:
  - Full unrestricted system access across all tables, audit logs, and settings.

---

## ⚡ Key RPC Stored Procedures

- `create_order(...)`: Atomically creates an order header, verifies item stock, calculates item commissions, deducts inventory, records timeline events, and fires notifications.
- `accept_order(...)`: Supplier accepts order for fulfillment.
- `reject_order(...)`: Supplier rejects order with reason.
- `follow_supplier(...)` / `unfollow_supplier(...)`: Handles follow relationship and updates supplier follower counts.
- `mark_notification_read(...)` / `mark_all_notifications_read(...)`: Updates notification status.

---

## 🪣 Storage Buckets

- `product-images`: Public bucket for supplier product photography.
- `business-assets`: Public bucket for logos, banners, and store media.
- `storefront-assets`: Public bucket for creator storefront visuals.
- `avatars`: Public bucket for profile photos.
- `documents`: Private bucket for business verification documents.
- `appeals`: Private bucket for moderation attachments.
