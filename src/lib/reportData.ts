import { supabase } from "@/integrations/supabase/client";
import { Tables, Enums } from "@/integrations/supabase/types";
import { Visitor } from "@/types/visitor";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, startOfWeek, endOfWeek, isWithinInterval, addWeeks, subYears, addMonths, isSameMonth, parseISO, getWeek, startOfYear, endOfYear, eachMonthOfInterval, addYears } from 'date-fns'; // Import date-fns functions

export interface MonthlyMetrics {
  totalVisitors: number;
  newVisitors: number;
  femaleVisitors: number;
  retentionRate: number;
  averageFrequency: number;
  youngVisitors: number;
  maleVisitors: number;
  monthlyGrowth: number; // This might become a percentage change later
  totalVisitorsChange: number; // Percentage change vs previous month
  newVisitorsChange: number; // Percentage change vs previous month
  femaleVisitorsChange: number; // Percentage change vs previous month
  retentionRateChange: number; // Percentage change vs previous month
  averageFrequencyChange: number; // Change in value vs previous month (not percentage)
  youngVisitorsChange: number; // Percentage change vs previous month
  maleVisitorsChange: number; // Percentage change vs previous month
  monthlyGrowthChange: number; // This is the change of the monthly growth itself, maybe not needed?
}

export interface DailyVisitorsData {
  day: string;
  visitors: number;
  newVisitors: number;
}

export interface AgeDistributionData {
  name: string;
  value: number;
  color: string; // Assuming color is needed for the chart
}

export interface WeeklyComparisonData {
  week: string;
  current: number;
  previous: number;
}

export interface MonthlyTrendData {
  month: string;
  visitors: number;
}

export interface PerformanceMetrics {
  peakDay: { day: string | null; visitors: number };
  averageDaily: number;
  lowestDay: { day: string | null; visitors: number };
}

export interface AnnualComparisonData {
  year: string;
  visitors: number;
  growth: number; // Percentage growth vs previous year
}

// Define interfaces for the mapped data structures to help with typing
interface MappedMonthlyVisitor {
  is_new_visitor: boolean;
  visit_count: number;
  gender: string | null;
  ageGroup: string | null;
}

interface MappedDailyVisitor {
  visitDate: string | null;
  is_new_visitor: boolean;
}

interface MappedAgeDistributionVisitor {
  ageGroup: string | null;
}

interface MappedDateOnlyVisitor {
  visitDate: string | null;
}

// Helper to calculate percentage change
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // Avoid division by zero
  } else if (current === 0) {
     return -100; // If current is 0 and previous was not
  }
  return ((current - previous) / previous) * 100;
};

