import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DealerAppointmentPaginationProps {
    currentPage: number
    totalPages: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
}

export function DealerAppointmentPagination({
    currentPage,
    totalPages,
    pageSize,
    total,
    onPageChange,
}: DealerAppointmentPaginationProps) {
    const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, total)
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    const pageButtonClass = (active: boolean) =>
        `flex h-10 w-10 items-center justify-center font-barlow text-sm font-semibold transition-colors ${
            active ? 'bg-lambo-primary text-black' : 'bg-lambo-tertiary text-lambo-secondary hover:bg-lambo-pressed'
        }`

    return (
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="font-barlow text-sm text-lambo-hover">
                Hiển thị {start}–{end} / {total} lịch hẹn
            </p>

            <nav aria-label="Phân trang" className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    aria-label="Trang trước"
                    className="flex h-10 w-10 items-center justify-center text-lambo-primary transition-colors hover:text-lambo-hover disabled:opacity-30"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                {pages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        aria-current={page === currentPage ? 'page' : undefined}
                        className={pageButtonClass(page === currentPage)}
                    >
                        {page}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    aria-label="Trang sau"
                    className="flex h-10 w-10 items-center justify-center text-lambo-primary transition-colors hover:text-lambo-hover disabled:opacity-30"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </nav>
        </div>
    )
}
