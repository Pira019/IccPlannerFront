export interface ErrorModel {
    success: boolean;
    IsWarning?: boolean;
    statusCode?: number;
    message?: string;
    validationErrors?: string[];
}
