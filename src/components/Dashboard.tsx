
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/src/lib/supabase';
import { Sale } from '@/src/types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { 
  format, startOfDay, startOfMonth, startOfYear, isWithinInterval, 
  endOfDay, endOfMonth, endOfYear, parseISO 
} from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  TrendingUp, Calendar, Hash, DollarSign, ArrowLeft, Layers, 
  FileDown, FileSpreadsheet, FileText, FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToExcel, exportToPDF, exportToWord } from '@/src/lib/exportUtils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function Dashboard({ onBack }: { onBack?: () => void }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<'today' | 'month' | 'year' | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    if (selectedReport === 'today') {
      return sales.filter(s => 
        isWithinInterval(parseISO(s.created_at), { start: startOfDay(now), end: endOfDay(now) })
      );
    }
    if (selectedReport === 'month') {
      return sales.filter(s => 
        isWithinInterval(parseISO(s.created_at), { start: startOfMonth(now), end: endOfMonth(now) })
      );
    }
    if (selectedReport === 'year') {
      return sales.filter(s => 
        isWithinInterval(parseISO(s.created_at), { start: startOfYear(now), end: endOfYear(now) })
      );
    }
    return [];
  }, [sales, selectedReport]);

  const stats = useMemo(() => {
    const now = new Date();
    
    const dailySales = sales.filter(s => 
      isWithinInterval(parseISO(s.created_at), { start: startOfDay(now), end: endOfDay(now) })
    );
    const monthlySales = sales.filter(s => 
      isWithinInterval(parseISO(s.created_at), { start: startOfMonth(now), end: now })
    );
    const yearlySales = sales.filter(s => 
      isWithinInterval(parseISO(s.created_at), { start: startOfYear(now), end: now })
    );

    const sum = (arr: Sale[]) => arr.reduce((acc, sale) => acc + sale.total_price, 0);

    return {
      today: sum(dailySales),
      thisMonth: sum(monthlySales),
      thisYear: sum(yearlySales),
      totalCount: sales.length,
      averageTicket: sales.length > 0 ? sum(sales) / sales.length : 0
    };
  }, [sales]);

  // Chart data: Group by last 7 days
  const dailyChartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'yyyy-MM-dd');
    }).reverse();

    return last7Days.map(dateStr => {
      const daySales = sales.filter(s => s.created_at.startsWith(dateStr));
      return {
        date: format(parseISO(dateStr), 'dd/MM', { locale: id }),
        total: daySales.reduce((acc, s) => acc + s.total_price, 0)
      };
    });
  }, [sales]);

  const filteredStats = useMemo(() => {
    const total = filteredData.reduce((acc, s) => acc + s.total_price, 0);
    return {
      total,
      profitSharing: {
        modal: total * 0.5,
        pengelola: total * 0.3,
        pemilik: total * 0.2
      }
    };
  }, [filteredData]);

  const handleExport = (type: 'excel' | 'pdf' | 'word') => {
    const dataToExport = selectedReport ? filteredData : sales;
    const total = dataToExport.reduce((acc, s) => acc + s.total_price, 0);
    
    // Only include profit sharing for monthly reports or if specifically chosen
    const summary = {
      total,
      profitSharing: selectedReport === 'month' ? {
        modal: total * 0.5,
        pengelola: total * 0.3,
        pemilik: total * 0.2
      } : undefined
    };

    const title = selectedReport 
      ? `Laporan ROTTKING - ${selectedReport.toUpperCase()}` 
      : 'Laporan Seluruh Penjualan ROTTKING';
    const fileName = `Laporan_ROTTKING_${format(new Date(), 'yyyyMMdd_HHmm')}`;

    if (type === 'excel') exportToExcel(dataToExport, fileName, summary);
    else if (type === 'pdf') exportToPDF(dataToExport, title, fileName, summary);
    else exportToWord(dataToExport, title, fileName, summary);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-amber-800/20 border-t-amber-800 rounded-full animate-spin" />
        <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">Menyiapkan Laporan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={selectedReport ? () => setSelectedReport(null) : onBack}
              className="rounded-full hover:bg-amber-100 text-amber-800"
            >
              <ArrowLeft size={24} />
            </Button>
          )}
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            {selectedReport ? `Detail Laporan ${selectedReport === 'today' ? 'Hari Ini' : selectedReport === 'month' ? 'Bulan Ini' : 'Tahun Ini'}` : 'Analisa Bisnis'}
          </h2>
        </div>

        {selectedReport && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-amber-800 hover:bg-stone-900 rounded-2xl font-bold flex items-center gap-2 px-4 py-2 text-white text-sm transition-all active:scale-95 shadow-lg shadow-amber-900/20">
                <FileDown size={18} />
                Ekspor Laporan
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl border-stone-100 p-2 min-w-[200px]">
                <DropdownMenuItem onClick={() => handleExport('excel')} className="rounded-xl flex items-center gap-3 cursor-pointer p-3 font-bold text-stone-600">
                  <FileSpreadsheet size={18} className="text-green-600" />
                  Format Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="rounded-xl flex items-center gap-3 cursor-pointer p-3 font-bold text-stone-600">
                  <FileImage size={18} className="text-red-600" />
                  Format PDF (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('word')} className="rounded-xl flex items-center gap-3 cursor-pointer p-3 font-bold text-stone-600">
                  <FileText size={18} className="text-blue-600" />
                  Format Word (.docx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {!selectedReport ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'today', label: 'HARI INI', value: stats.today, icon: Calendar, color: 'text-amber-800', bg: 'bg-white', tag: 'Today' },
              { id: 'month', label: 'BULAN INI', value: stats.thisMonth, icon: Layers, color: 'text-amber-800', bg: 'bg-white', tag: 'Monthly' },
              { id: 'year', label: 'TAHUN INI', value: stats.thisYear, icon: DollarSign, color: 'text-stone-900', bg: 'bg-amber-50', tag: 'Annual' },
              { id: 'total', label: 'TRANSAKSI', value: stats.totalCount, icon: Hash, color: 'text-white', bg: 'bg-amber-900', isMoney: false, tag: 'Lifetime' },
            ].map((item, i) => (
              <Card 
                key={i} 
                className={`${item.bg} border-stone-100 shadow-sm rounded-[2rem] overflow-hidden relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                onClick={() => i < 3 && setSelectedReport(item.id as any)}
              >
                <div className="p-8 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${item.bg === 'bg-amber-900' ? 'bg-white/10 text-white' : 'bg-stone-50 text-stone-400 opacity-50'}`}>
                      <item.icon size={20} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.bg === 'bg-amber-900' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                      {item.tag}
                    </span>
                  </div>
                  <div>
                    <p className={`text-3xl font-black ${item.color} tracking-tighter`}>
                      {item.isMoney === false ? item.value : `Rp ${item.value.toLocaleString('id-ID')}`}
                    </p>
                    <p className={`text-[10px] font-bold ${item.bg === 'bg-amber-900' ? 'text-amber-200/50' : 'text-stone-300'} uppercase tracking-[0.2em] mt-1`}>{item.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 shadow-sm border-stone-100 rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black text-stone-900 flex items-center gap-3">
                  <TrendingUp size={24} className="text-amber-800" />
                  Trend Performa
                </CardTitle>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">7 Hari Terakhir</p>
              </CardHeader>
              <CardContent className="h-[350px] p-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyChartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#78350f" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#78350f" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                      tickFormatter={(val) => `Rp ${val/1000}k`}
                    />
                    <Tooltip 
                      formatter={(val: number) => [`Rp ${val.toLocaleString('id-ID')}`, 'Omset']}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                      itemStyle={{ fontWeight: 900, color: '#78350f' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#78350f" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Transactions Table */}
            <Card className="shadow-sm border-stone-100 rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-amber-900 text-white p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Terbaru</CardTitle>
                  <div className="text-[10px] font-black bg-white/20 px-2 py-1 rounded">Real-time</div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-stone-400 uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-left">Jam</th>
                      <th className="px-6 py-4 text-left">Menu</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {sales.slice(0, 10).map((sale) => (
                      <tr key={sale.id} className="hover:bg-amber-50/50 transition-colors group">
                        <td className="px-6 py-4 text-stone-400 font-bold">
                          {format(parseISO(sale.created_at), 'HH:mm')}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-stone-800">
                             {sale.items && sale.items.length > 0 
                               ? sale.items.map(i => i.menu_name).join(', ') 
                               : sale.menu_name || 'No Items'}
                          </p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase">
                            {sale.items && sale.items.length > 0
                              ? sale.items.reduce((acc, i) => acc + i.quantity, 0)
                              : sale.quantity || 0} Items
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-amber-900 group-hover:scale-110 transition-transform">
                          Rp{sale.total_price.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sales.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                   <Hash className="text-stone-100" size={48} />
                   <p className="text-stone-300 font-bold text-xs uppercase tracking-widest">Belum ada data</p>
                </div>
              )}
            </Card>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {selectedReport === 'month' && (
            <Card className="shadow-sm border-amber-200 rounded-[2rem] overflow-hidden bg-amber-50/30">
              <CardHeader className="bg-amber-800 text-white p-6">
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={20} />
                  Ringkasan Bagi Hasil (50/30/20)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-amber-800/50 uppercase tracking-[0.2em]">Modal (50%)</p>
                    <p className="text-2xl font-black text-stone-900">Rp {filteredStats.profitSharing.modal.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-amber-800/50 uppercase tracking-[0.2em]">Pengelola (30%)</p>
                    <p className="text-2xl font-black text-stone-900">Rp {filteredStats.profitSharing.pengelola.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-amber-800/50 uppercase tracking-[0.2em]">Pemilik (20%)</p>
                    <p className="text-2xl font-black text-amber-800 font-black">Rp {filteredStats.profitSharing.pemilik.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-stone-100 rounded-[2.5rem] overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Waktu</th>
                    <th className="px-6 py-4 text-left">Menu</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right">Total Harga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredData.map((sale) => (
                    <tr key={sale.id} className="hover:bg-amber-50/50 transition-colors group">
                      <td className="px-6 py-4 text-stone-400 font-bold">
                        {format(parseISO(sale.created_at), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 font-black text-stone-800">
                        {sale.items && sale.items.length > 0 
                          ? sale.items.map(i => i.menu_name).join(', ') 
                          : sale.menu_name || 'No Items'}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-stone-600">
                        {sale.items && sale.items.length > 0
                          ? sale.items.reduce((acc, i) => acc + i.quantity, 0)
                          : sale.quantity || 0}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-amber-900">
                        Rp{sale.total_price.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-stone-50/50">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-stone-400 uppercase tracking-widest">Grand Total</td>
                    <td className="px-6 py-4 text-right font-black text-2xl text-amber-800">
                      Rp {filteredStats.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {filteredData.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                 <Hash className="text-stone-100" size={48} />
                 <p className="text-stone-300 font-bold text-xs uppercase tracking-widest">Tidak ada data untuk periode ini</p>
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  );
}
