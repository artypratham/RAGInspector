import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RecordData } from '../types/pipeline';
import type { AnnotationState } from '../types/annotation';
import type { Metrics } from '../types/metrics';

export function generatePDFReport(
  records: RecordData[],
  baseMetrics: Metrics,
  annotations: AnnotationState,
  totalFields: number,
  annotatedCount: number
) {
  // Compute additional metrics from records
  const totalRecords = records.length;
  const successfulRecords = records.filter(r => r.success).length;
  const successRate = totalRecords > 0 ? successfulRecords / totalRecords : 0;

  // Calculate average confidence
  let totalConfidence = 0;
  let confidenceCount = 0;
  let lowConfidenceCount = 0;
  let missingContextCount = 0;

  records.forEach(record => {
    Object.keys(record.extracted_fields).forEach(field => {
      const extractedField = record.extracted_fields[field];
      if (extractedField) {
        const confidence = extractedField.confidence || 0;
        totalConfidence += confidence;
        confidenceCount++;
        if (confidence < 0.7) lowConfidenceCount++;
      }

      // Check for missing context
      const hasContext = record.retrieved_context && record.retrieved_context.length > 0
        ? record.retrieved_context.some((ctx) => ctx.field_name === field)
        : false;
      if (!hasContext) missingContextCount++;
    });
  });

  const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

  // Combine all metrics
  const metrics = {
    totalRecords,
    successRate,
    correctFields: baseMetrics.correctFields,
    totalFields: baseMetrics.totalFields,
    avgConfidence,
    lowConfidenceCount,
    missingContextCount,
    groundedAccuracy: baseMetrics.groundedAccuracy,
    retrievalPrecision: baseMetrics.retrievalPrecision,
  };

  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(6, 182, 212); // Cyan
  doc.text('RAG Pipeline Diagnostic Report', 105, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 105, yPosition, { align: 'center' });

  yPosition += 15;

  // Executive Summary
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Executive Summary', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const summaryText = [
    `Total Records Analyzed: ${metrics.totalRecords}`,
    `Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`,
    `Fields Extracted: ${metrics.correctFields} of ${metrics.totalFields}`,
    `Average Confidence: ${(metrics.avgConfidence * 100).toFixed(1)}%`,
    `Human Annotations: ${annotatedCount} of ${totalFields} fields`,
  ];

  summaryText.forEach(line => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Key Metrics Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Key Performance Metrics', 20, yPosition);
  yPosition += 10;

  // Metrics table
  const metricsData = [
    ['Metric', 'Value', 'Formula', 'Meaning'],
    [
      'Success Rate',
      `${(metrics.successRate * 100).toFixed(1)}%`,
      'Successful Records / Total Records',
      'Percentage of records processed without errors'
    ],
    [
      'Field Accuracy',
      `${((metrics.correctFields / Math.max(metrics.totalFields, 1)) * 100).toFixed(1)}%`,
      'Correct Fields / Total Fields',
      'Percentage of fields extracted correctly'
    ],
    [
      'Avg Confidence',
      `${(metrics.avgConfidence * 100).toFixed(1)}%`,
      'Sum(Confidence Scores) / Total Fields',
      'Average model confidence across all extractions'
    ],
    [
      'Faithfulness Score',
      `${(metrics.groundedAccuracy * 100).toFixed(1)}%`,
      'Grounded Fields / Total Fields',
      'Fields properly supported by retrieved context'
    ],
    [
      'Retrieval Precision',
      `${(metrics.retrievalPrecision * 100).toFixed(1)}%`,
      'Relevant Context / Retrieved Context',
      'Quality of context retrieval system'
    ],
    [
      'Low Confidence',
      `${metrics.lowConfidenceCount}`,
      'Fields with Confidence < 0.7',
      'Fields requiring human review'
    ],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [metricsData[0]],
    body: metricsData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [6, 182, 212],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { halign: 'center', cellWidth: 25 },
      2: { fontSize: 7, cellWidth: 55 },
      3: { fontSize: 7, cellWidth: 'auto' },
    },
  });

  yPosition = // eslint-disable-next-line @typescript-eslint/no-explicit-any
