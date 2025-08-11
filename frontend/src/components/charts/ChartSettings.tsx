'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings, Download, RefreshCw, Eye, EyeOff, Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ChartSettingsProps {
  title?: string;
  onExport?: () => void;
  onRefresh?: () => void;
  settings?: ChartConfiguration;
  onSettingsChange?: (settings: ChartConfiguration) => void;
}

export interface ChartConfiguration {
  // Display options
  showLegend: boolean;
  showGrid: boolean;
  showTooltips: boolean;
  
  // Data options
  maxDataPoints: number;
  groupByCategory: boolean;
  showTrendLine: boolean;
  
  // Visual options
  colorScheme: 'default' | 'colorblind' | 'high-contrast' | 'pastel';
  chartHeight: 'small' | 'medium' | 'large';
  
  // Filtering
  hideEmptyCategories: boolean;
  minThreshold: number;
}

const defaultSettings: ChartConfiguration = {
  showLegend: true,
  showGrid: true,
  showTooltips: true,
  maxDataPoints: 100,
  groupByCategory: false,
  showTrendLine: false,
  colorScheme: 'default',
  chartHeight: 'medium',
  hideEmptyCategories: false,
  minThreshold: 0
};

export function ChartSettings({ 
  title = "Chart Settings",
  onExport,
  onRefresh,
  settings = defaultSettings,
  onSettingsChange
}: ChartSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<ChartConfiguration>(settings);

  const updateSetting = <K extends keyof ChartConfiguration>(
    key: K, 
    value: ChartConfiguration[K]
  ) => {
    const newSettings = { ...currentSettings, [key]: value };
    setCurrentSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const resetSettings = () => {
    setCurrentSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  };

  const getHeightClass = (height: string) => {
    switch (height) {
      case 'small': return 'h-64';
      case 'large': return 'h-[600px]';
      default: return 'h-96';
    }
  };

  const colorSchemes = {
    default: { name: 'Default', colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'] },
    colorblind: { name: 'Colorblind Safe', colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'] },
    'high-contrast': { name: 'High Contrast', colors: ['#000000', '#ffffff', '#ff0000', '#00ff00'] },
    pastel: { name: 'Pastel', colors: ['#a8dadc', '#457b9d', '#f1faee', '#e63946'] }
  };

  return (
    <div className="space-y-2">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[420px]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Chart Configuration</CardTitle>
                  <CardDescription>Customize how this chart displays data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="display" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="display">Display</TabsTrigger>
                      <TabsTrigger value="data">Data</TabsTrigger>
                      <TabsTrigger value="style">Style</TabsTrigger>
                    </TabsList>

                    <TabsContent value="display" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Legend</Label>
                            <p className="text-sm text-muted-foreground">Display chart legend</p>
                          </div>
                          <Switch
                            checked={currentSettings.showLegend}
                            onCheckedChange={(checked) => updateSetting('showLegend', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Grid</Label>
                            <p className="text-sm text-muted-foreground">Display grid lines</p>
                          </div>
                          <Switch
                            checked={currentSettings.showGrid}
                            onCheckedChange={(checked) => updateSetting('showGrid', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Tooltips</Label>
                            <p className="text-sm text-muted-foreground">Enable interactive tooltips</p>
                          </div>
                          <Switch
                            checked={currentSettings.showTooltips}
                            onCheckedChange={(checked) => updateSetting('showTooltips', checked)}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="data" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Max Data Points: {currentSettings.maxDataPoints}</Label>
                          <Slider
                            value={[currentSettings.maxDataPoints]}
                            onValueChange={(value) => updateSetting('maxDataPoints', value[0])}
                            max={500}
                            min={10}
                            step={10}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Group by Category</Label>
                            <p className="text-sm text-muted-foreground">Group data points by question category</p>
                          </div>
                          <Switch
                            checked={currentSettings.groupByCategory}
                            onCheckedChange={(checked) => updateSetting('groupByCategory', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Trend Line</Label>
                            <p className="text-sm text-muted-foreground">Add trend line to chart</p>
                          </div>
                          <Switch
                            checked={currentSettings.showTrendLine}
                            onCheckedChange={(checked) => updateSetting('showTrendLine', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Hide Empty Categories</Label>
                            <p className="text-sm text-muted-foreground">Hide categories with no data</p>
                          </div>
                          <Switch
                            checked={currentSettings.hideEmptyCategories}
                            onCheckedChange={(checked) => updateSetting('hideEmptyCategories', checked)}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="style" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Color Scheme</Label>
                          <Select
                            value={currentSettings.colorScheme}
                            onValueChange={(value) => updateSetting('colorScheme', value as ChartConfiguration['colorScheme'])}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(colorSchemes).map(([key, scheme]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                      {scheme.colors.map((color, i) => (
                                        <div 
                                          key={i}
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: color }}
                                        />
                                      ))}
                                    </div>
                                    {scheme.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Chart Height</Label>
                          <Select
                            value={currentSettings.chartHeight}
                            onValueChange={(value) => updateSetting('chartHeight', value as ChartConfiguration['chartHeight'])}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small (16rem)</SelectItem>
                              <SelectItem value="medium">Medium (24rem)</SelectItem>
                              <SelectItem value="large">Large (37.5rem)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Minimum Threshold: {currentSettings.minThreshold}</Label>
                          <p className="text-sm text-muted-foreground">Filter out values below this threshold</p>
                          <Slider
                            value={[currentSettings.minThreshold]}
                            onValueChange={(value) => updateSetting('minThreshold', value[0])}
                            max={100}
                            min={0}
                            step={5}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={resetSettings}>
                      Reset to Defaults
                    </Button>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Object.values(currentSettings).filter(v => v !== defaultSettings[Object.keys(currentSettings).find(k => currentSettings[k as keyof ChartConfiguration] === v) as keyof ChartConfiguration]).length} customizations
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}