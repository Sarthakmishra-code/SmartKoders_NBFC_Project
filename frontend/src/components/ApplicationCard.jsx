import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ApplicationCard = ({ application }) => {

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      documents_pending: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Link to={`/applications/${application.id}`} className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Application #{application.id}
          </h3>
          <p className="text-sm text-gray-500">{application.loan_purpose || 'Personal Loan'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
          {application.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <DollarSign size={18} className="mr-2" />
          <span className="font-medium">
            ₹{application.loan_amount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center text-gray-600">
          <Clock size={18} className="mr-2" />
          <span>{application.tenure_months} months</span>
        </div>

        <div className="flex items-center text-gray-600">
          <Calendar size={18} className="mr-2" />
          <span>{format(new Date(application.created_at), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {application.monthly_emi && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">Monthly EMI</p>
          <p className="text-lg font-semibold text-primary-600">
            ₹{application.monthly_emi.toLocaleString('en-IN')}
          </p>
        </div>
      )}
    </Link>
  );
};

export default ApplicationCard;
