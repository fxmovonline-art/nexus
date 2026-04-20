'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StartupDetailHero from '@/components/explore/StartupDetailHero';
import StartupAbout from '@/components/explore/StartupAbout';
import FundingProgress from '@/components/explore/FundingProgress';
import TeamMembers from '@/components/explore/TeamMembers';

interface StartupDetail {
  id: string;
  name: string;
  logo: string;
  bio: string;
  industry: string;
  location: string;
  website: string;
  description: string;
  problemStatement: string;
  solution: string;
  targetMarket: string;
  fundingStage: string;
  fundingGoal: string;
  currentFunding: string;
  targetAmount: number;
  raisedAmount: number;
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
  }>;
}

// Mock data - in production, this would be fetched based on [id]
const startupDetails: { [key: string]: StartupDetail } = {
  '1': {
    id: '1',
    name: 'TechWave AI',
    logo: '🤖',
    bio: 'AI-powered financial analytics platform helping businesses make smarter investment decisions',
    industry: 'FinTech',
    location: 'San Francisco, CA',
    website: 'https://techwave-ai.example.com',
    description:
      'TechWave AI is revolutionizing financial analytics by combining artificial intelligence with deep market insights. Our platform processes millions of data points in real-time to provide actionable investment recommendations for both institutional and retail investors.',
    problemStatement:
      'Traditional financial analysis is time-consuming, expensive, and often inaccessible to small investors. Large datasets overwhelm manual analysis, leading to missed opportunities and poor investment decisions.',
    solution:
      'We use advanced machine learning algorithms to analyze market trends, company fundamentals, and macroeconomic factors. Our platform delivers personalized insights, predictive analytics, and automated portfolio optimization in minutes.',
    targetMarket:
      'Financial advisors, hedge funds, retail investors, and corporate treasury teams aged 25-65 with $50K+ investment portfolios.',
    fundingStage: 'Series A',
    fundingGoal: '$3M',
    currentFunding: '$1.8M',
    targetAmount: 3000000,
    raisedAmount: 1800000,
    teamMembers: [
      { id: '1', name: 'Sarah Johnson', role: 'CEO & Co-founder', avatar: '👩‍💼' },
      { id: '2', name: 'John Smith', role: 'CTO & Co-founder', avatar: '👨‍💻' },
      { id: '3', name: 'Emily Davis', role: 'Head of Finance', avatar: '👩‍💼' },
      { id: '4', name: 'Mark Wilson', role: 'VP of Sales', avatar: '👨‍💼' },
    ],
  },
  '2': {
    id: '2',
    name: 'GreenLife Solutions',
    logo: '🌱',
    bio: 'Sustainable packaging alternatives that reduce environmental impact',
    industry: 'CleanTech',
    location: 'Portland, OR',
    website: 'https://greenlife-solutions.example.com',
    description:
      'GreenLife Solutions develops biodegradable and compostable packaging materials that are fully compliant with food safety standards while significantly reducing environmental footprint.',
    problemStatement:
      'The packaging industry generates millions of tons of waste annually. Existing alternatives are expensive, fragile, and often not commercially viable for large manufacturers.',
    solution:
      'Our proprietary bio-polymer technology creates packaging that degrades within 90-120 days in industrial composting facilities without affecting product quality or shelf life.',
    targetMarket: 'Food and beverage companies, e-commerce retailers, and quick-service restaurants seeking sustainable packaging solutions.',
    fundingStage: 'Seed Round',
    fundingGoal: '$2M',
    currentFunding: '$600K',
    targetAmount: 2000000,
    raisedAmount: 600000,
    teamMembers: [
      { id: '1', name: 'David Chen', role: 'CEO & Founder', avatar: '👨‍💼' },
      { id: '2', name: 'Lisa Wang', role: 'Chief Innovation Officer', avatar: '👩‍🔬' },
    ],
  },
};

export default function StartupDetailPage({ params }: { params: { id: string } }) {
  const startup = startupDetails[params.id] || startupDetails['1'];

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <StartupDetailHero
        name={startup.name}
        logo={startup.logo}
        bio={startup.bio}
        industry={startup.industry}
        location={startup.location}
        website={startup.website}
      />

      {/* Main Content + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* About Section */}
          <StartupAbout
            description={startup.description}
            problemStatement={startup.problemStatement}
            solution={startup.solution}
            targetMarket={startup.targetMarket}
          />

          {/* Funding Progress */}
          <FundingProgress
            fundingGoal={startup.fundingGoal}
            currentFunding={startup.currentFunding}
            stage={startup.fundingStage}
            targetAmount={startup.targetAmount}
            raisedAmount={startup.raisedAmount}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <TeamMembers members={startup.teamMembers} />
        </div>
      </div>
    </DashboardLayout>
  );
}
