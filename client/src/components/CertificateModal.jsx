import React, { useEffect, useRef } from 'react';
import { Award, Download, X, CheckCircle2, Shield } from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { soundService } from '../services/sound';

export default function CertificateModal({ certificate, settings, onClose }) {
  const qrCanvasRef = useRef(null);

  const certId = certificate?.certificate_id || 'BH-2026-000001';
  const studentName = certificate?.student_name || 'Participant';
  const teamName = certificate?.team_name || 'Team Alpha';
  const achievement = certificate?.achievement || 'Certificate of Participation';
  const rank = certificate?.rank || 1;
  const finalScore = certificate?.final_score || 0;
  const dateStr = certificate?.competition_date || 'September 9, 2026';

  const collegeName = settings?.college_name || 'National Institute of Technology & Engineering';
  const department = settings?.department || 'Department of Computer Science & Information Technology';
  const coordinator = settings?.coordinator_name || 'Prof. A. Sharma';
  const hod = settings?.hod_name || 'Dr. R. K. Patel';
  const principal = settings?.principal_name || 'Dr. S. Nair';

  const verifyUrl = `${window.location.origin}/verify/${certId}`;

  // Generate QR Code on canvas
  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, verifyUrl, {
        width: 90,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) console.error('QR code generation error:', err);
      });
    }
  }, [verifyUrl]);

  // Export as A4 Landscape PDF
  const handleDownloadPDF = () => {
    soundService.playClick();
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background Fill
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer Gold/Cyan Cyber Border
    doc.setDrawColor(0, 229, 255); // cyber-cyan
    doc.setLineWidth(1.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    doc.setDrawColor(0, 255, 136); // cyber-green
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Header Branding
    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(collegeName.toUpperCase(), pageWidth / 2, 22, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(department, pageWidth / 2, 28, { align: 'center' });

    // Competition Title
    doc.setTextColor(0, 255, 136);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('🐞 BUG HUNT 2026', pageWidth / 2, 42, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 229, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('“Find the Bug. Fix the Code. Win the Hunt.”', pageWidth / 2, 48, { align: 'center' });

    // Certificate Type
    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(achievement.toUpperCase(), pageWidth / 2, 64, { align: 'center' });

    // Body Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(226, 232, 240);
    doc.text('This is proudly presented to', pageWidth / 2, 74, { align: 'center' });

    // Recipient Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(studentName, pageWidth / 2, 86, { align: 'center' });

    // Underline
    doc.setDrawColor(0, 229, 255);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 40, 89, pageWidth / 2 + 40, 89);

    // Team & Achievement details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(203, 213, 225);
    const detailText = `representing team "${teamName}" for demonstrating exceptional technical debugging and code remediation proficiency, securing Rank #${rank} with an official score of ${finalScore} / 50 Marks.`;
    doc.text(doc.splitTextToSize(detailText, 190), pageWidth / 2, 98, { align: 'center' });

    // Date & Venue
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Event Date: ${dateStr}  |  Official Platform Certified`, pageWidth / 2, 120, { align: 'center' });

    // Signatures
    const sigY = 150;
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);

    // Sig 1: Coordinator
    doc.line(30, sigY, 75, sigY);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(coordinator, 52.5, sigY + 5, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Event Coordinator', 52.5, sigY + 9, { align: 'center' });

    // Sig 2: HOD
    doc.line(pageWidth / 2 - 22.5, sigY, pageWidth / 2 + 22.5, sigY);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(hod, pageWidth / 2, sigY + 5, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Head of Department', pageWidth / 2, sigY + 9, { align: 'center' });

    // Sig 3: Principal
    doc.line(pageWidth - 75, sigY, pageWidth - 30, sigY);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(principal, pageWidth - 52.5, sigY + 5, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Principal / Director', pageWidth - 52.5, sigY + 9, { align: 'center' });

    // Footer & Permanent Certificate ID
    doc.setFontSize(8);
    doc.setTextColor(0, 229, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`CERTIFICATE ID: ${certId}`, 15, pageHeight - 12);

    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(`Verify Authenticity at: ${verifyUrl}`, pageWidth - 15, pageHeight - 12, { align: 'right' });

    // Save File
    doc.save(`BUG_HUNT_CERTIFICATE_${certId}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="max-w-4xl w-full bg-slate-900 border-2 border-cyber-cyan/50 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_#00e5ff30] relative my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Landscape Preview Card */}
        <div className="rounded-2xl border border-cyber-green/40 bg-slate-950 p-6 md:p-8 text-center relative overflow-hidden shadow-inner font-sans mb-6">
          
          {/* Subtle Decorative Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-cyan" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-cyan" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-green" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-green" />

          {/* College Header */}
          <p className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase mb-1">
            {collegeName}
          </p>
          <p className="text-[11px] font-mono text-slate-500 mb-4">
            {department}
          </p>

          {/* BUG HUNT Branding */}
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-cyber-green mb-1 flex items-center justify-center gap-2">
            <Bug className="w-8 h-8 text-cyber-green" />
            BUG HUNT 2026
          </h2>
          <p className="text-xs font-mono text-cyber-cyan mb-4">
            “Find the Bug. Fix the Code. Win the Hunt.”
          </p>

          {/* Achievement Title */}
          <div className="inline-block px-5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-400 font-mono font-bold text-sm uppercase tracking-wider mb-4">
            {achievement}
          </div>

          <p className="text-xs font-mono text-slate-400 mb-1">
            This certifies that
          </p>

          {/* Student Name */}
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-display mb-1 underline decoration-cyber-cyan underline-offset-8">
            {studentName}
          </h3>

          <p className="text-xs font-mono text-slate-300 max-w-xl mx-auto mt-4 mb-6 leading-relaxed">
            of <strong className="text-slate-100">"{teamName}"</strong> has demonstrated outstanding performance in competitive source-code debugging, achieving <strong className="text-amber-400">Rank #{rank}</strong> with a score of <strong className="text-cyber-green">{finalScore} / 50 Marks</strong>.
          </p>

          {/* Bottom Row: Signatures + QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 border-t border-slate-800 pt-6 text-xs font-mono">
            
            {/* Sig 1 */}
            <div>
              <div className="w-24 mx-auto border-b border-slate-700 pb-1 mb-1 font-bold text-slate-200 truncate">
                {coordinator}
              </div>
              <span className="text-[10px] text-slate-500">Coordinator</span>
            </div>

            {/* Sig 2 */}
            <div>
              <div className="w-24 mx-auto border-b border-slate-700 pb-1 mb-1 font-bold text-slate-200 truncate">
                {hod}
              </div>
              <span className="text-[10px] text-slate-500">Head of Dept.</span>
            </div>

            {/* Sig 3 */}
            <div>
              <div className="w-24 mx-auto border-b border-slate-700 pb-1 mb-1 font-bold text-slate-200 truncate">
                {principal}
              </div>
              <span className="text-[10px] text-slate-500">Principal</span>
            </div>

            {/* QR Code Verification */}
            <div className="flex flex-col items-center justify-center">
              <canvas ref={qrCanvasRef} className="rounded-lg shadow" />
              <span className="text-[9px] text-cyber-cyan font-bold tracking-wider mt-1">{certId}</span>
              <span className="text-[8px] text-slate-500">Scan to Verify</span>
            </div>

          </div>

        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-slate-400">
            Official A4 Landscape Document • Permanent ID: <strong className="text-cyber-cyan">{certId}</strong>
          </span>

          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-green to-emerald-500 text-slate-950 font-bold hover:opacity-90 transition flex items-center gap-2 shadow-[0_0_15px_#00ff8840]"
          >
            <Download className="w-4 h-4" />
            Download Print-Ready PDF
          </button>
        </div>

      </div>
    </div>
  );
}