export async function fetchMonthlyMetrics(month: number, year: number): Promise<MonthlyMetrics | null> {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const prevMonthDate = new Date(year, month - 1, 1);
    const prevMonthStartDate = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
    const prevMonthEndDate = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0);

    console.log(`Fetching visitors for current month (${startDate.toISOString()} to ${endDate.toISOString()}) and previous month (${prevMonthStartDate.toISOString()} to ${prevMonthEndDate.toISOString()})`);

    // Select specific fields including metadata fields using ->>
    const { data: currentMonthData, error: currentMonthError } = await supabase
      .from('visitors')
      .select('is_new_visitor, visit_count, metadata->>gender, metadata->>ageGroup')
      .gte('metadata->>visitDate', startDate.toISOString())
      .lte('metadata->>visitDate', endDate.toISOString());

    if (currentMonthError) {
      console.error('Error fetching current month visitors:', currentMonthError);
      return null;
    }

    // Map data to the new interface
    const currentMonthVisitors: MappedMonthlyVisitor[] = (currentMonthData || []).map(v => ({
       is_new_visitor: v.is_new_visitor ?? false,
       visit_count: v.visit_count ?? 0,
       gender: v['metadata->>gender'] as string | null,
       ageGroup: v['metadata->>ageGroup'] as string | null,
    }));

    // Select specific fields for previous month
    const { data: prevMonthData, error: prevMonthError } = await supabase
      .from('visitors')
      .select('is_new_visitor, visit_count, metadata->>gender, metadata->>ageGroup')
      .gte('metadata->>visitDate', prevMonthStartDate.toISOString())
      .lte('metadata->>visitDate', prevMonthEndDate.toISOString());

    if (prevMonthError) {
      console.error('Error fetching previous month visitors:', prevMonthError);
    }

    // Map previous month data to the new interface
    const prevMonthVisitors: MappedMonthlyVisitor[] = (prevMonthData || []).map(v => ({
       is_new_visitor: v.is_new_visitor ?? false,
       visit_count: v.visit_count ?? 0,
       gender: v['metadata->>gender'] as string | null,
       ageGroup: v['metadata->>ageGroup'] as string | null,
    }));

    // --- Calculate Metrics for Current Month ---
    const currentTotalVisitors = currentMonthVisitors.length;
    const currentNewVisitors = currentMonthVisitors.filter(v => v.is_new_visitor).length;
    const currentFemaleVisitors = currentMonthVisitors.filter(v => v.gender === 'feminino').length;
    const currentMaleVisitors = currentMonthVisitors.filter(v => v.gender === 'masculino').length;
    const currentReturningVisitors = currentMonthVisitors.filter(v => (v.visit_count ?? 0) > 1).length;
    const currentRetentionRate = currentTotalVisitors > 0 ? (currentReturningVisitors / currentTotalVisitors) * 100 : 0;
    const currentTotalVisitCount = currentMonthVisitors.reduce((sum, v) => sum + (v.visit_count ?? 0), 0);
    const currentAverageFrequency = currentTotalVisitors > 0 ? currentTotalVisitCount / currentTotalVisitors : 0;
    const currentYoungVisitors = currentMonthVisitors.filter(v => v.ageGroup === 'jovem').length;
    const currentMonthlyGrowth = 0;

    // --- Calculate Metrics for Previous Month ---
    const prevTotalVisitors = prevMonthVisitors.length;
    const prevNewVisitors = prevMonthVisitors.filter(v => v.is_new_visitor).length;
    const prevFemaleVisitors = prevMonthVisitors.filter(v => v.gender === 'feminino').length;
    const prevMaleVisitors = prevMonthVisitors.filter(v => v.gender === 'masculino').length;
    const prevReturningVisitors = prevMonthVisitors.filter(v => (v.visit_count ?? 0) > 1).length;
    const prevRetentionRate = prevTotalVisitors > 0 ? (prevReturningVisitors / prevTotalVisitors) * 100 : 0;
    const prevTotalVisitCount = prevMonthVisitors.reduce((sum, v) => sum + (v.visit_count ?? 0), 0);
    const prevAverageFrequency = prevTotalVisitors > 0 ? prevTotalVisitCount / prevTotalVisitors : 0;
    const prevYoungVisitors = prevMonthVisitors.filter(v => v.ageGroup === 'jovem').length;
    const prevMonthlyGrowth = 0;

    // --- Calculate Changes vs Previous Month ---
    const totalVisitorsChange = calculatePercentageChange(currentTotalVisitors, prevTotalVisitors);
    const newVisitorsChange = calculatePercentageChange(currentNewVisitors, prevNewVisitors);
    const femaleVisitorsChange = calculatePercentageChange(currentFemaleVisitors, prevFemaleVisitors);
    const retentionRateChange = calculatePercentageChange(currentRetentionRate, prevRetentionRate);
    const averageFrequencyChange = currentAverageFrequency - prevAverageFrequency;
    const youngVisitorsChange = calculatePercentageChange(currentYoungVisitors, prevYoungVisitors);
    const maleVisitorsChange = calculatePercentageChange(currentMaleVisitors, prevMaleVisitors);
    const monthlyGrowthChange = calculatePercentageChange(currentMonthlyGrowth, prevMonthlyGrowth);

    return {
      totalVisitors: currentTotalVisitors,
      newVisitors: currentNewVisitors,
      femaleVisitors: currentFemaleVisitors,
      retentionRate: parseFloat(currentRetentionRate.toFixed(2)),
      averageFrequency: parseFloat(currentAverageFrequency.toFixed(1)),
      youngVisitors: currentYoungVisitors,
      maleVisitors: currentMaleVisitors,
      monthlyGrowth: currentMonthlyGrowth,
      totalVisitorsChange: parseFloat(totalVisitorsChange.toFixed(1)),
      newVisitorsChange: parseFloat(newVisitorsChange.toFixed(1)),
      femaleVisitorsChange: parseFloat(femaleVisitorsChange.toFixed(1)),
      retentionRateChange: parseFloat(retentionRateChange.toFixed(1)),
      averageFrequencyChange: parseFloat(averageFrequencyChange.toFixed(1)),
      youngVisitorsChange: parseFloat(youngVisitorsChange.toFixed(1)),
      maleVisitorsChange: parseFloat(maleVisitorsChange.toFixed(1)),
      monthlyGrowthChange: parseFloat(monthlyGrowthChange.toFixed(1)),
    };

  } catch (error) {
    console.error('Error fetching monthly metrics:', error);
    return null;
  }
}

