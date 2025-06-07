export interface ErrorModel {
    success: boolean;
    statusCode?: number;
    message?: string;
    validationErrors?: string[];
}
