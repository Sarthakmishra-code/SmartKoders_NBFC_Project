import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { applicationService } from '../services/applicationService';
import { Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Documents = () => {
  const { user } = useApp();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationService.getUserApplications(user.id);
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Load applications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">Manage and upload documents for your applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-6">Create an application first to upload documents</p>
          <Link to="/applications/new" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FileText size={20} className="mr-2" />
            Create Application
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Application #{app.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Loan Amount: ₹{app.loan_amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <Link
                  to={`/applications/${app.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Upload size={18} className="mr-2" />
                  Upload Documents
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['PAN Card', 'Salary Slip', 'Bank Statement', 'Identity Proof'].map((docType, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon('pending')}
                      <span className="text-sm font-medium text-gray-700">{docType}</span>
                    </div>
                    <p className="text-xs text-gray-500">Not uploaded</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;