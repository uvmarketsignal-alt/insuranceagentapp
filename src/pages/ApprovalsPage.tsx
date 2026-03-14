import { useState } from 'react';
import { Check, X, MessageSquare, Eye, Download, CreditCard } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

export default function ApprovalsPage() {
  const { customers, approveCustomer, rejectCustomer, requestChanges, tenant } = useStore();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const pendingCustomers = customers.filter(c => c.status === 'pending');

  const handleApprove = async (customerId: string) => {
    if (!tenant) return;
    await approveCustomer(customerId, notes);
    setSelectedCustomer(null);
    setNotes('');
    setShowNotes(false);
  };

  const handleReject = async (customerId: string) => {
    if (!tenant) return;
    await rejectCustomer(customerId, notes);
    setSelectedCustomer(null);
    setNotes('');
    setShowNotes(false);
  };

  const handleRequestChanges = async (customerId: string) => {
    if (!tenant) return;
    await requestChanges(customerId, notes);
    setSelectedCustomer(null);
    setNotes('');
    setShowNotes(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Approvals</h1>
          <p className="text-slate-600 mt-1">Review and approve pending customer applications</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Pending Customers ({pendingCustomers.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {pendingCustomers.length > 0 ? (
            pendingCustomers.map((customer) => (
              <div key={customer.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900">{customer.full_name}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                      {customer.risk_score !== undefined && (
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          customer.risk_score > 70 ? "bg-red-100 text-red-800" :
                          customer.risk_score > 40 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        )}>
                          {customer.risk_score}% Risk
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {customer.phone} • {customer.email || 'No email'}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {customer.occupation || 'No occupation'} • ₹{customer.annual_income || '0'}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Applied {format(new Date(customer.created_at), 'MMM dd, yyyy')} • {customer.address || 'No address'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <button
                      onClick={() => setSelectedCustomer(customer.id)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {selectedCustomer === customer.id && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    {/* Document Preview Section */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Uploaded Documents
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {useStore.getState().documents.filter(d => d.customer_id === customer.id).map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Download className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-900 truncate capitalize">{doc.document_type.replace('_', ' ')}</p>
                                <p className="text-[10px] text-slate-500 truncate">{doc.file_name}</p>
                              </div>
                            </div>
                            <a 
                              href={doc.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          </div>
                        ))}
                        {useStore.getState().documents.filter(d => d.customer_id === customer.id).length === 0 && (
                          <div className="col-span-full py-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                            No documents uploaded for this customer
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Review Notes {selectedCustomer === customer.id && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Add your review notes here..."
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApprove(customer.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestChanges(customer.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleReject(customer.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500">
              No pending customers to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}