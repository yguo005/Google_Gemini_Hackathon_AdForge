import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import CampaignResults from './components/CampaignResults';
import Spinner from './components/Spinner';
import type { Campaign } from './types';
import { generateScriptsAndPrompts, generateImageFromPrompt } from './services/geminiService';

const App: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main>
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
