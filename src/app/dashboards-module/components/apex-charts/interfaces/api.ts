

interface Api {
    method: string;
    url: string;
    headers: Headers;
    searchParams: SearchParams;
}

interface SearchParams {
    tuUltimoEstado: TuUltimoEstado;
    tuUltimoEstadoAllCompany: TuUltimoEstadoAllCompany;
    mediaEvolucion: MediaEvolucion;
    mediaEvolucionAllCompany: MediaEvolucion;
    evolucionUltimosXDias: MediaEvolucion;
    evolucionUltimosXDiasAllCompany: MediaEvolucion;
}

interface MediaEvolucion {
    userId: string;
    days: string;
    months: string;
    years: string;
    fromDate: string;
    toDate: string;
}

interface TuUltimoEstadoAllCompany {
}

interface TuUltimoEstado {
    userId: string;
}

interface Headers {
    'x-api-key': string;
    'Content-Type': string;
}