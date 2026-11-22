import { Search } from 'lucide-react'
import type { DealerStatusFilter } from '../types'
import { DEALER_STATUS_OPTIONS } from '../data'

interface DealerAppointmentToolbarProps {
    query: string
    status: DealerStatusFilter
    onQueryChange: (query: string) => void
    onStatusChange: (status: DealerStatusFilter) => void
}

export function DealerAppointmentToolbar({
    query,
    status,
    onQueryChange,
    onStatusChange,
}: DealerAppointmentToolbarProps) {
    return (
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <label className="relative flex h-12 flex-1 items-center border border-lambo-pressed bg-lambo-tertiary">
                <input
                    type="search"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Tìm theo khách hàng hoặc mã lịch hẹn"
                    className="h-full w-full bg-transparent px-4 pr-12 text-sm text-lambo-secondary placeholder:text-lambo-hover focus:outline-none"
                />
                <Search className="pointer-events-none absolute right-4 h-4 w-4 text-lambo-primary" aria-hidden="true" />
            </label>

            <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value as DealerStatusFilter)}
                aria-label="Lọc theo trạng thái"
                className="h-12 bg-lambo-secondary px-6 font-barlow text-sm font-semibold uppercase tracking-[0.04em] text-lambo-bold-black focus:outline-none md:w-80"
            >
                {DEALER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
