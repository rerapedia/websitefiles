"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { marginBottom: 20, borderBottom: "2px solid #2563eb", paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1e293b" },
  subtitle: { fontSize: 12, color: "#64748b", marginTop: 4 },
  brandLine: { fontSize: 10, color: "#2563eb", marginTop: 4 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#1e293b", marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 160, color: "#64748b", fontWeight: "bold" },
  value: { flex: 1, color: "#1e293b" },
  scoreBox: { backgroundColor: "#eff6ff", padding: 12, borderRadius: 4, marginTop: 8, textAlign: "center" },
  scoreNumber: { fontSize: 36, fontWeight: "bold", color: "#2563eb" },
  scoreLabel: { fontSize: 10, color: "#64748b" },
  table: { marginTop: 8 },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #e2e8f0", padding: 4 },
  tableHeader: { flexDirection: "row", borderBottom: "2px solid #cbd5e1", padding: 4, backgroundColor: "#f8fafc" },
  tableCell: { flex: 1, fontSize: 9 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#94a3b8", textAlign: "center" },
});

interface ReportData {
  project: {
    name: string;
    reraNumber: string;
    trustScore: number | null;
    status: string;
    city: string;
    locality: string;
    possessionDate: string | null;
    totalUnits: number | null;
    completionPercentage: number | null;
    registrationDate: string | null;
    expiryDate: string | null;
  };
  builder: { name: string } | null;
  state: { name: string } | null;
  complaints: Array<{ subject: string | null; status: string }>;
  timeline: Array<{ changeDate: string; changeType: string; oldValue: string | null; newValue: string | null }>;
  generatedAt: string;
}

function ReportDocument({ data }: { data: ReportData }) {
  const p = data.project;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>ReraPedia Trust Report</Text>
          <Text style={styles.subtitle}>{p.name}</Text>
          <Text style={styles.brandLine}>Generated on {new Date(data.generatedAt).toLocaleDateString("en-IN")}</Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreNumber}>{p.trustScore ?? "N/A"}</Text>
          <Text style={styles.scoreLabel}>TRUST SCORE (out of 100)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          {[
            ["RERA Number", p.reraNumber],
            ["Builder", data.builder?.name ?? "Unknown"],
            ["Location", `${p.locality}, ${p.city}`],
            ["State", data.state?.name ?? ""],
            ["Status", p.status?.replace(/_/g, " ") ?? "—"],
            ["Total Units", p.totalUnits?.toString() ?? "—"],
            ["Completion", p.completionPercentage != null ? `${p.completionPercentage}%` : "—"],
            ["Possession Date", p.possessionDate ? new Date(p.possessionDate).toLocaleDateString("en-IN") : "—"],
            ["Registration Date", p.registrationDate ? new Date(p.registrationDate).toLocaleDateString("en-IN") : "—"],
            ["Expiry Date", p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-IN") : "—"],
          ].map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        {data.complaints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Complaints ({data.complaints.length})</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Subject</Text>
                <Text style={[styles.tableCell, { fontWeight: "bold", flex: 0.5 }]}>Status</Text>
              </View>
              {data.complaints.slice(0, 10).map((c, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{c.subject ?? "No subject"}</Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>{c.status}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.timeline.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Timeline</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { fontWeight: "bold", flex: 0.6 }]}>Date</Text>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Change</Text>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>From</Text>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>To</Text>
              </View>
              {data.timeline.slice(0, 10).map((t, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.6 }]}>{new Date(t.changeDate).toLocaleDateString("en-IN")}</Text>
                  <Text style={styles.tableCell}>{t.changeType}</Text>
                  <Text style={styles.tableCell}>{t.oldValue ?? "—"}</Text>
                  <Text style={styles.tableCell}>{t.newValue ?? "—"}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          This report is auto-generated by ReraPedia.in using publicly available RERA data. Not financial advice.
        </Text>
      </Page>
    </Document>
  );
}

export function ProjectReportPDF({ data }: { data: ReportData }) {
  const filename = `ReraPedia-Report-${data.project.reraNumber.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

  return (
    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
      <PDFDownloadLink
        document={<ReportDocument data={data} />}
        fileName={filename}
        className="inline-block rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700"
      >
        {({ loading }) => (loading ? "Preparing PDF..." : `Download ${filename}`)}
      </PDFDownloadLink>
    </div>
  );
}
