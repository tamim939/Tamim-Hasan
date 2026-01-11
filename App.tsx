
import React, { useState, useRef, useEffect } from 'react';
import { AppFeature, GenerationResult } from './types';
import { LoadingScreen } from './components/LoadingScreen';
import { generateImage, editImage, cleanVideo, ensureKeySelection } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppFeature>(AppFeature.IMAGE_ENHANCEMENT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [prompt, setPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [showBefore, setShowBefore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFile(event.target?.result as string);
        setResult(null);
        setShowBefore(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (tab: AppFeature) => {
    setActiveTab(tab);
    setResult(null);
    setPrompt('');
    setShowBefore(false);
  };

  const runTask = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setResult(null);

    try {
      let finalResult: GenerationResult = { timestamp: Date.now(), originalUrl: uploadedFile || undefined };

      switch (activeTab) {
        case AppFeature.IMAGE_GENERATION:
          const genImg = await generateImage(prompt, true);
          finalResult.imageUrl = genImg;
          break;
        
        case AppFeature.IMAGE_ENHANCEMENT:
          if (!uploadedFile) throw new Error("Please upload an image first.");
          const enhancedImg = await editImage(uploadedFile, "Enhance this image to ultra-HD 4K quality, upscale resolution 4x, improve sharpness, remove artifacts, and maximize realistic detail.");
          finalResult.imageUrl = enhancedImg;
          break;

        case AppFeature.DARK_RESTORATION:
          if (!uploadedFile) throw new Error("Please upload a dark image first.");
          const restoredImg = await editImage(uploadedFile, "Heavily restore this dark/underexposed image. Brighten it as if it were daylight, recover all shadow details, and ensure a clear realistic output without noise.");
          finalResult.imageUrl = restoredImg;
          break;

        case AppFeature.VIDEO_NOISE_REMOVAL:
          const videoUrl = await cleanVideo(prompt || "Crystal clear cinematic video, noise free, studio resolution", uploadedFile || undefined);
          finalResult.videoUrl = videoUrl;
          break;
      }
      setResult(finalResult);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getTitle = () => {
    switch(activeTab) {
      case AppFeature.VIDEO_NOISE_REMOVAL: return "Video Cleaner";
      case AppFeature.IMAGE_ENHANCEMENT: return "4K Enhancer";
      case AppFeature.DARK_RESTORATION: return "Dark Restore";
      case AppFeature.IMAGE_GENERATION: return "AI Generator";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden font-sans">
      {/* Mobile Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getTitle()}</h1>
          <p className="text-xs text-gray-500 font-medium">LUMINA STUDIO PRO</p>
        </div>
        <button 
          onClick={() => ensureKeySelection()}
          className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-blue-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-32">
        <div className="space-y-6">
          {/* Result Viewport */}
          <div className="relative aspect-[3/4] md:aspect-video bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center">
            {isProcessing ? (
              <LoadingScreen />
            ) : result ? (
              <div className="w-full h-full relative group">
                {showBefore && result.originalUrl ? (
                  <img src={result.originalUrl} className="w-full h-full object-contain" alt="Before" />
                ) : result.imageUrl ? (
                  <img src={result.imageUrl} className="w-full h-full object-contain animate-fadeIn" alt="After" />
                ) : result.videoUrl ? (
                  <video src={result.videoUrl} autoPlay loop muted controls className="w-full h-full object-contain animate-fadeIn" />
                ) : null}

                {/* Comparison Toggle */}
                {result.originalUrl && (
                  <button 
                    onMouseDown={() => setShowBefore(true)}
                    onMouseUp={() => setShowBefore(false)}
                    onTouchStart={() => setShowBefore(true)}
                    onTouchEnd={() => setShowBefore(false)}
                    className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Hold for Original
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center p-8 space-y-4">
                <div className="w-20 h-20 bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto border border-gray-700">
                   <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-gray-500 text-sm">Upload media to begin enhancement</p>
              </div>
            )}
          </div>

          {/* Upload & Controls */}
          <div className="space-y-4">
            {activeTab !== AppFeature.IMAGE_GENERATION && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all flex items-center space-x-4 cursor-pointer ${uploadedFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-800 bg-gray-900/50 hover:bg-gray-900'}`}
              >
                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept={activeTab === AppFeature.VIDEO_NOISE_REMOVAL ? "video/*,image/*" : "image/*"} />
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                  {uploadedFile ? (
                    <img src={uploadedFile} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{uploadedFile ? 'Media Ready' : 'Select Source'}</p>
                  <p className="text-xs text-gray-500">{activeTab === AppFeature.VIDEO_NOISE_REMOVAL ? 'Tap to upload video or frame' : 'Tap to upload photo'}</p>
                </div>
                {uploadedFile && (
                  <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setResult(null); }} className="p-2 text-red-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">AI Instruction</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === AppFeature.IMAGE_GENERATION ? "Imagine something beautiful..." : "Add custom tweaks (optional)..."}
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
              />
            </div>

            <button
              onClick={runTask}
              disabled={isProcessing || (activeTab === AppFeature.IMAGE_GENERATION && !prompt) || (activeTab !== AppFeature.IMAGE_GENERATION && !uploadedFile)}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 active:scale-[0.98] disabled:from-gray-800 disabled:to-gray-800 disabled:opacity-50 rounded-2xl font-bold text-white transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Generate Result</span>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Navigation Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-gray-950/80 backdrop-blur-xl border-t border-gray-800 px-6 flex items-center justify-between z-50">
        <TabButton 
          active={activeTab === AppFeature.VIDEO_NOISE_REMOVAL} 
          onClick={() => handleTabChange(AppFeature.VIDEO_NOISE_REMOVAL)}
          label="Video"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
        />
        <TabButton 
          active={activeTab === AppFeature.IMAGE_ENHANCEMENT} 
          onClick={() => handleTabChange(AppFeature.IMAGE_ENHANCEMENT)}
          label="4K"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
        />
        <TabButton 
          active={activeTab === AppFeature.DARK_RESTORATION} 
          onClick={() => handleTabChange(AppFeature.DARK_RESTORATION)}
          label="Restore"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
        />
        <TabButton 
          active={activeTab === AppFeature.IMAGE_GENERATION} 
          onClick={() => handleTabChange(AppFeature.IMAGE_GENERATION)}
          label="Create"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}
        />
      </nav>
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 transition-all ${active ? 'text-blue-500 scale-110' : 'text-gray-500 hover:text-gray-400'}`}
  >
    <div className={`mb-1 p-2 rounded-xl transition-colors ${active ? 'bg-blue-500/10' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
