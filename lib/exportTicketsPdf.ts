import { Ticket } from './TicketsContext';

interface ExportOptions {
  subtitle?: string;
}

export async function exportTicketsPdf(tickets: Ticket[], { subtitle }: ExportOptions = {}) {
  if (!tickets || tickets.length === 0) return;

  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const generatedOn = new Date().toLocaleString();

  // Title block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text('StreamDesk — Support Tickets', 40, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // #64748B
  const metaLine = subtitle ? `${subtitle}  •  Generated ${generatedOn}` : `Generated ${generatedOn}`;
  doc.text(metaLine, 40, 56);
  doc.text(`${tickets.length} ticket${tickets.length === 1 ? '' : 's'}`, 40, 68);

  const body = tickets.map((t) => [
    t.ticket_id,
    t.customer_name,
    t.customer_email,
    t.subject,
    t.status,
    new Date(t.created_at).toLocaleDateString(),
    new Date(t.updated_at).toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: 84,
    head: [['Ticket ID', 'Customer', 'Email', 'Subject', 'Status', 'Created', 'Last Activity']],
    body,
    styles: { fontSize: 8, cellPadding: 5, textColor: [15, 23, 42], overflow: 'linebreak' },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 110 },
      2: { cellWidth: 150 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 70 },
      5: { cellWidth: 70 },
      6: { cellWidth: 75 },
    },
    margin: { left: 40, right: 40 },
  });

  doc.save(`streamdesk_tickets_${new Date().toISOString().split('T')[0]}.pdf`);
}
