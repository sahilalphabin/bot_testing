'use client';

import React, { useState } from 'react';
import { useQueryStates } from 'nuqs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Download } from 'lucide-react';
import { DashboardFilters, Evaluation } from '@/types';

interface GlobalFiltersProps {
  evaluations: Evaluation[];
  onFilterChange?: (filteredEvaluations: Evaluation[]) => void;
  onExport?: () => void;
}

export function GlobalFilters({ evaluations, onFilterChange, onExport }: GlobalFiltersProps) {
  const [filters, setFilters] = useQueryStates({
    categories: {
      parse: (value: string) => value ? value.split(',') : [],
      serialize: (value: string[]) => value.join(','),
      defaultValue: [] as string[]
    },
    difficulties: {
      parse: (value: string) => value ? value.split(',') : [],
      serialize: (value: string[]) => value.join(','),
      defaultValue: [] as string[]
    },
    evaluationTypes: {
      parse: (value: string) => value ? value.split(',') : [],
      serialize: (value: string[]) => value.join(','),
      defaultValue: [] as string[]
    },
    dateStart: {
      parse: (value: string) => value || '',
      serialize: (value: string) => value,
      defaultValue: ''
    },
    dateEnd: {
      parse: (value: string) => value || '',
      serialize: (value: string) => value,
      defaultValue: ''
    },
    minScore: {
      parse: (value: string) => value ? parseInt(value) : 0,
      serialize: (value: number) => value.toString(),
      defaultValue: 0
    },
    maxScore: {
      parse: (value: string) => value ? parseInt(value) : 100,
      serialize: (value: number) => value.toString(),
      defaultValue: 100
    }
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Apply filters to evaluations
  const filteredEvaluations = evaluations.filter(evaluation => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(evaluation.question.category)) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulties.length > 0 && !filters.difficulties.includes(evaluation.question.difficulty)) {
      return false;
    }

    // Evaluation type filter (based on available scores)
    if (filters.evaluationTypes.length > 0) {
      const hasML = evaluation.evaluation_results.ml_score !== undefined;
      const hasGemini = evaluation.evaluation_results.gemini_score !== undefined;
      
      const matchesType = filters.evaluationTypes.some(type => {
        if (type === 'ml' && hasML) return true;
        if (type === 'gemini' && hasGemini) return true;
        if (type === 'both' && hasML && hasGemini) return true;
        return false;
      });
      
      if (!matchesType) return false;
    }

    // Date range filter
    if (filters.dateStart || filters.dateEnd) {
      const evalDate = new Date(evaluation.timestamp);
      if (filters.dateStart && evalDate < new Date(filters.dateStart)) return false;
      if (filters.dateEnd && evalDate > new Date(filters.dateEnd + 'T23:59:59')) return false;
    }

    // Score range filter
    const combinedScore = evaluation.evaluation_results.combined_score || 
                         evaluation.evaluation_results.ml_score || 
                         evaluation.evaluation_results.gemini_score || 0;
    
    if (combinedScore < filters.minScore || combinedScore > filters.maxScore) {
      return false;
    }

    return true;
  });

  // Call the onChange handler when filters change
  React.useEffect(() => {
    onFilterChange?.(filteredEvaluations);
  }, [filteredEvaluations.length, onFilterChange]);

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      difficulties: [],
      evaluationTypes: [],
      dateStart: '',
      dateEnd: '',
      minScore: 0,
      maxScore: 100
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.evaluationTypes.length > 0 ||
    filters.dateStart ||
    filters.dateEnd ||
    filters.minScore > 0 ||
    filters.maxScore < 100;

  const activeFilterCount = 
    filters.categories.length +
    filters.difficulties.length +
    filters.evaluationTypes.length +
    (filters.dateStart ? 1 : 0) +
    (filters.dateEnd ? 1 : 0) +
    (filters.minScore > 0 ? 1 : 0) +
    (filters.maxScore < 100 ? 1 : 0);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Dashboard Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount}</Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Showing {filteredEvaluations.length} of {evaluations.length} evaluations
          {hasActiveFilters && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied)`}
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <Select
                value={filters.categories.join(',')}
                onValueChange={(value) => 
                  setFilters({ categories: value ? value.split(',') : [] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="general,safety">General + Safety</SelectItem>
                  <SelectItem value="technical,creative">Technical + Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulties */}
            <div className="space-y-2">
              <Label>Difficulties</Label>
              <Select
                value={filters.difficulties.join(',')}
                onValueChange={(value) => 
                  setFilters({ difficulties: value ? value.split(',') : [] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="easy,medium">Easy + Medium</SelectItem>
                  <SelectItem value="medium,hard">Medium + Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Evaluation Types */}
            <div className="space-y-2">
              <Label>Evaluation Types</Label>
              <Select
                value={filters.evaluationTypes.join(',')}
                onValueChange={(value) => 
                  setFilters({ evaluationTypes: value ? value.split(',') : [] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="ml">ML Only</SelectItem>
                  <SelectItem value="gemini">AI Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Score Range */}
            <div className="space-y-2">
              <Label>Score Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  min={0}
                  max={100}
                  value={filters.minScore || ''}
                  onChange={(e) => setFilters({ minScore: parseInt(e.target.value) || 0 })}
                  className="w-20"
                />
                <span className="self-center">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  min={0}
                  max={100}
                  value={filters.maxScore === 100 ? '' : filters.maxScore}
                  onChange={(e) => setFilters({ maxScore: parseInt(e.target.value) || 100 })}
                  className="w-20"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.dateStart}
                onChange={(e) => setFilters({ dateStart: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.dateEnd}
                onChange={(e) => setFilters({ dateEnd: e.target.value })}
              />
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-sm font-medium">Active Filters:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.categories.map(cat => (
                  <Badge key={cat} variant="outline">
                    Category: {cat}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setFilters({ 
                        categories: filters.categories.filter(c => c !== cat) 
                      })}
                    />
                  </Badge>
                ))}
                {filters.difficulties.map(diff => (
                  <Badge key={diff} variant="outline">
                    Difficulty: {diff}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setFilters({ 
                        difficulties: filters.difficulties.filter(d => d !== diff) 
                      })}
                    />
                  </Badge>
                ))}
                {filters.evaluationTypes.map(type => (
                  <Badge key={type} variant="outline">
                    Type: {type}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setFilters({ 
                        evaluationTypes: filters.evaluationTypes.filter(t => t !== type) 
                      })}
                    />
                  </Badge>
                ))}
                {filters.dateStart && (
                  <Badge variant="outline">
                    From: {filters.dateStart}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setFilters({ dateStart: '' })}
                    />
                  </Badge>
                )}
                {filters.dateEnd && (
                  <Badge variant="outline">
                    To: {filters.dateEnd}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setFilters({ dateEnd: '' })}
                    />
                  </Badge>
                )}
                {(filters.minScore > 0 || filters.maxScore < 100) && (
                  <Badge variant="outline">
                    Score: {filters.minScore}-{filters.maxScore}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setFilters({ minScore: 0, maxScore: 100 })}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}