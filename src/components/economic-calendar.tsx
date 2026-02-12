'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EconomicEvent {
  id: number;
  title: string;
  country: string;
  date: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  currency: string;
  previous: string;
  forecast: string;
}

export default function EconomicCalendar() {
  const events: EconomicEvent[] = [
    { id: 1, title: 'US CPI Inflation Data', country: 'US', date: 'Today', time: '13:30 GMT', impact: 'high', currency: 'USD', previous: '3.2%', forecast: '3.1%' },
    { id: 2, title: 'FOMC Meeting Minutes', country: 'US', date: 'Tomorrow', time: '19:00 GMT', impact: 'high', currency: 'USD', previous: '-', forecast: '-' },
    { id: 3, title: 'US Non-Farm Payrolls', country: 'US', date: 'Friday', time: '13:30 GMT', impact: 'high', currency: 'USD', previous: '199K', forecast: '180K' },
    { id: 4, title: 'UK GDP Data', country: 'UK', date: 'Today', time: '07:00 GMT', impact: 'medium', currency: 'GBP', previous: '0.2%', forecast: '0.3%' },
    { id: 5, title: 'ECB Interest Rate Decision', country: 'EU', date: 'Thursday', time: '13:15 GMT', impact: 'high', currency: 'EUR', previous: '4.50%', forecast: '4.50%' },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Economic Calendar</span>
          <Badge variant="outline" className="bg-gold-50 text-gold-800">
            Gold Impact Events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(event.impact)}`}>
                    {event.impact.toUpperCase()}
                  </span>
                  <span className="font-medium">{event.title}</span>
                </div>
                <span className="text-sm text-gray-500">{event.date} {event.time}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Country:</span>
                  <span className="ml-2 font-medium">{event.country}</span>
                </div>
                <div>
                  <span className="text-gray-600">Previous:</span>
                  <span className="ml-2 font-medium">{event.previous}</span>
                </div>
                <div>
                  <span className="text-gray-600">Forecast:</span>
                  <span className="ml-2 font-medium">{event.forecast}</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">Gold Impact:</span>
                <span className="ml-2">
                  {event.impact === 'high' ? 'High - Avoid trading 1 hour before/after' :
                   event.impact === 'medium' ? 'Medium - Trade with caution' :
                   'Low - Minimal impact on gold'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
