import type { Appointment } from '../types'
import { AppointmentActionButton } from './AppointmentActionButton'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'

interface NextAppointmentCardProps {
    appointment: Appointment
}

export function NextAppointmentCard({ appointment }: NextAppointmentCardProps) {
    return (
        <section data-node-id="226:5757" className="border border-lambo-pressed bg-lambo-tertiary p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="font-barlow text-xs font-semibold uppercase tracking-[0.08em] text-lambo-primary">
                    Lịch hẹn tiếp theo
                </div>
                <AppointmentStatusBadge status={appointment.status} />
            </div>

            <div className="mt-6 font-barlow text-5xl font-bold uppercase leading-[52px] text-lambo-secondary">
                {appointment.dayLabel}
            </div>
            <p className="mt-3 text-lg font-semibold text-lambo-secondary">
                {appointment.timeLabel} · {appointment.title}
            </p>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                <p className="text-base text-lambo-hover">{appointment.venue}</p>
                <div className="flex flex-wrap gap-3">
                    <AppointmentActionButton>Đổi lịch</AppointmentActionButton>
                    <AppointmentActionButton>Hủy lịch</AppointmentActionButton>
                </div>
            </div>
        </section>
    )
}
