import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, Phone, Shield, Check, X } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

export default function EmployeesPage() {
  const { employees, addEmployee, toggleEmployeeStatus, tenant } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    employee_code: '',
    department: ''
  });

  const handleAddEmployee = async () => {
    if (!tenant) return;
    
    await addEmployee({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'employee',
      is_active: true,
      profile: {
        full_name: formData.full_name,
        phone: formData.phone,
        employee_code: formData.employee_code,
        department: formData.department,
        is_active: true
      }
    });

    setFormData({
      name: '',
      email: '',
      password: '',
      full_name: '',
      phone: '',
      employee_code: '',
      department: ''
    });
    setShowAddForm(false);
  };

  const handleToggleStatus = async (employeeId: string, currentStatus: boolean) => {
    await toggleEmployeeStatus(employeeId, !currentStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-slate-600 mt-1">Manage your team members and their access</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </motion.button>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Add New Employee</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Employee Code</label>
              <input
                type="text"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter employee code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEmployee}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Employee
            </button>
          </div>
        </motion.div>
      )}

      {/* Employees List */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Team Members ({employees.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-200">
          {employees.length > 0 ? (
            employees.map((employee) => (
              <div key={employee.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {employee.profile.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{employee.profile.full_name}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        <Mail className="inline w-3 h-3 mr-1" />
                        {employee.email}
                      </p>
                      <p className="text-sm text-slate-600">
                        <Phone className="inline w-3 h-3 mr-1" />
                        {employee.profile.phone || 'No phone'}
                      </p>
                      {employee.profile.employee_code && (
                        <p className="text-xs text-slate-500 mt-1">
                          Code: {employee.profile.employee_code}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-2">
                      <Shield className={`w-4 h-4 ${employee.role === 'owner' ? 'text-purple-600' : 'text-blue-600'}`} />
                      <span className={`text-sm font-medium ${employee.role === 'owner' ? 'text-purple-600' : 'text-blue-600'}`}>
                        {employee.role === 'owner' ? 'Owner' : 'Employee'}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.is_active ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                    <p className="text-xs text-slate-500 mt-2">
                      Joined {format(new Date(employee.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  {employee.role !== 'owner' && (
                    <button
                      onClick={() => handleToggleStatus(employee.id, employee.is_active)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                        employee.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {employee.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                  <button className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500">
              No employees found. Add your first team member!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}