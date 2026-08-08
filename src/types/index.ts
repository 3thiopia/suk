export type UserRole = 'business_owner' | 'reseller' | 'creator' | 'admin' | 'customer';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'shipped'
  | 'delivered'
  | 'completed';

export type ProductStatus = 'active' | 'archived' | 'out_of_stock';

export type NotificationType =
  | 'new_order'
  | 'order_accepted'
  | 'order_rejected'
  | 'order_shipped'
  | 'order_delivered'
  | 'commission_earned'
  | 'monthly_payout'
  | 'payout_processed'
  | 'product_updated'
  | 'business_updated'
  | 'storefront_updated'
  | 'dispute_created'
  | 'system_announcement'
  | 'account_status_changed'
  | 'appeal_status_changed'
  | 'storefront_status_changed'
  | 'order_report_created'
  | 'order_report_updated'
  | 'new_review'
  | 'low_rating_alert'
  | 'review_reported';

export type StorefrontTheme = 'emerald' | 'purple' | 'sunset' | 'minimal' | 'ocean' | 'midnight';
export type StorefrontLayout = 'grid' | 'featured' | 'minimal';

export type UserAccountStatus = 'active' | 'suspended' | 'banned' | 'pending_review';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: string;
  status?: UserAccountStatus;
  banReason?: string;
  bannedAt?: string;
  banType?: 'permanent' | 'temporary';
  suspensionReason?: string;
  suspendedAt?: string;
  suspensionEndDate?: string;
}

export interface BusinessProfile {
  id: string;
  ownerId: string;
  businessName: string;
  slug: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  website: string;
  phone?: string;
  category: string;
  rating: number;
  followerCount: number;
  createdAt: string;
  status?: UserAccountStatus;
  statusReason?: string;
  isVerified?: boolean;
  defaultCommissionRate?: number;
  tagline?: string;
  email?: string;
  city?: string;
  country?: string;
  address?: string;
  yearEstablished?: number;
  story?: string;
  mission?: string;
  specialties?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    telegram?: string;
    x?: string;
    youtube?: string;
    linkedin?: string;
    pinterest?: string;
  };
}

export interface Product {
  id: string;
  businessId: string;
  businessName?: string;
  businessLogo?: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number;
  costPrice?: number;
  stock: number;
  status: ProductStatus;
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isHidden?: boolean;
  adminNotes?: string;
  hiddenReason?: string;
  hiddenAt?: string;
  hiddenByAdminId?: string;
  hiddenByAdminName?: string;
  appealStatus?: AppealStatus;
  currentAppealId?: string;
  specifications?: Record<string, string>;
  commissionRate?: number;
  commissionAmount?: number;
}

export type HeaderLayout =
  | 'logo_left'
  | 'logo_center'
  | 'logo_above_title'
  | 'logo_right'
  | 'minimal_centered'
  | 'hero_full'
  | 'split'
  | 'sticky_modern';

export type TextAlignment = 'left' | 'center' | 'right';
export type VerticalAlignment = 'top' | 'middle' | 'bottom';
export type BannerHeight = 'small' | 'medium' | 'large' | 'full';

export type ButtonShape = 'rounded' | 'square' | 'pill';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonVariant = 'filled' | 'outlined' | 'soft' | 'ghost';

export type CardLayout =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'compact'
  | 'large'
  | 'marketplace'
  | 'horizontal';

export type ImageRatio = '1:1' | '4:3' | '16:9' | '3:4';
export type ShadowIntensity = 'none' | 'soft' | 'medium' | 'heavy';
export type HoverAnimation = 'none' | 'lift' | 'scale' | 'glow';

export type StoreLayoutMode =
  | '2-column'
  | '3-column'
  | '4-column'
  | 'masonry'
  | 'list'
  | 'featured'
  | 'magazine';

export type NavType = 'horizontal' | 'sidebar' | 'centered' | 'floating' | 'sticky';
export type ColorMode = 'light' | 'dark' | 'auto';
export type AnimationType = 'none' | 'fade' | 'slide' | 'zoom' | 'scale';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  heading: string;
  button: string;
  buttonHover: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  colorMode: ColorMode;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  fontSize: 'small' | 'medium' | 'large';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  letterSpacing: 'tight' | 'normal' | 'wide';
  lineHeight: 'tight' | 'normal' | 'relaxed';
}

export type SocialPlatformId =
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'tiktok'
  | 'telegram'
  | 'youtube'
  | 'linkedin'
  | 'snapchat'
  | 'twitch'
  | 'discord'
  | 'pinterest'
  | 'whatsapp'
  | 'reddit'
  | 'threads'
  | 'github'
  | 'medium'
  | 'website'
  | 'blog'
  | 'email';

