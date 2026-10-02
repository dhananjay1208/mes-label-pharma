import type { SignalRow } from '@/data/types';

interface SignalTableProps {
  rows: SignalRow[];
  caption?: string;
}

// Renders a signal/register list as a compact table. Rows flagged `trap`
// get a teal highlight — known integration traps participants must spot.
const SignalTable = ({ rows, caption }: SignalTableProps) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200">
    {caption && (
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-900">
        {caption}
      </div>
    )}
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-slate-50 text-left text-xs text-slate-600">
          <th className="px-3 py-2 font-semibold">Field</th>
          <th className="px-3 py-2 font-semibold">Source / Address</th>
          <th className="px-3 py-2 font-semibold">Type</th>
          <th className="px-3 py-2 font-semibold">Format</th>
          <th className="px-3 py-2 font-semibold">Trigger</th>
          <th className="px-3 py-2 font-semibold">Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.tag}
            className={`border-t border-slate-100 ${
              row.trap ? 'bg-tobacco-100' : 'bg-white'
            }`}
          >
            <td className="px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
              {row.trap ? '⚠ ' : ''}{row.tag}
            </td>
            <td className="px-3 py-2 font-mono text-xs text-leaf-700 whitespace-nowrap">{row.address}</td>
            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.dataType}</td>
            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.format}</td>
            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.trigger}</td>
            <td className="px-3 py-2 text-slate-600">{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SignalTable;
