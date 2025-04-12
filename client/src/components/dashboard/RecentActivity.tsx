import React from "react";

interface RecentActivityProps {
  userId: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ userId }) => {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
      <p className="text-gray-600">Recent activity for user ID: {userId} will be displayed here.</p>
    </section>
  );
};

export default RecentActivity;