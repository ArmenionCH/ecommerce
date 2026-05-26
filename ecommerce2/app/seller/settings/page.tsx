'use client';

import React, { useEffect, useState } from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Clock, XCircle, FileText, Upload, Shield } from 'lucide-react';
import type { VerificationRequest } from '@/lib/types';

export default function SellerSettingsPage() {
  const { user, isLoading: isSessionLoading } = useUserSession();
  const [isVerified, setIsVerified] = useState(false);
  const [existingRequest, setExistingRequest] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    businessDocumentUrl: '',
  });

  const fetchVerificationStatus = async () => {
    if (!user) return;
    try {
      // Check if seller is verified
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsVerified(profile.is_verified);
      }

      // Check for existing verification request
      const { data: request } = await supabaseClient
        .from('verification_requests')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (request) {
        setExistingRequest(request as VerificationRequest);
      }
    } catch (err) {
      console.error('Failed to fetch verification status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'seller') {
      fetchVerificationStatus();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (existingRequest && existingRequest.status === 'pending') {
        setErrorMsg('You already have a pending verification request.');
        return;
      }

      const { error } = await supabaseClient
        .from('verification_requests')
        .insert({
          seller_id: user.id,
          business_name: formData.businessName,
          business_description: formData.businessDescription,
          business_document_url: formData.businessDocumentUrl || null,
          status: 'pending',
        });

      if (error) throw error;

      setSuccessMsg('Verification request submitted successfully! We will review your application.');
      await fetchVerificationStatus();
      setFormData({ businessName: '', businessDescription: '', businessDocumentUrl: '' });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit verification request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    if (!user) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabaseClient
        .storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseClient
        .storage
        .from('verification-documents')
        .getPublicUrl(fileName);

      setFormData({ ...formData, businessDocumentUrl: publicUrl });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to upload document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'seller') {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto my-10 space-y-4">
        <span className="text-5xl">🔒</span>
        <h3 className="text-xl font-bold text-gray-800">Seller Area</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Please sign in as a seller to access settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Seller Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your seller account and verification status.</p>
      </div>

      {/* Verification Status Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Verification Status</h2>
        </div>

        {isVerified ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-900">Verified Seller</p>
              <p className="text-sm text-emerald-700">Your account is verified and trusted by buyers.</p>
            </div>
          </div>
        ) : existingRequest ? (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              existingRequest.status === 'pending' ? 'bg-amber-50 border-amber-100' :
              existingRequest.status === 'rejected' ? 'bg-rose-50 border-rose-100' :
              'bg-emerald-50 border-emerald-100'
            }`}>
              {existingRequest.status === 'pending' ? (
                <Clock className="w-8 h-8 text-amber-600" />
              ) : existingRequest.status === 'rejected' ? (
                <XCircle className="w-8 h-8 text-rose-600" />
              ) : (
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              )}
              <div>
                <p className={`font-bold ${
                  existingRequest.status === 'pending' ? 'text-amber-900' :
                  existingRequest.status === 'rejected' ? 'text-rose-900' :
                  'text-emerald-900'
                }`}>
                  {existingRequest.status.charAt(0).toUpperCase() + existingRequest.status.slice(1)}
                </p>
                <p className="text-sm text-gray-600">
                  {existingRequest.status === 'pending' ? 'Your verification is being reviewed.' :
                   existingRequest.status === 'rejected' ? 'Your verification was rejected.' :
                   'Your verification was approved!'}
                </p>
                {existingRequest.admin_notes && (
                  <p className="text-xs text-gray-500 mt-1">Admin: {existingRequest.admin_notes}</p>
                )}
              </div>
            </div>
            {existingRequest.status === 'rejected' && (
              <Button
                onClick={() => {
                  setExistingRequest(null);
                  setFormData({ businessName: '', businessDescription: '', businessDocumentUrl: '' });
                }}
                variant="outline"
                className="w-full"
              >
                Submit New Application
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <XCircle className="w-8 h-8 text-gray-400" />
            <div>
              <p className="font-bold text-gray-900">Not Verified</p>
              <p className="text-sm text-gray-600">Apply for verification to build trust with buyers.</p>
            </div>
          </div>
        )}
      </div>

      {/* Verification Application Form */}
      {!isVerified && (!existingRequest || existingRequest.status === 'rejected') && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Apply for Verification</h2>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-sm mb-4">{errorMsg}</div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-sm mb-4">{successMsg}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Business Name</label>
              <Input
                type="text"
                placeholder="Your business or shop name"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Business Description</label>
              <textarea
                placeholder="Describe your business, products, and experience..."
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                disabled={isSubmitting}
                className="flex w-full rounded-xl border bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:ring-emerald-200/50 min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Business Document (Optional)</label>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="https://..."
                  value={formData.businessDocumentUrl}
                  onChange={(e) => setFormData({ ...formData, businessDocumentUrl: e.target.value })}
                  disabled={isSubmitting}
                />
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload(file);
                    }}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                  <div className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-gray-700 text-center cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-400">Upload business permit, license, or other verification documents.</p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
