import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../services/api';

interface Escalation {
  id: string;
  chatSessionId: string;
  guestName: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  createdAt: string;
  apartmentName?: string;
}

export default function EscalationsScreen({ navigation }: any) {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetchEscalations();
  }, [filter]);

  const fetchEscalations = async () => {
    try {
      const response = await api.get('/admin/escalations', {
        params: { urgency: filter === 'all' ? undefined : filter }
      });
      setEscalations(response.data);
    } catch (error) {
      console.error('Failed to fetch escalations:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEscalations();
    setRefreshing(false);
  };

  const handleTakeover = async (escalation: Escalation) => {
    try {
      await api.post(`/admin/escalations/${escalation.id}/takeover`);
      navigation.navigate('Chats', { 
        screen: 'ChatDetail',
        params: { 
          chatId: escalation.chatSessionId,
          guestName: escalation.guestName 
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to take over chat');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const renderEscalation = ({ item }: { item: Escalation }) => (
    <TouchableOpacity
      style={[styles.escalationCard, { borderLeftColor: getUrgencyColor(item.urgency) }]}
      onPress={() => handleTakeover(item)}
      activeOpacity={0.8}
    >
      <View style={styles.escalationHeader}>
        <View style={styles.guestInfo}>
          <Text style={styles.guestName}>{item.guestName || 'Guest'}</Text>
          {item.apartmentName && (
            <Text style={styles.apartmentName}>{item.apartmentName}</Text>
          )}
        </View>
        <View style={styles.urgencyBadge}>
          <Icon 
            name={item.urgency === 'high' ? 'error' : item.urgency === 'medium' ? 'warning' : 'info'} 
            size={16} 
            color={getUrgencyColor(item.urgency)} 
          />
          <Text style={[styles.urgencyText, { color: getUrgencyColor(item.urgency) }]}>
            {item.urgency.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.messagePreview} numberOfLines={2}>
        {item.message}
      </Text>

      <View style={styles.escalationFooter}>
        <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
        <TouchableOpacity style={styles.takeoverButton}>
          <Text style={styles.takeoverButtonText}>Take Over</Text>
          <Icon name="arrow-forward" size={16} color="#6366f1" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ value, label }: { value: any, label: string }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escalations</Text>
        <Text style={styles.subtitle}>{escalations.length} pending</Text>
      </View>

      <View style={styles.filterContainer}>
        <FilterButton value="all" label="All" />
        <FilterButton value="high" label="High" />
        <FilterButton value="medium" label="Medium" />
        <FilterButton value="low" label="Low" />
      </View>

      {escalations.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="check-circle" size={48} color="#10b981" />
          <Text style={styles.emptyStateTitle}>All Clear!</Text>
          <Text style={styles.emptyStateText}>
            No escalations at the moment
          </Text>
        </View>
      ) : (
        <FlatList
          data={escalations}
          renderItem={renderEscalation}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 20,
  },
  escalationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  escalationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  apartmentName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  escalationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  takeoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  takeoverButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});