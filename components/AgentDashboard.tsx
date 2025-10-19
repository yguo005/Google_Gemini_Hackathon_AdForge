import React, { useState, useEffect } from 'react';
import { Play, Brain, Target, Zap, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';

interface LogEntry {
  step: string;
  step_number?: number;
  sub_step?: string;
  message: string;
  timestamp: string;
  data?: any;
  prompt?: string;
  ai_response?: any;
  decision?: any;
  reasoning?: string;
  confidence?: number;
  action_taken?: any;
  result?: any;
  campaign_summary?: any;
  final_summary?: any;
}

interface JobInfo {
  status: string;
  created_at: string;
  progress: number;
  result?: any;
  error?: string;
}

interface DashboardProps {
  onStartDemo: () => void;
}

const AgentDashboard: React.FC<DashboardProps> = ({ onStartDemo }) => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCampaignAnalysis = async () => {
    try {
      setIsRunning(true);
      setError(null);
      setLogEntries([]);
      
      const response = await fetch('http://localhost:5001/start-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJobId(data.job_id);
        onStartDemo();
      } else {
        throw new Error(data.error || 'Failed to start campaign');
      }
    } catch (err: any) {
      setError(err.message);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!jobId || !isRunning) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5001/get-campaign-status/${jobId}`);
        const data = await response.json();
        
        if (data.success) {
          setJobInfo(data.job_info);
          setLogEntries(data.log_entries || []);
          
          if (data.job_info.status === 'COMPLETED' || data.job_info.status === 'ERROR') {
            setIsRunning(false);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    const interval = setInterval(pollStatus, 1000);
    return () => clearInterval(interval);
  }, [jobId, isRunning]);

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'INITIALIZE': return <Play className="w-5 h-5" />;
      case 'OBSERVE': return <Target className="w-5 h-5" />;
      case 'ORIENT': return <Brain className="w-5 h-5" />;
      case 'DECIDE': return <CheckCircle className="w-5 h-5" />;
      case 'ACT': return <Zap className="w-5 h-5" />;
      case 'COMPLETE': return <TrendingUp className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStepColor = (step: string) => {
    switch (step) {
      case 'INITIALIZE': return 'bg-blue-500/20 border-blue-500 text-blue-400';
      case 'OBSERVE': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'ORIENT': return 'bg-purple-500/20 border-purple-500 text-purple-400';
      case 'DECIDE': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'ACT': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'COMPLETE': return 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
      default: return 'bg-slate-500/20 border-slate-500 text-slate-400';
    }
  };

  const renderLogEntry = (entry: LogEntry, index: number) => {
    const stepColor = getStepColor(entry.step);
    const stepIcon = getStepIcon(entry.step);

    return (
      <div key={index} className={`border rounded-lg p-4 mb-4 ${stepColor}`}>
        <div className="flex items-center gap-3 mb-2">
          {stepIcon}
          <h3 className="font-semibold">
            {entry.step_number ? `Step ${entry.step_number}: ` : ''}{entry.step}
            {entry.sub_step && ` - ${entry.sub_step.replace(/_/g, ' ').toUpperCase()}`}
          </h3>
          <span className="text-xs opacity-70 ml-auto">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        </div>
        
        <p className="text-sm mb-3">{entry.message}</p>
        
        {entry.data && (
          <div className="bg-black/30 rounded p-3 mb-3">
            <h4 className="text-xs font-semibold mb-2">📊 CAMPAIGN DATA:</h4>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(entry.data, null, 2)}
            </pre>
          </div>
        )}
        
        {entry.ai_response && (
          <div className="bg-black/30 rounded p-3 mb-3">
            <h4 className="text-xs font-semibold mb-2">🤖 AI ANALYSIS:</h4>
            <div className="text-sm space-y-2">
              {entry.ai_response.reasoning && (
                <div>
                  <strong>Reasoning:</strong> {entry.ai_response.reasoning}
                </div>
              )}
              {entry.ai_response.confidence && (
                <div>
                  <strong>Confidence:</strong> {(entry.ai_response.confidence * 100).toFixed(1)}%
                </div>
              )}
              {entry.ai_response.action && (
                <div>
                  <strong>Recommended Action:</strong> {entry.ai_response.action.tool_name}
                </div>
              )}
            </div>
          </div>
        )}
        
        {entry.decision && (
          <div className="bg-black/30 rounded p-3 mb-3">
            <h4 className="text-xs font-semibold mb-2">⚡ DECISION:</h4>
            <div className="text-sm">
              <strong>Action:</strong> {entry.decision.tool_name}
              {entry.decision.expected_outcome && (
                <div className="mt-1">
                  <strong>Expected Outcome:</strong> {entry.decision.expected_outcome}
                </div>
              )}
            </div>
          </div>
        )}
        
        {entry.result && (
          <div className="bg-black/30 rounded p-3">
            <h4 className="text-xs font-semibold mb-2">✅ EXECUTION RESULT:</h4>
            <p className="text-sm">{entry.result.result || JSON.stringify(entry.result)}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">🤖 AdForge Agent Transparency Dashboard</h1>
          <p className="text-slate-400">Watch the AI agent analyze campaign data in real-time using the OODA loop</p>
        </div>
      </div>

      {/* Campaign Metrics Banner */}
      {jobInfo && (
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{Math.round(jobInfo.progress)}%</div>
              <div className="text-sm text-slate-400">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{logEntries.length}</div>
              <div className="text-sm text-slate-400">Log Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{jobInfo.status}</div>
              <div className="text-sm text-slate-400">Agent Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">DEMO</div>
              <div className="text-sm text-slate-400">Mode</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        {!isRunning && !jobId && (
          <div className="text-center py-12">
            <div className="bg-slate-800 rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Ready to See AI in Action?</h2>
              <p className="text-slate-400 mb-6">
                This demo will show you exactly how an AI agent thinks and makes decisions. 
                Using real campaign data, you'll see the complete OODA loop: Observe, Orient, Decide, Act.
              </p>
              <button
                onClick={startCampaignAnalysis}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Start Agent Demo
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {isRunning && (
          <div className="mb-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                <span>Agent is analyzing campaign data...</span>
              </div>
            </div>
          </div>
        )}

        {/* Log Entries */}
        <div className="space-y-4">
          {logEntries.map((entry, index) => renderLogEntry(entry, index))}
        </div>

        {jobInfo?.status === 'COMPLETED' && (
          <div className="mt-8 bg-emerald-900/20 border border-emerald-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-3">🎉 Analysis Complete!</h3>
            <p className="text-slate-300">
              The AI agent has successfully analyzed all campaign data using its OODA loop decision-making process. 
              Each step was transparent, showing exactly how artificial intelligence can make strategic marketing decisions.
            </p>
            <button
              onClick={() => {
                setJobId(null);
                setJobInfo(null);
                setLogEntries([]);
                setIsRunning(false);
              }}
              className="mt-4 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors"
            >
              Run Another Demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
