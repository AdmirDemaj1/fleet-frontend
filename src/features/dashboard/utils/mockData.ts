// Mock data for dashboard

import { DashboardData } from '../types/dashboard.types';

export const mockDashboardData: DashboardData = {
  metrics: [
    {
      title: 'Total Vehicles',
      value: 247,
      change: 12,
      changeLabel: 'from last month',
      color: 'primary'
    },
    {
      title: 'Active Contracts',
      value: 189,
      change: 8,
      changeLabel: 'from last month',
      color: 'success'
    },
    {
      title: 'Total Customers',
      value: 156,
      change: -3,
      changeLabel: 'from last month',
      color: 'info'
    },
    {
      title: 'Monthly Revenue',
      value: '€127,450',
      change: 15.8,
      changeLabel: 'from last month',
      color: 'secondary'
    }
  ],
  vehicleStatusChart: {
    labels: ['Active', 'Maintenance', 'Available', 'Out of Service'],
    data: [142, 23, 67, 15],
    colors: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
  },
  revenueChart: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [95000, 102000, 98000, 115000, 127000, 134000, 128000, 145000, 139000, 152000, 148000, 165000],
        color: '#3b82f6'
      },
      {
        label: 'Expenses',
        data: [65000, 68000, 71000, 75000, 78000, 82000, 79000, 86000, 83000, 89000, 87000, 91000],
        color: '#ef4444'
      }
    ]
  },
  contractsChart: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    data: [45, 52, 61, 48],
    colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981']
  },
  recentActivity: [
    {
      id: '1',
      type: 'contract',
      title: 'New Contract Signed',
      description: 'Contract #2024-001 signed with ABC Company',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'success'
    },
    {
      id: '2',
      type: 'vehicle',
      title: 'Vehicle Maintenance Completed',
      description: 'Vehicle VIN-12345 maintenance completed',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: 'info'
    },
    {
      id: '3',
      type: 'customer',
      title: 'New Customer Registration',
      description: 'John Doe registered as new individual customer',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      status: 'success'
    },
    {
      id: '4',
      type: 'payment',
      title: 'Payment Overdue',
      description: 'Payment for Contract #2023-156 is overdue',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      status: 'warning'
    },
    {
      id: '5',
      type: 'vehicle',
      title: 'Vehicle Status Updated',
      description: 'Vehicle VIN-67890 marked as available',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      status: 'info'
    }
  ]
};
