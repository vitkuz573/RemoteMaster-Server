export interface OrganizationForm {
  name: string;
  domain: string;
  industry: string;
  size: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  description: string;
  expectedUsers: number;
  selectedPlan: string;
}

export interface BYOIDForm {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  discoveryData?: {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    jwks_uri: string;
    response_types_supported: string[];
    subject_types_supported: string[];
    id_token_signing_alg_values_supported: string[];
    scopes_supported: string[];
    claims_supported: string[];
    end_session_endpoint?: string;
  };
}

export type WizardStep = 'organization' | 'contact' | 'pricing' | 'byoid' | 'complete';

export interface WizardStepConfig {
  key: WizardStep;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface SetupWizardProps {
  onStepChange?: (step: WizardStep) => void;
  onComplete?: () => void;
} 