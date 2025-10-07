'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/i18n';

interface TrendChartProps {
  labels: string[];
  fuelData: number[];
  miscData: number[];
  totalData: number[];
  title?: string;
}

export default function TrendChart({ labels, fuelData, miscData, totalData, title }: TrendChartProps) {
  const { t } = useTranslation('dashboard');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamically import Chart.js to avoid SSR issues
    import('chart.js/auto').then((ChartJS) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      // Destroy previous chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Create gradients for professional look
      const fuelGradient = ctx.createLinearGradient(0, 0, 0, 400);
      fuelGradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
      fuelGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.12)');
      fuelGradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

      const miscGradient = ctx.createLinearGradient(0, 0, 0, 400);
      miscGradient.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      miscGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)');
      miscGradient.addColorStop(1, 'rgba(168, 85, 247, 0.02)');

      const totalGradient = ctx.createLinearGradient(0, 0, 0, 400);
      totalGradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      totalGradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

      // Create new chart with enterprise-grade styling
      chartRef.current = new ChartJS.default(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: t('charts.fuel'),
              data: fuelData,
              borderColor: '#3b82f6',
              backgroundColor: fuelGradient,
              borderWidth: 2.5,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointHoverBackgroundColor: '#3b82f6',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 3,
            },
            {
              label: t('charts.misc'),
              data: miscData,
              borderColor: '#a855f7',
              backgroundColor: miscGradient,
              borderWidth: 2.5,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: '#a855f7',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointHoverBackgroundColor: '#a855f7',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 3,
            },
            {
              label: t('charts.total'),
              data: totalData,
              borderColor: '#10b981',
              backgroundColor: totalGradient,
              borderWidth: 3.5,
              tension: 0.4,
              fill: true,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointBackgroundColor: '#10b981',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2.5,
              pointHoverBackgroundColor: '#10b981',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 3.5,
              borderDash: [0],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20,
                font: {
                  size: 13,
                  weight: 600,
                  family: "'Inter', 'system-ui', sans-serif",
                },
                color: '#374151',
                boxWidth: 10,
                boxHeight: 10,
              },
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              titleColor: '#f9fafb',
              bodyColor: '#f9fafb',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              padding: 16,
              displayColors: true,
              boxWidth: 12,
              boxHeight: 12,
              boxPadding: 6,
              usePointStyle: true,
              titleFont: {
                size: 14,
                weight: 'bold' as const,
                family: "'Inter', 'system-ui', sans-serif",
              },
              bodyFont: {
                size: 13,
                weight: 500,
                family: "'Inter', 'system-ui', sans-serif",
              },
              bodySpacing: 8,
              cornerRadius: 8,
              caretSize: 8,
              caretPadding: 12,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += formatCurrency(context.parsed.y);
                  }
                  return label;
                },
                afterLabel: function(context) {
                  // Calculate percentage of total
                  const datasetIndex = context.datasetIndex;
                  if (datasetIndex < 2) { // Only for Fuel and Misc
                    const total = context.chart.data.datasets[2].data[context.dataIndex] as number;
                    const value = context.parsed.y;
                    if (total > 0) {
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `(${percentage}% of total)`;
                    }
                  }
                  return '';
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: true,
                color: 'rgba(156, 163, 175, 0.1)',
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 12,
                  weight: 500,
                  family: "'Inter', 'system-ui', sans-serif",
                },
                padding: 10,
              },
              border: {
                display: false,
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(156, 163, 175, 0.15)',
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 12,
                  weight: 500,
                  family: "'Inter', 'system-ui', sans-serif",
                },
                padding: 12,
                callback: function(value) {
                  return formatCurrency(value as number);
                }
              },
              border: {
                display: false,
              }
            }
          },
          animation: {
            duration: 1500,
            easing: 'easeInOutQuart',
          },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [labels, fuelData, miscData, totalData, t]);

  return (
    <Card className="hover:shadow-glow transition-all duration-300 border-gray-200 bg-gradient-to-br from-white to-gray-50/30">
      <CardHeader className="border-b border-gray-100 bg-white/50 backdrop-blur-sm">
        <CardTitle className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mr-3 shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {title || t('charts.monthlyTrend')}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Letzte {labels.length} Monate
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-96">
          <canvas ref={canvasRef}></canvas>
        </div>
        {/* Watermark for professional branding */}
        <div className="mt-2 text-right">
          <span className="text-[10px] text-gray-400 font-medium">Flotix Analytics</span>
        </div>
      </CardContent>
    </Card>
  );
}
