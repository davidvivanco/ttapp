export interface DashboardFilter {
    _id?: string,
    id: string,
    name?: string,
    type: string,
    fieldToQuery: string,
    label: string,
    options?: Array<Option>
}

export interface Option {
    value: string,
    name: string
}