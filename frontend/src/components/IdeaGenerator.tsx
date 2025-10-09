import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Lightbulb, Sparkles, Send, Loader2, Brain } from 'lucide-react';
import { InterestIdea, ChatSession } from '@/services/apiService';
import apiService from '@/services/apiService';
import { formatRelativeTime } from '@/lib/utils';

interface IdeaGeneratorProps {
  resources?: any[];
  currentDraft?: any;
  onIdeaSelect?: (idea: InterestIdea) => void;
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({
  resources = [],
  currentDraft,
  onIdeaSelect,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<InterestIdea[]>([]);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analyzingContent, setAnalyzingContent] = useState(false);

  // Load existing ideas
  const loadIdeas = useCallback(async () => {
    try {
      const data = await apiService.getIdeas();
      setIdeas(data);
    } catch (err) {
      console.error('Error loading ideas:', err);
    }
  }, []);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  // Generate ideas from collected data
  const generateIdeas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare content for analysis
      const contentData = {
        content: currentDraft?.content || '',
        resources: resources.map((r) => r.id),
      };

      // Call AI analysis endpoint (placeholder implementation)
      const analysisResult = await apiService.analyzeContent(contentData);

      let newIdeas: InterestIdea[] = [];
      if (analysisResult.ideas && Array.isArray(analysisResult.ideas)) {
        newIdeas = analysisResult.ideas.map((idea: any, index: number) => ({
          id: `generated-${Date.now()}-${index}`,
          title: idea.title || 'Generated Idea',
          description: idea.description || '',
          source_data: JSON.stringify(contentData),
          created_at: new Date().toISOString(),
        }));

        setIdeas((prev) => [...newIdeas, ...prev]);
      }

      // Show success notification
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Ideas Generated!', {
          body: `${newIdeas.length} new ideas have been generated based on your content.`,
        });
      }
    } catch (err) {
      setError('Failed to generate ideas. Please try again.');
      console.error('Error generating ideas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentDraft, resources]);

  // Start chat session
  const startChatSession = useCallback(async () => {
    try {
      const session = await apiService.createChatSession();
      setChatSession(session);
      setError(null);
    } catch (err) {
      setError('Failed to start chat session');
      console.error('Error starting chat session:', err);
    }
  }, []);

  // Send chat message
  const sendMessage = useCallback(async () => {
    if (!message.trim() || !chatSession) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedSession = await apiService.addChatMessage(
        chatSession.id,
        message
      );
      setChatSession(updatedSession);
      setMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [message, chatSession]);

  // Analyze current content
  const analyzeContent = useCallback(async () => {
    if (!currentDraft?.content && resources.length === 0) {
      setError('Please add some content or resources to analyze');
      return;
    }

    setAnalyzingContent(true);
    setError(null);

    try {
      const contentData = {
        content: currentDraft?.content || '',
        resources: resources.map((r) => r.id),
      };

      const analysisResult = await apiService.analyzeContent(contentData);

      if (analysisResult.summary) {
        // Create an idea based on the analysis
        const analysisIdea: InterestIdea = {
          id: `analysis-${Date.now()}`,
          title: 'Content Analysis',
          description: analysisResult.summary,
          source_data: JSON.stringify(contentData),
          created_at: new Date().toISOString(),
        };

        setIdeas((prev) => [analysisIdea, ...prev]);
      }
    } catch (err) {
      setError('Failed to analyze content');
      console.error('Error analyzing content:', err);
    } finally {
      setAnalyzingContent(false);
    }
  }, [currentDraft, resources]);

  const handleIdeaSelect = useCallback(
    (idea: InterestIdea) => {
      if (onIdeaSelect) {
        onIdeaSelect(idea);
      }
    },
    [onIdeaSelect]
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Idea Generator
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Main IDEA ISPIRA Button */}
        <div className="text-center mb-6">
          <Button
            size="lg"
            onClick={generateIdeas}
            disabled={
              isLoading || (!currentDraft?.content && resources.length === 0)
            }
            className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                IDEA ISPIRA
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Generate creative ideas from your content and resources
          </p>
        </div>

        {/* Content Analysis */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={analyzeContent}
            disabled={
              analyzingContent ||
              (!currentDraft?.content && resources.length === 0)
            }
            className="w-full"
          >
            {analyzingContent ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Analyze Current Content
              </>
            )}
          </Button>
        </div>

        {/* Generated Ideas */}
        {ideas.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Generated Ideas ({ideas.length})
            </h3>
            <div className="space-y-3">
              {ideas.map((idea) => (
                <Card
                  key={idea.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleIdeaSelect(idea)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {idea.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {formatRelativeTime(idea.created_at)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Assistant
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={startChatSession}
              disabled={!!chatSession}
            >
              {chatSession ? 'Session Active' : 'Start Chat'}
            </Button>
          </div>

          {chatSession ? (
            <div className="space-y-3">
              {/* Chat Messages */}
              <div className="bg-muted/50 rounded-md p-3 min-h-[100px] max-h-[200px] overflow-auto">
                {chatSession.messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Start a conversation with the AI assistant...
                  </p>
                ) : (
                  <div className="space-y-2">
                    {chatSession.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 rounded-md text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary/10 ml-4'
                            : 'bg-secondary/50 mr-4'
                        }`}
                      >
                        <div className="font-medium mb-1">
                          {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        </div>
                        <div>{msg.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask for ideas, feedback, or suggestions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="flex-1 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  size="sm"
                  className="self-end"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Start a chat session to get personalized suggestions
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IdeaGenerator;
