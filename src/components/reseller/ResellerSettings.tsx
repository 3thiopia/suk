import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Store, DollarSign, Building2, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';
import { storage } from '../../lib/storage';
import { EthiopianBankSelect } from '../common/EthiopianBankSelect';
import { PayoutBank, PayoutMethodType } from '../../types/payout';

export function ResellerSettings() {
  const currentUser = storage.getCurrentUser();
  const storefront = storage.getStorefrontByResellerId(currentUser.id);

  const [storeName, setStoreName] = useState(storefront?.storeName || '');
  const [slug, setSlug] = useState(storefront?.slug || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Payout Account State
  const [payoutBanks, setPayoutBanks] = useState<PayoutBank[]>(() => storage.getPayoutBanks());
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethodType>('ethiopian_bank');
  const [selectedBankId, setSelectedBankId] = useState<string>('bank_cbe');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [telebirrPhone, setTelebirrPhone] = useState(currentUser.phone || '+251911234567');
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [payoutSavedSuccess, setPayoutSavedSuccess] = useState(false);

  useEffect(() => {
    const existingAccount = storage.getCreatorPayoutAccount(currentUser.id);
    if (existingAccount) {
      setPayoutMethod(existingAccount.payoutMethod || 'ethiopian_bank');
      if (existingAccount.bankId) setSelectedBankId(existingAccount.bankId);
      if (existingAccount.accountHolderName) setAccountHolderName(existingAccount.accountHolderName);
      if (existingAccount.accountNumber) setAccountNumber(existingAccount.accountNumber);
      if (existingAccount.telebirrPhone) setTelebirrPhone(existingAccount.telebirrPhone);
    } else {
      // Pre-fill holder name from current user
      setAccountHolderName(currentUser.name);
    }

    const unsubscribe = storage.subscribe(() => {
      setPayoutBanks(storage.getPayoutBanks());
    });
    return unsubscribe;
  }, [currentUser.id, currentUser.name, currentUser.phone]);

  if (!storefront) {
    return <div className="p-8 text-center text-xs text-neutral-500">Storefront profile not found.</div>;
  }

  const handleSaveStore = () => {
    storage.updateStorefront(storefront.id, {
      storeName,
      slug,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSavePayoutAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSavingPayout(true);

    try {
      if (payoutMethod === 'ethiopian_bank') {
        if (!selectedBankId) {
          throw new Error('Please select an Ethiopian bank from the dropdown list.');
        }
        if (!accountHolderName.trim()) {
          throw new Error('Account holder name is required.');
        }
        if (!accountNumber.trim()) {
          throw new Error('Account number is required.');
        }
      } else if (payoutMethod === 'telebirr') {
        if (!telebirrPhone.trim()) {
          throw new Error('Telebirr mobile number is required.');
        }
      }

      storage.saveCreatorPayoutAccount({
        creatorId: currentUser.id,
        payoutMethod,
        bankId: selectedBankId,
        accountHolderName,
        accountNumber,
        telebirrPhone,
      });

      setPayoutSavedSuccess(true);
      setTimeout(() => setPayoutSavedSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save payout account.');
    } finally {
      setIsSavingPayout(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-black text-neutral-900">Creator Storefront Settings</h1>
          </div>
          <p className="text-xs text-neutral-500">
            Configure store URL, branding details, and your Ethiopian Commission Payout Account.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Store Domain & Brand Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
              <Store className="h-4 w-4 text-emerald-600" />
              Storefront Identity & URL
            </div>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Store identity updated successfully!
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 font-bold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Public URL Slug</label>
              <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1 pl-3">
                <span className="text-neutral-400 font-mono text-xs">/store/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-transparent p-1.5 font-mono font-bold text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveStore}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition-all"
            >
              <Save className="h-3.5 w-3.5 text-emerald-400" />
              <span>Update Store Identity</span>
            </button>
          </div>
        </div>

        {/* Creator Commission Payout Account Form */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Commission Payout Account
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" /> NBE Standard
            </span>
          </div>

          {payoutSavedSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Payout account updated! Commissions will settle to this account.
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSavePayoutAccount} className="space-y-4 text-xs">
            {/* Payout Method Selector */}
            <div>
              <label className="block font-bold text-neutral-800 mb-1.5">Payout Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="payout-method-bank"
                  onClick={() => setPayoutMethod('ethiopian_bank')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-bold transition-all ${
                    payoutMethod === 'ethiopian_bank'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span>Ethiopian Bank</span>
                </button>

                <button
                  type="button"
                  id="payout-method-telebirr"
                  onClick={() => setPayoutMethod('telebirr')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-bold transition-all ${
                    payoutMethod === 'telebirr'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  <span>Telebirr</span>
                </button>
              </div>
            </div>

            {/* Conditional Ethiopian Bank Fields */}
            {payoutMethod === 'ethiopian_bank' && (
              <div className="space-y-3 p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-200">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <EthiopianBankSelect
                    banks={payoutBanks}
                    selectedBankId={selectedBankId}
                    onSelectBank={(bank) => setSelectedBankId(bank.id)}
                    id="creator-payout-bank-select"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Select from 32 licensed commercial & development banks in Ethiopia.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Account Holder Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="creator-account-holder"
                    required
                    placeholder="e.g. Abebe Kebede"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="creator-account-number"
                    required
                    placeholder="e.g. 1000123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Conditional Telebirr Fields */}
            {payoutMethod === 'telebirr' && (
              <div className="space-y-3 p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-200">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Telebirr Registered Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="creator-telebirr-phone"
                    required
                    placeholder="e.g. +251 91 123 4567"
                    value={telebirrPhone}
                    onChange={(e) => setTelebirrPhone(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Ensure this phone number has an active Telebirr wallet account.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              id="save-payout-account-btn"
              disabled={isSavingPayout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSavingPayout ? 'Saving Account...' : 'Save Payout Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
