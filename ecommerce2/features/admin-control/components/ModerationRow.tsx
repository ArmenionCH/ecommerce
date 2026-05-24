'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Ban } from 'lucide-react';

interface ModerationRowProps {
  type: 'seller' | 'product';
  id: string | number;
  title: string;
  subtitle: string;
  details?: string;
  isModerated: boolean;
  onApprove: () => Promise<boolean>;
  onReject: () => Promise<boolean>;
}

export function ModerationRow({
  type,
  id,
  title,
  subtitle,
  details,
  isModerated,
  onApprove,
  onReject,
}: ModerationRowProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    const ok = await onApprove();
    if (ok) {
      setDone('Approved');
    }
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    const ok = await onReject();
    if (ok) {
      setDone('Deactivated');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors last:border-0 animate-in fade-in-50 duration-200">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            {type} #{id}
          </span>
          {done ? (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              done === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {done}
            </span>
          ) : isModerated ? (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Approved · live on marketplace
            </span>
          ) : (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Pending approval
            </span>
          )}
        </div>
        <h5 className="text-sm font-bold text-gray-800">{title}</h5>
        <p className="text-xs text-gray-400">{subtitle}</p>
        {details && <p className="text-xs text-gray-500 mt-1 font-medium">{details}</p>}
      </div>

      {!done && (
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {type === 'seller' && !isModerated && (
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={handleApprove}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
            >
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Approve
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={handleReject}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <Ban className="w-4 h-4 mr-1.5" />
            {type === 'seller' ? 'Reject application' : 'Deactivate'}
          </Button>
        </div>
      )}
    </div>
  );
}
