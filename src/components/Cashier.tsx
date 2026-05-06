
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MENU_ITEMS, Sale } from '@/src/types';
import { supabase } from '@/src/lib/supabase';
import { ShoppingCart, Trash2, Banknote, RotateCcw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Cashier({ onBack }: { onBack?: () => void }) {
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastChange, setLastChange] = useState<number | null>(null);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const changeAmount = paymentAmount ? Math.max(0, Number(paymentAmount) - totalPrice) : 0;
  const isPaymentSufficient = Number(paymentAmount) >= totalPrice && totalPrice > 0;

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setPaymentAmount('');
    setLastChange(null);
  };

  const handleCheckout = async () => {
    if (!isPaymentSufficient || loading) return;

    setLoading(true);
    try {
      // Gabungkan rincian pesanan ke dalam satu string menu_name
      // Contoh: "Roti Bakar Full (x1), Roti Bakar Setengah (x2)"
      const menuDescription = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
      const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

      const transaction = {
        menu_name: menuDescription,
        quantity: totalQty,
        price: totalPrice / totalQty, // Harga rata-rata atau bisa diset 0 jika tidak relevan
        total_price: totalPrice,
        payment_amount: Number(paymentAmount),
        change_amount: changeAmount,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('sales').insert([transaction]);
      
      if (error) throw error;

      setLastChange(changeAmount);
      setCart([]);
      setPaymentAmount('');
      
      toast.success('Penjualan Berhasil!', {
        description: `Kembalian: Rp ${changeAmount.toLocaleString('id-ID')}`,
        icon: <CheckCircle2 className="text-green-500" />,
        duration: 5000,
      });

    } catch (error: any) {
      console.error(error);
      toast.error('Gagal menyimpan penjualan', {
        description: error.message || 'Terjadi kesalahan pada server'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      {onBack && (
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="rounded-full hover:bg-amber-100 text-amber-800"
          >
            <ArrowLeft size={24} />
          </Button>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">Kasir Penjualan</h2>
        </div>
      )}

        <div className="flex flex-col lg:flex-row gap-8 pb-24 items-start">
        {/* Menu Selection - Sisi Kiri */}
        <div className="flex-1 space-y-6 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-stone-800 uppercase tracking-tight">Daftar Menu</h3>
            <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-1 rounded">2 Items Tersedia</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MENU_ITEMS.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer overflow-hidden border-2 border-stone-100 hover:border-amber-500 transition-all bg-white shadow-sm hover:shadow-md rounded-2xl"
                  onClick={() => addToCart(item)}
                >
                  <div className="h-32 w-full overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base font-bold text-stone-900">{item.name}</CardTitle>
                    <CardDescription className="text-lg font-black text-amber-700">
                      Rp {item.price.toLocaleString('id-ID')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="bg-amber-50/50 border-amber-100 rounded-2xl border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-amber-800">Status Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              {lastChange !== null ? (
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 text-green-700 p-2 rounded-lg">
                    <Banknote size={16} />
                  </div>
                  <div className="text-sm text-stone-600 font-bold">
                    Kembalian Terakhir: <span className="font-black text-lg text-stone-900">Rp {lastChange.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-400 italic">Siap melayani pesanan ROTTKING...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart & Payment - Sisi Kanan (Sticky on Desktop) */}
        <div className="w-full lg:w-[450px] lg:sticky lg:top-24 space-y-6">
          <Card className="shadow-2xl shadow-amber-900/10 border-stone-100 flex flex-col bg-white rounded-[2rem] overflow-hidden border-t-4 border-t-amber-800">
            <CardHeader className="bg-white p-6 border-b border-stone-50">
              <CardTitle className="flex items-center gap-3 text-xl font-black text-stone-900">
                <div className="bg-amber-800 p-2 rounded-xl text-white">
                  <ShoppingCart size={20} />
                </div>
                Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              {/* Cart Items */}
              <div className="flex-1 min-h-[150px] max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {cart.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full py-12 flex flex-col items-center justify-center text-stone-300 gap-2"
                    >
                      <ShoppingCart size={40} className="opacity-10" />
                      <p className="font-black uppercase text-[10px] tracking-widest">Kosong</p>
                    </motion.div>
                  ) : (
                    cart.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 10, opacity: 0 }}
                        className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-transparent hover:border-amber-100 transition-all"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-stone-900 text-sm">{item.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-2 bg-white rounded-lg border border-stone-100 p-0.5">
                              <button 
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c));
                                  } else {
                                    removeFromCart(item.id);
                                  }
                                }}
                                className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-amber-800"
                              >-</button>
                              <span className="text-xs font-black min-w-[12px] text-center">{item.quantity}</span>
                              <button 
                                onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))}
                                className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-amber-800"
                              >+</button>
                            </div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase">
                              @ {item.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-stone-900 text-sm">
                            {(item.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 text-stone-300 hover:text-red-500 bg-white"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-stone-100 pt-6 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Total Bayar</span>
                  <span className="text-3xl font-black text-amber-800 tracking-tighter">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment" className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1">Bayar Tunai (RP)</Label>
                  <div className="relative">
                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={20} />
                    <Input
                      id="payment"
                      type="number"
                      placeholder="0"
                      className="pl-12 text-xl font-black py-7 border-2 border-stone-100 rounded-2xl focus:border-amber-800 focus:ring-0 placeholder:text-stone-200 transition-all bg-stone-50/30"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-2xl flex justify-between items-center border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-800">KEMBALIAN</span>
                  <span className={`text-xl font-black ${changeAmount > 0 ? 'text-green-600' : 'text-stone-300'}`}>
                    Rp {changeAmount.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  <Button 
                    variant="outline" 
                    className="col-span-1 h-16 rounded-2xl border-stone-200 text-stone-400 hover:bg-stone-50"
                    onClick={clearCart}
                  >
                    <RotateCcw size={18} />
                  </Button>
                  <Button 
                    className="col-span-5 bg-amber-800 hover:bg-stone-900 text-white font-black h-16 text-lg rounded-2xl shadow-xl shadow-amber-900/10 transition-all active:scale-95 disabled:opacity-30"
                    disabled={!isPaymentSufficient || loading}
                    onClick={handleCheckout}
                  >
                    {loading ? 'MEMPROSES...' : 'BAYAR SEKARANG'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
