// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, TextInput, StyleSheet, Dimensions } from 'react-native';
// import { Appbar, Card, Button, SegmentedButtons, DataTable, Chip } from 'react-native-paper';
// import { BarChart, LineChart } from 'react-native-gifted-charts';

// interface Transaction {
//   id: string;
//   type: 'receivable' | 'payable';
//   amount: number;
//   date: string;
//   description: string;
//   category?: string;
//   transporter?: string;
// }

// interface FinancialSummary {
//   totalReceivables: number;
//   totalPayables: number;
//   netCashFlow: number;
//   grossMargin: number;
// }

// export default function TransportFinanceScreen() {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [amount, setAmount] = useState('');
//   const [description, setDescription] = useState('');
//   const [type, setType] = useState<'receivable' | 'payable'>('receivable');
//   const [category, setCategory] = useState('');
//   const [transporter, setTransporter] = useState('');
//   const [metrics, setMetrics] = useState<FinancialSummary>({
//     totalReceivables: 0,
//     totalPayables: 0,
//     netCashFlow: 0,
//     grossMargin: 0
//   });

//   // Calculate metrics
//   useEffect(() => {
//     const totalReceivables = transactions
//       .filter(t => t.type === 'receivable')
//       .reduce((sum, t) => sum + t.amount, 0);

//     const totalPayables = transactions
//       .filter(t => t.type === 'payable')
//       .reduce((sum, t) => sum + t.amount, 0);

//     const netCashFlow = totalReceivables - totalPayables;
//     const grossMargin = totalReceivables > 0 
//       ? (netCashFlow / totalReceivables) * 100 
//       : 0;

//     setMetrics({
//       totalReceivables,
//       totalPayables,
//       netCashFlow,
//       grossMargin: Number(grossMargin.toFixed(2))
//     });
//   }, [transactions]);

//   // Weekly data aggregation
//   const processWeeklyData = () => {
//     const weeklyData: { [key: string]: { receivables: number; payables: number } } = {};

//     transactions.forEach(transaction => {
//       const date = new Date(transaction.date);
//       // Get start of week (Sunday)
//       const weekStart = new Date(
//         date.getFullYear(),
//         date.getMonth(),
//         date.getDate() - date.getDay()
//       ).toISOString().split('T')[0];

//       if (!weeklyData[weekStart]) {
//         weeklyData[weekStart] = { receivables: 0, payables: 0 };
//       }

//       if (transaction.type === 'receivable') {
//         weeklyData[weekStart].receivables += transaction.amount;
//       } else {
//         weeklyData[weekStart].payables += transaction.amount;
//       }
//     });

//     return Object.entries(weeklyData).map(([week, amounts]) => ({
//       week,
//       ...amounts,
//       net: amounts.receivables - amounts.payables
//     }));
//   };

//   const addTransaction = () => {
//     if (!amount || isNaN(Number(amount))) return;

//     const newTransaction: Transaction = {
//       id: Date.now().toString(),
//       type,
//       amount: Number(amount),
//       date: new Date().toISOString(),
//       description,
//       ...(type === 'payable' && { category, transporter })
//     };

//     setTransactions([...transactions, newTransaction]);
//     setAmount('');
//     setDescription('');
//     setCategory('');
//     setTransporter('');
//   };

//   // Chart data formatting
//   const weeklyChartData = processWeeklyData().map(week => ({
//     stacks: [
//       { value: week.receivables, color: '#4CAF50' },
//       { value: week.payables, color: '#F44336' }
//     ],
//     label: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
//     labelTextStyle: { color: '#666', rotation: 45 }
//   }));

//   const marginTrendData = processWeeklyData().map((week, index) => ({
//     value: ((week.receivables - week.payables) / week.receivables) * 100 || 0,
//     label: `W${index + 1}`,
//     dataPointText: `${(((week.receivables - week.payables) / week.receivables) * 100 || 0).toFixed(1)}%`
//   }));

