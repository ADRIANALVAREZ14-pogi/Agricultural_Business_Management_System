import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filterUser, setFilterUser] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  const loadLogs = async () => {
    const params = {};
    if (filterUser.trim()) params.user = filterUser.trim();
    if (filterDepartment !== 'ALL') params.department = filterDepartment;
    if (filterDate) params.date = filterDate;

    const res = await api.get('/admin/audit-logs', { params });
    setLogs(res.data);
  };

  useEffect(() => {
    loadLogs();
  }, [filterUser, filterDepartment, filterDate]);

  const handleClearFilters = () => {
    setFilterUser('');
    setFilterDepartment('ALL');
    setFilterDate('');
  };

  return (
    <div>
      <h2>Admin - System Activity &amp; Audit Logs</h2>

      {/* Filter Controls: User, Department, and Date */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <label>Filter by User: </label>
          <input
            type="text"
            placeholder="Username or User ID"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          />
        </div>

        <div>
          <label>Filter by Department: </label>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Gulayan">Gulayan</option>
            <option value="Prutasan">Prutasan</option>
            <option value="Babuyan">Babuyan</option>
            <option value="All">System / Admin</option>
          </select>
        </div>

        <div>
          <label>Filter by Date: </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <button type="button" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>

      {/* Activity & Audit Log Table */}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Role</th>
            <th>Department</th>
            <th>Module</th>
            <th>Action</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan="7">No activity logs found for the selected filters.</td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.username}</td>
                <td>{log.user_role}</td>
                <td>{log.department}</td>
                <td>{log.module_name}</td>
                <td><strong>{log.action_type}</strong></td>
                <td>{log.details}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAuditLogs;