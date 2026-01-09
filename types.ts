
export interface AppConfig {
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  systemPrompt: string;
}

export interface StatusMessage {
  type: 'info' | 'success' | 'error' | '';
  text: string;
}
