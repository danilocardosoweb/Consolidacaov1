import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchDailyVisitors, DailyVisitorsData, fetchMonthlyMetrics, MonthlyMetrics, fetchAgeDistribution, AgeDistributionData, fetchWeeklyComparison, WeeklyComparisonData } from '@/lib/reportData';
import { Loader2 } from 'lucide-react';

interface ReportChartsProps {
  selectedMonth: number;
  selectedYear: number;
}

// Define specific types for Tooltip payload entries
interface DailyVisitorsTooltipPayload {
  dataKey: string; // 'visitors' or 'newVisitors'
  value: number;
  color: string;
  name?: string; // Optional name
}

interface AgeDistributionTooltipPayload {
  name: string; // Age group name
  value: number;
  color: string;
  percent?: number; // Optional percentage
}

// Define the union type for the payload
type CustomTooltipPayload = DailyVisitorsTooltipPayload | AgeDistributionTooltipPayload;

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
  label?: string | number; // Label is typically the X-axis value (day for daily visitors) or undefined for PieChart
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Check the structure of the first payload item to determine type
    const firstEntry = payload[0];

    if (firstEntry && 'dataKey' in firstEntry) { // Likely Daily Visitors data (AreaChart)
       return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          {label !== undefined && <p className="font-semibold text-slate-800">{`Dia ${label}`}</p>}
          {payload.map((entry: DailyVisitorsTooltipPayload, index: number) => ( // Use specific type
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {`${entry.dataKey === 'visitors' ? 'Total' : 'Novos'}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    } else if (firstEntry && 'name' in firstEntry && 'value' in firstEntry) { // Likely Age Distribution data (PieChart)
       return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          {payload.map((entry: AgeDistributionTooltipPayload, index: number) => ( // Use specific type
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {`${entry.name}: ${entry.value}${entry.percent !== undefined ? ` (${(entry.percent * 100).toFixed(0)}%)` : ''}`}
            </p>
          ))}
        </div>
      );
    } else { // Fallback for unexpected structure
       return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800">Tooltip Data</p>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </div>
      );
    }
  }
  return null;
};

const ReportCharts: React.FC<ReportChartsProps> = ({ selectedMonth, selectedYear }) => {
  const [dailyVisitorsData, setDailyVisitorsData] = useState<DailyVisitorsData[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [ageDistributionData, setAgeDistributionData] = useState<AgeDistributionData[]>([]);
  const [loadingAge, setLoadingAge] = useState(true);
  const [weeklyComparisonData, setWeeklyComparisonData] = useState<WeeklyComparisonData[]>([]);
  const [loadingWeekly, setLoadingWeekly] = useState(true);

  useEffect(() => {
    const loadDailyData = async () => {
      setLoadingDaily(true);
      const data = await fetchDailyVisitors(selectedMonth, selectedYear);
      if (data) {
        setDailyVisitorsData(data);
      } else {
         setDailyVisitorsData([]);
      }
      setLoadingDaily(false);
    };

    const loadAgeDistributionData = async () => {
      setLoadingAge(true);
      const data = await fetchAgeDistribution(selectedMonth, selectedYear);
      if (data) {
        setAgeDistributionData(data);
      } else {
        setAgeDistributionData([]); // Ensure it's an empty array on error/no data
      }
      setLoadingAge(false);
    };

    const loadWeeklyComparisonData = async () => {
      setLoadingWeekly(true);
      const data = await fetchWeeklyComparison(selectedMonth, selectedYear);
      if (data) {
        setWeeklyComparisonData(data);
      } else {
         setWeeklyComparisonData([]);
      }
      setLoadingWeekly(false);
    };

    loadDailyData();
    loadAgeDistributionData();
    loadWeeklyComparisonData();
  }, [selectedMonth, selectedYear]);

  // Mock data (to be replaced)
  const monthlyTrend = [
    { month: 'Jan', visitors: 180 },
    { month: 'Feb', visitors: 195 },
    { month: 'Mar', visitors: 220 },
    { month: 'Apr', visitors: 205 },
    { month: 'May', visitors: 235 },
    { month: 'Jun', visitors: 247 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-playfair font-bold gradient-text mb-2">
          Análise Gráfica
        </h2>
        <p className="text-slate-600 font-medium">
          Visualizações detalhadas dos dados de visitação
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visitors Trend */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg font-semibold gradient-text">
              Visitantes por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDaily ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-church-primary animate-spin mb-4" />
                <p className="text-gray-700">Carregando dados diários...</p>
              </div>
            ) : dailyVisitorsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}> {/* Corrected width to 100% */}
                <AreaChart data={dailyVisitorsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#475569" style={{ fontSize: '12px', fontWeight: 500 }} />
                  <YAxis stroke="#475569" style={{ fontSize: '12px', fontWeight: 500 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#94C6EF"
                    fill="#94C6EF"
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="newVisitors"
                    stroke="#A8D0F2"
                    fill="#A8D0F2"
                    fillOpacity={0.5}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>Nenhum dado de visitante encontrado para este mês.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Age Groups */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg font-semibold gradient-text">
              Distribuição por Idade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAge ? (
               <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-church-primary animate-spin mb-4" />
                <p className="text-gray-700">Carregando distribuição por idade...</p>
              </div>
            ) : ageDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: '12px', fontWeight: 500, fill: '#1e293b' }}
                >
                  {ageDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>Nenhum dado de distribuição por idade encontrado para este mês.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Comparison */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg font-semibold gradient-text">
              Comparativo Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
             {loadingWeekly ? (
               <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-church-primary animate-spin mb-4" />
                <p className="text-gray-700">Carregando comparativo semanal...</p>
              </div>
            ) : weeklyComparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#475569" style={{ fontSize: '12px', fontWeight: 500 }} />
                <YAxis stroke="#475569" style={{ fontSize: '12px', fontWeight: 500 }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 500 }} />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }} />
                <Bar dataKey="current" name="Mês Atual" fill="#94C6EF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="previous" name="Mês Anterior" fill="#A8D0F2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
             ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>Nenhum dado de comparativo semanal encontrado para este mês.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg font-semibold gradient-text">
              Tendência Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#475569" style={{ fontSize: '12px', fontWeight: 500 }} />
                <YAxis stroke="#475569" style={{ fontSize: '12px', fontWeight: 500 }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 500 }} />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#94C6EF"
                  strokeWidth={4}
                  dot={{ fill: '#94C6EF', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#94C6EF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle className="text-xl font-semibold gradient-text">
            Análise de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-xl font-bold text-church-primary mb-1">Pico</div>
              <div className="text-sm text-slate-700 font-medium">Dia 14</div>
              <div className="text-xs text-slate-600">30 visitantes</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="text-xl font-bold text-emerald-600 mb-1">Média</div>
              <div className="text-sm text-slate-700 font-medium">19.7/dia</div>
              <div className="text-xs text-slate-600">Crescimento +12%</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="text-xl font-bold text-purple-600 mb-1">Menor</div>
              <div className="text-sm text-slate-700 font-medium">Dia 3</div>
              <div className="text-xs text-slate-600">6 visitantes</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <div className="text-xl font-bold text-orange-600 mb-1">Tendência</div>
              <div className="text-sm text-slate-700 font-medium">Crescente</div>
              <div className="text-xs text-slate-600">+18% no mês</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportCharts;
