import React, { useState } from 'react';
import Header from './src/components/Header';
import InputForm from './src/components/InputForm';
import CampaignResults from './src/components/CampaignResults';
import AgentDashboard from './src/components/AgentDashboard';
import Spinner from './src/components/Spinner';
import type { Campaign } from './src/types';
import { generateScriptsAndPrompts, generateImageFromPrompt } from './src/services/geminiService';

const App: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleGenerateCampaign = async (productDescription: string, audiences: string) => {
    setIsLoading(true);
    setError(null);
    setCampaigns([]);
    setLoadingMessage('Generating creative scripts and concepts...');

    try {
      const generatedScripts = await generateScriptsAndPrompts(productDescription, audiences);
      if (generatedScripts.length === 0) {
          throw new Error("The AI failed to generate any campaign ideas. Please try refining your inputs.");
      }

      const initialCampaigns: Campaign[] = generatedScripts.map(script => ({
        ...script,
        isGeneratingImage: true,
      }));
      setCampaigns(initialCampaigns);
      setLoadingMessage('Scripts generated! Now creating images...');

      await Promise.allSettled(
        initialCampaigns.map((campaign, index) =>
          generateImageFromPrompt(campaign.imagePrompt)
            .then(imageUrl => {
              setCampaigns(prev =>
                prev.map((c, i) => (i === index ? { ...c, imageUrl, isGeneratingImage: false } : c))
              );
            })
            .catch(err => {
              setCampaigns(prev =>
                prev.map((c, i) => (i === index ? { ...c, imageError: err.message, isGeneratingImage: false } : c))
              );
            })
        )
      );

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  if (showDashboard) {
    return <AgentDashboard onStartDemo={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main>
        <div className="text-center py-8">
          <button
            onClick={() => setShowDashboard(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 mb-8"
          >
            🤖 Launch Agent Transparency Demo
          </button>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            See how an AI agent thinks and makes decisions in real-time using campaign data. 
            Watch the complete OODA loop: Observe, Orient, Decide, Act.
          </p>
        </div>
        
        <InputForm onSubmit={handleGenerateCampaign} isLoading={isLoading} />
        {isLoading && campaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner className="w-10 h-10" />
            <p className="mt-4 text-slate-400">{loadingMessage}</p>
          </div>
        )}
        {error && (
          <div className="text-center p-4 my-4 max-w-2xl mx-auto bg-red-900/20 border border-red-500 rounded-md">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        <CampaignResults campaigns={campaigns} />
      </main>
      <footer className="text-center p-4 mt-8 border-t border-slate-700">
        <p className="text-sm text-slate-500">Powered by Google Gemini & Imagen</p>
      </footer>
    </div>
  );
};

export default App;
