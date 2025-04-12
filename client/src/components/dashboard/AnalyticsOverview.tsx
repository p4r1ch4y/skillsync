import React from "react";

interface AnalyticsOverviewProps {
  userId: number;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ userId }) => {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics Overview</h2>
      <p className="text-gray-600">Analytics data for user ID: {userId} will be displayed here.</p>
    </section>
  );
};

export default AnalyticsOverview;