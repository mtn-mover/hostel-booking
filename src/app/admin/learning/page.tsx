'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  BarChart,
  RefreshCw,
  Eye
} from 'lucide-react';

interface LearningAnalytics {
  totalLearnings: number;
  appliedLearnings: number;
  applicationRate: number;
  knowledgeByCategory: Array<{
    category: string;
    _count: number;
    _avg: {
      confidenceScore: number;
      successRate: number;
    };
  }>;
  recentLearnings: Array<{
    id: string;
    originalQuestion: string;
    adminResponse: string;
    createdAt: string;
    appliedToKnowledge: boolean;
  }>;
  highConfidenceKnowledge: Array<{
    id: string;
    category: string;
    keyName: string;
    confidenceScore: number;
    useCount: number;
    successRate: number;
  }>;
}

export default function LearningDashboard() {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLearning, setSelectedLearning] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/learning/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch learning analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyLearning = async (learningId: string) => {
    try {
      const response = await fetch('/api/admin/learning/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learningId })
      });
      
      if (response.ok) {
        fetchAnalytics(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to apply learning:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p>Failed to load learning analytics</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          Learning System Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage the AI learning system
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Learnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLearnings}</div>
            <p className="text-xs text-gray-500 mt-1">
              From admin interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Applied Knowledge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.appliedLearnings}</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">
                {analytics.applicationRate.toFixed(1)}% applied
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Knowledge Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.knowledgeByCategory.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Active categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg. Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                analytics.knowledgeByCategory.reduce(
                  (sum, cat) => sum + (cat._avg.confidenceScore || 0),
                  0
                ) / analytics.knowledgeByCategory.length * 100
              ).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Across all categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge by Category */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Knowledge Distribution by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.knowledgeByCategory.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{category.category}</Badge>
                  <span className="text-sm text-gray-600">
                    {category._count} items
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    Confidence: {((category._avg.confidenceScore || 0) * 100).toFixed(1)}%
                  </span>
                  <span className="text-gray-500">
                    Success: {((category._avg.successRate || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Learnings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Learning Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentLearnings.map((learning) => (
              <div
                key={learning.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">
                      Guest Question:
                    </p>
                    <p className="text-gray-700 text-sm mb-2">
                      {learning.originalQuestion}
                    </p>
                    <p className="font-medium text-sm mb-1">
                      Admin Response:
                    </p>
                    <p className="text-gray-700 text-sm">
                      {learning.adminResponse}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {learning.appliedToKnowledge ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Applied
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => applyLearning(learning.id)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Apply Learning
                      </Button>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(learning.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* High Confidence Knowledge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            High Confidence Knowledge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.highConfidenceKnowledge.map((knowledge) => (
              <div
                key={knowledge.id}
                className="border rounded-lg p-4 bg-green-50 border-green-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-green-700">
                    {knowledge.category}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedLearning(knowledge)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm font-medium mb-2">{knowledge.keyName}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Confidence:</span>
                    <p className="font-bold text-green-700">
                      {(knowledge.confidenceScore * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Used:</span>
                    <p className="font-bold">{knowledge.useCount}x</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Success:</span>
                    <p className="font-bold text-green-700">
                      {(knowledge.successRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <Button
          onClick={fetchAnalytics}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Analytics
        </Button>
      </div>
    </div>
  );
}