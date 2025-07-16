import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttendanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-no-data">
        <p>Aucune donnée de présence disponible</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="jour" 
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px'
          }}
        />
        <Legend />
        <Bar 
          dataKey="presents" 
          fill="#28a745" 
          name="Présents"
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="retards" 
          fill="#ffc107" 
          name="Retards"
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="absents" 
          fill="#dc3545" 
          name="Absents"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
