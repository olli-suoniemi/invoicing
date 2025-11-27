// lib/pdf/InvoicePdfDocument.js
import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from '@react-pdf/renderer';

// Styles for the PDF 
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#555',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: 700,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderCell: {
    margin: 4,
    padding: 4,
    fontSize: 10,
    fontWeight: 700,
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  tableCell: {
    margin: 4,
    padding: 4,
    fontSize: 10,
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalsBlock: {
    width: 200,
  },
  totalsLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 11,
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#666',
  },
});

export function InvoicePdfDocument({ order }) {
  const items = order.items ?? [];

  const totalAmount =
    order.total_amount == null ? 0 : Number(order.total_amount);
  const totalAmountVatIncl =
    order.total_amount_vat_incl == null
      ? totalAmount
      : Number(order.total_amount_vat_incl);

  const orderDate = order.order_date
    ? new Date(order.order_date).toLocaleDateString('fi-FI')
    : '—';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lasku</Text>
          <Text style={styles.subtitle}>Laskun päiväys: {orderDate}</Text>
        </View>

        {/* From / To */}
        <View style={[styles.section, styles.row]}>
          <View>
            <Text style={styles.sectionTitle}>Lähettäjä</Text>
            <Text>{order.company_name ?? '-'}</Text>
            <Text>{order.company_address ?? '-'}</Text>
            <Text>{order.company_postal_code ?? '-'}</Text>
            <Text>{order.company_city ?? '-'}</Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Laskun saaja</Text>
            <Text>{order.customer_name ?? '-'}</Text>
            <Text>{order.customer_address ?? '-'}</Text>
            <Text>{order.customer_postal_code ?? '-'}</Text>
            <Text>{order.customer_city ?? '-'}</Text>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tuotteet</Text>

          <View style={styles.table}>
            {/* Header row */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeaderCell, { width: '35%' }]}>
                Tuote
              </Text>
              <Text style={[styles.tableHeaderCell, { width: '10%', textAlign: 'right' }]}>
                Määrä
              </Text>
              <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
                Yksikkö € (alv 0%)
              </Text>
              <Text style={[styles.tableHeaderCell, { width: '10%', textAlign: 'right' }]}>
                ALV %
              </Text>
              <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
                Yhteensä € (alv 0%)
              </Text>
              <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
                Yhteensä € (sis. alv.)
              </Text>
            </View>

            {/* Data rows */}
            {items.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '100%' }]}>
                  Ei tuotteita.
                </Text>
              </View>
            ) : (
              items.map((item) => {
                const quantity = item.quantity ?? 0;
                const unitPrice =
                  item.unit_price == null ? 0 : Number(item.unit_price);
                const totalPrice =
                  item.total_price == null
                    ? quantity * unitPrice
                    : Number(item.total_price);
                const taxRate = item.tax_rate ? Number(item.tax_rate) : 0;
                const totalInclVat =
                  totalPrice + (taxRate / 100) * totalPrice;

                return (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: '35%' }]}>
                      {item.product_name ?? item.product_id ?? '-'}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { width: '10%', textAlign: 'right' },
                      ]}
                    >
                      {quantity}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { width: '15%', textAlign: 'right' },
                      ]}
                    >
                      {unitPrice.toFixed(2)}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { width: '10%', textAlign: 'right' },
                      ]}
                    >
                      {taxRate.toFixed(2)}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { width: '15%', textAlign: 'right' },
                      ]}
                    >
                      {totalPrice.toFixed(2)}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { width: '15%', textAlign: 'right' },
                      ]}
                    >
                      {totalInclVat.toFixed(2)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsRow}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalsLine}>
              <Text>Yhteensä (alv 0%)</Text>
              <Text>{totalAmount.toFixed(2)} €</Text>
            </View>
            <View style={styles.totalsLine}>
              <Text>Yhteensä (sis. alv.)</Text>
              <Text>{totalAmountVatIncl.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Maksuehdot: 14 päivää netto</Text>
          <Text>Pankkitili: FI00 1234 5600 0000 · BIC: NDEAFIHH</Text>
        </View>
      </Page>
    </Document>
  );
}
