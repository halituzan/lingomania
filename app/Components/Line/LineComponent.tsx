import React from 'react';
import './app.css'; // CSS dosyanızı buraya dahil edin

const App = () => {
  const steps = Array.from({ length: 10}, (_, i) => ({ id: i + 1 }));

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col gap-3">
        Point
        {steps.map(step => (
          <div key={step.id} className="w-16 h-16 rounded-full bg-blue-700 flex justify-center items-center text-4xl text-white">
            {step.id}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;