export async function fetchDailyVisitors(month: number, year: number): Promise<DailyVisitorsData[] | null> {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    // Select specific fields: visitDate from metadata and is_new_visitor
    const { data, error } = await supabase
      .from('visitors')
      .select('metadata->>visitDate, is_new_visitor')
      .gte('metadata->>visitDate', startDate.toISOString())
      .lte('metadata->>visitDate', endDate.toISOString())
      .order('metadata->>visitDate', { ascending: true });

    if (error) {
      console.error('Error fetching daily visitors:', error);
      return null;
    }

    if (!data) {
      return [];
    }

    // Map data to the new interface
    const visitorsData: MappedDailyVisitor[] = data.map(v => ({
        visitDate: v['metadata->>visitDate'] as string | null,
        is_new_visitor: v.is_new_visitor ?? false,
    })).filter(v => v.visitDate !== null);

    const dailyData: { [key: string]: { visitors: number, newVisitors: number } } = {};

    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(startDate),
      end: endOfMonth(startDate)
    });

    daysInMonth.forEach(day => {
      dailyData[format(day, 'd')] = { visitors: 0, newVisitors: 0 };
    });

    visitorsData.forEach(visitor => {
      const day = format(parseISO(visitor.visitDate!), 'd'); // visitDate is guaranteed non-null by filter
        if (dailyData[day]) {
          dailyData[day].visitors++;
          if (visitor.is_new_visitor) {
            dailyData[day].newVisitors++;
          }
        }
    });

    const formattedDailyData: DailyVisitorsData[] = Object.keys(dailyData).map(day => ({
      day,
      visitors: dailyData[day].visitors,
      newVisitors: dailyData[day].newVisitors,
    }));

    formattedDailyData.sort((a, b) => parseInt(a.day, 10) - parseInt(b.day, 10));

    return formattedDailyData;

  } catch (error) {
    console.error('Error fetching daily visitors:', error);
    return null;
  }
}

export async function fetchAgeDistribution(month: number, year: number): Promise<AgeDistributionData[] | null> {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    // Select specific field: ageGroup from metadata
    const { data, error } = await supabase
      .from('visitors')
      .select('metadata->>ageGroup')
      .gte('metadata->>visitDate', startDate.toISOString())
      .lte('metadata->>visitDate', endDate.toISOString());

    if (error) {
      console.error('Error fetching age distribution:', error);
      return null;
    }

    if (!data) {
      return [];
    }

    // Map data to the new interface
    const visitorsData: MappedAgeDistributionVisitor[] = data.map(v => ({
       ageGroup: v['metadata->>ageGroup'] as string | null,
    })).filter(v => v.ageGroup !== null); // Filter out entries without ageGroup

    const ageGroupCounts: { [key: string]: number } = {};

    visitorsData.forEach(visitor => {
      const ageGroup = visitor.ageGroup!;
      if (ageGroup) {
        ageGroupCounts[ageGroup] = (ageGroupCounts[ageGroup] || 0) + 1;
      }
    });

    const ageGroupColors: { [key: string]: string } = {
      'adolescente': '#A8D0F2',
      'jovem': '#94C6EF',
      'adulto': '#BCDAF5',
      'melhor_idade': '#CFE4F8',
      'indefinido': '#cccccc',
    };

    const formattedAgeData: AgeDistributionData[] = Object.keys(ageGroupCounts).map(group => ({
      name: group === '' ? 'Indefinido' : group,
      value: ageGroupCounts[group],
      color: ageGroupColors[group] || ageGroupColors['indefinido']
    }));

    return formattedAgeData;

  } catch (error) {
    console.error('Error fetching age distribution:', error);
    return null;
  }
}