//   return (
//     <ScrollView style={styles.container}>
//       <Appbar.Header>
//         <Appbar.Content title="Transport Financial Manager" />
//         <Appbar.Action icon="download" onPress={() => console.log('Export')} />
//       </Appbar.Header>

//       {/* Metrics Cards */}
//       <View style={styles.metricsRow}>
//         <Card style={styles.metricCard}>
//           <Card.Title title="Receivables" subtitle={`$${metrics.totalReceivables.toFixed(2)}`} />
//         </Card>
//         <Card style={styles.metricCard}>
//           <Card.Title title="Payables" subtitle={`$${metrics.totalPayables.toFixed(2)}`} />
//         </Card>
//         <Card style={styles.metricCard}>
//           <Card.Title title="Net Cash" subtitle={`$${metrics.netCashFlow.toFixed(2)}`} />
//         </Card>
//         <Card style={styles.metricCard}>
//           <Card.Title title="Margin" subtitle={`${metrics.grossMargin}%`} />
//         </Card>
//       </View>

//       {/* Weekly Trend Chart */}
//       <Card style={styles.chartCard}>
//         <Card.Title title="Weekly Financial Trends" />
//         <Card.Content>
//           <BarChart
//             data={weeklyChartData}
//             width={Dimensions.get('window').width - 32}
//             height={300}
//             yAxisThickness={0}
//             xAxisThickness={0}
//             yAxisTextStyle={{ color: '#666' }}
//             xAxisLabelTextStyle={{ color: '#666', width: 80 }}
//             showValuesAsTopLabel
//             topLabelTextStyle={{ color: '#666', fontSize: 10 }}
//             barBorderRadius={4}
//             spacing={20}
//             initialSpacing={10}
//           />
//         </Card.Content>
//       </Card>

//       {/* Margin Trend Chart */}
//       <Card style={styles.chartCard}>
//         <Card.Title title="Gross Margin Trend" />
//         <Card.Content>
//           <LineChart
//             data={marginTrendData}
//             color="#FFC107"
//             thickness={2}
//             yAxisOffset={20}
//             areaChart
//             startFillColor="rgba(255,193,7,0.2)"
//             width={Dimensions.get('window').width - 32}
//             height={200}
//             yAxisTextStyle={{ color: '#666' }}
//             xAxisLabelTextStyle={{ color: '#666' }}
//             showVerticalLines
//             verticalLinesColor="rgba(0,0,0,0.1)"
//             dataPointsColor="#FFC107"
//           />
//         </Card.Content>
//       </Card>

//       {/* Transaction Form */}
//       <Card style={styles.formCard}>
//         <Card.Title title="New Transaction" />
//         <Card.Content>
//           <SegmentedButtons
//             value={type}
//             onValueChange={(value) => setType(value as 'receivable' | 'payable')}
//             buttons={[
//               { value: 'receivable', label: 'Receivable' },
//               { value: 'payable', label: 'Payable' },
//             ]}
//             style={styles.segment}
//           />

//           <TextInput
//             style={styles.input}
//             placeholder="Amount"
//             keyboardType="numeric"
//             value={amount}
//             onChangeText={setAmount}
//           />

//           <TextInput
//             style={styles.input}
//             placeholder="Description"
//             value={description}
//             onChangeText={setDescription}
//           />

//           {type === 'payable' && (
//             <>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Transporter"
//                 value={transporter}
//                 onChangeText={setTransporter}
//               />
              
//               <View style={styles.chipContainer}>
//                 {['Fuel', 'Maintenance', 'Tolls', 'Loading'].map((cat) => (
//                   <Chip
//                     key={cat}
//                     selected={category === cat}
//                     onPress={() => setCategory(cat)}
//                     style={styles.chip}
//                   >
//                     {cat}
//                   </Chip>
//                 ))}
//               </View>
//             </>
//           )}

//           <Button mode="contained" onPress={addTransaction} style={styles.button}>
//             Add Transaction
//           </Button>
//         </Card.Content>
//       </Card>

