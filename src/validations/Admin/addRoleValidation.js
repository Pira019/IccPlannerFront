import { toTypedSchema } from "@vee-validate/zod";
import z from "zod";

export const addRoleValidation  = toTypedSchema(
    z.object({
        name : z.string().nonempty().max(255),
        description : z.string().max(55),
        permissionIds: z.array(z.number()).default([]),
    })
)
