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

export function InvoicePdfDocument({ invoice, referenceBarcode, companyLogo }) {
  const items = invoice.order.items ?? [];

  const totalAmount =
    invoice.total_amount_vat_excl == null 
      ? 0 
      : Number(invoice.total_amount_vat_excl);
  const totalAmountVatIncl =
    invoice.total_amount_vat_incl == null
      ? totalAmount
      : Number(invoice.total_amount_vat_incl);
  const vatAmount = totalAmountVatIncl - totalAmount;

  // Try to get a single tax rate (fall back to first item)
  let taxRate = 0;
  if (invoice.tax_rate != null) {
    taxRate = Number(invoice.tax_rate);
  } else if (items.length > 0 && items[0].tax_rate != null) {
    taxRate = Number(items[0].tax_rate);
  }

  const invoiceNumber = invoice.invoice_number ?? invoice.id ?? '';
  const paymentReference = invoice.reference ?? invoiceNumber ?? '';

  const orderDate = invoice.order.order_date
    ? new Date(invoice.order.order_date).toLocaleDateString('fi-FI')
    : '';
  const dueDate = invoice.due_date
    ? new Date(invoice.due_date).toLocaleDateString('fi-FI')
    : '';
  const issueDate = invoice.issue_date
    ? new Date(invoice.issue_date).toLocaleDateString('fi-FI')
    : '';
  const deliveryDate = invoice.delivery_date
    ? new Date(invoice.delivery_date).toLocaleDateString('fi-FI')
    : '';
  
  const extraInfo = invoice.extra_info ?? invoice.show_info_on_invoice ?? '';
  const daysUntilDue = invoice.days_until_due ?? '';

  const companyName = invoice.company_name ?? '';
  const companyAddress = invoice.company_address ?? '';
  const companyPostal = invoice.company_postal_code ?? '';
  const companyCity = invoice.company_city ?? '';
  const companyEmail = invoice.company_email ?? '';
  const companyWebsite = invoice.company_website ?? '';
  const businessId = invoice.company_business_id ?? '';
  const iban = invoice.company_iban ?? '';

  const customerName = invoice.customer_name ?? '';
  const customerAddress = invoice.customer_address ?? '';
  const customerPostal = invoice.customer_postal_code ?? '';
  const customerCity = invoice.customer_city ?? '';

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
                <Text style={styles.headerInfoValue}>{invoiceNumber}</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerInfoLabel}>Laskun päiväys</Text>
                <Text style={styles.headerInfoValue}>{issueDate}</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerInfoLabel}>Tilauspäivä</Text>
                <Text style={styles.headerInfoValue}>{deliveryDate}</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerInfoLabel}>Eräpäivä</Text>
                <Text style={styles.headerInfoValue}>{dueDate}</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerInfoLabel}>Maksuaika</Text>
                <Text style={styles.headerInfoValue}>{daysUntilDue} pv</Text>
              </View>
              <View style={styles.headerInfoRow}>
                <Text style={styles.headerInfoLabel}>Maksun viite</Text>
                <Text style={styles.headerInfoValue}>{paymentReference}</Text>
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
                item.unit_price_vat_excl == null ? 0 : Number(item.unit_price_vat_excl);
              const totalPrice =
                item.total_price_vat_incl == null
                  ? quantity * unitPrice
                  : Number(item.total_price_vat_incl);

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

        {/* Extra info */}
        {extraInfo && (
          <View style={{ marginTop: 20, marginBottom: 40 }}>
            <Text>{extraInfo}</Text>
          </View>
        )}

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
                  <Text style={styles.paymentValue}>{paymentReference}</Text>

                  <Text style={[styles.paymentLabel]}>
                    Eräpäivä
                  </Text>
                  <Text style={styles.paymentValue}>{dueDate}</Text>

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
                    {invoice.barcodeData}
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
