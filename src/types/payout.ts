export interface PayoutBank {
  id: string;
  name: string;
  code?: string;
  shortName?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
}

export type PayoutMethodType = 'ethiopian_bank' | 'telebirr';

export interface CreatorPayoutAccount {
  id: string;
  creatorId: string;
  payoutMethod: PayoutMethodType;
  
  // Ethiopian Bank fields (when payoutMethod === 'ethiopian_bank')
  bankId?: string;
  bankName?: string; // Resolved from bankId or stored for reference
  accountHolderName?: string;
  accountNumber?: string;
  
  // Telebirr fields (when payoutMethod === 'telebirr')
  telebirrPhone?: string;
  
  isVerified?: boolean;
  updatedAt: string;
  createdAt: string;
}
