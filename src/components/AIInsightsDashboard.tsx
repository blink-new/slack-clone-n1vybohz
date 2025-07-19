import React from 'react';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Users, 
  MessageSquare, 
  Calendar,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Zap,
  Target,
  Activity,
  Sparkles,
  Mail,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

interface AIInsightsDashboardProps {
  isDemoMode?: boolean;
  hasAIInsights?: boolean;
  hasEmailIntegration?: boolean;
  onViewChange?: (view: string) => void;
}

const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({ 
  isDemoMode = false, 
  hasAIInsights = false, 
  hasEmailIntegration = false,
  onViewChange
}) => {
  const insights = [
    {
      title: "Team Productivity",
      value: "87%",
      change: "+12%",
      trend: "up",
      icon: TrendingUp,
      description: "Compared to last week"
    },
    {
      title: "Active Threads",
      value: "24",
      change: "+3",
      trend: "up",
      icon: MessageSquare,
      description: "Currently active"
    },
    {
      title: "Response Time",
      value: "2.3h",
      change: "-0.5h",
      trend: "down",
      icon: Clock,
      description: "Average response time"
    },
    {
      title: "Team Members",
      value: "12",
      change: "+2",
      trend: "up",
      icon: Users,
      description: "Active this week"
    }
  ];

  const recentActivities = [
    {
      type: 'message',
      title: 'New message in #product-design',
      description: 'Sarah shared wireframes for the mobile app',
      time: '2 minutes ago',
      priority: 'high'
    },
    {
      type: 'meeting',
      title: 'Upcoming meeting: Sprint Planning',
      description: 'Starts in 15 minutes with the development team',
      time: '15 minutes',
      priority: 'urgent'
    },
    {
      type: 'task',
      title: 'Task completed: API Documentation',
      description: 'John finished the REST API documentation',
      time: '1 hour ago',
      priority: 'normal'
    },
    {
      type: 'integration',
      title: 'Jira sync completed',
      description: '15 new tickets imported from project board',
      time: '2 hours ago',
      priority: 'normal'
    }
  ];

  const aiSuggestions = [
    {
      title: "Schedule team standup",
      description: "Based on recent activity, consider scheduling a team sync",
      action: "Schedule Meeting",
      confidence: 85
    },
    {
      title: "Review pending PRs",
      description: "3 pull requests have been waiting for review for 2+ days",
      action: "Review Now",
      confidence: 92
    },
    {
      title: "Update project timeline",
      description: "Current sprint velocity suggests timeline adjustment",
      action: "Update Timeline",
      confidence: 78
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'meeting': return Calendar;
      case 'task': return CheckCircle;
      case 'integration': return Zap;
      default: return Activity;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Show welcome message for new users without AI insights or email integration
  if (!isDemoMode && !hasAIInsights && !hasEmailIntegration) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="text-center py-12">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to THREAD</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your AI-powered workspace is ready! Let's get you started with some powerful features.
          </p>
          
          {/* Quick Demo Toggle */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Want to see THREAD in action? Toggle Demo Mode in the bottom right corner!
              </span>
            </div>
          </div>
        </div>

        {/* Getting Started Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-white shadow-sm hover:scale-105 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Start Messaging</CardTitle>
              <CardDescription>
                Create channels and start conversations with your team
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full"
                onClick={() => onViewChange?.('dms')}
              >
                Go to Messages
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-white shadow-sm hover:scale-105 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Connect Email</CardTitle>
              <CardDescription>
                Integrate your email for unified communication
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onViewChange?.('email')}
              >
                Open Email
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-white shadow-sm hover:scale-105 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Manage Projects</CardTitle>
              <CardDescription>
                Track tasks and collaborate on projects
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onViewChange?.('projects')}
              >
                View Projects
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Sparkles className="h-5 w-5" />
              What makes THREAD special?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">AI-Powered Insights</h4>
                    <p className="text-sm text-gray-600">Get intelligent summaries and actionable insights from your conversations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Unified Communication</h4>
                    <p className="text-sm text-gray-600">Bring together chat, email, and meetings in one place</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Smart Automation</h4>
                    <p className="text-sm text-gray-600">Automate routine tasks and focus on what matters most</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Goal Tracking</h4>
                    <p className="text-sm text-gray-600">Track team progress and achieve objectives faster</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
              <p className="text-gray-600">Your intelligent workspace overview</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            AI Active
          </Badge>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const isPositive = insight.trend === 'up';
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 border-0 bg-white shadow-sm hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {insight.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  isPositive ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">{insight.value}</div>
                <div className="flex items-center space-x-1">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isPositive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <TrendingUp className={`h-3 w-3 ${
                      isPositive ? 'text-green-600' : 'text-red-600 rotate-180'
                    }`} />
                    <span>{insight.change}</span>
                  </div>
                  <span className="text-xs text-gray-500">{insight.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest updates from your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(activity.priority)}`}
                        >
                          {activity.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>AI Suggestions</span>
            </CardTitle>
            <CardDescription>
              Intelligent recommendations for your workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <Progress value={suggestion.confidence} className="w-16 h-2" />
                          <span className="text-xs font-medium text-gray-700">
                            {suggestion.confidence}%
                          </span>
                        </div>
                        <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                          {suggestion.action}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all group">
              <MessageSquare className="h-6 w-6 text-gray-400 group-hover:text-primary mb-2" />
              <p className="text-sm font-medium text-gray-900">New Thread</p>
              <p className="text-xs text-gray-500">Start conversation</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all group">
              <Calendar className="h-6 w-6 text-gray-400 group-hover:text-primary mb-2" />
              <p className="text-sm font-medium text-gray-900">Schedule Meeting</p>
              <p className="text-xs text-gray-500">Book time slot</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all group">
              <BarChart3 className="h-6 w-6 text-gray-400 group-hover:text-primary mb-2" />
              <p className="text-sm font-medium text-gray-900">View Analytics</p>
              <p className="text-xs text-gray-500">Team insights</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all group">
              <Zap className="h-6 w-6 text-gray-400 group-hover:text-primary mb-2" />
              <p className="text-sm font-medium text-gray-900">Integrations</p>
              <p className="text-xs text-gray-500">Connect tools</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightsDashboard;