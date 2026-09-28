export interface Environment {
  id: number;
  name: string;
  tokenEndpoint: string;
  scope: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppEnvironmentConfig {
  id: number;
  applicationId: number;
  environmentId: number;
  clientId: string;
  clientSecret: string;
  scimBaseUrl: string;
  scope: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppEnvironmentConfigWithNames extends AppEnvironmentConfig {
  applicationName: string;
  environmentName: string;
}
