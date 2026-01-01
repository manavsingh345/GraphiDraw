import { z } from "zod";

export const CreateUserSchema=z.object({
    email:z.string().trim().email("Invalid email"),
    password:z.string().min(4,"Password too short").max(40,"Password too long"),
    name:z.string().trim().min(4,"Name too short").max(40,"Name too long"),
    photo: z.string().url().optional(),
})

export const SigninSchema=z.object({
    email:z.string().trim().email("Invalid Email"),
    password:z.string().min(4,"Password too short").max(40,"Password too long"),
});

export const CreateRoomSchema=z.object({
    slug:z.string().min(3,"Name too short").max(30,"Name too long")
})