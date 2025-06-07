import { toTypedSchema } from "@vee-validate/zod";
import { z } from 'zod';
/**
 * Permet de valider les donnes avant l'envoie
 */
export const addMinistryValidation = toTypedSchema(
    z.object({
        name : z.string().nonempty().max(255),
        description : z.string().nonempty(),
    })
)
