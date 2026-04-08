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
}
