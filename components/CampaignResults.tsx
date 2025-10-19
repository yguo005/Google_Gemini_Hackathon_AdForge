import React from 'react';
import type { Campaign } from '../types';
import Spinner from './Spinner';

interface CampaignResultsProps {
  campaigns: Campaign[];
}

const loadingMessages = [
    "Sketching out concepts...",
    "Mixing the digital paints...",
    "Consulting the color wheel...",
    "Developing the image...",
    "Adding finishing touches...",
    "Polishing the creative...",
];

const ImageGenerationLoader: React.FC = () => {
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="aspect-video w-full flex flex-col items-center justify-center bg-slate-800 rounded-md p-4">
            <Spinner className="w-10 h-10" />
            <p className="mt-4 text-slate-400 text-sm text-center">{message}</p>
        </div>
    );
};


const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-purple-400 mb-2">
          For: <span className="text-white">{campaign.audience}</span>
        </h3>
        <p className="text-slate-300 italic mb-4">
          <span className="font-semibold text-slate-200">Script:</span> "{campaign.script}"
        </p>
        <p className="text-xs text-slate-400 mb-4 break-words">
          <span className="font-semibold text-slate-300">Image Prompt:</span> {campaign.imagePrompt}
        </p>
        
        {campaign.isGeneratingImage && <ImageGenerationLoader />}
        {campaign.imageUrl && (
          <img 
            src={campaign.imageUrl} 
            alt={`Ad creative for ${campaign.audience}`}
            className="w-full h-auto rounded-md bg-black aspect-video object-cover"
          />
        )}
        {campaign.imageError && (
          <div className="aspect-video w-full flex flex-col items-center justify-center bg-red-900/20 border border-red-500 rounded-md p-4">
            <p className="text-red-400 text-sm text-center font-semibold">Image Generation Failed</p>
            <p className="text-red-400 text-xs text-center mt-2">{campaign.imageError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CampaignResults: React.FC<CampaignResultsProps> = ({ campaigns }) => {
  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 md:px-8 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Your Generated Ad Creatives</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((campaign, index) => (
          <CampaignCard key={index} campaign={campaign} />
        ))}
      </div>
    </div>
  );
};

export default CampaignResults;