//       {/* Transactions Table */}
//       <DataTable style={styles.table}>
//         <DataTable.Header>
//           <DataTable.Title>Date</DataTable.Title>
//           <DataTable.Title>Type</DataTable.Title>
//           <DataTable.Title numeric>Amount</DataTable.Title>
//           <DataTable.Title>Description</DataTable.Title>
//           {type === 'payable' && <DataTable.Title>Category</DataTable.Title>}
//         </DataTable.Header>

//         {transactions.map((transaction) => (
//           <DataTable.Row key={transaction.id}>
//             <DataTable.Cell>
//               {new Date(transaction.date).toLocaleDateString()}
//             </DataTable.Cell>
//             <DataTable.Cell>
//               <Chip 
//                 style={[
//                   styles.typeChip,
//                   transaction.type === 'receivable' 
//                     ? styles.receivableChip 
//                     : styles.payableChip
//                 ]}
//               >
//                 {transaction.type}
//               </Chip>
//             </DataTable.Cell>
//             <DataTable.Cell numeric>
//               ${transaction.amount.toFixed(2)}
//             </DataTable.Cell>
//             <DataTable.Cell>{transaction.description}</DataTable.Cell>
//             {transaction.type === 'payable' && (
//               <DataTable.Cell>{transaction.category}</DataTable.Cell>
//             )}
//           </DataTable.Row>
//         ))}
//       </DataTable>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f5f5f5'
//   },
//   metricsRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 16,
//     marginBottom: 16
//   },
//   metricCard: {
//     flex: 1,
//     minWidth: 200,
//     elevation: 2
//   },
//   chartCard: {
//     marginBottom: 24,
//     padding: 8
//   },
//   formCard: {
//     marginBottom: 24,
//     padding: 16
//   },
//   input: {
//     backgroundColor: 'white',
//     marginBottom: 12,
//     padding: 12,
//     borderRadius: 4,
//     borderWidth: 1,
//     borderColor: '#ddd'
//   },
//   segment: {
//     marginBottom: 16
//   },
//   chipContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginBottom: 16
//   },
//   chip: {
//     marginRight: 8
//   },
//   button: {
//     marginTop: 16
//   },
//   table: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     overflow: 'hidden'
//   },
//   typeChip: {
//     width: 100,
//     justifyContent: 'center'
//   },
//   receivableChip: {
//     backgroundColor: '#4CAF50'
//   },
//   payableChip: {
//     backgroundColor: '#F44336'
//   }
// });




import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Dimensions, Alert } from 'react-native';
import { Appbar, Card, Button, SegmentedButtons, DataTable, Chip, ActivityIndicator, Snackbar } from 'react-native-paper';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '../firebase';

interface Transaction {
  id: string;
  type: 'receivable' | 'payable';
  amount: number;
  date: string;
  description: string;
  category?: string;
  transporterId?: string;
  userId: string;
}

interface Transporter {
  id: string;
  name: string;
  phone: string;
}

interface FinancialMetrics {
  totalReceivables: number;
  totalPayables: number;
  netCashFlow: number;
  grossMargin: number;
}

