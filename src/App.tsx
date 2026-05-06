import React, { useState } from 'react';
import Cashier from '@/src/components/Cashier';
import Dashboard from '@/src/components/Dashboard';
import History from '@/src/components/History';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UtensilsCrossed, LayoutDashboard, ShoppingCart, History as HistoryIcon, Lock, ArrowRight } from 'lucide-react';
import { Toaster } from 'sonner';

export default function App() {
  const [view, setView] = useState<'home' | 'cashier' | 'dashboard' | 'history'>('home');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const handleLaporanClick = () => {
    setShowAuthDialog(true);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '220602') {
      setView('dashboard');
      setShowAuthDialog(false);
      setPassword('');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-amber-200">
      <Toaster position="top-center" richColors />
      {/* Header Minimalis */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView('home')}
          >
            <div className="bg-amber-800 p-2 rounded-xl text-white group-hover:rotate-12 transition-transform">
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <h1 className="text-xl font-black text-stone-900 tracking-tighter">ROTTKING</h1>
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest leading-none">Toast Management</p>
            </div>
          </div>
          
          {view !== 'home' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setView('home')}
              className="text-stone-500 hover:text-amber-800 border-stone-200 rounded-xl bg-white shadow-sm transition-all active:scale-95"
            >
              Kembali
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {view === 'home' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-12 max-w-lg mx-auto relative">
              {/* Decorative Background Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-amber-100/30 rounded-full blur-[120px] -z-10" />
              
              <div className="text-center space-y-6 relative">
                <div className="relative inline-block group">
                  <div className="bg-gradient-to-br from-amber-800 to-stone-900 p-7 rounded-[2.5rem] text-white mb-2 shadow-2xl shadow-amber-900/30 rotate-3 group-hover:rotate-0 transition-all duration-500">
                     <UtensilsCrossed size={60} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white text-amber-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border-2 border-amber-50">
                    Pro v1.2
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-6xl font-black text-stone-900 tracking-tighter">ROTT<span className="text-amber-800">KING</span></h2>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-0.5 w-8 bg-amber-800/20" />
                    <p className="text-stone-500 font-bold text-xs uppercase tracking-[0.3em]">Premium Toast System</p>
                    <div className="h-0.5 w-8 bg-amber-800/20" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-5 w-full relative">
                {/* Tombol Penjualan (Primary Gradient) */}
                <div 
                  className="group cursor-pointer bg-gradient-to-r from-amber-800 to-stone-900 p-8 rounded-[2.5rem] shadow-2xl shadow-amber-900/20 hover:shadow-amber-900/40 hover:-translate-y-2 transition-all duration-500 flex items-center gap-6 relative overflow-hidden"
                  onClick={() => setView('cashier')}
                >
                  <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10 border border-white/10">
                    <ShoppingCart size={36} />
                  </div>
                  <div className="text-left relative z-10">
                    <h3 className="text-3xl font-black text-white tracking-tight">KASIR</h3>
                    <p className="text-amber-200/60 text-xs font-bold uppercase tracking-widest">Transaksi Baru</p>
                  </div>
                  {/* Glass Accent */}
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
                </div>

                {/* Tombol Riwayat (White to Stone Gradient) */}
                <div 
                  className="group cursor-pointer bg-white p-8 rounded-[2.5rem] border-2 border-stone-100 hover:border-amber-800 shadow-xl shadow-stone-200/50 hover:shadow-amber-900/10 hover:-translate-y-2 transition-all duration-500 flex items-center gap-6 overflow-hidden relative"
                  onClick={() => setView('history')}
                >
                  <div className="bg-stone-50 p-5 rounded-2xl text-stone-400 group-hover:bg-amber-800 group-hover:text-white transition-all duration-500 border border-stone-100">
                    <HistoryIcon size={36} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-black text-stone-900 tracking-tight">RIWAYAT</h3>
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Data Penjualan</p>
                  </div>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-stone-50 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                    <ArrowRight size={48} />
                  </div>
                </div>

                {/* Tombol Laporan (Subtle Gradient) */}
                <div 
                  className="group cursor-pointer bg-stone-50/50 p-6 rounded-3xl border-2 border-stone-100 border-dashed hover:border-amber-800 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center gap-6"
                  onClick={handleLaporanClick}
                >
                  <div className="bg-stone-100 p-4 rounded-xl text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-800 transition-all">
                    <LayoutDashboard size={28} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-black text-stone-500 group-hover:text-amber-900 transition-colors">LAPORAN ANALITIK</h3>
                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Growth & Metrics</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.5em]">Authentic Toast Quality</p>
              </div>
            </div>
          )}

          {view === 'cashier' && <Cashier onBack={() => setView('home')} />}
          {view === 'dashboard' && <Dashboard onBack={() => setView('home')} />}
          {view === 'history' && <History onBack={() => setView('home')} />}
        </div>
      </main>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="text-orange-500" size={20} />
              Autentikasi Laporan
            </DialogTitle>
            <DialogDescription>
              Masukkan kode akses untuk melihat laporan omset.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAuthSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Kode Akses</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`text-center text-2xl tracking-widest ${authError ? 'border-red-500' : ''}`}
                autoFocus
              />
              {authError && <p className="text-xs text-red-500 text-center">Kode akses salah. Silahkan coba lagi.</p>}
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Masuk Laporan</Button>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="py-12 text-center text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em]">
        ROTIKING System v1.1 &bull; 2026 &bull; Secure Access Enabled
      </footer>
    </div>
  );
}
