
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/src/lib/supabase';
import { Sale } from '@/src/types';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  History as HistoryIcon, Search, Calendar as CalendarIcon, 
  Receipt, ArrowLeft, FileDown, FileSpreadsheet, FileText, FileImage 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { exportToExcel, exportToPDF, exportToWord } from '@/src/lib/exportUtils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function History({ onBack }: { onBack?: () => void }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetchSales();
  }, [searchTerm]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .filter('created_at', 'gte', `${searchTerm}T00:00:00Z`)
        .filter('created_at', 'lte', `${searchTerm}T23:59:59Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (err) {
      console.error('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: 'excel' | 'pdf' | 'word') => {
    const title = `Laporan Penjualan ROTTKING - ${format(parseISO(searchTerm), 'dd MMMM yyyy', { locale: id })}`;
    const fileName = `Export_ROTTKING_${searchTerm}`;

    if (type === 'excel') exportToExcel(sales, fileName);
    else if (type === 'pdf') exportToPDF(sales, title, fileName);
    else exportToWord(sales, title, fileName);
  };

  const totalDay = sales.reduce((acc, s) => acc + s.total_price, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="rounded-full hover:bg-stone-200 text-stone-600"
            >
              <ArrowLeft size={24} />
            </Button>
          )}
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">Riwayat Transaksi</h2>
        </div>

        {sales.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-stone-900 hover:bg-stone-800 rounded-2xl font-bold flex items-center gap-2 px-4 py-2 text-white text-sm transition-all active:scale-95 shadow-lg">
              <FileDown size={18} />
              Ekspor Harian
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl border-stone-100 p-2 min-w-[200px]">
              <DropdownMenuItem onClick={() => handleExport('excel')} className="rounded-xl flex items-center gap-3 cursor-pointer p-3 font-bold text-stone-600">
                <FileSpreadsheet size={18} className="text-green-600" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="rounded-xl flex items-center gap-3 cursor-pointer p-3 font-bold text-stone-600">
                <FileImage size={18} className="text-red-600" />
                PDF (.pdf)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('word')} className="rounded-xl flex items-center gap-3 cursor-pointer p-3 font-bold text-stone-600">
                <FileText size={18} className="text-blue-600" />
                Word (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-amber-900 p-3 rounded-2xl text-white">
            <HistoryIcon size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Arsip Data</p>
            <p className="font-black text-stone-900">Log Penjualan</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-stone-50 px-6 py-3 rounded-2xl border border-stone-100 w-full sm:w-auto focus-within:border-amber-700 transition-all">
          <CalendarIcon size={18} className="text-amber-800" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase leading-none mb-1">Filter Tanggal</p>
            <Input 
              type="date" 
              className="border-none focus:ring-0 text-sm p-0 h-auto w-full bg-transparent font-black text-stone-900 cursor-pointer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="bg-[#3D2B1F] text-white shadow-2xl shadow-stone-900/10 rounded-[2.5rem] border-none overflow-hidden relative">
        <CardContent className="p-10 flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10 text-center sm:text-left">
          <div className="space-y-1">
            <p className="text-amber-200/60 text-xs font-bold uppercase tracking-[0.3em]">Total Pendapatan</p>
            <p className="text-5xl font-black tracking-tighter">Rp {totalDay.toLocaleString('id-ID')}</p>
          </div>
          <div className="h-12 w-px bg-white/10 hidden sm:block" />
          <div className="text-right flex flex-col items-center sm:items-end gap-1">
             <p className="text-amber-200/60 text-xs font-bold uppercase tracking-[0.3em]">Volume Penjualan</p>
             <p className="text-5xl font-black tracking-tighter">{sales.length} <span className="text-lg text-amber-200/40 uppercase font-black">Sells</span></p>
          </div>
        </CardContent>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-900/50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em]">Rincian Transaksi</h3>
          <div className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded uppercase">
            Live Database
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-amber-900/20 border-t-amber-900 rounded-full animate-spin" />
            <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">Sinkronisasi Data...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-stone-100 shadow-sm flex flex-col items-center gap-4">
            <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center">
              <Search className="text-stone-200" size={40} />
            </div>
            <div className="space-y-1">
              <p className="text-stone-900 font-black text-lg tracking-tight">Data Kosong</p>
              <p className="text-stone-400 text-sm">Tidak ditemukan transaksi pada tanggal {format(parseISO(searchTerm), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {sales.map((sale) => (
              <Card 
                key={sale.id} 
                className="hover:border-amber-200 transition-all hover:shadow-xl hover:-translate-y-1 border-stone-100 rounded-[1.5rem] group cursor-pointer bg-white overflow-hidden"
                onClick={() => setSelectedSale(sale)}
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="bg-stone-50 p-4 rounded-2xl text-stone-400 group-hover:bg-amber-900 group-hover:text-white transition-all duration-500 font-black text-xs leading-none flex flex-col items-center gap-1">
                      <span>{format(parseISO(sale.created_at), 'HH')}</span>
                      <div className="w-4 h-0.5 bg-current opacity-20" />
                      <span>{format(parseISO(sale.created_at), 'mm')}</span>
                    </div>
                    <div>
                      <p className="font-black text-stone-900 text-xl tracking-tight leading-tight mb-1">
                        {sale.items && sale.items.length > 0 
                          ? sale.items.map(i => i.menu_name).join(', ') 
                          : sale.menu_name || 'No Items'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full uppercase">
                          {sale.items && sale.items.length > 0
                            ? sale.items.reduce((acc, i) => acc + i.quantity, 0)
                            : sale.quantity || 0} Porsi
                        </span>
                        <span className="text-[10px] font-bold text-stone-300">
                          {sale.items && sale.items.length > 0 ? `${sale.items.length} Jenis Menu` : 'Ringkasan Transaksi'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-amber-900 text-2xl tracking-tighter">
                      Rp {sale.total_price.toLocaleString('id-ID')}
                    </p>
                    <div className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Detail Transaksi
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-[3rem] border-stone-100 p-0 overflow-hidden">
          <div className="bg-amber-900 p-8 text-white relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt size={24} />
                <h3 className="text-xl font-black uppercase tracking-tight">Struk Digital</h3>
              </div>
              <div className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded uppercase">Original Copy</div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>
          
          {selectedSale && (
            <div className="p-8 space-y-8 bg-white">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Merchant</p>
                    <p className="font-black text-stone-900 text-lg">ROTTKING TOAST</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Receipt NO.</p>
                    <p className="font-mono text-xs text-stone-500">RK-{selectedSale.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="bg-stone-50 p-6 rounded-3xl space-y-4 border border-stone-100">
                  <div className="flex justify-between items-center pb-4 border-b border-stone-200 border-dashed">
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Timestamp</span>
                    <span className="font-bold text-stone-900 text-sm">
                      {format(parseISO(selectedSale.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedSale.items && selectedSale.items.length > 0 ? (
                      selectedSale.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div>
                            <p className="font-black text-stone-900">{item.menu_name}</p>
                            <p className="text-[10px] font-bold text-stone-400 uppercase">{item.quantity} Units x Rp {item.price.toLocaleString('id-ID')}</p>
                          </div>
                          <span className="font-black text-stone-900 text-sm">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black text-stone-900">{selectedSale.menu_name}</p>
                          <p className="text-[10px] font-bold text-stone-400 uppercase">Total {selectedSale.quantity} Item</p>
                        </div>
                        <span className="font-black text-stone-900 text-sm">Rp {selectedSale.total_price.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-200 border-dashed space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Subtotal</span>
                      <span className="font-black text-stone-900">Rp {selectedSale.total_price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-stone-400">
                      <span>Tunai</span>
                      <span>Rp {selectedSale.payment_amount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-black text-green-600">CHANGE</span>
                      <span className="text-2xl font-black text-green-600 tracking-tighter">Rp {selectedSale.change_amount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-stone-200">
                  <div className="h-px flex-1 bg-current" />
                  <div className="w-2 h-2 rounded-full bg-current" />
                  <div className="h-px flex-1 bg-current" />
                </div>
                <p className="text-[10px] text-stone-300 font-black uppercase tracking-[0.3em]">Thank you for coming!</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
