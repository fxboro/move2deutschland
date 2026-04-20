import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  FileText, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download, 
  LogOut,
  User
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();

  const steps = [
    { name: 'Eligibility', status: 'completed' },
    { name: 'Document Upload', status: 'current' },
    { name: 'Expert Review', status: 'upcoming' },
    { name: 'Visa Prep', status: 'upcoming' },
    { name: 'Pre-Departure', status: 'upcoming' },
  ];

  const documents = [
    { name: 'WAEC Certificate', status: 'Verified', icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'University Transcript', status: 'Pending', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'International Passport', status: 'Missing', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const resources = [
    { name: 'Blocked Account Guide 2026', type: 'PDF', size: '2.4 MB' },
    { name: 'German Health Insurance Explained', type: 'PDF', size: '1.8 MB' },
    { name: 'Visa Interview Checklist', type: 'PDF', size: '1.1 MB' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navigation */}
      <nav className="bg-prussian-blue text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div 
          className="font-heading font-bold text-2xl tracking-tight cursor-pointer"
          onClick={() => navigate('/')}
        >
          move<span className="text-gold">2</span>deutschland
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold text-prussian-blue flex items-center justify-center font-bold">
              JD
            </div>
            <span className="font-medium">John Doe</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-prussian-blue font-heading">Candidate Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome back, John. Here is your application progress.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Progress & Documents) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Progress Tracker */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-prussian-blue mb-6">Application Progress</h2>
              <div className="relative">
                <div className="absolute left-4 md:left-auto md:top-4 bottom-0 md:bottom-auto md:right-0 md:w-full w-0.5 md:h-0.5 bg-slate-200 -z-10"></div>
                <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-0">
                  {steps.map((step, index) => (
                    <div key={step.name} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white ${
                        step.status === 'completed' ? 'text-green-500' : 
                        step.status === 'current' ? 'text-gold border-2 border-gold' : 
                        'text-slate-300'
                      }`}>
                        {step.status === 'completed' ? <CheckCircle2 size={32} /> : <Circle size={24} className={step.status === 'current' ? 'fill-gold/20' : ''} />}
                      </div>
                      <span className={`text-sm font-medium ${
                        step.status === 'completed' ? 'text-slate-800' : 
                        step.status === 'current' ? 'text-prussian-blue font-bold' : 
                        'text-slate-400'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Document Management */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-prussian-blue">Document Management</h2>
                <span className="text-sm font-medium text-slate-500">1 of 3 Uploaded</span>
              </div>
              
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.bg} ${doc.color}`}>
                        <doc.icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{doc.name}</h3>
                        <span className={`text-xs font-bold uppercase tracking-wider ${doc.color}`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      {doc.status === 'Verified' ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium px-4 py-2">
                          <CheckCircle size={18} /> Verified
                        </div>
                      ) : (
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-prussian-blue rounded-lg hover:bg-slate-50 hover:border-prussian-blue transition-colors text-sm font-medium shadow-sm">
                          <UploadCloud size={18} />
                          Upload File
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Right Column (Resource Hub & Support) */}
          <div className="space-y-8">
            
            {/* Resource Hub */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-prussian-blue rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 text-white relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/20 rounded-full blur-2xl"></div>
              
              <h2 className="text-xl font-bold text-white mb-6 relative z-10">Resource Hub</h2>
              
              <div className="space-y-4 relative z-10">
                {resources.map((resource) => (
                  <div key={resource.name} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-gold" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-sm text-white group-hover:text-gold transition-colors line-clamp-2">{resource.name}</h3>
                      <span className="text-xs text-slate-400">{resource.type} • {resource.size}</span>
                    </div>
                    <Download size={18} className="text-slate-400 group-hover:text-white transition-colors shrink-0 mt-1" />
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 py-3 border border-white/20 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                View All Resources
              </button>
            </motion.div>

            {/* Need Help */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <h3 className="font-bold text-prussian-blue mb-2">Need Assistance?</h3>
              <p className="text-sm text-slate-600 mb-4">Your dedicated consultant is available to help you with your application.</p>
              <button className="w-full py-3 bg-slate-100 text-prussian-blue rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                Contact Support
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
