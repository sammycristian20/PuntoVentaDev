'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type SalesSummary = {
  total_sales: number;
  total_tax: number;
  total_items: number;
  average_sale: number;
};

type TopProduct = {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
};

type DailySales = {
  date: string;
  total: number;
  items_sold: number;
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch sales summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('sales')
        .select('total, tax, items:sales_items(quantity)')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      if (summaryError) throw summaryError;

      const summary = summaryData?.reduce(
        (acc, sale) => {
          acc.total_sales += sale.total;
          acc.total_tax += sale.tax;
          acc.total_items += sale.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          return acc;
        },
        { total_sales: 0, total_tax: 0, total_items: 0, average_sale: 0 }
      );

      if (summary && summaryData.length > 0) {
        summary.average_sale = summary.total_sales / summaryData.length;
      }

      setSummary(summary || null);

      // Fetch top products
      const { data: topProductsData, error: topProductsError } = await supabase
        .from('sales_items')
        .select(`
          quantity,
          price,
          products(name)
        `)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      if (topProductsError) throw topProductsError;

      const productSummary = topProductsData?.reduce((acc: any, item: any) => {
        const productName = item.products.name;
        if (!acc[productName]) {
          acc[productName] = { total_quantity: 0, total_revenue: 0 };
        }
        acc[productName].total_quantity += item.quantity;
        acc[productName].total_revenue += item.price * item.quantity;
        return acc;
      }, {});

      const topProducts = Object.entries(productSummary || {}).map(([name, data]: [string, any]) => ({
        product_name: name,
        ...data,
      })).sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5);

      setTopProducts(topProducts);

      // Fetch daily sales
      const { data: dailySalesData, error: dailySalesError } = await supabase
        .from('sales')
        .select('created_at, total, items:sales_items(quantity)')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at');

      if (dailySalesError) throw dailySalesError;

      const dailySalesMap = dailySalesData?.reduce((acc: any, sale: any) => {
        const date = sale.created_at.split('T')[0];
        if (!acc[date]) {
          acc[date] = { total: 0, items_sold: 0 };
        }
        acc[date].total += sale.total;
        acc[date].items_sold += sale.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        return acc;
      }, {});

      const dailySales = Object.entries(dailySalesMap || {}).map(([date, data]: [string, any]) => ({
        date,
        ...data,
      }));

      setDailySales(dailySales);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando reportes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Reportes de Ventas
          </h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Rango de Fechas</label>
          <div className="mt-1 flex space-x-4">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Ventas Totales</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {summary ? formatCurrency(summary.total_sales) : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">ITBIS Total</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {summary ? formatCurrency(summary.total_tax) : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Artículos Vendidos</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {summary ? summary.total_items : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Venta Promedio</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {summary ? formatCurrency(summary.average_sale) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Productos Más Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Producto
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Cantidad
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {product.product_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {product.total_quantity}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatCurrency(product.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ventas Diarias</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Fecha
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Ventas
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Artículos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dailySales.map((day, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {formatDate(day.date)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatCurrency(day.total)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {day.items_sold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}