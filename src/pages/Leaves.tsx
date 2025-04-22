import React, { useState, useEffect } from 'react';
import { useStore } from '../zustandStore/store';
import { format } from 'date-fns';
import { stopAllCameras } from '../utils/stopAllCameras';

function Leaves() {
  const [showForm, setShowForm] = useState(false);
  const { leaves, addLeave } = useStore();

  useEffect(() => {
    stopAllCameras();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addLeave({
      id: Date.now().toString(),
      startDate: new Date(formData.get('startDate') as string),
      endDate: new Date(formData.get('endDate') as string),
      type: formData.get('type') as 'sick' | 'vacation' | 'personal',
      status: 'pending',
      reason: formData.get('reason') as string,
    });

    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Leave Requests</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          New Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg border">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="sick">Sick Leave</option>
              <option value="vacation">Vacation</option>
              <option value="personal">Personal Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              name="reason"
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {leaves.map((leave) => (
          <div key={leave.id} className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {leave.type} Leave
                </span>
                <p className="text-sm text-gray-600">
                  {format(new Date(leave.startDate), 'PP')} -{' '}
                  {format(new Date(leave.endDate), 'PP')}
                </p>
              </div>
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${leave.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                ${leave.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{leave.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaves;