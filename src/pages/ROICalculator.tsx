import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calculator, DollarSign, Clock, Users, TrendingUp, ArrowRight, Phone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Seo } from "@/components/seo/Seo";

const ROICalculator = () => {
  const [monthlyLeads, setMonthlyLeads] = useState(500);
  const [avgCallDuration, setAvgCallDuration] = useState(5);
  const [agentHourlyCost, setAgentHourlyCost] = useState(25);
  const [currentConversionRate, setCurrentConversionRate] = useState(15);
  const [avgDealValue, setAvgDealValue] = useState(500);

  const calculations = useMemo(() => {
    // Current costs (manual calling)
    const totalCallMinutes = monthlyLeads * avgCallDuration;
    const totalCallHours = totalCallMinutes / 60;
    const currentMonthlyCost = totalCallHours * agentHourlyCost;
    const currentAnnualCost = currentMonthlyCost * 12;

    // Ringster costs (AI calling)
    const ringsterPerMinuteRate = 0.12; // $0.12 per minute
    const ringsterMonthlyCost = totalCallMinutes * ringsterPerMinuteRate;
    const ringsterAnnualCost = ringsterMonthlyCost * 12;

    // Savings
    const monthlySavings = currentMonthlyCost - ringsterMonthlyCost;
    const annualSavings = currentAnnualCost - ringsterAnnualCost;
    const savingsPercentage = ((monthlySavings / currentMonthlyCost) * 100) || 0;

    // Revenue impact (assuming 20% improvement in conversion with AI)
    const currentMonthlyRevenue = (monthlyLeads * (currentConversionRate / 100)) * avgDealValue;
    const improvedConversionRate = Math.min(currentConversionRate * 1.2, 100);
    const projectedMonthlyRevenue = (monthlyLeads * (improvedConversionRate / 100)) * avgDealValue;
    const additionalRevenue = projectedMonthlyRevenue - currentMonthlyRevenue;

    // Time savings
    const hoursFreedPerMonth = totalCallHours;

    // ROI
    const totalMonthlyBenefit = monthlySavings + additionalRevenue;
    const roi = ((totalMonthlyBenefit / ringsterMonthlyCost) * 100) || 0;

    return {
      currentMonthlyCost,
      currentAnnualCost,
      ringsterMonthlyCost,
      ringsterAnnualCost,
      monthlySavings,
      annualSavings,
      savingsPercentage,
      hoursFreedPerMonth,
      additionalRevenue,
      roi,
      totalCallMinutes,
      improvedConversionRate,
    };
  }, [monthlyLeads, avgCallDuration, agentHourlyCost, currentConversionRate, avgDealValue]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  return (
    <>
      <Seo 
        title="ROI Calculator - See Your Savings with AI Calling | Ringster"
        description="Calculate how much time and money you can save with Ringster's AI-powered calling platform. Get your personalized ROI estimate in seconds."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/LG.svg" 
                alt="Ringster Logo" 
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Calculator className="w-4 h-4" />
                <span className="text-sm font-medium">ROI Calculator</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Calculate Your Savings with AI Calling
              </h1>
              <p className="text-lg text-muted-foreground">
                See exactly how much time and money you can save by switching to Ringster's 
                AI-powered calling platform. Adjust the sliders below to match your business.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Users className="w-5 h-5 text-primary" />
                      Your Business Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Monthly Leads */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-foreground font-medium">Monthly Leads/Calls</Label>
                        <span className="text-2xl font-bold text-primary">{formatNumber(monthlyLeads)}</span>
                      </div>
                      <Slider
                        value={[monthlyLeads]}
                        onValueChange={(value) => setMonthlyLeads(value[0])}
                        min={50}
                        max={10000}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>50</span>
                        <span>10,000</span>
                      </div>
                    </div>

                    {/* Avg Call Duration */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-foreground font-medium">Avg. Call Duration (minutes)</Label>
                        <span className="text-2xl font-bold text-primary">{avgCallDuration}</span>
                      </div>
                      <Slider
                        value={[avgCallDuration]}
                        onValueChange={(value) => setAvgCallDuration(value[0])}
                        min={1}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 min</span>
                        <span>30 min</span>
                      </div>
                    </div>

                    {/* Agent Hourly Cost */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-foreground font-medium">Agent Hourly Cost</Label>
                        <span className="text-2xl font-bold text-primary">${agentHourlyCost}</span>
                      </div>
                      <Slider
                        value={[agentHourlyCost]}
                        onValueChange={(value) => setAgentHourlyCost(value[0])}
                        min={10}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$10/hr</span>
                        <span>$100/hr</span>
                      </div>
                    </div>

                    {/* Current Conversion Rate */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-foreground font-medium">Current Conversion Rate</Label>
                        <span className="text-2xl font-bold text-primary">{currentConversionRate}%</span>
                      </div>
                      <Slider
                        value={[currentConversionRate]}
                        onValueChange={(value) => setCurrentConversionRate(value[0])}
                        min={1}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1%</span>
                        <span>50%</span>
                      </div>
                    </div>

                    {/* Avg Deal Value */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-foreground font-medium">Avg. Deal Value</Label>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(avgDealValue)}</span>
                      </div>
                      <Slider
                        value={[avgDealValue]}
                        onValueChange={(value) => setAvgDealValue(value[0])}
                        min={50}
                        max={10000}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$50</span>
                        <span>$10,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Results Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-6"
              >
                {/* Main Savings Card */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-2">Your Estimated Annual Savings</p>
                      <p className="text-5xl md:text-6xl font-bold text-primary">
                        {formatCurrency(calculations.annualSavings)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        That's {Math.round(calculations.savingsPercentage)}% less than your current costs
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="text-center p-4 bg-background/50 rounded-lg">
                        <Clock className="w-6 h-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold text-foreground">
                          {formatNumber(calculations.hoursFreedPerMonth)}
                        </p>
                        <p className="text-xs text-muted-foreground">Hours freed/month</p>
                      </div>
                      <div className="text-center p-4 bg-background/50 rounded-lg">
                        <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold text-foreground">
                          {formatNumber(calculations.roi)}%
                        </p>
                        <p className="text-xs text-muted-foreground">ROI</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Comparison */}
                <Card className="border-border/50 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-foreground">Monthly Cost Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-destructive/10 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Current (Manual)</p>
                        <p className="text-xs text-muted-foreground">{formatNumber(calculations.totalCallMinutes)} min/month</p>
                      </div>
                      <p className="text-2xl font-bold text-destructive">
                        {formatCurrency(calculations.currentMonthlyCost)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">With Ringster</p>
                        <p className="text-xs text-muted-foreground">$0.12/min AI calling</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(calculations.ringsterMonthlyCost)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg border-2 border-dashed border-primary/30">
                      <p className="font-semibold text-foreground">Monthly Savings</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(calculations.monthlySavings)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Revenue */}
                <Card className="border-border/50 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Projected Revenue Increase
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      With AI-powered calling, businesses typically see a 20% improvement in conversion rates due to 
                      consistent messaging, instant follow-ups, and 24/7 availability.
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Projected conversion</p>
                        <p className="font-medium text-foreground">
                          {currentConversionRate}% → {calculations.improvedConversionRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Additional monthly revenue</p>
                        <p className="text-xl font-bold text-primary">
                          +{formatCurrency(calculations.additionalRevenue)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                      Start Saving Today
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/contact" className="flex-1">
                    <Button variant="outline" className="w-full border-border" size="lg">
                      <Phone className="w-4 h-4 mr-2" />
                      Talk to Sales
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Why Businesses Switch to Ringster
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Clock,
                  title: "24/7 Availability",
                  description: "AI agents never sleep. Handle leads around the clock without overtime costs.",
                },
                {
                  icon: TrendingUp,
                  title: "Consistent Performance",
                  description: "Every call follows your script perfectly. No bad days, no missed opportunities.",
                },
                {
                  icon: CheckCircle,
                  title: "Instant Scale",
                  description: "Handle 10 calls or 10,000 calls. Scale instantly without hiring.",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="text-center h-full border-border/50">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Ringster. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ROICalculator;
