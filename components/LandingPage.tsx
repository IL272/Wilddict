import { Eye, Zap, BookOpen, Cloud, Check, Star, Chrome, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface LandingPageProps {
  onNavigateToDashboard: () => void;
}

export default function LandingPage({ onNavigateToDashboard }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Eye,
      title: 'Visual Lookup',
      description: 'Point, click, and learn. Extract words from any image, video, or website instantly.',
    },
    {
      icon: Zap,
      title: 'Instant Translation',
      description: 'Translate words and phrases across 100+ languages in real-time with AI precision.',
    },
    {
      icon: BookOpen,
      title: 'Smart Dictionary',
      description: 'Get context-aware definitions, examples, and pronunciation guides powered by AI.',
    },
    {
      icon: Cloud,
      title: 'Sync Everywhere',
      description: 'Access your saved words across all devices. Your personal dictionary, always with you.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Install WildDict',
      description: 'Add our lightweight extension to your browser in seconds.',
    },
    {
      number: '02',
      title: 'Select Any Word',
      description: 'Highlight text from images, videos, or web pages.',
    },
    {
      number: '03',
      title: 'Learn & Save',
      description: 'Get instant translations and save to your personal dictionary.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Language Student',
      content: 'WildDict transformed my language learning. I can now save words from YouTube videos and build my vocabulary effortlessly!',
      rating: 5,
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Content Creator',
      content: 'As someone who works with international content daily, this tool is a game-changer. The visual lookup is incredibly accurate.',
      rating: 5,
    },
    {
      name: 'Aisha Patel',
      role: 'Translator',
      content: 'The AI-powered context understanding is impressive. It saves me hours of manual dictionary lookups every week.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-gray-900">WildDict</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <Button variant="ghost" onClick={onNavigateToDashboard}>Sign In</Button>
              <Button className="bg-[#FF6B35] hover:bg-[#FF5722] text-white">
                <Chrome className="w-4 h-4 mr-2" />
                Add to Chrome
              </Button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
                <Button variant="ghost" onClick={onNavigateToDashboard} className="justify-start">Sign In</Button>
                <Button className="bg-[#FF6B35] hover:bg-[#FF5722] text-white">
                  <Chrome className="w-4 h-4 mr-2" />
                  Add to Chrome
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-orange-100 text-[#FF6B35] border-none">
              AI-Powered Visual Dictionary
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-6">
              Learn Languages from <span className="text-[#FF6B35]">Anywhere</span> on the Web
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              WildDict lets you translate and save words from images, videos, and websites instantly. 
              Build your visual vocabulary with AI-powered intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-[#FF6B35] hover:bg-[#FF5722] text-white px-8">
                <Chrome className="w-5 h-5 mr-2" />
                Install Free Extension
              </Button>
              <Button size="lg" variant="outline" onClick={onNavigateToDashboard}>
                View Demo Dashboard
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Free forever • No credit card required • 50,000+ active users
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-[#FF6B35] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Eye className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-600">Extension Demo Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4">
              Powerful Features for Visual Learning
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to master new languages through visual content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-[#FF6B35] transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-[#FF6B35]" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start building your visual vocabulary in under a minute
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 h-full">
                  <div className="text-6xl text-[#FF6B35] opacity-20 mb-4">{step.number}</div>
                  <h3 className="text-2xl text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-[#FF6B35]"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-[#FF6B35] hover:bg-[#FF5722] text-white px-8">
              <Chrome className="w-5 h-5 mr-2" />
              Start Learning Now
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4">
              Loved by Language Learners Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of users transforming how they learn languages
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-gray-100">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#FF6B35] text-[#FF6B35]" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FF6B35] to-[#FF5722]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl text-white mb-6">
            Ready to Transform Your Language Learning?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Install WildDict today and start building your visual vocabulary
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-[#FF6B35] hover:bg-gray-100 px-8">
              <Chrome className="w-5 h-5 mr-2" />
              Install Free Extension
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 text-white/80 flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>100+ Languages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-white">WildDict</span>
              </div>
              <p className="text-sm">
                AI-powered visual dictionary for modern language learners.
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 WildDict. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
