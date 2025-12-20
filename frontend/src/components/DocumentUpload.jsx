import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const DocumentUpload = ({ onUpload, loading, error }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('pan');
  const [dragActive, setDragActive] = useState(false);

  const documentTypes = [
    { value: 'pan', label: 'PAN Card' },
    { value: 'salary_slip', label: 'Salary Slip' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'identity_proof', label: 'Identity Proof' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await onUpload(selectedFile, documentType);
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Upload Document</h3>

      {/* Document Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="input-field"
        >
          {documentTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-3">
            <CheckCircle size={48} className="mx-auto text-green-500" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              <X size={20} className="inline mr-1" />
              Remove
            </button>
          </div>
        ) : (
          <>
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop your file here, or
            </p>
            <label className="cursor-pointer">
              <span className="text-primary-600 hover:text-primary-700 font-medium">
                browse
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleChange}
                accept=".jpg,.jpeg,.png,.pdf"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supports: JPG, PNG, PDF (Max 10MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle size={20} className="text-red-600 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full btn-primary mt-4 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} className="mr-2" />
              Upload Document
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default DocumentUpload;