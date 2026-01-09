
import React from 'react';
import { Github, Save, Wand2, X } from 'lucide-react';
import type { AppConfig } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onSave: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, config, setConfig, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center">
              <Github className="w-4 h-4 mr-2" /> GitHub Configuration
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Personal Access Token</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={config.githubToken}
                  onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">Requires `repo` scope.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Owner (User/Org)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="e.g. johndoe"
                    value={config.githubOwner}
                    onChange={(e) => setConfig({ ...config, githubOwner: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Repo Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="course-materials"
                    value={config.githubRepo}
                    onChange={(e) => setConfig({ ...config, githubRepo: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="main"
                  value={config.githubBranch}
                  onChange={(e) => setConfig({ ...config, githubBranch: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-violet-600 uppercase tracking-wider flex items-center">
              <Wand2 className="w-4 h-4 mr-2" /> Pedagogy Engine
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">System Prompt & Rules</label>
              <textarea
                className="w-full h-48 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none text-sm leading-relaxed font-mono"
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-2">Adjust these instructions to change the style of the generated documents.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button
            onClick={onSave}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex justify-center items-center"
          >
            <Save className="w-4 h-4 mr-2" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
