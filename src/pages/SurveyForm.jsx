import React, { useState } from 'react';

const locationData = {
  districts: [
    {
      id: 'd1', name: 'Visakhapatnam', mandals: [
        { id: 'm1', name: 'Gajuwaka', villages: ['Village A', 'Village B'] },
        { id: 'm2', name: 'Pendurthi', villages: ['Village C', 'Village D'] }
      ]
    },
    {
      id: 'd2', name: 'Vizianagaram', mandals: [
        { id: 'm3', name: 'Bhogapuram', villages: ['Village E', 'Village F'] },
        { id: 'm4', name: 'Nellimarla', villages: ['Village G', 'Village H'] }
      ]
    }
  ],
  admins: ['Admin User 1', 'Admin User 2', 'Regional Manager']
};

// Defined 10 questions, each with 2 options
const surveyQuestions = [
  { id: 1, label: "Soil Type", opt1: "Red Soil", opt2: "Black Soil" },
  { id: 2, label: "Farming Method", opt1: "Organic", opt2: "Chemical" },
  { id: 3, label: "Water Source", opt1: "Borewell", opt2: "Rainfed" },
  { id: 4, label: "Crop Season", opt1: "Kharif", opt2: "Rabi" },
  { id: 5, label: "Seed Source", opt1: "Government", opt2: "Private" },
  { id: 6, label: "Land Ownership", opt1: "Owned", opt2: "Leased" },
  { id: 7, label: "Pesticide Use", opt1: "Applied", opt2: "Not Applied" },
  { id: 8, label: "Market Reach", opt1: "Local Market", opt2: "Export" },
  { id: 9, label: "Labor Type", opt1: "Family", opt2: "Hired" },
  { id: 10, label: "Harvest Status", opt1: "Ready", opt2: "In Progress" }
];

export function SurveyForm() {
  const [district, setDistrict] = useState('');
  const [mandal, setMandal] = useState('');
  const [village, setVillage] = useState('');
  const [admin, setAdmin] = useState('');

  // Stores the selected option index (0 or 1) for each question
  const [selections, setSelections] = useState({});

  const availableMandals = locationData.districts.find(d => d.name === district)?.mandals || [];
  const availableVillages = availableMandals.find(m => m.name === mandal)?.villages || [];

  const handleOptionChange = (questionId, optionValue) => {
    setSelections(prev => ({
      ...prev,
      [questionId]: optionValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create the console output mapping
    const results = {};
    surveyQuestions.forEach(q => {
      const picked = selections[q.id];
      // Logic: true if Option 1 is picked, false if Option 2 is picked
      results[q.label] = picked === q.opt1 ? "true" : "false";
    });

    console.log("SURVEY SUBMISSION:", {
      location: { district, mandal, village, admin },
      data: results
    });
    alert("Results sent to console!");
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gray-50 flex justify-center">
      <form onSubmit={handleSubmit} className="glass-card bg-white p-6 md:p-8 max-w-2xl w-full shadow-2xl rounded-[2rem] border border-gray-100">
        <h2 className="text-2xl font-black text-text-primary mb-6 font-poppins border-b pb-4">
          Field Assessment Form 📋
        </h2>

        {/* LOCATION DROPDOWNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">District</label>
            <select className="glow-input w-full p-3 bg-gray-50 rounded-2xl" value={district} onChange={(e) => { setDistrict(e.target.value); setMandal(''); }} required>
              <option value="">Select District</option>
              {locationData.districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mandal</label>
            <select className="glow-input w-full p-3 bg-gray-50 rounded-2xl" value={mandal} onChange={(e) => setMandal(e.target.value)} disabled={!district} required>
              <option value="">Select Mandal</option>
              {availableMandals.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Village</label>
            <select className="glow-input w-full p-3 bg-gray-50 rounded-2xl" value={village} onChange={(e) => setVillage(e.target.value)} disabled={!mandal} required>
              <option value="">Select Village</option>
              {availableVillages.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Admin</label>
            <select className="glow-input w-full p-3 bg-gray-50 rounded-2xl" value={admin} onChange={(e) => setAdmin(e.target.value)} required>
              <option value="">Select Admin</option>
              {locationData.admins.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* 2-OPTION QUESTIONS */}
        <div className="space-y-6 mb-10">
          <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
            Survey Details <span className="h-1 w-full bg-gray-100 rounded-full"></span>
          </h3>
          
          {surveyQuestions.map((q) => (
            <div key={q.id} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
              <p className="text-sm font-bold text-gray-800 mb-3">{q.id}. {q.label}</p>
              <div className="flex gap-4">
                {[q.opt1, q.opt2].map((opt) => (
                  <label key={opt} className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selections[q.id] === opt ? 'border-accent-green bg-accent-green/5 text-accent-green' : 'border-gray-100 text-gray-500'}`}>
                    <input 
                      type="radio" 
                      name={`question-${q.id}`} 
                      className="hidden" 
                      checked={selections[q.id] === opt}
                      onChange={() => handleOptionChange(q.id, opt)}
                      required
                    />
                    <span className="text-xs font-bold">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="glow-btn w-full py-4 rounded-2xl text-lg font-black tracking-wide">
          SUBMIT DATA →
        </button>
      </form>
    </div>
  );
}