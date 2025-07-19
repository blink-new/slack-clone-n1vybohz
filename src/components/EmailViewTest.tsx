import React from 'react';
import { Mail } from 'lucide-react';

export function EmailViewTest() {
  console.log('EmailViewTest rendering...');
  
  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Mail className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Email Test View</h1>
      </div>
      
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">
          This is a test email view to check if the basic structure works.
        </p>
        
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-gray-50 rounded">
            <h3 className="font-medium">Test Email 1</h3>
            <p className="text-sm text-gray-600">From: test@example.com</p>
            <p className="text-sm">This is a test email content.</p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <h3 className="font-medium">Test Email 2</h3>
            <p className="text-sm text-gray-600">From: another@example.com</p>
            <p className="text-sm">This is another test email content.</p>
          </div>
        </div>
      </div>
    </div>
  );
}