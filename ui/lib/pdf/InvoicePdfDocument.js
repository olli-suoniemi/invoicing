import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image, 
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingHorizontal: 40,
    paddingBottom: 60,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },

  // HEADER
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
    gap: 20,
  },
  bigTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subTitle: {
    fontWeight: 'bold',
  },
  companyName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyLine: {
  },

  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',   // vertical centering relative to logo
    gap: 10,
  },

  senderInfo: {
  },

  logoImage: {
    width: 100,
    height: 35,                 // not too tall, matches minHeight above
    objectFit: 'contain',
  },

  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  detailBox: {
    width: 230,
    borderWidth: 0.5,
    borderColor: '#ccc',
    padding: 6,
  },
  headerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  headerInfoLabel: {
    color: '#555',
  },
  headerInfoValue: {
  },

  // ADDRESSES
  addressesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  addressBlock: {
    width: '45%',
  },
  addressTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressLine: {
  },

  // ITEMS TABLE
  itemsSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemsTable: {
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  itemsRow: {
    flexDirection: 'row',
  },
  itemsHeaderCell: {
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  itemsCell: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  // SUMMARY (Verot / kokonaishinta / Yhteensä)
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  summaryBox: {
    width: 220,
    borderWidth: 0.5,
    borderColor: '#ccc',
    padding: 6,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
  },
  summaryValue: {
  },
  summaryTotalLabel: {
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontWeight: 'bold',
  },

  footerContainer: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 20,
  },

  paymentBox: {
    borderTopWidth: 0.8,
    borderColor: '#ccc',
    paddingTop: 8,
    marginTop: 8,
  },

  companyDetailsAbovePayment: {
    color: '#555',
    marginBottom: 6,
  },
  companyDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companyDetailsCol: {
    width: '48%',
  },
  companyDetailsLabel: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyDetailsLine: {
    marginBottom: 2
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  paymentColLeft: {
    width: '45%',
  },
  paymentColRight: {
    width: '45%',
  },
  paymentLabel: {
    paddingTop: 4,
    color: '#555',
  },
  paymentValue: {
    fontWeight: 'bold',
  },
  footerCompanyLine: {
    marginTop: 4,
  },
  barcodeImage: {
    marginTop: 30,
    width: '100%',
  },
});

