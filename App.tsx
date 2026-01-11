
import React, { useState, useRef } from 'react';
import { AppFeature, GenerationResult } from './types';
import { LoadingScreen } from './components/LoadingScreen';
import { generateAIImage, enhanceTo4K, restoreDarkImage, processVideoNoise, ensureKeySelection } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppFeature>(AppFeature.IMAGE_4K);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [prompt, setPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isShowingOriginal, setIsShowingOriginal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFile(event.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeAction = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setResult(null);

    try {
      let data: GenerationResult = { 
        timestamp: Date.now(), 
        originalUrl: uploadedFile || undefined,
        originalType: activeTab === AppFeature.VIDEO_CLEANER ? 'video' : 'image'
      };

      if (activeTab === AppFeature.AI_GENERATE) {
        if (!prompt) throw new Error("Please enter a prompt.");
        data.imageUrl = await generateAIImage(prompt);
      } else if (activeTab === AppFeature.IMAGE_4K) {
        if (!uploadedFile) throw new Error("Please upload an image.");
        data.imageUrl = await enhanceTo4K(uploadedFile);
      } else if (activeTab === AppFeature.DARK_RESTORE) {
        if (!uploadedFile) throw new Error("Please upload a dark image.");
        data.imageUrl = await restoreDarkImage(uploadedFile);
      } else if (activeTab === AppFeature.VIDEO_CLEANER) {
        // For video noise removal demo, we use the first frame/uploaded image as reference for Veo
        data.videoUrl = await processVideoNoise(prompt || "A clean cinematic masterpiece", uploadedFile || undefined);
      }
      setResult(data);
    } catch (err: any) {
      alert(err.message || "Failed to process.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-white/10 backdrop-blur-md bg-black/50 z-10">
        <div>
          <h1 className="text-xl font-black tracking-tighter italic text-blue-500">LUMINA AI</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Premium Studio</p>
        </div>
        <button onClick={() => ensureKeySelection()} className="p-2 rounded-full bg-white/5 border border-white/10 text-blue-400 active:scale-90 transition-transform">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
        </button>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="p-4 space-y-4">
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl flex items-center justify-center">
            {isProcessing ? (
              <LoadingScreen />
            ) : result ? (
              <div className="w-full h-full relative">
                {isShowingOriginal && result.originalUrl ? (
                  result.originalType === 'video' ? (
                    <video src={result.originalUrl} className="w-full h-full object-cover" autoPlay muted loop />
                  ) : (
                    <img src={result.originalUrl} className="w-full h-full object-contain" alt="Original" />
                  )
                ) : result.videoUrl ? (
                  <video src={result.videoUrl} className="w-full h-full object-cover animate-fadeIn" controls autoPlay loop />
                ) : result.imageUrl ? (
                  <img src={result.imageUrl} className="w-full h-full object-contain animate-fadeIn" alt="AI Enhanced" />
                ) : null}

                {result.originalUrl && (
                  <button 
                    onMouseDown={() => setIsShowingOriginal(true)}
                    onMouseUp={() => setIsShowingOriginal(false)}
                    onTouchStart={() => setIsShowingOriginal(true)}
                    onTouchEnd={() => setIsShowingOriginal(false)}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs font-black uppercase tracking-widest active:scale-95 transition-transform select-none shadow-xl"
                  >
                    Hold to compare
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center px-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-zinc-500 text-sm font-medium">Capture or upload media to enhance</p>
              </div>
            )}
          </div>

          {/* Control Section */}
          <div className="space-y-4">
            {activeTab !== AppFeature.AI_GENERATE && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all flex items-center space-x-4 cursor-pointer active:scale-98 ${uploadedFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}
              >
                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept={activeTab === AppFeature.VIDEO_CLEANER ? "video/*,image/*" : "image/*"} />
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {uploadedFile ? <img src={uploadedFile} className="w-full h-full object-cover" /> : <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-tight">{uploadedFile ? 'Media Ready' : 'Upload Source'}</p>
                  <p className="text-[10px] text-zinc-500 font-bold">Tap to choose {activeTab === AppFeature.VIDEO_CLEANER ? 'video' : 'photo'}</p>
                </div>
                {uploadedFile && (
                  <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setResult(null); }} className="text-red-500 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">AI Prompt / Context</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === AppFeature.AI_GENERATE ? "Describe your vision..." : "Add details for better results..."}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none h-24 resize-none transition-all"
              />
            </div>

            <button
              onClick={executeAction}
              disabled={isProcessing || (activeTab === AppFeature.AI_GENERATE && !prompt) || (activeTab !== AppFeature.AI_GENERATE && !uploadedFile)}
              className="w-full py-5 rounded-2xl bg-blue-600 active:bg-blue-700 active:scale-95 disabled:bg-zinc-800 disabled:opacity-50 disabled:active:scale-100 font-black text-white uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
            >
              {isProcessing ? "Processing..." : `Process ${getTitle(activeTab)}`}
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-2 z-20">
        <NavButton active={activeTab === AppFeature.VIDEO_CLEANER} onClick={() => {setActiveTab(AppFeature.VIDEO_CLEANER); setResult(null);}} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} label="Video" />
        <NavButton active={activeTab === AppFeature.IMAGE_4K} onClick={() => {setActiveTab(AppFeature.IMAGE_4K); setResult(null);}} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>} label="4K Edit" />
        <NavButton active={activeTab === AppFeature.DARK_RESTORE} onClick={() => {setActiveTab(AppFeature.DARK_RESTORE); setResult(null);}} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>} label="Restore" />
        <NavButton active={activeTab === AppFeature.AI_GENERATE} onClick={() => {setActiveTab(AppFeature.AI_GENERATE); setResult(null);}} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>} label="Generate" />
      </nav>
    </div>
  );
};

const getTitle = (tab: AppFeature) => {
  switch(tab) {
    case AppFeature.VIDEO_CLEANER: return "Video";
    case AppFeature.IMAGE_4K: return "4K HD";
    case AppFeature.DARK_RESTORE: return "Restored";
    case AppFeature.AI_GENERATE: return "AI Concept";
  }
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 transition-all ${active ? 'text-blue-500' : 'text-zinc-500'}`}>
    <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-blue-500/10 scale-110 shadow-lg shadow-blue-500/5' : 'bg-transparent'}`}>{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-tighter mt-1">{label}</span>
  </button>
);

export default App;
