import React, { useState } from 'react';
import { ProjectManagementFlow } from './ProjectManagementFlow';

interface AIProjectManagerProps {
  isDemoMode?: boolean;
}

const AIProjectManager: React.FC<AIProjectManagerProps> = ({ isDemoMode = false }) => {
  return <ProjectManagementFlow isDemoMode={isDemoMode} />;
};

export default AIProjectManager;