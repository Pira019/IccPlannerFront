import { toTypedSchema } from "@vee-validate/zod";
import { z } from 'zod';
/**
 * Permet de valider les donnes avant l'envoie
 */
export const addDepartmentValidation  = toTypedSchema(
    z.object({
        name : z.string().nonempty().max(255),
        ministryId : z.number().positive(),
        description : z.string().nonempty(),
        shortName : z.string().max(55).optional(),
        startDate: z.preprocess((val) => val ? new Date(val) : undefined, z.date().optional()).optional()
    })
)