export async function fetchWeeklyComparison(month: number, year: number): Promise<WeeklyComparisonData[] | null> {
  try {
    const currentMonthStart = new Date(year, month, 1);
    const currentMonthEnd = new Date(year, month + 1, 0);
    const prevMonthStart = startOfMonth(subMonths(currentMonthStart, 1));
    const prevMonthEnd = endOfMonth(subMonths(currentMonthStart, 1));

    // Select only visitDate from metadata
    const { data: visitorsData, error } = await supabase
      .from('visitors')
      .select('metadata->>visitDate')
      .gte('metadata->>visitDate', prevMonthStart.toISOString()) // Fetch from start of previous month
      .lte('metadata->>visitDate', currentMonthEnd.toISOString()); // to end of current month

    if (error) {
      console.error('Error fetching weekly comparison data:', error);
      return null;
    }

    if (!visitorsData) {
      return [];
    }

    // Map data to the new interface
    const allVisitorsDatesData: MappedDateOnlyVisitor[] = visitorsData.map(v => ({
        visitDate: v['metadata->>visitDate'] as string | null,
    })).filter(v => v.visitDate !== null);

    const allVisitorsDates = allVisitorsDatesData
      .map(v => parseISO(v.visitDate!)) as Date[]; // visitDate is guaranteed non-null by filter

    const currentMonthDates = allVisitorsDates.filter(date =>
      isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })
    );
    const prevMonthDates = allVisitorsDates.filter(date =>
      isWithinInterval(date, { start: prevMonthStart, end: prevMonthEnd })
    );

    const weeklyData: WeeklyComparisonData[] = [];
    const currentMonthStartDate = new Date(year, month, 1);
    const firstDayOfCurrentMonth = startOfWeek(currentMonthStartDate, { weekStartsOn: 1 });

    const weeksInMonth = Math.ceil((currentMonthEnd.getDate() - firstDayOfCurrentMonth.getDate() + 1) / 7);

    for (let i = 0; i < weeksInMonth; i++) {
      const weekStartDate = addWeeks(firstDayOfCurrentMonth, i);
      const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });

      const currentWeekVisitors = currentMonthDates.filter(date =>
        isWithinInterval(date, { start: weekStartDate, end: weekEndDate })
      ).length;

      const prevWeekStartDate = subMonths(weekStartDate, 1);
      const prevWeekEndDate = subMonths(weekEndDate, 1);

      const prevWeekVisitors = prevMonthDates.filter(date =>
        isWithinInterval(date, { start: prevWeekStartDate, end: prevWeekEndDate })
      ).length;

      weeklyData.push({
        week: `Sem ${i + 1}`,
        current: currentWeekVisitors,
        previous: prevWeekVisitors,
      });
    }

    return weeklyData;

  } catch (error) {
    console.error('Error fetching weekly comparison data:', error);
    return null;
  }
}

