import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../services/api';

interface DashboardStats {
  activeChats: number;
  pendingEscalations: number;
  todayBookings: number;
  occupancyRate: number;
  learningProgress: number;
  recentEscalationReduction: number;
}

export default function DashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<DashboardStats>({
    activeChats: 0,
    pendingEscalations: 0,
    todayBookings: 0,
    occupancyRate: 0,
    learningProgress: 0,
    recentEscalationReduction: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = '#6366f1',
    onPress 
  }: any) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statCardHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      {subtitle && (
        <Text style={styles.statCardSubtitle}>{subtitle}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Alpine Haven Hostel</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Active Chats"
          value={stats.activeChats}
          subtitle="Currently ongoing"
          icon="chat"
          color="#10b981"
          onPress={() => navigation.navigate('Chats')}
        />

        <StatCard
          title="Escalations"
          value={stats.pendingEscalations}
          subtitle="Needs attention"
          icon="warning"
          color="#ef4444"
          onPress={() => navigation.navigate('Escalations')}
        />

        <StatCard
          title="Today's Bookings"
          value={stats.todayBookings}
          subtitle="New reservations"
          icon="event"
          color="#6366f1"
        />

        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          subtitle="Current month"
          icon="hotel"
          color="#8b5cf6"
        />
      </View>

      <View style={styles.learningCard}>
        <View style={styles.learningHeader}>
          <Icon name="psychology" size={28} color="#a855f7" />
          <Text style={styles.learningTitle}>AI Learning Progress</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${stats.learningProgress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {stats.learningProgress}% Automated
          </Text>
        </View>

        <View style={styles.learningStats}>
          <View style={styles.learningStat}>
            <Icon name="trending-down" size={20} color="#10b981" />
            <Text style={styles.learningStatText}>
              {stats.recentEscalationReduction}% fewer escalations
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Learning')}
            style={styles.viewDetailsButton}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="arrow-forward" size={16} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="people" size={24} color="#6366f1" />
            <Text style={styles.actionButtonText}>View Guests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="apartment" size={24} color="#6366f1" />
            <Text style={styles.actionButtonText}>Apartments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="analytics" size={24} color="#6366f1" />
            <Text style={styles.actionButtonText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  statsGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statCardSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  learningCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  learningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  learningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
  },
  learningStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  learningStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learningStatText: {
    fontSize: 14,
    color: '#10b981',
    marginLeft: 6,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginRight: 4,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
});