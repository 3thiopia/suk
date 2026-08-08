# SUK Complete Supabase Production Setup & Migration Guide

This guide provides step-by-step instructions for creating a new Supabase project, executing the database migrations, configuring storage, applying Row Level Security (RLS), and connecting the **SUK (Supplier & Creator E-Commerce Platform)** application.

---

## 🏗️ 1. Architecture & Schema Overview

The SUK application uses a multi-tier, multi-role e-commerce model:

- **Admin**: Platform oversight, product moderation, appeals review, audit logs, account ban management.
- **Business Owner (Supplier)**: Product catalog owner, wholesale inventory manager, order fulfillment, commission payer.
- **Creator (Reseller)**: Promotes supplier products via customized storefront subdomains (`creator.mystore.et`), earns commissions upon delivery, follows suppliers.
- **Customer**: Unauthenticated **guest user**. Customers do not create accounts or log in. Guest checkout is natively supported.

### 📊 Database Schema Map (27 Migration Files)

| File | Purpose & Entities Covered |
|---|---|
| `001_extensions.sql` | Enable required PostgreSQL extensions (`uuid-ossp`, `pgcrypto`, `pg_trgm`). |
| `002_enums.sql` | Enum definitions for user roles, order statuses, product statuses, ban types, etc. |
| `003_profiles.sql` | User profiles table (`profiles`), linked to `auth.users` with account ban/suspension status fields. |
| `004_businesses.sql` | Supplier business profiles (`businesses`), company info, rating, follower counts. |
| `005_creator_profiles.sql` | Creator profiles (`creator_profiles`), bio, social links, bank details. |
| `006_storefronts.sql` | Creator storefronts (`storefronts`), custom domain configuration, status, earnings. |
| `007_categories.sql` | Hierarchical product categories (`categories`). |
| `008_products.sql` | Supplier product catalog (`products`), wholesale pricing, stock, commission rate. |
| `009_product_images.sql` | Product gallery images (`product_images`). |
| `010_orders.sql` | Storefront customer orders (`orders`), guest customer info, delivery address, status. |
| `011_order_items.sql` | Line items (`order_items`) and fulfillment stage timeline (`order_timeline_events`). |
| `012_commissions.sql` | Commission payout records (`commissions`) for Creators upon order delivery. |
| `013_notifications.sql` | Targeted user notifications (`notifications`). |
| `014_reports.sql` | Moderation reports, support tickets, and disputes (`reports`). |
| `015_product_appeals.sql` | Supplier product moderation appeals (`product_appeals`). |
| `016_product_moderation.sql` | Admin audit logs, announcements, and platform settings. |
| `017_following.sql` | Creator-to-supplier follow mapping (`follows`). |
| `018_storefront_customization.sql` | Storefront collections (`collections`), social links, curated catalog (`storefront_products`). |
| `019_analytics.sql` | Analytics daily metrics (`analytics_daily`) and event logs (`analytics_events`). |
| `020_storage.sql` | Storage buckets setup & security access policies. |
| `021_rls.sql` | Production-grade Row Level Security (RLS) policies for all tables. |
| `022_functions.sql` | Stored procedures (`create_order`, `accept_order`, `reject_order`, `follow_supplier`, etc.). |
| `023_triggers.sql` | Triggers for auth profile creation, timestamp auto-updating. |
| `024_seed.sql` | Safe development seed data (Admin, Business Owner, Creator, Products, Storefronts). |
| `025_reviews.sql` | Reviews & Ratings (`product_reviews`, `review_replies`, `review_reports`, rating triggers). |
| `026_subdomains.sql` | Storefront wildcard subdomains, reserved slugs (`reserved_slugs`), alias history (`storefront_slug_history`). |
| `027_account_bans_customization_setup.sql` | Account ban audit table (`account_bans`), storefront style version history (`storefront_customizations`), setup progress (`account_setup_progress`), `deliver_order` function. |

---

## 🚀 2. Step-by-Step Supabase Setup Instructions

### Step 1: Create a New Supabase Project

1. Log in to [https://app.supabase.com](https://app.supabase.com) and click **New Project**.
2. Select your organization, enter project name `suk-production`, select a cloud region close to your target users, and generate a secure Database Password.
3. Wait ~2 minutes for provisioning to complete.

### Step 2: Configure Authentication Settings

1. Go to **Authentication -> Settings**.
2. Ensure **Email / Password** provider is enabled.
3. (Optional) For rapid onboarding, disable **Confirm email** if email verification service is not yet configured.
4. Set site URL to `https://suk.et` and add redirect URIs:
   - `https://*.mystore.et/*`
   - `https://*.suk.et/*`
   - `http://localhost:3000/*`

### Step 3: Run Database Migrations

#### Option A: Via Supabase SQL Editor (Recommended)
1. In your Supabase Dashboard, open the **SQL Editor** tab.
2. Open the `/supabase/migrations/` folder in this workspace.
3. Paste and execute files **in numerical order** from `001_extensions.sql` through `027_account_bans_customization_setup.sql`.
4. Optionally execute `024_seed.sql` if you want initial test data.

#### Option B: Via Supabase CLI
```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### Step 4: Storage Buckets Configuration

Ensure the following 6 public/private buckets are created (handled automatically by `020_storage.sql`):
- `product-images` (Public)
- `business-assets` (Public)
- `storefront-assets` (Public)
- `avatars` (Public)
- `documents` (Private - for supplier verification)
- `appeals` (Private - for admin appeals)

### Step 5: Environment Variables Setup

Create a `.env` file in the application root:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="<your-anon-public-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"

# Platform & Storefront Wildcard Domains
VITE_PLATFORM_DOMAIN="suk.et"
VITE_STOREFRONT_DOMAIN="mystore.et"
NEXT_PUBLIC_PLATFORM_DOMAIN="suk.et"
NEXT_PUBLIC_STOREFRONT_DOMAIN="mystore.et"
```

> **Security Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code!

---

## 🧪 3. Verification & Testing Matrix

| Feature | Test Procedure |
|---|---|
| **Subdomain Resolution** | Navigate to `https://abebe.mystore.et`. The app extracts `abebe`, verifies it is not reserved, queries `storefronts` or `storefront_slug_history`, and renders the storefront. |
| **Reserved Slugs** | Try setting a storefront slug to `admin` or `checkout`. Trigger `trigger_validate_storefront_slug` will reject reserved platform keywords. |
| **Guest Checkout** | Add products to cart on a storefront and complete checkout as an unauthenticated guest. Function `create_order` inserts order, line items, and notifies creator. |
| **Order Delivery & Commission** | Business owner marks order as `delivered`. Function `deliver_order` calculates commission, updates creator earnings, and generates payout record. |
| **Product Reviews** | Customers who purchased delivered items submit reviews. Trigger `trg_update_business_rating` automatically updates supplier average rating and review count. |
| **Restore Previous Style** | Creators customize their storefront. `storefront_customizations` retains `previous_style` JSONB so "Restore Previous Style" restores the prior version. |
| **Account Bans** | Admin bans a user. RLS policies check `profiles.status` and block suspended/banned users from modifying data via API. |

---

## 🛠️ 4. Code Integration Reference

- Client initialization: `src/lib/supabase/client.ts`
- TypeScript database types: `supabase/types.ts`
- Storage & State persistence bridge: `src/lib/storage.ts`
- Subdomain resolver: `src/lib/subdomain.ts`
