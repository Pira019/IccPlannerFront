import BaseService from "./BaseService";

export default class PlanningService extends BaseService
{
    static authBaseUrl = "plannings/"

    static async assign(departmentId, payload)
    {
        const endPoint = `${this.authBaseUrl}${departmentId}`
        return await this.axiosInstance.post(endPoint, payload)
    }

    static async getMonthlyPlanning(month, year, departmentId)
    {
        let endPoint = `${this.authBaseUrl}${month}/${year}`
        if (departmentId)
        {
            endPoint += `?departmentId=${departmentId}`
        }
        return await this.axiosInstance.get(endPoint)
    }

    static async unassign(planningId)
    {
        const endPoint = `${this.authBaseUrl}${planningId}`
        return await this.axiosInstance.delete(endPoint)
    }

    static async update(planningId, payload)
    {
        const endPoint = `${this.authBaseUrl}${planningId}`
        return await this.axiosInstance.put(endPoint, payload)
    }

    static async publish(departmentId, month, year)
    {
        const endPoint = `${this.authBaseUrl}${departmentId}/publish?month=${month}&year=${year}`
        return await this.axiosInstance.post(endPoint)
    }

    static async getStatus(month, year, departmentId)
    {
        const endPoint = `${this.authBaseUrl}${month}/${year}/status?departmentId=${departmentId}`
        return await this.axiosInstance.get(endPoint)
    }

    static async getMyPlanning(month, year, departmentId)
    {
        let endPoint = `${this.authBaseUrl}my-planning/${month}/${year}`
        if (departmentId)
        {
            endPoint += `?departmentId=${departmentId}`
        }
        return await this.axiosInstance.get(endPoint)
    }

    static async downloadPdf(month, year, departmentId)
    {
        const endPoint = `${this.authBaseUrl}${month}/${year}/pdf?departmentId=${departmentId}`
        return await this.axiosInstance.get(endPoint, { responseType: 'blob' })
    }

    static async downloadDailyPdf(date, departmentId)
    {
        const endPoint = `${this.authBaseUrl}daily-pdf/${date}?departmentId=${departmentId}`
        return await this.axiosInstance.get(endPoint, { responseType: 'blob' })
    }

    static async getTeamPlanning(departmentId, month, year)
    {
        const endPoint = `${this.authBaseUrl}team/${departmentId}/${month}/${year}`
        return await this.axiosInstance.get(endPoint)
    }
}
