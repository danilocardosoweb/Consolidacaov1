
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportChartsProps {
  selectedMonth: number;
  selectedYear: number;
}

const ReportCharts: React.FC<ReportChartsProps> = ({ selectedMonth, selectedYear }) => {
  // Mock data
  const dailyVisitors = [
    { day: '1', visitors: 8, newVisitors: 3 },
    { day: '2', visitors: 12, newVisitors: 5 },
    { day: '3', visitors: 6, newVisitors: 2 },
    { day: '4', visitors: 15, newVisitors: 7 },
    { day: '5', visitors: 18, newVisitors: 8 },
    { day: '6', visitors: 22, newVisitors: 9 },
    { day: '7', visitors: 25, newVisitors: 12 },
    { day: '8', visitors: 20, newVisitors: 6 },
    { day: '9', visitors: 16, newVisitors: 4 },
    { day: '10', visitors: 19, newVisitors: 7 },
    { day: '11', visitors: 23, newVisitors: 10 },
    { day: '12', visitors: 28, newVisitors: 14 },
    { day: '13', visitors: 26, newVisitors: 11 },
    { day: '14', visitors: 30, newVisitors: 15 },
    { day: '15', visitors: 27, newVisitors: 9 },
  ];

  const ageGroups = [
    { name: '18-25', value: 25, color: '#94C6EF' },
    { name: '26-35', value: 35, color: '#A8D0F2' },
    { name: '36-45', value: 28, color: '#BCDAF5' },
    { name: '46-55', value: 18, color: '#CFE4F8' },
    { name: '56+', value: 14, color: '#E2EEFB' },
  ];

  const weeklyComparison = [
    { week: 'Sem 1', current: 85, previous: 72 },
    { week: 'Sem 2', current: 92, previous: 78 },
    { week: 'Sem 3', current: 88, previous: 85 },
    { week: 'Sem 4', current: 96, previous: 88 },
  ];

  const monthlyTrend = [
    { month: 'Jan', visitors: 180 },
    { month: 'Feb', visitors: 195 },
    { month: 'Mar', visitors: 220 },
    { month: 'Apr', visitors: 205 },
    { month: 'May', visitors: 235 },
    { month: 'Jun', visitors: 247 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800">{`Dia ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {`${entry.dataKey === 'visitors' ? 'Total' : 'Novos'}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyVisitors}>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageGroups}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: '12px', fontWeight: 500, fill: '#1e293b' }}
                >
                  {ageGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#475569" style={{ fontSize: '12px', fontWeight: 500 }} />
                <YAxis stroke="#475569" style={{ fontSize: '12px', fontWeight: 500 }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 500 }} />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }} />
                <Bar dataKey="current" name="Mês Atual" fill="#94C6EF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="previous" name="Mês Anterior" fill="#A8D0F2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
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
