
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Github, 
  Settings, 
  Wand2, 
  FileText, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Eye,
  Code
} from 'lucide-react';
import { generateCourseContent } from './services/geminiService';
import SettingsPanel from './components/SettingsPanel';
import MarkdownPreview from './components/MarkdownPreview';
import type { AppConfig, StatusMessage } from './types';

const App: React.FC = () => {
  const [rawContent, setRawContent] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [fileName, setFileName] = useState('chapter_draft.md');
  const [activeTab, setActiveTab] = useState('editor');
  
  const [config, setConfig] = useState<AppConfig>({
    githubToken: '',
    githubOwner: '',
    githubRepo: '',
    githubBranch: 'main',
    systemPrompt: `You are an expert educational content creator. Convert the provided raw course notes or slide content into a detailed, pedagogical study guide in Markdown format.

1. Structure: Use clear # and ## headings.
2. Expansion: Convert bullet points into comprehensive, readable paragraphs.
3. Equations: Format all math in LaTeX style using $ for inline and $$ for blocks.
4. Tone: Academic yet accessible. Define jargon.
5. Figures: Indicate where figures should go with [Figure: Description].
6. Summary: End with key takeaways.`
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<StatusMessage>({ type: '', text: '' });

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('courseWeaverConfig');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error("Failed to parse config from localStorage:", error);
    }
  }, []);

  const handleSaveConfig = useCallback(() => {
    localStorage.setItem('courseWeaverConfig', JSON.stringify(config));
    setStatusMsg({ type: 'success', text: 'Settings saved locally.' });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    setIsSettingsOpen(false);
  }, [config]);

  const handleGenerateContent = async () => {
    if (!rawContent.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter some content to process.' });
      return;
    }

    setIsGenerating(true);
    setStatusMsg({ type: 'info', text: 'Weaving course content...' });

    try {
      const text = await generateCourseContent(rawContent, config.systemPrompt);
      setGeneratedContent(text);
      setStatusMsg({ type: 'success', text: 'Content generated successfully!' });
      setActiveTab('preview');
    } catch (error) {
      console.error('Generation Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatusMsg({ type: 'error', text: `Generation failed: ${errorMessage}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToGitHub = async () => {
    if (!config.githubToken || !config.githubOwner || !config.githubRepo) {
      setStatusMsg({ type: 'error', text: 'Please configure GitHub settings first.' });
      setIsSettingsOpen(true);
      return;
    }
    if (!generatedContent.trim()) {
      setStatusMsg({ type: 'error', text: 'No content to save.' });
      return;
    }

    setIsSaving(true);
    setStatusMsg({ type: 'info', text: 'Committing to GitHub...' });

    try {
      const path = fileName.startsWith('/') ? fileName.slice(1) : fileName;
      const url = `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/contents/${path}`;
      
      let sha: string | null = null;
      try {
        const getRes = await fetch(url, {
          headers: { 
            'Authorization': `token ${config.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (getRes.ok) {
          const getData = await getRes.json();
          sha = getData.sha;
        }
      } catch (e) { /* Ignore error if file doesn't exist */ }

      const contentEncoded = btoa(unescape(encodeURIComponent(generatedContent)));
      
      const body: {
          message: string;
          content: string;
          branch: string;
          sha?: string;
      } = {
        message: `docs: update ${fileName} via CourseWeaver`,
        content: contentEncoded,
        branch: config.githubBranch
      };
      if (sha) body.sha = sha;

      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${config.githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!putRes.ok) {
        const errData = await putRes.json();
        throw new Error(errData.message || 'Failed to commit to GitHub');
      }

      setStatusMsg({ type: 'success', text: 'Successfully saved to GitHub!' });
    } catch (error) {
      console.error('GitHub Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatusMsg({ type: 'error', text: `GitHub Save Failed: ${errorMessage}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">CourseWeaver</h1>
            <p className="text-xs text-slate-500 font-medium">AI-Powered Docs Generator</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {statusMsg.text && (
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center animate-fade-in-down ${
              statusMsg.type === 'error' ? 'bg-red-100 text-red-700' : 
              statusMsg.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 
              'bg-blue-100 text-blue-700'
            }`}>
              {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 mr-2"/>}
              {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 mr-2"/>}
              {statusMsg.type === 'info' && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              {statusMsg.text}
            </div>
          )}
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Configuration"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-white min-w-0">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Raw Content Input</span>
            </div>
          </div>
          <textarea
            className="flex-1 p-6 resize-none focus:outline-none focus:ring-inset focus:ring-2 focus:ring-indigo-50 text-base leading-relaxed font-mono text-slate-700"
            placeholder="Paste your slide content, bullet points, or rough notes here..."
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
          />
          <div className="p-4 border-t border-slate-100 bg-white">
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating || !rawContent}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-white font-semibold transition-all shadow-md hover:shadow-lg transform active:scale-[0.98] ${
                isGenerating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
              }`}
            >
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></>
              ) : (
                <><Wand2 className="w-5 h-5" /><span>Generate Study Guide</span></>
              )}
            </button>
          </div>
        </div>

        <div className="flex-[1.2] flex flex-col bg-slate-50 min-w-0">
          <div className="px-4 py-3 border-b border-t md:border-t-0 border-slate-200 bg-white flex justify-between items-center flex-wrap gap-2">
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center ${
                  activeTab === 'editor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Code className="w-4 h-4 mr-1.5" /> Editor
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center ${
                  activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Eye className="w-4 h-4 mr-1.5" /> Preview
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="text-sm border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:border-indigo-500 w-48 font-mono bg-white"
                aria-label="File name"
              />
              <button
                onClick={saveToGitHub}
                disabled={isSaving || !generatedContent}
                className={`py-1.5 px-3 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors border ${
                  isSaving || !generatedContent ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                }`}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                <span className="hidden sm:inline">Commit</span>
              </button>
            </div>
          </div>

          {activeTab === 'editor' ? (
            <textarea
              className="flex-1 p-6 resize-none focus:outline-none text-base leading-relaxed font-mono text-slate-800 bg-slate-50"
              placeholder="Generated content will appear here..."
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
            />
          ) : (
             <MarkdownPreview content={generatedContent} />
          )}
        </div>
      </main>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        setConfig={setConfig}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

export default App;