export type SocialPlacement = 'header' | 'footer' | 'contact' | 'about';
export type SocialAlignment = 'left' | 'center' | 'right';
export type SocialSize = 'small' | 'medium' | 'large';
export type SocialStyle = 'filled' | 'outline' | 'rounded' | 'square' | 'minimal';
export type SocialHoverAnimation = 'none' | 'lift' | 'scale' | 'glow' | 'bounce' | 'spin';

export interface StorefrontSocialLink {
  id: string;
  storefrontId: string;
  platform: SocialPlatformId | string;
  url: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SocialDisplayConfig {
  placements: SocialPlacement[];
  alignment: SocialAlignment;
  size: SocialSize;
  style: SocialStyle;
  useThemeColors: boolean;
  customColor?: string;
  customHoverColor?: string;
  customBgColor?: string;
  borderRadius?: number;
  spacing: number;
  hoverAnimation: SocialHoverAnimation;
}

export interface StorefrontCustomization {
  headerLayout: HeaderLayout;
  hero: {
    bannerUrl: string;
    logoUrl: string;
    storeTitle: string;
    tagline: string;
    description: string;
    textAlign: TextAlignment;
    verticalAlign: VerticalAlignment;
    bannerHeight: BannerHeight;
  };
  colors: ThemeColors;
  typography: ThemeTypography;
  buttons: {
    shape: ButtonShape;
    size: ButtonSize;
    variant: ButtonVariant;
  };
  cards: {
    layout: CardLayout;
    imageRatio: ImageRatio;
    spacing: 'tight' | 'normal' | 'spacious';
    borderRadius: number;
    shadow: ShadowIntensity;
    hoverAnimation: HoverAnimation;
    badgeStyle: 'filled' | 'outlined' | 'subtle';
  };
  storeLayout: {
    gridColumns: StoreLayoutMode;
    contentWidth: 'full' | 'max-7xl' | 'max-5xl';
    spacing: number;
    padding: number;
  };
  navigation: {
    type: NavType;
    height: number;
    bgTransparency: number;
    blurEffect: boolean;
    activeLinkColor: string;
  };
  footer: {
    show: boolean;
    bgColor: string;
    textColor: string;
    logoUrl?: string;
    copyrightText: string;
    showSocialLinks: boolean;
    showNewsletter: boolean;
  };
  sections: {
    featuredProducts: boolean;
    newArrivals: boolean;
    collections: boolean;
    categories: boolean;
    testimonials: boolean;
    aboutUs: boolean;
    contact: boolean;
    faq: boolean;
    newsletter: boolean;
    instagramFeed: boolean;
  };
  animations: {
    type: AnimationType;
  };
  socialDisplayConfig?: SocialDisplayConfig;
}

export interface Storefront {
  id: string;
  resellerId: string;
  storeName: string;
  slug: string;
  storeDomain?: string;
  previousSlugs?: string[];
  logoUrl: string;
  bannerUrl: string;
  bannerTitle: string;
  bannerSubtitle: string;
  themeColor: StorefrontTheme;
  layoutMode: StorefrontLayout;
  minPayoutThreshold: number;
  totalEarnings: number;
  pendingPayout: number;
  totalOrdersCount: number;
  createdAt: string;
  status?: UserAccountStatus;
  isDisabled?: boolean;
  disabledReason?: string;
  disabledAt?: string;
  customization?: StorefrontCustomization;
}

export interface StorefrontProduct {
  id: string;
  storefrontId: string;
  productId: string;
  isVisible: boolean;
  displayOrder: number;
  customCoverImage?: string;
  collectionIds: string[];
  addedAt: string;
  // Computed / expanded properties for easy UI rendering
  product?: Product;
}

export interface Collection {
  id: string;
  storefrontId: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  businessId: string;
  coverImage: string;
}

export interface OrderAuditLog {
  id: string;
  action: string;
  timestamp: string;
  actorId?: string;
  actorName?: string;
  actorRole?: UserRole;
  details?: string;
  rejectionReason?: string;
}

export interface Order {
  id: string;
  storefrontId: string;
  storefrontName?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  totalAmount: number;
  resellerCommission: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectionReason?: string;
  commissionEligibleForPayout?: boolean;
  isDeliveredLocked?: boolean;
  auditLogs?: OrderAuditLog[];
}

export interface CommissionPayout {
  id: string;
  resellerId: string;
  storefrontId: string;
  storefrontName: string;
  amount: number;
  status: 'pending' | 'processed';
  paymentReference?: string;
  payoutDate: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'rejected';

export interface DisputeMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  complainantName?: string;
  complainantRole?: UserRole;
  respondentId: string;
  respondentName: string;
  respondentRole: UserRole;
  issueType: string;
  reason?: string;
  description: string;
  disputedAmount?: number;
  status: DisputeStatus;
  messages: DisputeMessage[];
  internalNotes?: string;
  resolutionDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'business' | 'reseller' | 'product' | 'order';
  targetId: string;
  targetName: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName?: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export type AppealStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'more_info_requested';

export interface AccountAppeal {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  subject: string;
  explanation: string;
  attachments?: string[];
  status: AppealStatus;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAppeal {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  businessId: string;
  businessName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  hiddenReason: string;
  hiddenAt: string;
  hiddenByAdminId?: string;
  hiddenByAdminName?: string;
  appealMessage: string;
  attachments?: string[];
  status: AppealStatus;
  adminNotes?: string;
  rejectionReason?: string;
  requestedInfo?: string;
  reviewedByAdminId?: string;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  history?: {
    action: string;
    timestamp: string;
    actor: string;
    details: string;
  }[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'businesses' | 'resellers' | 'selected';
  recipientIds?: string[];
  createdAt: string;
  createdBy: string;
}

export interface PlatformSettings {
  appName: string;
  logoUrl?: string;
  supportEmail: string;
  currencySymbol: string;
  defaultCommissionRate: number;
  minPayoutAmount: number;
  maintenanceMode: boolean;
  timezone: string;
}

export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  timestamp: string;
  stage: 'created' | 'notification' | 'accepted' | 'shipped' | 'delivered' | 'commission' | 'payout';
  title: string;
  description: string;
  actor: string;
}

export interface Notification {
  id: string;
  userId: string;
  userRole: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Follower {
  id: string;
  resellerId: string;
  businessId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: Category[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  storefrontProductId: string;
  selectedCoverImage: string;
}

export type TicketStatus = 'Open' | 'Investigating' | 'Waiting for Business' | 'Resolved' | 'Closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketType = 'customer' | 'reseller';

export type CustomerIssueCategory =
  | 'Wrong product received'
  | 'Product not delivered'
  | 'Damaged item'
  | 'Missing item'
  | 'Incorrect quantity'
  | 'Refund request'
  | 'Delivery problem'
  | 'Other';

export type ResellerIssueCategory =
  | 'Commission issue'
  | 'Payout issue'
  | 'Technical problem'
  | 'Storefront issue'
  | 'Product catalog issue'
  | 'Other';

export interface TicketNote {
  id: string;
  authorName: string;
  authorRole: string;
  note: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketType: TicketType;
  
  // Customer details (for customer tickets created by admin)
  customerName?: string;
  customerPhone?: string; // Required for customer tickets
  relatedOrderId?: string;
  businessId?: string; // Optional related business
  
  // Reseller details (for reseller tickets)
  resellerId?: string;
  resellerName?: string;

  category: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  notes: TicketNote[];
  createdAt: string;
  updatedAt: string;
}

export type OrderReportStatus =
  | 'open'
  | 'investigating'
  | 'waiting_business_response'
  | 'waiting_reseller_response'
  | 'resolved'
  | 'closed';

export type OrderReportCategory =
  | 'Order has been pending too long'
  | 'Order was rejected without explanation'
  | 'Commission was not received'
  | 'Incorrect commission amount'
  | 'Business owner is not responding'
  | 'Order status appears incorrect'
  | 'Suspected fraud'
  | 'Technical issue'
  | 'Other';

export interface OrderReportNote {
  id: string;
  authorName: string;
  authorRole: UserRole;
  note: string;
  createdAt: string;
  isInternalOnly?: boolean;
}

export interface OrderReport {
  id: string;
  orderId: string;
  resellerId: string;
  resellerName: string;
  storefrontId: string;
  storefrontName: string;
  businessId?: string;
  businessName?: string;
  productTitle?: string;
  itemsSummary: string;
  orderDate: string;
  orderStatus: OrderStatus;
  totalAmount: number;
  resellerCommission: number;
  category: OrderReportCategory | string;
  description: string;
  attachments?: string[];
  status: OrderReportStatus;
  notes: OrderReportNote[];
  resolutionDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  businessId: string;
  authorName: string;
  replyText: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductReview {
  id: string;
  orderId: string;
  productId: string;
  businessId: string;
  storefrontId?: string;
  customerName: string;
  isAnonymous?: boolean;
  rating: number; // 1 to 5
  comment?: string;
  isVerifiedPurchase: boolean;
  isHidden?: boolean;
  hiddenReason?: string;
  createdAt: string;
  updatedAt?: string;
  reply?: ReviewReply;
  productTitle?: string;
  businessName?: string;
}

export type ReviewReportStatus = 'open' | 'reviewed' | 'dismissed' | 'actioned';

export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterId?: string;
  reporterRole: UserRole | string;
  reason: string;
  details?: string;
  status: ReviewReportStatus;
  createdAt: string;
  review?: ProductReview;
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  totalVerified: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  breakdownPercentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export type ReviewSortOption = 'recent' | 'highest' | 'lowest' | 'verified';

