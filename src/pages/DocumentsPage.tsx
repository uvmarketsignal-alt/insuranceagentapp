import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Download, FileText, Image, File } from 'lucide-react';
import { useStore } from '../store';
import { DocumentViewer } from '../components/DocumentViewer';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

export default function DocumentsPage() {
  const { documents, customers, tenant } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<Array<any>>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const filteredDocuments = documents.filter((doc) => {
    const customer = customers.find(c => c.id === doc.customer_id);
    const matchesSearch = 
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    
    // Employees can only view, not download (for security)
    // Owner can download but it's logged
    return matchesSearch && matchesType;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5 text-purple-500" />;
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const getFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${Math.round(sizeInBytes / 1024)} KB`;
    return `${Math.round(sizeInBytes / (1024 * 1024))} MB`;
  };

  const handleViewDocument = useCallback((doc: any) => {
    setSelectedDocuments([doc]);
    setViewerIndex(0);
    setViewerOpen(true);
  }, []);

  const handleViewAll = useCallback(() => {
    const filteredDocs = filteredDocuments.map(doc => ({
      id: doc.id,
      file_name: doc.file_name,
      file_url: doc.file_url,
      file_type: doc.file_type,
      document_type: doc.document_type
    }));
    setSelectedDocuments(filteredDocs);
    setViewerIndex(0);
    setViewerOpen(true);
  }, [filteredDocuments]);

  const handleDownload = useCallback((docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    // Log the download attempt
    if (tenant) {
      useStore.getState().addAuditLog({
        tenant_id: tenant.id,
        action: 'download',
        entity_type: 'document',
        entity_id: docId,
        new_values: `File: ${doc.file_name}, Size: ${getFileSize(doc.file_size)}`
      });

      // Owner notification for security
      if (tenant.role === 'owner') {
        useStore.getState().addNotification({
          tenant_id: tenant.id,
          title: 'Document Downloaded',
          message: `Document "${doc.file_name}" was downloaded`,
          type: 'info',
          priority: 'medium'
        });
      }
    }

    // Trigger actual download
    const link = document.createElement('a');
    link.href = doc.file_url;
    link.download = doc.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [documents, tenant]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-600 mt-1">View and manage customer documents</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {filteredDocuments.length} documents
          </span>
          {filteredDocuments.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewAll}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View All
            </motion.button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="id_proof">ID Proof</option>
            <option value="address_proof">Address Proof</option>
            <option value="income_proof">Income Proof</option>
            <option value="policy_document">Policy Document</option>
            <option value="medical_report">Medical Report</option>
            <option value="vehicle_rc">Vehicle RC</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Document Library ({filteredDocuments.length})
            </h2>
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc) => {
                const customer = customers.find(c => c.id === doc.customer_id);
                
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Document Preview */}
                    <div className="aspect-square bg-slate-200 flex items-center justify-center relative">
                      {doc.file_type.startsWith('image/') ? (
                        <img
                          src={doc.file_url}
                          alt={doc.file_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-center">
                          {getFileIcon(doc.file_type)}
                          <p className="text-xs text-slate-500 mt-2">{doc.file_type}</p>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDocument(doc)}
                            className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {tenant?.role === 'owner' && (
                            <button
                              onClick={() => handleDownload(doc.id)}
                              className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-slate-900 truncate" title={doc.file_name}>
                        {doc.file_name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {customer?.full_name || 'Unknown Customer'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          doc.document_type === 'id_proof' && 'bg-blue-100 text-blue-800',
                          doc.document_type === 'address_proof' && 'bg-green-100 text-green-800',
                          doc.document_type === 'income_proof' && 'bg-yellow-100 text-yellow-800',
                          doc.document_type === 'policy_document' && 'bg-purple-100 text-purple-800',
                          doc.document_type === 'medical_report' && 'bg-red-100 text-red-800',
                          doc.document_type === 'vehicle_rc' && 'bg-indigo-100 text-indigo-800',
                          doc.document_type === 'other' && 'bg-gray-100 text-gray-800'
                        )}>
                          {doc.document_type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {getFileSize(doc.file_size)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {format(new Date(doc.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>

                    {/* Security Badge for Employees */}
                    {tenant?.role === 'employee' && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/90 text-white text-xs rounded-full">
                        View Only
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg">No documents found</p>
              <p className="text-slate-400 text-sm mt-2">
                {searchQuery || typeFilter !== 'all' 
                  ? 'Try adjusting your search filters'
                  : 'Upload documents from customer records'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documents={selectedDocuments}
        initialIndex={viewerIndex}
        canDownload={tenant?.role === 'owner'}
        onDownload={handleDownload}
      />
    </div>
  );
}