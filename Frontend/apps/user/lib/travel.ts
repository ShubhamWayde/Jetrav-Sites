import type { ElementType } from 'react';
import type { BadgeTone } from '@repo/ui/Badge';
import {
  CurrencyExchange,
  FlightTakeoff,
  Holiday,
  Hotel,
  Insurance,
  RoundTrip,
  Taxi,
  TrainTicket,
  Visa,
} from '@repo/ui/icon';

interface ServiceMeta {
  label: string;
  icon: ElementType;
}

/** Lead / quotation `type` values from the backend → label + icon. */
const SERVICES: Record<string, ServiceMeta> = {
  air:              { label: 'Flight',           icon: FlightTakeoff },
  train:            { label: 'Train',            icon: TrainTicket },
  hotel:            { label: 'Hotel',            icon: Hotel },
  visa:             { label: 'Visa',             icon: Visa },
  insurance:        { label: 'Travel insurance', icon: Insurance },
  bus:              { label: 'Bus',              icon: RoundTrip },
  car:              { label: 'Car',              icon: Taxi },
  foreign_exchange: { label: 'Foreign exchange', icon: CurrencyExchange },
  package:          { label: 'Holiday package',  icon: Holiday },
};

export function serviceMeta(type: string): ServiceMeta {
  return (
    SERVICES[type?.toLowerCase()] ?? {
      label: type ? type.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) : 'Trip request',
      icon: RoundTrip,
    }
  );
}

/** Lead statuses that no longer need the customer's attention. */
export const CLOSED_LEAD_STATUSES = ['confirmed', 'cancelled', 'lost'];

/** Badge tone for a lead status. */
export function leadStatusTone(status: string): BadgeTone {
  switch (status?.toLowerCase()) {
    case 'contacted':   return 'info';
    case 'quotation':
    case 'quoted':      return 'accent';
    case 'negotiation': return 'warning';
    case 'confirmed':   return 'success';
    case 'lost':        return 'danger';
    default:            return 'neutral'; // cancelled and anything new
  }
}