export default function TransportFinanceScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalReceivables: 0,
    totalPayables: 0,
    netCashFlow: 0,
    grossMargin: 0
  });
  const [form, setForm] = useState({
    type: 'receivable' as 'receivable' | 'payable',
    amount: '',
    description: '',
    category: '',
    transporterId: '',
  });

  // Get user ID from AsyncStorage
  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('phoneNumber');
      if (storedUserId) setUserId(storedUserId);
    };
    getUserId();
  }, []);

  // Fetch data from Firebase
  useEffect(() => {
    if (!userId) return;

    const unsubscribeTransactions = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
          .filter(t => t.userId === userId);
        setTransactions(data);
        calculateMetrics(data);
      },
      (error) => Alert.alert('Error', 'Failed to load transactions')
    );

    const unsubscribeTransporters = onSnapshot(
      collection(db, 'transporter'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transporter));
        setTransporters(data);
        setLoading(false);
      },
      (error) => Alert.alert('Error', 'Failed to load transporters')
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeTransporters();
    };
  }, [userId]);

  const calculateMetrics = (transactions: Transaction[]) => {
    const receivables = transactions.filter(t => t.type === 'receivable');
    const payables = transactions.filter(t => t.type === 'payable');
    
    const totalReceivables = receivables.reduce((sum, t) => sum + t.amount, 0);
    const totalPayables = payables.reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalReceivables - totalPayables;
    const grossMargin = totalReceivables > 0 
      ? (netCashFlow / totalReceivables) * 100 
      : 0;

    setMetrics({
      totalReceivables,
      totalPayables,
      netCashFlow,
      grossMargin: Number(grossMargin.toFixed(2))
    });
  };

  const handleAddTransaction = async () => {
    try {
      setSaving(true);
      if (!form.amount || isNaN(Number(form.amount))) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      const newTransaction = {
        ...form,
        amount: Number(form.amount),
        date: new Date().toISOString(),
        userId
      };

      await addDoc(collection(db, 'transactions'), newTransaction);
      setForm({
        type: 'receivable',
        amount: '',
        description: '',
        category: '',
        transporterId: '',
      });
      setSnackbarVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);
      const csvData = [
        ['Date', 'Type', 'Amount', 'Description', 'Category', 'Transporter'],
        ...transactions.map(t => [
          new Date(t.date).toLocaleDateString(),
          t.type.toUpperCase(),
          `$${t.amount.toFixed(2)}`,
          t.description,
          t.category || 'N/A',
          transporters.find(tr => tr.id === t.transporterId)?.name || 'N/A'
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const fileUri = FileSystem.documentDirectory + 'transactions.csv';
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const processChartData = () => {
    const weeklyData: { [key: string]: { receivables: number; payables: number } } = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      const weekStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay()
      ).toISOString().split('T')[0];

      if (!weeklyData[weekStart]) {
        weeklyData[weekStart] = { receivables: 0, payables: 0 };
      }

      t.type === 'receivable' 
        ? weeklyData[weekStart].receivables += t.amount
        : weeklyData[weekStart].payables += t.amount;
    });

    return Object.entries(weeklyData).map(([week, data]) => ({
      week,
      ...data,
      margin: ((data.receivables - data.payables) / data.receivables) * 100 || 0
    }));
  };

  if (loading || !userId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const marginTrendData = processChartData().map((week, index) => ({
    value: week.margin,
    label: `W${index + 1}`,
    dataPointText: `${week.margin.toFixed(1)}%`,
    labelTextStyle: { color: '#666', width: 40 }
  }));

  return (
    <ScrollView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Transport Finance Manager" />
        <Appbar.Action 
          icon="download" 
          onPress={exportToCSV} 
          disabled={exporting}
          loading={exporting}
        />
      </Appbar.Header>

      {/* Financial Metrics */}
      <View style={styles.metricsContainer}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricTitle}>Receivables</Text>
          <Text style={styles.metricValue}>
          ₦{metrics.totalReceivables.toFixed(2)}
          </Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricTitle}>Payables</Text>
          <Text style={styles.metricValue}>
          ₦{metrics.totalPayables.toFixed(2)}
          </Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricTitle}>Net Cash</Text>
          <Text style={[styles.metricValue, 
            metrics.netCashFlow >= 0 ? styles.positive : styles.negative]}>
            ₦{metrics.netCashFlow.toFixed(2)}
          </Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricTitle}>Gross Margin</Text>
          <Text style={[styles.metricValue, 
            metrics.grossMargin >= 0 ? styles.positive : styles.negative]}>
            {metrics.grossMargin.toFixed(2)}%
          </Text>
        </Card>
      </View>

      {/* Gross Margin Trend */}
      <Card style={styles.chartCard}>
        <Card.Title title="Gross Margin Trend" />
        <Card.Content>
          <LineChart
            data={marginTrendData}
            width={Dimensions.get('window').width - 48}
            height={200}
            color="#FFC107"
            thickness={3}
            yAxisOffset={20}
            areaChart
            startFillColor="rgba(255,193,7,0.2)"
            startOpacity={0.2}
            yAxisTextStyle={{ color: '#666' }}
            xAxisLabelTextStyle={{ color: '#666', width: 60 }}
            dataPointsColor="#FFC107"
            dataPointsRadius={4}
            spacing={60}
          />
        </Card.Content>
      </Card>

      {/* Transaction Form */}
      <Card style={styles.formCard}>
        <Card.Title title="New Transaction" />
        <Card.Content>
          <SegmentedButtons
            value={form.type}
            onValueChange={value => setForm({ ...form, type: value as any })}
            buttons={[
              {
                value: 'receivable',
                label: 'Receivable',
                icon: 'arrow-down',
                checkedColor: '#4CAF50',
              },
              {
                value: 'payable',
                label: 'Payable',
                icon: 'arrow-up',
                checkedColor: '#F44336',
              },
            ]}
            style={styles.segment}
          />

          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={form.amount}
            onChangeText={text => setForm({ ...form, amount: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Description"
            value={form.description}
            onChangeText={text => setForm({ ...form, description: text })}
          />

          {form.type === 'payable' && (
            <>
              <Picker
                selectedValue={form.transporterId}
                onValueChange={value => setForm({ ...form, transporterId: value })}
                style={styles.picker}
              >
                <Picker.Item label="Select Transporter" value="" />
                {transporters.map(transporter => (
                  <Picker.Item
                    key={transporter.id}
                    label={transporter.name}
                    value={transporter.id}
                  />
                ))}
              </Picker>

              <View style={styles.chipContainer}>
                {['Fuel', 'Maintenance', 'Tolls', 'Loading'].map(category => (
                  <Chip
                    key={category}
                    selected={form.category === category}
                    onPress={() => setForm({ ...form, category })}
                    style={[
                      styles.chip,
                      form.category === category && styles.selectedChip
                    ]}
                  >
                    {category}
                  </Chip>
                ))}
              </View>
            </>
          )}

          <Button
            mode="contained"
            onPress={handleAddTransaction}
            style={styles.button}
            loading={saving}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Add Transaction'}
          </Button>
        </Card.Content>
      </Card>

      {/* Transactions List */}
      <DataTable style={styles.table}>
        <DataTable.Header>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title>Type</DataTable.Title>
          <DataTable.Title numeric>Amount</DataTable.Title>
          <DataTable.Title>Details</DataTable.Title>
        </DataTable.Header>

        {transactions.map(transaction => (
          <DataTable.Row key={transaction.id}>
            <DataTable.Cell>
              {new Date(transaction.date).toLocaleDateString()}
            </DataTable.Cell>
            <DataTable.Cell>
              <Chip
                style={[
                  styles.typeChip,
                  transaction.type === 'receivable' 
                    ? styles.receivableChip 
                    : styles.payableChip
                ]}
                textStyle={styles.chipText}
              >
                {transaction.type}
              </Chip>
            </DataTable.Cell>
            <DataTable.Cell numeric>
            ₦{transaction.amount.toFixed(2)}
            </DataTable.Cell>
            <DataTable.Cell>
              {transaction.description}
              {transaction.transporterId && (
                <Text style={styles.transporterText}>
                  "   ": {transporters.find(t => t.id === transaction.transporterId)?.name}
                </Text>
              )}
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        Transaction added successfully!
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
    elevation: 2,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
    elevation: 2,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  selectedChip: {
    backgroundColor: '#2196F3',
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    marginTop: 8,
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  typeChip: {
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  receivableChip: {
    backgroundColor: '#4CAF50',
  },
  payableChip: {
    backgroundColor: '#F44336',
  },
  chipText: {
    color: '#fff',
    fontWeight: '600',
  },
  transporterText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  snackbar: {
    backgroundColor: '#2196F3',
    marginBottom: 24,
  },
  segment: {
    marginBottom: 16,
  },
});