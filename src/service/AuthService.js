import { jwtDecode } from "jwt-decode";
import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un programme
 **/
export default class AuthService extends BaseService
{
    static authBaseUrl = "availabilities/"
    
    static parseToken(token) {
        try {
            return jwtDecode(token)
        } catch (e) {
            return null
        }
}

}
