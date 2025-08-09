import { toTypedSchema } from "@vee-validate/zod";
import { z } from 'zod';
/**
 * Permet de valider les donnes avant l'envoie
 */
export const LoginValidator = toTypedSchema(
    z.object({
        email : z.string().email(),
        password : z.string().nonempty(),
        remember : z.boolean().default(false),
    })
)
