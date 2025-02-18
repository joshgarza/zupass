import { createContext } from "react";

// I am overall not sure about this file, so I didn't go too far.
// I would really like to get set up with Redux asap.

export interface GIError {
  name: string;
  description: string;
}

export interface GIContextState {
  setState: (state: Partial<GIContextState>) => void;
  error?: GIError;
  isAdminMode?: boolean;
  logout: () => Promise<void>;
  handleAuthToken: (token?: string) => Promise<void>;
  devModeAuthToken?: string;
}

export const GIContext = createContext<GIContextState>({
  error: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setState: (_state: GIContextState) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: async (): Promise<void> => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleAuthToken: async (_token?: string): Promise<void> => {}
});
