import { useState, useEffect } from 'react';
import { Search, Download, BookOpen, User, Settings, LogOut, Plus, Filter, BarChart3, List, Folder } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { api, type Word as ApiWord, type Stats as ApiStats } from '../lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface DashboardProps {
  onNavigateToLanding: () => void;
}

export default function Dashboard({ onNavigateToLanding }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [words, setWords] = useState<ApiWord[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    loadData();
  }, [selectedLanguage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [wordsData, statsData] = await Promise.all([
        api.getWords({ language: selectedLanguage === 'all' ? undefined : selectedLanguage }),
        api.getStats()
      ]);
      
      setWords(wordsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  // Mock fallback data (kept for backwards compatibility)
  const mockWords: ApiWord[] = [
    {
      id: 1,
      word: 'Serendipity',
      definition: 'The occurrence of events by chance in a happy or beneficial way',
      example: 'Finding that book in the old bookstore was pure serendipity.',
      language: 'English',
      source_language: 'Spanish',
      created_at: '2025-11-14',
      tags: ['noun', 'abstract'],
    },
  ];

  const displayWords = words.length > 0 ? words : mockWords;

  const statsDisplay = [
    { label: 'Total Words', value: stats?.total_words.toString() || '0', change: '+12 this week' },
    { label: 'Languages', value: stats?.language_count.toString() || '0', change: stats?.languages.slice(0, 3).join(', ') || 'Loading...' },
    { label: 'Study Streak', value: '15 days', change: 'Personal best!' },
    { label: 'Words Mastered', value: Math.floor((stats?.total_words || 0) * 0.34).toString(), change: '34% of total' },
  ];

  const wordLists = [
    { name: 'Travel Vocabulary', count: 45, color: 'bg-blue-500' },
    { name: 'Business Terms', count: 32, color: 'bg-green-500' },
    { name: 'Everyday Phrases', count: 28, color: 'bg-purple-500' },
  ];

  const filteredWords = displayWords.filter((word) => {
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleExport = () => {
    const data = JSON.stringify(words, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wilddict-words.json';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateToLanding}>
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-gray-900">WildDict</span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:inline">Alex Morgan</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onNavigateToLanding}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl text-gray-900 mb-2">
            Welcome back, Alex! 👋
          </h1>
          <p className="text-gray-600">
            You've learned 12 new words this week. Keep up the great work!
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="words" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="words" className="gap-2">
              <List className="w-4 h-4" />
              My Words
            </TabsTrigger>
            <TabsTrigger value="lists" className="gap-2">
              <Folder className="w-4 h-4" />
              Word Lists
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* My Words Tab */}
          <TabsContent value="words" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search words..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Portuguese">Portuguese</SelectItem>
                      <SelectItem value="Swedish">Swedish</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-[#FF6B35] hover:bg-[#FF5722] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Word
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Word List */}
            <div className="space-y-4">
              {filteredWords.map((word) => (
                <Card key={word.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-2xl text-gray-900 mb-1">{word.word}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="border-[#FF6B35] text-[#FF6B35]">
                                {word.language}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                from {word.source_language}
                              </span>
                              {word.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(word.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{word.definition}</p>
                        <div className="bg-orange-50 border-l-4 border-[#FF6B35] p-3 rounded">
                          <p className="text-sm text-gray-700 italic">
                            "{word.example}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredWords.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No words found matching your search.</p>
                  <Button className="bg-[#FF6B35] hover:bg-[#FF5722] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Word
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Word Lists Tab */}
          <TabsContent value="lists" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wordLists.map((list, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 ${list.color} rounded-xl mb-4`}></div>
                    <h3 className="text-xl text-gray-900 mb-2">{list.name}</h3>
                    <p className="text-gray-600">{list.count} words</p>
                  </CardContent>
                </Card>
              ))}
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300">
                <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[180px]">
                  <Plus className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-600">Create New List</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsDisplay.map((stat, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-[#FF6B35]">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Learning Progress Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-orange-50 to-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-[#FF6B35] mx-auto mb-4" />
                    <p className="text-gray-600">Progress chart visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Languages You're Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Spanish', 'German', 'Japanese', 'Portuguese', 'Swedish'].map((lang, index) => {
                    const counts = [34, 28, 22, 18, 15];
                    const percentage = (counts[index] / 127) * 100;
                    return (
                      <div key={lang}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-900">{lang}</span>
                          <span className="text-gray-600">{counts[index]} words</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF6B35]"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
