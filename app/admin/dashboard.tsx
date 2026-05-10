import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, sales: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // For now, we fetch products to get a count, and mock others until backend has full admin routes
      const productsRes = await axios.get(`${API_URL}/api/products`);
      setStats({
        products: productsRes.data.length,
        orders: 124,
        sales: 45890,
        users: 856
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'seller') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Feather name="shield-off" size={48} color={colors.live} />
        <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>Access Denied</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['rgba(139,92,246,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Admin Console</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Sales', value: `₹${stats.sales.toLocaleString()}`, icon: 'indian-rupee', color: '#10B981' },
            { label: 'Orders', value: stats.orders.toString(), icon: 'shopping-bag', color: '#8B5CF6' },
            { label: 'Products', value: stats.products.toString(), icon: 'package', color: '#F59E0B' },
            { label: 'Active Users', value: stats.users.toString(), icon: 'users', color: '#3B82F6' },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
                <Feather name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {[
            { label: 'Add Product', icon: 'plus-circle', color: colors.primary, route: '/create' },
            { label: 'Manage Orders', icon: 'list', color: '#F59E0B', route: null },
            { label: 'User Reports', icon: 'bar-chart-2', color: '#10B981', route: null },
            { label: 'Settings', icon: 'settings', color: colors.mutedForeground, route: null },
          ].map((a) => (
            <Pressable 
              key={a.label} 
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => a.route && router.push(a.route as any)}
            >
              <Feather name={a.icon as any} size={24} color={a.color} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 32 }]}>Recent Activity</Text>
        <View style={[styles.activityList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : (
            [1,2,3].map((i) => (
              <View key={i} style={[styles.activityItem, i < 3 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activityText, { color: colors.foreground }]}>New order #VNK-892{i} received</Text>
                  <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>{i}h ago</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '48%', padding: 16, borderRadius: 20, borderWidth: 1, gap: 8 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '48%', padding: 20, borderRadius: 20, borderWidth: 1, alignItems: 'center', gap: 12 },
  actionLabel: { fontSize: 14, fontWeight: '700' },
  activityList: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityText: { fontSize: 14, fontWeight: '600' },
  activityTime: { fontSize: 12, marginTop: 2 },
});