(doc as any).lastAutoTable.finalY + 15;

  // Diagnostic Framework
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Diagnostic Framework', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  // Faithfulness Analysis
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Faithfulness (Grounding)', 20, yPosition);
  yPosition += 7;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const faithfulnessScore = metrics.groundedAccuracy * 100;
  doc.text(`Score: ${faithfulnessScore.toFixed(1)}%`, 25, yPosition);
  yPosition += 5;

  doc.setFontSize(8);
  const faithfulnessDesc = [
    'Measures: How well extracted values are supported by retrieved context',
    'Good (>80%): Model reliably grounds responses in source documents',
    'Fair (60-80%): Some hallucination or context misalignment',
    'Poor (<60%): Significant hallucination issues',
  ];
  faithfulnessDesc.forEach(line => {
    doc.text(line, 25, yPosition);
    yPosition += 5;
  });

  yPosition += 5;

  // Relevance Analysis
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('2. Contextual Relevance (Retrieval)', 20, yPosition);
  yPosition += 7;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const relevanceScore = metrics.retrievalPrecision * 100;
  doc.text(`Score: ${relevanceScore.toFixed(1)}%`, 25, yPosition);
  yPosition += 5;

  doc.setFontSize(8);
  const relevanceDesc = [
    'Measures: Quality and precision of document retrieval',
    'Good (>80%): Retrieval system finds highly relevant context',
    'Fair (60-80%): Some irrelevant chunks retrieved',
    'Poor (<60%): Retrieval needs optimization',
  ];
  relevanceDesc.forEach(line => {
    doc.text(line, 25, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Error Analysis
  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Error Analysis', 20, yPosition);
  yPosition += 10;

  const errorData = [
    ['Error Type', 'Count', 'Description'],
    ['Low Confidence', `${metrics.lowConfidenceCount}`, 'Fields with confidence < 70%'],
    ['Missing Context', `${metrics.missingContextCount}`, 'Fields without supporting context'],
    ['Failed Records', `${metrics.totalRecords - Math.floor(metrics.successRate * metrics.totalRecords)}`, 'Records that failed to process'],
  ];

  autoTable( doc, {
    startY: yPosition,
    head: [errorData[0]],
    body: errorData.slice(1),
    theme: 'striped',
    headStyles: {
      fillColor: [239, 68, 68],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
    },
  });

  yPosition = // eslint-disable-next-line @typescript-eslint/no-explicit-any
(doc as any).lastAutoTable.finalY + 15;

  // Annotation Summary
  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Human Annotations', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Annotated Fields: ${annotatedCount} of ${totalFields} (${((annotatedCount / Math.max(totalFields, 1)) * 100).toFixed(1)}%)`, 20, yPosition);
  yPosition += 10;

  // Collect annotation details
  const annotationDetails: string[][] = [['Record ID', 'Field', 'Status', 'Category', 'Expected Value']];
  records.forEach(record => {
    const recordAnnotations = annotations[record.record_id];
    if (recordAnnotations) {
      Object.entries(recordAnnotations).forEach(([field, annotation]) => {
        if (annotation.status) {
          const category = annotation.category
            ? annotation.category.charAt(0).toUpperCase() + annotation.category.slice(1)
            : '-';
          const expectedValue = annotation.expected_value || '-';

          annotationDetails.push([
            record.record_id,
            field,
            annotation.status === 'correct' ? 'Correct' : 'Incorrect',
            category,
            expectedValue,
          ]);
        }
      });
    }
  });

  if (annotationDetails.length > 1) {
    autoTable(doc, {
      startY: yPosition,
      head: [annotationDetails[0]],
      body: annotationDetails.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [168, 85, 247],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 25 },  // Record ID
        1: { cellWidth: 35 },  // Field
        2: { cellWidth: 25 },  // Status
        3: { cellWidth: 35 },  // Category
        4: { cellWidth: 'auto' },  // Expected Value
      },
    });

    yPosition = // eslint-disable-next-line @typescript-eslint/no-explicit-any
(doc as any).lastAutoTable.finalY + 15;
  }

  // Recommendations
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Recommendations', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const recommendations: string[] = [];

  if (faithfulnessScore < 60) {
    recommendations.push('• HIGH PRIORITY: Address hallucination - improve context grounding');
  } else if (faithfulnessScore < 80) {
    recommendations.push('• Improve faithfulness - review prompt engineering and context usage');
  }

  if (relevanceScore < 60) {
    recommendations.push('• HIGH PRIORITY: Optimize retrieval system - improve chunk relevance');
  } else if (relevanceScore < 80) {
    recommendations.push('• Fine-tune retrieval - consider semantic search improvements');
  }

  if (metrics.lowConfidenceCount > metrics.totalFields * 0.3) {
    recommendations.push('• Many low-confidence fields - consider model fine-tuning');
  }

  if (metrics.avgConfidence < 0.7) {
    recommendations.push('• Low average confidence - review training data quality');
  }

  if (annotatedCount < totalFields * 0.5) {
    recommendations.push('• Continue human annotation for better evaluation coverage');
  }

  if (recommendations.length === 0) {
    recommendations.push('✓ Pipeline performing well - maintain current configuration');
    recommendations.push('✓ Continue monitoring and periodic evaluation');
  }

  recommendations.forEach(rec => {
    doc.text(rec, 20, yPosition);
    yPosition += 7;
  });

  // Footer
  const pageCount = // eslint-disable-next-line @typescript-eslint/no-explicit-any
(doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `RAG Inspector Report - Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `rag_diagnostic_report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
