'use client';

import React, { useState } from 'react';
import { AnalysisResponse } from '@/lib/types/product';
import { DealCard } from './DealCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Filter, 
  SortAsc, 
  Brain,
  AlertCircle,
  TrendingUp,
  Award,
  Star,
  Globe,
  MapPin,
} from 'lucide-react';
import { RegionMapper } from '@/lib/services/regionMapper';
import { getCountryInfo } from '@/lib/data/globalCountries';

interface AnalyzedDealsListProps {
  analysis: AnalysisResponse;
}

export function AnalyzedDealsList({ analysis }: AnalyzedDealsListProps) {
  const [sortBy, setSortBy] = useState<'relevance' | 'quality' | 'price'>('relevance');
  const [filterQuality, setFilterQuality] = useState<string>('all');

  // Sort deals based on selected criteria
  const sortedDeals = [...analysis.deals].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return b.relevanceScore - a.relevanceScore;
      case 'quality':
        const qualityOrder = { excellent: 4, good: 3, average: 2, poor: 1 };
        return qualityOrder[b.dealQuality] - qualityOrder[a.dealQuality];
      case 'price':
        const priceA = parseFloat(a.price?.replace(/[^0-9.]/g, '') || '0');
        const priceB = parseFloat(b.price?.replace(/[^0-9.]/g, '') || '0');
        return priceA - priceB;
      default:
        return 0;
    }
  });

  // Filter by quality if specified
  const filteredDeals = filterQuality !== 'all'
    ? sortedDeals.filter(deal => deal.dealQuality === filterQuality)
    : sortedDeals;

  if (analysis.relevantResults === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-gray-900/50 border-gray-800">
        <CardContent className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No relevant deals found</h3>
          <p className="text-gray-400 mb-6">
            The AI couldn&apos;t find any relevant shopping results for &quot;{analysis.query}&quot;.
          </p>
          <p className="text-sm text-gray-500">
            Try searching with more specific product names or different keywords.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getQualityStats = () => {
    const stats = { excellent: 0, good: 0, average: 0, poor: 0 };
    analysis.deals.forEach(deal => {
      stats[deal.dealQuality]++;
    });
    return stats;
  };

  const qualityStats = getQualityStats();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* AI Analysis Summary */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Deal Analysis for &quot;{analysis.query}&quot;
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Country Context */}
          {(() => {
            const countryInfo = getCountryInfo(analysis.country);
            return countryInfo ? (
              <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Results for {countryInfo.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    {countryInfo.popular && (
                      <Badge variant="default" className="bg-purple-600 text-white text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Major Market
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs border-purple-600 text-purple-300">
                      <MapPin className="w-3 h-3 mr-1" />
                      {countryInfo.region}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-purple-400 font-medium">Currency:</span>
                    <div className="text-purple-200 font-semibold">{countryInfo.currencySymbol} {countryInfo.currency}</div>
                  </div>
                  <div>
                    <span className="text-purple-400 font-medium">Retailers:</span>
                    <div className="text-purple-200 font-semibold">{RegionMapper.getSearchDomains(analysis.country).length} sites</div>
                  </div>
                  <div>
                    <span className="text-purple-400 font-medium">Language:</span>
                    <div className="text-purple-200 font-semibold">{countryInfo.language.toUpperCase()}</div>
                  </div>
                  <div>
                    <span className="text-purple-400 font-medium">Search Engine:</span>
                    <div className="text-purple-200 font-semibold">{analysis.searchEngineUsed}</div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-blue-400">{analysis.totalResults}</div>
              <div className="text-sm text-gray-400">Total Results</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{analysis.relevantResults}</div>
              <div className="text-sm text-gray-400">Relevant Deals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round((analysis.relevantResults / analysis.totalResults) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Relevance Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{qualityStats.excellent}</div>
              <div className="text-sm text-gray-400">Excellent Deals</div>
            </div>
          </div>

          {/* Quality Distribution */}
          <div className="flex flex-wrap gap-2 mb-4">
            {qualityStats.excellent > 0 && (
              <Badge variant="outline" className="bg-green-900/30 border-green-600 text-green-400">
                <Award className="w-3 h-3 mr-1 text-green-400" />
                {qualityStats.excellent} Excellent
              </Badge>
            )}
            {qualityStats.good > 0 && (
              <Badge variant="outline" className="bg-blue-900/30 border-blue-600 text-blue-400">
                <TrendingUp className="w-3 h-3 mr-1 text-blue-400" />
                {qualityStats.good} Good
              </Badge>
            )}
            {qualityStats.average > 0 && (
              <Badge variant="outline" className="bg-yellow-900/30 border-yellow-600 text-yellow-400">
                <Star className="w-3 h-3 mr-1 text-yellow-400" />
                {qualityStats.average} Average
              </Badge>
            )}
            {qualityStats.poor > 0 && (
              <Badge variant="outline" className="bg-red-900/30 border-red-600 text-red-400">
                <AlertCircle className="w-3 h-3 mr-1 text-red-400" />
                {qualityStats.poor} Poor
              </Badge>
            )}
          </div>

          {/* AI Summary */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700 p-4 rounded-lg">
            <div className="text-sm font-medium text-purple-300 mb-1 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Analysis Summary:
            </div>
            <div className="text-sm text-purple-200">{analysis.summary}</div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-300">Filters:</span>
            </div>
            
            <Select value={filterQuality} onValueChange={setFilterQuality}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                <SelectItem value="excellent">Excellent Only</SelectItem>
                <SelectItem value="good">Good+</SelectItem>
                <SelectItem value="average">Average+</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-300">Sort by:</span>
            </div>
            
            <Select value={sortBy} onValueChange={(value: 'relevance' | 'quality' | 'price') => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="quality">Deal Quality</SelectItem>
                <SelectItem value="price">Price (Low to High)</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto">
              <Badge variant="secondary">
                {filteredDeals.length} of {analysis.relevantResults} shown
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal, index) => (
          <DealCard 
            key={`${deal.url}-${index}`}
            deal={deal}
            rank={index + 1}
            country={analysis.country}
          />
        ))}
      </div>

      {/* Analysis Info */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-400">
            <p className="mb-2">Analysis powered by: {analysis.searchEngineUsed}</p>
            <p className="text-xs">
              Results are analyzed by AI for relevance and deal quality. Prices and availability should be verified on the retailer&apos;s website.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}