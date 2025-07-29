export interface DashboardMetric {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ComponentType;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export interface PieChartData {
  labels: string[];
  data: number[];
  colors: string[];
}

export interface BarChartData {
  labels: string[];
  data: number[];
  colors?: string[];
}

export interface DashboardData {
  metrics: DashboardMetric[];
  vehicleStatusChart: PieChartData;
  revenueChart: LineChartData;
  contractsChart: BarChartData;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'contract' | 'vehicle' | 'customer' | 'payment';
  title: string;
  description: string;
  timestamp: Date | string;
  status?: 'success' | 'warning' | 'error' | 'info';
}