export function InvoicePdfDocument({ order, referenceBarcode, companyLogo }) {
  const items = order.items ?? [];

  const totalAmount =
    order.total_amount == null ? 0 : Number(order.total_amount);
  const totalAmountVatIncl =
    order.total_amount_vat_incl == null
      ? totalAmount
      : Number(order.total_amount_vat_incl);

  const vatAmount = totalAmountVatIncl - totalAmount;

  // Try to get a single tax rate (fall back to first item)
  let taxRate = 0;
  if (order.tax_rate != null) {
    taxRate = Number(order.tax_rate);
  } else if (items.length > 0 && items[0].tax_rate != null) {
    taxRate = Number(items[0].tax_rate);
  }

  const invoiceNumber = order.invoice_number ?? order.id ?? '';
  const reference =
    order.payment_reference ??
    order.reference ??
    invoiceNumber ??
    '';
  const ourReference = order.our_reference ?? order.reference_code ?? '';

  const orderDate = order.order_date
    ? new Date(order.order_date).toLocaleDateString('fi-FI')
    : '';
  const dueDate = order.due_date
    ? new Date(order.due_date).toLocaleDateString('fi-FI')
    : '';

  const companyName = order.company_name ?? 'Yritys Oy';
  const companyAddress = order.company_address ?? '';
  const companyPostal = order.company_postal_code ?? '';
  const companyCity = order.company_city ?? '';
  const companyEmail = order.company_email ?? 'toimisto@example.com';
  const companyWebsite = order.company_website ?? 'https://example.com';
  const businessId = order.company_business_id ?? 'Y-tunnus: 0000000-0';
  const iban = order.company_iban ?? 'FI00 0000 0000 0000 00';
  const bic = order.company_bic ?? 'BIC: BANKFIHH';

  const customerName = order.customer_name ?? '';
  const customerAddress = order.customer_address ?? '';
  const customerPostal = order.customer_postal_code ?? '';
  const customerCity = order.customer_city ?? '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View>
              <View style={styles.senderRow}>
                <View style={{flexDirection: 'column'}}>
                  <Text style={styles.subTitle}>Lähettäjä</Text>
                  <View style={styles.senderInfo}>
                    <Text style={styles.companyLine}>{companyName}</Text>
                    {!!companyAddress && (
                      <Text style={styles.companyLine}>{companyAddress}</Text>
                    )}
                    {!!companyPostal && (
                      <Text style={styles.companyLine}>
                        {companyPostal} {companyCity}
                      </Text>
                    )}
                  </View>
                </View>

                {companyLogo && (
                  <Image
                    style={styles.logoImage}
                    src={companyLogo}
                  />
                )}
              </View>
            </View>
            <View>
              <Text style={styles.subTitle}>Saaja</Text>
              <Text style={styles.addressLine}>{customerName}</Text>
              {!!customerAddress && (
                <Text style={styles.addressLine}>{customerAddress}</Text>
              )}
              {(customerPostal || customerCity) && (
                <Text style={styles.addressLine}>
                  {customerPostal} {customerCity}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.bigTitle}>Lasku</Text>
            <View style={styles.detailBox}>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerInfoLabel}>Laskun numero</Text>
                <Text style={styles.headerInfoValue}>123456789</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerInfoLabel}>Maksun viite</Text>
                <Text style={styles.headerInfoValue}>Matkailu KP4392 TOI6401</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerInfoLabel}>Laskun päiväys</Text>
                <Text style={styles.headerInfoValue}>{orderDate}</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerInfoLabel}>Eräpäivä</Text>
                <Text style={styles.headerInfoValue}>{dueDate}</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerInfoLabel}>Viitteemme</Text>
                <Text style={styles.headerInfoValue}>{ourReference}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ITEMS */}
        <Text style={styles.itemsSectionTitle}>Tuotteet</Text>

        <View style={styles.itemsTable}>
          {/* Header */}
          <View style={styles.itemsRow}>
            <Text style={[styles.itemsHeaderCell, { width: '29%' }]}>
              Tuote
            </Text>
            <Text
              style={[
                styles.itemsHeaderCell,
                { width: '19%', textAlign: 'right' },
              ]}
            >
              EAN-koodi
            </Text>
            <Text
              style={[
                styles.itemsHeaderCell,
                { width: '10%', textAlign: 'right' },
              ]}
            >
              Määrä
            </Text>
            <Text
              style={[
                styles.itemsHeaderCell,
                { width: '22%', textAlign: 'right' },
              ]}
            >
              Yksikköhinta (alv 0%)
            </Text>
            <Text
              style={[
                styles.itemsHeaderCell,
                { width: '10%', textAlign: 'right' },
              ]}
            >
              Alv %
            </Text>
            <Text
              style={[
                styles.itemsHeaderCell,
                { width: '10%', textAlign: 'right' },
              ]}
            >
              Summa
            </Text>
          </View>

          {/* Rows */}
          {items.length === 0 ? (
            <View style={styles.itemsRow}>
              <Text style={[styles.itemsCell, { width: '100%' }]}>
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

              return (
                <View key={item.id} style={styles.itemsRow}>
                  <Text style={[styles.itemsCell, { width: '29%' }]}>
                    {item.product_name ?? item.product_id ?? '-'}
                  </Text>
                  <Text
                    style={[
                      styles.itemsCell,
                      { width: '19%', textAlign: 'right' },
                    ]}
                  >
                    {item.ean_code ?? '6429811577008'}
                  </Text>
                  <Text
                    style={[
                      styles.itemsCell,
                      { width: '10%', textAlign: 'right' },
                    ]}
                  >
                    {quantity} kpl
                  </Text>
                  <Text
                    style={[
                      styles.itemsCell,
                      { width: '22%', textAlign: 'right' },
                    ]}
                  >
                    {unitPrice.toFixed(2)} €
                  </Text>
                  <Text
                    style={[
                      styles.itemsCell,
                      { width: '10%', textAlign: 'right' },
                    ]}
                  >
                    {item.tax_rate != null ? Number(item.tax_rate).toFixed(0) : '0'} %
                  </Text>
                  <Text
                    style={[
                      styles.itemsCell,
                      { width: '10%', textAlign: 'right' },
                    ]}
                  >
                    {totalPrice.toFixed(2)} €
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* SUMMARY, right side (Verot / kokonaishinta / Yhteensä) */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Veroton kokonaishinta</Text>
              <Text style={styles.summaryValue}>
                {totalAmount.toFixed(2)} €
              </Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Verot</Text>
              <Text style={styles.summaryValue}>
                {vatAmount.toFixed(2)} €
              </Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryTotalLabel}>Yhteensä</Text>
              <Text style={styles.summaryTotalValue}>
                {totalAmountVatIncl.toFixed(2)} €
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER: company details just above payment slip */}
        <View style={styles.footerContainer}>
          {/* Company details directly above the payment box */}
          <View style={styles.companyDetailsAbovePayment}>
            <View style={styles.companyDetailsRow}>
              <View style={styles.companyDetailsCol}>
                <Text style={styles.companyDetailsLine}>{companyName}</Text>
                {!!companyAddress && (
                  <Text style={styles.companyDetailsLine}>{companyAddress}</Text>
                )}
                {(companyPostal || companyCity) && (
                  <Text style={styles.companyDetailsLine}>
                    {companyPostal} {companyCity}
                  </Text>
                )}
              </View>

              <View style={styles.companyDetailsCol}>
                <Text style={[styles.companyDetailsLine, { textAlign: 'center' }]}>{companyEmail}</Text>
                <Text style={[styles.companyDetailsLine, { textAlign: 'center' }]}>{companyWebsite}</Text>
              </View>
              <View style={styles.companyDetailsCol}>
                <Text style={[styles.companyDetailsLine, { textAlign: 'right' }]}>Y-tunnus: {businessId}</Text>
              </View>
            </View>
          </View>

          {/* PAYMENT FOOTER (simplified payment slip) */}
          <View style={styles.paymentBox}>
            <View style={{flexDirection: 'column'}}>

              <View style={styles.paymentRow}>
                <View style={styles.paymentColLeft}>
                  <Text style={[styles.paymentLabel]}>
                    Saajan tilinumero
                  </Text>
                  <Text style={styles.paymentValue}>{iban}</Text>
                  <Text style={styles.paymentLabel}>Saaja</Text>
                  <Text style={styles.paymentValue}>{companyName}</Text>

                  <Text style={[styles.paymentLabel]}>
                    Maksaja
                  </Text>
                  <Text style={styles.paymentValue}>{customerName}</Text>

                </View>

                <View style={styles.paymentColRight}>
                  <Text style={styles.paymentLabel}>Viite</Text>
                  <Text style={styles.paymentValue}>Matkailu KP4392 TOI6401</Text>

                  <Text style={[styles.paymentLabel]}>
                    Eräpäivä
                  </Text>
                  <Text style={styles.paymentValue}>10.12.2025</Text>

                  <Text style={[styles.paymentLabel]}>
                    Summa
                  </Text>
                  <Text style={styles.paymentValue}>
                    {totalAmountVatIncl.toFixed(2)} €
                  </Text>
                </View>
              </View>
              {referenceBarcode && (
                <>
                  <Image style={styles.barcodeImage} src={referenceBarcode} />
                  <Text style={{ textAlign: 'center', marginTop: 4 }}>
                    {order.barcodeData}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
