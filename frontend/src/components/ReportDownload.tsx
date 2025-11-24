type ReportDownloadProps = {
  onDownload: (format: 'pdf' | 'csv') => void
}

const ReportDownload = ({ onDownload }: ReportDownloadProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-base font-semibold text-slate-800">ESG Reports</h2>
    <p className="mt-2 text-sm text-slate-500">
      Generate ESG-compliant energy, emissions, and waste summaries for your factories.
    </p>
    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={() => onDownload('pdf')}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
      >
        Download PDF
      </button>
      <button
        type="button"
        onClick={() => onDownload('csv')}
        className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
      >
        Download CSV
      </button>
    </div>
  </div>
)

export default ReportDownload
