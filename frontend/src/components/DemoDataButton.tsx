'use client';

import { Button } from "@/components/ui/button";
import { generateDemoData } from "@/lib/demoData";
import { LocalStorageManager } from "@/lib/localStorage";
import { useData } from "@/context/DataContext";
import { Database, Trash2, Plus } from "lucide-react";

export function DemoDataButton() {
  const { refreshData, evaluations } = useData();

  const handleGenerateDemoData = () => {
    generateDemoData();
    refreshData();
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all evaluation data? This action cannot be undone.")) {
      LocalStorageManager.clearAllData();
      refreshData();
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateDemoData}
        className="flex items-center space-x-2"
      >
        <Plus className="h-4 w-4" />
        <span>Load Demo Data</span>
      </Button>
      
      {evaluations.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearData}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear Data</span>
        </Button>
      )}
    </div>
  );
}