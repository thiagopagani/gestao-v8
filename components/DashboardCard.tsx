import React from 'react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => {
  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-md">
      <div className="p-3 mr-4 text-themeBlue-500 bg-themeBlue-100 rounded-full">
        {icon}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-600">
          {title}
        </p>
        <p className="text-lg font-semibold text-gray-700">
          {value}
        </p>
      </div>
    </div>
  );
};

export default DashboardCard;
