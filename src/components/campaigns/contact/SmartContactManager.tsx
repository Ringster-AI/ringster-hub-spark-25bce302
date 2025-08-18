import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  Users, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Trash2,
  Download,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  tags: string[];
  status: 'pending' | 'validated' | 'invalid';
  metadata?: Record<string, any>;
}

interface SmartContactManagerProps {
  onContactsReady: (contacts: Contact[]) => void;
}

export function SmartContactManager({ onContactsReady }: SmartContactManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'csv' | 'paste' | 'manual'>('csv');
  const [pastedData, setPastedData] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

  // Mock AI tagging suggestions
  const suggestedTags = [
    { tag: 'hot-leads', count: 12, color: 'hsl(var(--success))' },
    { tag: 'repeat-customers', count: 8, color: 'hsl(var(--primary))' },
    { tag: 'new-prospects', count: 25, color: 'hsl(var(--warning))' },
    { tag: 'high-value', count: 5, color: 'hsl(var(--flow-node-goal))' }
  ];

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate processing
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Mock CSV processing
    setTimeout(() => {
      const mockContacts: Contact[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          phoneNumber: '+1 (555) 123-4567',
          email: 'john@example.com',
          tags: ['hot-leads', 'repeat-customers'],
          status: 'validated'
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          phoneNumber: '+1 (555) 234-5678',
          email: 'sarah@company.com',
          tags: ['new-prospects'],
          status: 'validated'
        },
        {
          id: '3',
          firstName: 'Mike',
          lastName: 'Davis',
          phoneNumber: '555-345-6789',
          tags: ['hot-leads', 'high-value'],
          status: 'pending'
        }
      ];

      setContacts(mockContacts);
      setIsProcessing(false);
      setProcessingProgress(0);
    }, 2000);
  }, []);

  const handlePasteProcessing = () => {
    if (!pastedData.trim()) return;

    setIsProcessing(true);
    
    // Mock processing pasted data
    setTimeout(() => {
      const lines = pastedData.split('\n').filter(line => line.trim());
      const processedContacts: Contact[] = lines.map((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        return {
          id: `paste-${index}`,
          firstName: parts[0] || 'Unknown',
          lastName: parts[1] || '',
          phoneNumber: parts[2] || '',
          email: parts[3],
          tags: ['new-prospects'],
          status: 'pending' as const
        };
      });

      setContacts(processedContacts);
      setIsProcessing(false);
      setPastedData('');
    }, 1000);
  };

  const applyAITags = () => {
    setContacts(prev => prev.map(contact => ({
      ...contact,
      tags: [...new Set([...contact.tags, 'ai-suggested'])]
    })));
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const validateContacts = () => {
    setContacts(prev => prev.map(contact => ({
      ...contact,
      status: contact.phoneNumber.length >= 10 ? 'validated' : 'invalid'
    })));
  };

  const validContacts = contacts.filter(c => c.status === 'validated');
  const invalidContacts = contacts.filter(c => c.status === 'invalid');

  return (
    <div className="space-y-6">
      {/* Upload Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Add Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              variant={uploadMethod === 'csv' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('csv')}
              className="h-auto p-4 flex-col"
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="font-medium">Upload CSV</span>
              <span className="text-xs text-muted-foreground">Recommended</span>
            </Button>
            <Button
              variant={uploadMethod === 'paste' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('paste')}
              className="h-auto p-4 flex-col"
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="font-medium">Paste Numbers</span>
              <span className="text-xs text-muted-foreground">Quick & Easy</span>
            </Button>
            <Button
              variant={uploadMethod === 'manual' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('manual')}
              className="h-auto p-4 flex-col"
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="font-medium">Manual Entry</span>
              <span className="text-xs text-muted-foreground">One by one</span>
            </Button>
          </div>

          {uploadMethod === 'csv' && (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Drop your CSV file here</h3>
                <p className="text-muted-foreground mb-4">
                  Or click to browse files. We support Name, Phone, Email columns.
                </p>
                <Button>Choose File</Button>
              </label>
            </div>
          )}

          {uploadMethod === 'paste' && (
            <div className="space-y-4">
              <Textarea
                placeholder="Paste your contact data here...&#10;Format: FirstName, LastName, Phone, Email&#10;Example:&#10;John, Smith, +1-555-123-4567, john@example.com&#10;Sarah, Johnson, +1-555-234-5678, sarah@company.com"
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                rows={8}
              />
              <Button onClick={handlePasteProcessing} disabled={!pastedData.trim()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Process Data
              </Button>
            </div>
          )}

          {uploadMethod === 'manual' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Manual entry form coming soon...</p>
              <Button variant="outline" disabled>
                Add Contact Manually
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Progress */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="animate-spin">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Processing contacts...</h3>
                    <p className="text-sm text-muted-foreground">
                      AI is cleaning, formatting, and tagging your contacts
                    </p>
                    <Progress value={processingProgress} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Results */}
      {contacts.length > 0 && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{contacts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Contacts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{validContacts.length}</div>
                  <div className="text-sm text-muted-foreground">Valid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{invalidContacts.length}</div>
                  <div className="text-sm text-muted-foreground">Invalid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((validContacts.length / contacts.length) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Suggestions
                </CardTitle>
                <Button variant="outline" size="sm" onClick={applyAITags}>
                  Apply All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <Badge 
                    key={tag.tag} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-accent"
                    style={{ borderColor: tag.color }}
                  >
                    {tag.tag} ({tag.count})
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                AI has analyzed your contacts and suggests these tags based on patterns.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={validateContacts} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate All
            </Button>
            <Button onClick={() => onContactsReady(validContacts)} disabled={validContacts.length === 0}>
              <Users className="h-4 w-4 mr-2" />
              Use {validContacts.length} Valid Contacts
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Contact List Preview */}
          {contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {contacts.slice(0, 10).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          contact.status === 'validated' ? 'bg-green-500' : 
                          contact.status === 'invalid' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contact.phoneNumber}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContact(contact.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {contacts.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground pt-2">
                      ... and {contacts.length - 10} more contacts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}