'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    buySignals: true,
    sellSignals: true,
    highConfidence: true,
    mediumConfidence: false,
    lowConfidence: false,
    economicEvents: true,
    priceAlerts: false,
    dailySummary: true,
  });

  const [notificationMethod, setNotificationMethod] = useState('push');
  const [quietHours, setQuietHours] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('06:00');

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    try {
      // In real app, save to backend
      console.log('Saving notification settings:', { notifications, notificationMethod, quietHours });
      alert('Notification settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    }
  };

  const testNotification = async () => {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('BULLIONS BOT Test', {
          body: 'This is a test notification from your gold trading bot!',
          icon: '/logo.png',
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('BULLIONS BOT Test', {
            body: 'Notifications enabled! You will now receive trading signals.',
            icon: '/logo.png',
          });
        }
      }
    } catch (error) {
      console.error('Notification test failed:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Signal Types */}
        <div>
          <Label className="text-lg font-semibold mb-3 block">Signal Types</Label>
          <div className="space-y-4">
            {Object.entries({
              buySignals: 'Buy Signals',
              sellSignals: 'Sell Signals',
              highConfidence: 'High Confidence Signals (80%+)',
              mediumConfidence: 'Medium Confidence Signals (60-80%)',
              lowConfidence: 'Low Confidence Signals (below 60%)',
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                <Switch
                  id={key}
                  checked={notifications[key as keyof typeof notifications]}
                  onCheckedChange={() => handleToggle(key as keyof typeof notifications)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Additional Alerts */}
        <div>
          <Label className="text-lg font-semibold mb-3 block">Additional Alerts</Label>
          <div className="space-y-4">
            {Object.entries({
              economicEvents: 'High-Impact Economic Events',
              priceAlerts: 'Gold Price Movement Alerts',
              dailySummary: 'Daily Performance Summary',
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={`alert-${key}`} className="cursor-pointer">{label}</Label>
                <Switch
                  id={`alert-${key}`}
                  checked={notifications[key as keyof typeof notifications]}
                  onCheckedChange={() => handleToggle(key as keyof typeof notifications)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-lg font-semibold">Quiet Hours</Label>
            <Switch checked={quietHours} onCheckedChange={setQuietHours} />
          </div>
          {quietHours && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="quietStart">Start Time</Label>
                <input
                  id="quietStart"
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div>
                <Label htmlFor="quietEnd">End Time</Label>
                <input
                  id="quietEnd"
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button onClick={saveSettings} className="w-full bg-gold-600 hover:bg-gold-700">
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
