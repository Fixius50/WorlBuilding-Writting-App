/**
 * Chrono Engine - Conversión de Tiempo Universal a Calendarios Locales
 * 
 * REGLA CRÍTICA: La conversión NUNCA ocurre en la base de datos.
 * Los Ticks se guardan como enteros (BIGINT) y la conversión es exclusiva del Frontend.
 */

export interface TimeConfig {
    tick_multiplier: number;  // Relación con tiempo universal (1.0 = tiempo real)
    calendar: CalendarType;   // Tipo de calendario
    epoch_name?: string;      // Nombre de la era (ej: "Anno Domini", "Age of Fire")
    year_length?: number;     // Días por año (default: 365)
    day_length?: number;      // Horas por día (default: 24)
}

export type CalendarType =
    | 'earth_standard'    // Gregoriano estándar
    | 'earth_simple'      // 365 días, 12 meses iguales
    | 'mars_standard'     // Calendario marciano
    | 'custom';           // Definido por usuario

export interface LocalDate {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    epochName: string;
}

// Constantes por defecto
const TICKS_PER_MINUTE = 1;
const TICKS_PER_HOUR = 60;
const TICKS_PER_DAY = 24 * TICKS_PER_HOUR;
const TICKS_PER_YEAR_EARTH = 365 * TICKS_PER_DAY;

/**
 * Configuraciones de calendario predefinidas
 */
export const PRESET_CONFIGS: Record<CalendarType, Partial<TimeConfig>> = {
    earth_standard: {
        tick_multiplier: 1.0,
        year_length: 365,
        day_length: 24,
        epoch_name: 'CE',
    },
    earth_simple: {
        tick_multiplier: 1.0,
        year_length: 360,  // 12 meses de 30 días
        day_length: 24,
        epoch_name: 'Year',
    },
    mars_standard: {
        tick_multiplier: 1.027,  // Sol marciano ≈ 24h 37m
        year_length: 668,        // Sols por año marciano
        day_length: 24,
        epoch_name: 'Mars Year',
    },
    custom: {
        tick_multiplier: 1.0,
        year_length: 365,
        day_length: 24,
        epoch_name: 'Year',
    },
};

/**
 * Convierte Ticks Universales a fecha local según la configuración
 */
export function ticksToCalendar(ticks: bigint | number, config: TimeConfig): LocalDate {
    const tickNum = typeof ticks === 'bigint' ? Number(ticks) : ticks;
    const multiplier = config.tick_multiplier || 1.0;
    const yearLength = config.year_length || 365;
    const dayLength = config.day_length || 24;
    const epochName = config.epoch_name || 'Year';

    // Aplicar multiplicador de tiempo
    const adjustedTicks = tickNum * multiplier;

    // Calcular componentes
    const ticksPerDay = dayLength * TICKS_PER_HOUR;
    const ticksPerYear = yearLength * ticksPerDay;

    const year = Math.floor(adjustedTicks / ticksPerYear) + 1;
    const remainingAfterYear = adjustedTicks % ticksPerYear;

    const dayOfYear = Math.floor(remainingAfterYear / ticksPerDay) + 1;
    const remainingAfterDay = remainingAfterYear % ticksPerDay;

    const hour = Math.floor(remainingAfterDay / TICKS_PER_HOUR);
    const minute = Math.floor(remainingAfterDay % TICKS_PER_HOUR);

    // Calcular mes (asumiendo meses iguales para simplicidad)
    const daysPerMonth = Math.floor(yearLength / 12);
    const month = Math.floor((dayOfYear - 1) / daysPerMonth) + 1;
    const day = ((dayOfYear - 1) % daysPerMonth) + 1;

    return {
        year,
        month: Math.min(month, 12),
        day: Math.min(day, daysPerMonth),
        hour,
        minute,
        epochName,
    };
}

/**
 * Convierte una fecha local a Ticks Universales
 */
export function calendarToTicks(date: LocalDate, config: TimeConfig): bigint {
    const multiplier = config.tick_multiplier || 1.0;
    const yearLength = config.year_length || 365;
    const dayLength = config.day_length || 24;

    const ticksPerDay = dayLength * TICKS_PER_HOUR;
    const ticksPerYear = yearLength * ticksPerDay;
    const daysPerMonth = Math.floor(yearLength / 12);

    const yearTicks = (date.year - 1) * ticksPerYear;
    const monthTicks = (date.month - 1) * daysPerMonth * ticksPerDay;
    const dayTicks = (date.day - 1) * ticksPerDay;
    const hourTicks = date.hour * TICKS_PER_HOUR;
    const minuteTicks = date.minute;

    const totalTicks = (yearTicks + monthTicks + dayTicks + hourTicks + minuteTicks) / multiplier;

    return BigInt(Math.floor(totalTicks));
}

/**
 * Formatea una fecha local como string legible
 */
export function formatLocalDate(date: LocalDate, format: 'full' | 'short' | 'date' | 'time' = 'full'): string {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    switch (format) {
        case 'full':
            return `${date.epochName} ${date.year}, ${monthNames[date.month - 1]} ${date.day}, ${date.hour.toString().padStart(2, '0')}:${date.minute.toString().padStart(2, '0')}`;
        case 'short':
            return `${date.year}/${date.month}/${date.day}`;
        case 'date':
            return `${monthNames[date.month - 1]} ${date.day}, ${date.epochName} ${date.year}`;
        case 'time':
            return `${date.hour.toString().padStart(2, '0')}:${date.minute.toString().padStart(2, '0')}`;
        default:
            return `${date.epochName} ${date.year}`;
    }
}

/**
 * Formatea Ticks Universales directamente
 */
export function formatUniversalTick(ticks: bigint | number): string {
    const tickNum = typeof ticks === 'bigint' ? Number(ticks) : ticks;

    if (tickNum >= 1_000_000_000) {
        return `${(tickNum / 1_000_000_000).toFixed(2)}B`;
    }
    if (tickNum >= 1_000_000) {
        return `${(tickNum / 1_000_000).toFixed(2)}M`;
    }
    if (tickNum >= 1_000) {
        return `${(tickNum / 1_000).toFixed(1)}K`;
    }
    return tickNum.toLocaleString();
}

/**
 * Obtiene la configuración completa mezclando preset + custom
 */
export function getFullConfig(config: Partial<TimeConfig>): TimeConfig {
    const preset = PRESET_CONFIGS[config.calendar || 'earth_standard'];
    return {
        tick_multiplier: config.tick_multiplier ?? preset.tick_multiplier ?? 1.0,
        calendar: config.calendar || 'earth_standard',
        epoch_name: config.epoch_name || preset.epoch_name || 'Year',
        year_length: config.year_length ?? preset.year_length ?? 365,
        day_length: config.day_length ?? preset.day_length ?? 24,
    };
}

/**
 * Default configs para nuevos proyectos
 */
export const DEFAULT_TIME_CONFIG: TimeConfig = {
    tick_multiplier: 1.0,
    calendar: 'earth_standard',
    epoch_name: 'Year',
    year_length: 365,
    day_length: 24,
};
