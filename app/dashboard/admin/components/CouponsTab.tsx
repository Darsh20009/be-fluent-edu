'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Percent, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '',
    expiryDate: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount) {
      toast.error('Please fill in code and discount');
      return;
    }

    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });

      if (response.ok) {
        toast.success('Coupon added successfully');
        setIsAdding(false);
        setNewCoupon({ code: '', discount: '', expiryDate: '', isActive: true });
        fetchCoupons();
      } else {
        toast.error('Failed to add coupon');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Coupon deleted');
        fetchCoupons();
      } else {
        toast.error('Failed to delete coupon');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Discount Coupons / قسائم الخصم</h2>
        <Button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {isAdding ? 'Cancel / إلغاء' : 'Add Coupon / إضافة كوبون'}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 border-2 border-emerald-500 shadow-lg bg-emerald-50">
          <h3 className="text-lg font-bold mb-4">Create New Coupon / إنشاء كوبون جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Coupon Code / كود الكوبون"
              placeholder="e.g. SUMMER2024"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
            />
            <Input
              label="Discount (%) / الخصم"
              type="number"
              placeholder="20"
              value={newCoupon.discount}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
            />
            <Input
              label="Expiry Date / تاريخ الانتهاء"
              type="date"
              value={newCoupon.expiryDate}
              onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
            />
            <div className="flex items-end">
              <Button onClick={handleAddCoupon} className="w-full bg-[#10B981] hover:bg-[#059669]">
                Save Coupon / حفظ
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl text-gray-500">
            No coupons found. Create your first discount code!
          </div>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className="p-4 relative hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Tag className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <span className="font-bold text-lg text-gray-900">{coupon.code}</span>
                </div>
                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-2xl font-black text-emerald-600 mb-2">
                <Percent className="h-6 w-6" />
                {coupon.discount}% OFF
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Expires: {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge variant={coupon.isActive ? 'success' : 'secondary'}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div className="text-xs text-gray-400">
                  Used: {coupon.useCount || 0} times
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
