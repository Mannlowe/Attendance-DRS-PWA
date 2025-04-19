import React from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

function Home() {
  const { erpLinks, attendances } = useStore();
  const lastAttendance = attendances[attendances.length - 1];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <h2 className="font-semibold text-blue-900">Last Check-in</h2>
        {lastAttendance ? (
          <p className="text-blue-700 mt-1">
            {format(new Date(lastAttendance.timestamp), 'PPp')}
          </p>
        ) : (
          <p className="text-blue-700 mt-1">No recent check-ins</p>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Quick Links</h2>
        <div className="grid grid-cols-2 gap-4">
          {erpLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex-1">{link.title}</span>
              <ExternalLink size={16} className="text-gray-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;