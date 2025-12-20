import { useEffect } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import StatsCard from '../components/StatsCard';
import { FileText, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { analytics, applications, loading, loadAnalytics, loadApplications } = useAdmin();

  useEffect(() => {
    loadAnalytics();
    loadApplications();
  }, []);

  if (loading && !analytics) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusCounts = () => {
    if (!analytics?.statusBreakdown) return {};
    
    const counts = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    analytics.statusBreakdown.forEach(item => {
      counts.total += item.count;
      if (item.status === 'pending' || item.status === 'under_review') {
        counts.pending += item.count;
      } else if (item.status === 'approved') {
        counts.approved += item.count;
      } else if (item.status === 'rejected') {
        counts.rejected += item.count;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage all loan applications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Applications"
          value={statusCounts.total || 0}
          icon={<FileText size={24} />}
          color="primary"
        />
        <StatsCard
          title="Pending Review"
          value={statusCounts.pending || 0}
          icon={<Clock size={24} />}
          color="yellow"
        />
        <StatsCard
          title="Approved"
          value={statusCounts.approved || 0}
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <StatsCard
          title="Rejected"
          value={statusCounts.rejected || 0}
          icon={<XCircle size={24} />}
          color="red"
        />
      </div>

      {/* Average Metrics */}
      {analytics?.averageMetrics && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Average Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Loan Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Math.round(analytics.averageMetrics.avg_loan_amount || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Credit Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analytics.averageMetrics.avg_credit_score || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg DTI Ratio</p>
              <p className="text-2xl font-bold text-gray-900">
                {(analytics.averageMetrics.avg_dti || 0).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg EMI</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Math.round(analytics.averageMetrics.avg_emi || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Applications</h2>
        
        {applications.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No applications yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.slice(0, 10).map(app => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{app.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{app.loan_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        app.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
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
};

export default AdminDashboard;