import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Square, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Users,
  Target,
  MessageSquare,
  Activity,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CampaignStats {
  totalCalls: number;
  completedCalls: number;
  pendingCalls: number;
  failedCalls: number;
  conversions: number;
  conversionRate: number;
  avgCallDuration: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface LiveCampaignDashboardProps {
  campaignId: string;
  campaignName: string;
  status: 'running' | 'paused' | 'scheduled' | 'completed';
  onStatusChange: (status: string) => void;
}

const mockCallsOverTime = [
  { time: '09:00', calls: 0, conversions: 0 },
  { time: '10:00', calls: 12, conversions: 2 },
  { time: '11:00', calls: 28, conversions: 6 },
  { time: '12:00', calls: 35, conversions: 8 },
  { time: '13:00', calls: 42, conversions: 12 },
  { time: '14:00', calls: 55, conversions: 15 },
  { time: '15:00', calls: 68, conversions: 18 },
];

const sentimentColors = {
  positive: 'hsl(var(--dashboard-positive))',
  neutral: 'hsl(var(--dashboard-neutral))',
  negative: 'hsl(var(--dashboard-negative))'
};

export function LiveCampaignDashboard({ 
  campaignId, 
  campaignName, 
  status, 
  onStatusChange 
}: LiveCampaignDashboardProps) {
  const [stats, setStats] = useState<CampaignStats>({
    totalCalls: 200,
    completedCalls: 68,
    pendingCalls: 115,
    failedCalls: 17,
    conversions: 18,
    conversionRate: 26.5,
    avgCallDuration: 3.2,
    sentimentBreakdown: {
      positive: 45,
      neutral: 35,
      negative: 20
    }
  });

  const [isLive, setIsLive] = useState(status === 'running');

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        completedCalls: prev.completedCalls + Math.floor(Math.random() * 3),
        pendingCalls: Math.max(0, prev.pendingCalls - Math.floor(Math.random() * 2)),
        conversions: prev.conversions + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleStatusChange = (newStatus: string) => {
    setIsLive(newStatus === 'running');
    onStatusChange(newStatus);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'hsl(var(--dashboard-success))';
      case 'paused': return 'hsl(var(--dashboard-pending))';
      case 'completed': return 'hsl(var(--primary))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const sentimentData = [
    { name: 'Positive', value: stats.sentimentBreakdown.positive, color: sentimentColors.positive },
    { name: 'Neutral', value: stats.sentimentBreakdown.neutral, color: sentimentColors.neutral },
    { name: 'Negative', value: stats.sentimentBreakdown.negative, color: sentimentColors.negative }
  ];

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{campaignName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant="secondary" 
              className="capitalize"
              style={{ backgroundColor: `${getStatusColor()}15`, color: getStatusColor() }}
            >
              <Activity className="h-3 w-3 mr-1" />
              {status}
            </Badge>
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {status === 'running' ? (
            <Button onClick={() => handleStatusChange('paused')}>
              <Pause className="h-4 w-4 mr-2" />
              Pause Campaign
            </Button>
          ) : status === 'paused' ? (
            <Button onClick={() => handleStatusChange('running')}>
              <Play className="h-4 w-4 mr-2" />
              Resume Campaign
            </Button>
          ) : null}
          
          <Button variant="outline" onClick={() => handleStatusChange('completed')}>
            <Square className="h-4 w-4 mr-2" />
            Stop Campaign
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          animate={{ scale: isLive ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 2, repeat: isLive ? Infinity : 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Calls</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedCalls}</p>
                  <p className="text-xs text-muted-foreground">
                    of {stats.totalCalls} total
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <Progress 
                value={(stats.completedCalls / stats.totalCalls) * 100} 
                className="mt-3" 
              />
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Calls</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCalls}</p>
                <p className="text-xs text-muted-foreground">
                  {isLive ? 'Calling now...' : 'Waiting to call'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Calls</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedCalls}</p>
                <p className="text-xs text-muted-foreground">
                  {((stats.failedCalls / stats.totalCalls) * 100).toFixed(1)}% failure rate
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold text-primary">{stats.conversions}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.conversionRate}% conversion rate
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Calls Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockCallsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="calls" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Total Calls"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="hsl(var(--dashboard-success))" 
                      strokeWidth={2}
                      name="Conversions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Call Duration</span>
                  <span className="font-semibold">{stats.avgCallDuration} minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Best Time to Call</span>
                  <span className="font-semibold">11 AM - 2 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Answer Rate</span>
                  <span className="font-semibold">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Peak Engagement</span>
                  <span className="font-semibold">Tuesday 1 PM</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversation Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Positive Responses</span>
                    <Badge style={{ backgroundColor: `${sentimentColors.positive}15`, color: sentimentColors.positive }}>
                      {stats.sentimentBreakdown.positive}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    "This sounds interesting", "I'd like to know more"
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Neutral Responses</span>
                    <Badge style={{ backgroundColor: `${sentimentColors.neutral}15`, color: sentimentColors.neutral }}>
                      {stats.sentimentBreakdown.neutral}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    "Maybe later", "I need to think about it"
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Negative Responses</span>
                    <Badge style={{ backgroundColor: `${sentimentColors.negative}15`, color: sentimentColors.negative }}>
                      {stats.sentimentBreakdown.negative}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    "Not interested", "Please don't call again"
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Campaign Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Campaign Started</div>
                    <div className="text-sm text-muted-foreground">Today at 9:00 AM</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">First Calls Made</div>
                    <div className="text-sm text-muted-foreground">Today at 9:15 AM - 12 calls</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <Target className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">First Conversion</div>
                    <div className="text-sm text-muted-foreground">Today at 10:30 AM - Appointment booked</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 border-l-4 border-primary border bg-primary/5">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Peak Performance</div>
                    <div className="text-sm text-muted-foreground">Today at 2:00 PM - Highest conversion rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Issues & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Lower Answer Rate in Afternoon
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Answer rate drops to 65% after 3 PM. Consider scheduling more calls in the morning.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Adjust Schedule
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                      Script Performing Well
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your greeting block has 85% positive response. Consider using this script for future campaigns.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Save as Template
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">
                      Great Conversion Rate
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Your 26.5% conversion rate is above industry average of 18%. Keep up the good work!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}