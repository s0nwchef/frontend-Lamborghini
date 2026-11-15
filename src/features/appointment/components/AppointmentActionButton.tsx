import type { ButtonHTMLAttributes } from 'react'

export function AppointmentActionButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            className="inline-flex h-10 shrink-0 cursor-pointer items-center bg-lambo-secondary px-5 font-barlow text-xs font-bold uppercase tracking-[0.18em] text-lambo-bold-black transition-colors hover:bg-lambo-hover active:bg-lambo-pressed"
            {...props}
        >
            <span>{children}</span>
        </button>
    )
}
