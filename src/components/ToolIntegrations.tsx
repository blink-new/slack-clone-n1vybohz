import React, { useState } from 'react';
import { IntegrationManagementFlow } from './IntegrationManagementFlow';

interface ToolIntegrationsProps {
  isDemoMode?: boolean;
}

const ToolIntegrations: React.FC<ToolIntegrationsProps> = ({ isDemoMode = false }) => {
  return <IntegrationManagementFlow isDemoMode={isDemoMode} />;
};

export default ToolIntegrations;