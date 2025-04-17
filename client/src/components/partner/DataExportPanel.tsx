import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Title, 
  Text,
  Button,
  DateRangePicker,
  Select,
  SelectItem,
  Grid
} from '@tremor/react';
import { Loader2, Download, FileJson, Calendar, Filter } from 'lucide-react';

interface DataExportPanelProps {
  partnerId: number;
  apiKey: string;
}

type DateRangeValue = {
  from: Date;
  to: Date;
};

const DataExportPanel: React.FC<DataExportPanelProps> = ({ partnerId, apiKey }) => {
  const [exportType, setExportType] = useState<string>('conversations');
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [groupBy, setGroupBy] = useState<string>('day');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedData, setExportedData] = useState<any>(null);
  
  // Handle export button click
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Format dates for API
      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();
      
      // Construct API URL based on export type
      let url = `/api/export/${exportType}?startDate=${startDate}&endDate=${endDate}`;
      
      // Add additional parameters based on export type
      if (exportType === 'analytics') {
        url += `&groupBy=${groupBy}`;
      }
      
      // Fetch data
      const response = await fetch(url, {
        headers: {
          'X-API-KEY': apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const data = await response.json();
      setExportedData(data);
      
      // Trigger download
      downloadJson(data, `strangerwave_${exportType}_export_${new Date().toISOString().split('T')[0]}.json`);
    } catch (error) {
      console.error('Export error:', error);
      // Would show error toast in real implementation
    } finally {
      setIsExporting(false);
    }
  };
  
  // Function to download JSON data as a file
  const downloadJson = (data: any, filename: string) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', filename);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileJson className="h-5 w-5 text-primary" />
        <Title>Data Export</Title>
      </div>
      
      <Text className="mb-6">Export data for integration with your systems</Text>
      
      <Grid numItems={1} numItemsMd={2} className="gap-6 mb-6">
        <div>
          <Text className="mb-2">Data Type</Text>
          <Select 
            value={exportType} 
            onValueChange={setExportType}
            icon={Filter}
          >
            <SelectItem value="conversations">Conversations</SelectItem>
            <SelectItem value="user-activity">User Activity</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
            <SelectItem value="topics">Topics</SelectItem>
          </Select>
        </div>
        
        <div>
          <Text className="mb-2">Date Range</Text>
          <DateRangePicker 
            value={dateRange}
            onValueChange={setDateRange}
            className="max-w-md mx-auto"
          />
        </div>
      </Grid>
      
      {exportType === 'analytics' && (
        <div className="mb-6">
          <Text className="mb-2">Group By</Text>
          <Select 
            value={groupBy} 
            onValueChange={setGroupBy}
            icon={Calendar}
            className="max-w-xs"
          >
            <SelectItem value="hour">Hour</SelectItem>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </Select>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          icon={isExporting ? undefined : Download}
          className="mt-4"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Exporting...
            </>
          ) : (
            'Export Data'
          )}
        </Button>
      </div>
      
      {exportedData && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <Text className="font-medium mb-2">Export Summary</Text>
          <Text className="text-sm">
            Exported {exportType} data from {new Date(exportedData.metadata.startDate).toLocaleDateString()} to {new Date(exportedData.metadata.endDate).toLocaleDateString()}
          </Text>
          {exportedData.metadata.count && (
            <Text className="text-sm">
              {exportedData.metadata.count} records exported (total: {exportedData.metadata.totalConversations || exportedData.metadata.totalUsers || 'N/A'})
            </Text>
          )}
        </div>
      )}
    </Card>
  );
};

export default DataExportPanel;