export async function fetchMonthlyTrend(year: number): Promise<MonthlyTrendData[] | null> {
  try {
    const endOfSelectedYear = endOfYear(new Date(year, 11, 31));
    const startOfPeriod = startOfMonth(subMonths(endOfSelectedYear, 11));

    console.log(`Fetching visitor trend from ${startOfPeriod.toISOString()} to ${endOfSelectedYear.toISOString()}`);

    // Select only visitDate from metadata
    const { data, error } = await supabase
      .from('visitors')
      .select('metadata->>visitDate')
      .gte('metadata->>visitDate', startOfPeriod.toISOString()) // Fetch from the calculated start month
      .lte('metadata->>visitDate', endOfSelectedYear.toISOString()); // to the end of the selected year

    if (error) {
      console.error('Error fetching monthly trend:', error);
      return null;
    }

    if (!data) {
      return [];
    }

     // Map data to the new interface
    const allVisitorsDatesData: MappedDateOnlyVisitor[] = data.map(v => ({
        visitDate: v['metadata->>visitDate'] as string | null,
    })).filter(v => v.visitDate !== null);

    const allVisitorsDates = allVisitorsDatesData
      .map(v => parseISO(v.visitDate!)) as Date[]; // visitDate is guaranteed non-null by filter

    const monthlyCounts: { [key: string]: number } = {};

    const monthsInInterval = eachMonthOfInterval({ start: startOfPeriod, end: endOfSelectedYear });
    monthsInInterval.forEach(month => {
      const monthKey = format(month, 'MMM yy');
      monthlyCounts[monthKey] = 0;
    });

    allVisitorsDates.forEach(date => {
      const monthKey = format(date, 'MMM yy');
      if (monthlyCounts[monthKey] !== undefined) {
        monthlyCounts[monthKey]++;
      }
    });

    const formattedMonthlyTrend: MonthlyTrendData[] = monthsInInterval.map(month => {
      const monthKey = format(month, 'MMM yy');
      return {
        month: monthKey,
        visitors: monthlyCounts[monthKey] || 0,
      };
    });

    return formattedMonthlyTrend;

  } catch (error) {
    console.error('Error fetching monthly trend:', error);
    return null;
  }
}

export async function fetchPerformanceMetrics(month: number, year: number): Promise<PerformanceMetrics | null> {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    // Select only visitDate from metadata
    const { data, error } = await supabase
      .from('visitors')
      .select('metadata->>visitDate')
      .gte('metadata->>visitDate', startDate.toISOString())
      .lte('metadata->>visitDate', endDate.toISOString());

    if (error) {
      console.error('Error fetching performance metrics:', error);
      return null;
    }

    if (!data) {
      return {
        peakDay: { day: null, visitors: 0 },
        averageDaily: 0,
        lowestDay: { day: null, visitors: 0 },
      };
    }

     // Map data to the new interface
    const allVisitorsDatesData: MappedDateOnlyVisitor[] = data.map(v => ({
        visitDate: v['metadata->>visitDate'] as string | null,
    })).filter(v => v.visitDate !== null);

    const allVisitorsDates = allVisitorsDatesData
      .map(v => parseISO(v.visitDate!)) as Date[]; // visitDate is guaranteed non-null by filter

    if (allVisitorsDates.length === 0) {
      return {
        peakDay: { day: null, visitors: 0 },
        averageDaily: 0,
        lowestDay: { day: null, visitors: 0 },
      };
    }

    const dailyCounts: { [key: string]: number } = {};

    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    daysInMonth.forEach(day => {
      dailyCounts[format(day, 'd')] = 0;
    });

    allVisitorsDates.forEach(date => {
      const dayKey = format(date, 'd');
      if (dailyCounts[dayKey] !== undefined) {
        dailyCounts[dayKey]++;
      }
    });

    const sortedDailyCounts = Object.entries(dailyCounts).sort(([, countA], [, countB]) => countB - countA);

    const peakDay = sortedDailyCounts.length > 0 ? { day: sortedDailyCounts[0][0], visitors: sortedDailyCounts[0][1] } : { day: null, visitors: 0 };
    const lowestDay = sortedDailyCounts.length > 0 ? { day: sortedDailyCounts[sortedDailyCounts.length - 1][0], visitors: sortedDailyCounts[sortedDailyCounts.length - 1][1] } : { day: null, visitors: 0 };

    const totalVisitors = allVisitorsDates.length;
    const averageDaily = totalVisitors > 0 ? totalVisitors / daysInMonth.length : 0;

    return {
      peakDay,
      averageDaily: parseFloat(averageDaily.toFixed(1)),
      lowestDay,
    };

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return null;
  }
} 