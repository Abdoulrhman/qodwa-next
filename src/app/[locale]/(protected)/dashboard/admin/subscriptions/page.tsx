'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Subscription {
  id: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED';
  startDate: string;
  endDate: string;
  user: {
    name: string;
    email: string;
  };
  package: {
    name: string;
    price: number;
  };
  sessionsUsed: number;
  totalSessions: number;
}

interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
}

export default function AdminSubscriptionsPage() {
  const t = useTranslations('Dashboard');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscriptions');

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'EXPIRED':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'CANCELED':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-300 rounded mb-6'></div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-24 bg-gray-300 rounded'></div>
            ))}
          </div>
          <div className='h-64 bg-gray-300 rounded'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-600'>{error}</p>
          <button
            onClick={fetchSubscriptions}
            className='mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold mb-6'>Subscription Management</h1>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold text-gray-700'>
            Total Subscriptions
          </h3>
          <p className='text-3xl font-bold text-blue-600'>{stats.total}</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold text-gray-700'>Active</h3>
          <p className='text-3xl font-bold text-green-600'>{stats.active}</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold text-gray-700'>Expired</h3>
          <p className='text-3xl font-bold text-red-600'>{stats.expired}</p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h2 className='text-xl font-semibold'>All Subscriptions</h2>
        </div>

        {subscriptions.length === 0 ? (
          <div className='p-6 text-center text-gray-500'>
            No subscriptions found
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    User
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Package
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Sessions
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {subscription.user.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {subscription.user.email}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {subscription.package.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          ${subscription.package.price}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={getStatusBadge(subscription.status)}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {subscription.sessionsUsed} / {subscription.totalSessions}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      <div>
                        <div>Start: {formatDate(subscription.startDate)}</div>
                        <div>End: {formatDate(subscription.endDate)}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
